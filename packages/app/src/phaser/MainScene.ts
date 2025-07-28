import { Grid } from '@cakeaway/simulation-engine'
import Phaser from 'phaser'
import { GameMap } from './GameMap'

// Window 객체 타입 확장 (개발자 도구용)
declare global {
  interface Window {
    gameScene?: MainScene
  }
}

/**
 * 렌더링 큐 아이템 타입
 */
interface RenderQueueItem {
  x: number
  y: number
  depth: number
  height: number // 1-3 레벨의 높이 추가
  type: 'tile' | 'object' | 'selected-highlight' | 'hover-highlight'
  data?: {
    color?: number
    alpha?: number
    object?: unknown
    isFloorTile?: boolean // 바닥 타일 여부 표시
  }
}

/**
 * Phaser.js 메인 게임 씬
 * 케이크 공장 시뮬레이션의 기본 렌더링 씬
 */
export class MainScene extends Phaser.Scene {
  private grid: Grid | null = null
  private gameMap: GameMap | null = null
  private gridGraphics: Phaser.GameObjects.Graphics | null = null
  private renderQueue: RenderQueueItem[] = []
  private heightVisualization: boolean = false
  private selectedTile: { x: number; y: number } | null = null
  private highlightGraphics: Phaser.GameObjects.Graphics | null = null
  private hoveredTile: { x: number; y: number } | null = null
  private hoverGraphics: Phaser.GameObjects.Graphics | null = null
  private onTileSelectedCallback?: (tile: { x: number; y: number; height: number } | null) => void
  private initialMapPath: string = '/assets/maps/default-factory.json'
  private showGrid: boolean = false
  private showHitTestDebug: boolean = false

  // 스프라이트 관리를 위한 그룹
  private cubeSprites: Phaser.GameObjects.Group | null = null
  private highlightSprites: Phaser.GameObjects.Group | null = null

  // 히트 테스트 디버깅을 위한 그래픽스
  private hitTestDebugGraphics: Phaser.GameObjects.Graphics | null = null

  // 카메라 드래그 관련 변수들
  private isDragging: boolean = false
  private dragStartX: number = 0
  private dragStartY: number = 0
  private initialCameraX: number = 0
  private initialCameraY: number = 0

  // 줌 관련 변수들
  private minZoom: number = 0.3
  private maxZoom: number = 2.5
  private zoomSpeed: number = 0.1

  constructor() {
    super({ key: 'MainScene' })
  }

  /**
   * 타일 선택 콜백 설정
   */
  setTileSelectedCallback(callback: (tile: { x: number; y: number; height: number } | null) => void): void {
    this.onTileSelectedCallback = callback
  }

  /**
   * 초기 맵 경로 설정
   */
  setInitialMapPath(mapPath: string): void {
    this.initialMapPath = mapPath
  }

  /**
   * 격자 표시 설정
   */
  setShowGrid(enabled: boolean): void {
    this.showGrid = enabled
    // 설정 변경 시 그리드 다시 렌더링
    if (this.grid && this.gridGraphics) {
      this.renderGrid()
    }
  }

  /**
   * 히트 테스트 디버깅 표시 설정
   */
  setShowHitTestDebug(enabled: boolean): void {
    this.showHitTestDebug = enabled
    console.log(`MainScene: Setting hit test debug to ${enabled}`)

    // 설정 변경 시 디버깅 그래픽스 업데이트
    if (this.hitTestDebugGraphics) {
      if (enabled) {
        this.hitTestDebugGraphics.setVisible(true)
        console.log('MainScene: Hit test debug graphics enabled')
      } else {
        this.hitTestDebugGraphics.clear()
        this.hitTestDebugGraphics.setVisible(false)
        console.log('MainScene: Hit test debug graphics disabled')
      }
    } else {
      console.warn('MainScene: hitTestDebugGraphics not initialized')
    }
  }

  /**
   * 높이 시각화 옵션 설정
   */
  setHeightVisualization(enabled: boolean): void {
    this.heightVisualization = enabled
    // 설정 변경 시 그리드 다시 렌더링
    if (this.grid && this.gridGraphics) {
      this.renderGrid()
    }
  }

  /**
   * 맵 변경 (런타임에 다른 JSON 맵으로 교체)
   */
  async changeMap(configPath: string): Promise<boolean> {
    if (!this.gameMap) {
      console.error('MainScene: GameMap not initialized')
      return false
    }

    try {
      console.log(`MainScene: Changing map to ${configPath}`)

      const success = await this.gameMap.changeMap(configPath)
      if (success) {
        // 맵 변경 성공시 그리드 다시 렌더링
        this.renderGrid()
        console.log('MainScene: Map changed and grid re-rendered')
        return true
      }

      return false

    } catch (error) {
      console.error('MainScene: Error changing map:', error)
      return false
    }
  }

  preload(): void {
    console.log('MainScene: Preloading external SVG assets...')

    // 기본 큐브 텍스처 SVG 로드 (레벨 0-3)
    this.load.svg('cube-level-0', '/assets/sprites/cube-level-0.svg', { width: 64, height: 32 })
    this.load.svg('cube-level-1', '/assets/sprites/cube-level-1.svg', { width: 64, height: 48 })
    this.load.svg('cube-level-2', '/assets/sprites/cube-level-2.svg', { width: 64, height: 64 })
    this.load.svg('cube-level-3', '/assets/sprites/cube-level-3.svg', { width: 64, height: 80 })

    // 커스텀 큐브 텍스처 SVG 로드
    this.load.svg('cube-level-3-golden-svg', '/assets/sprites/cube-level-3-golden.svg', { width: 64, height: 80 })
    this.load.svg('cube-level-3-diamond-svg', '/assets/sprites/cube-level-3-diamond.svg', { width: 64, height: 80 })

    // 하이라이트 텍스처 SVG 로드 (레벨 0-3)
    this.load.svg('highlight-selected-0', '/assets/sprites/highlight-selected-0.svg', { width: 64, height: 32 })
    this.load.svg('highlight-selected-1', '/assets/sprites/highlight-selected-1.svg', { width: 64, height: 48 })
    this.load.svg('highlight-selected-2', '/assets/sprites/highlight-selected-2.svg', { width: 64, height: 64 })
    this.load.svg('highlight-selected-3', '/assets/sprites/highlight-selected-3.svg', { width: 64, height: 80 })
    this.load.svg('highlight-hover-0', '/assets/sprites/highlight-hover-0.svg', { width: 64, height: 32 })
    this.load.svg('highlight-hover-1', '/assets/sprites/highlight-hover-1.svg', { width: 64, height: 48 })
    this.load.svg('highlight-hover-2', '/assets/sprites/highlight-hover-2.svg', { width: 64, height: 64 })
    this.load.svg('highlight-hover-3', '/assets/sprites/highlight-hover-3.svg', { width: 64, height: 80 })

    // 로딩 완료 이벤트
    this.load.on('complete', () => {
      console.log('MainScene: All external SVG assets loaded successfully')
    })

    // 로딩 실패 이벤트
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error(`MainScene: Failed to load asset: ${file.key}`)
    })
  }

  create(): void {
    console.log('MainScene: Creating scene...')

    try {
      // 시뮬레이션 엔진 그리드 생성
      this.grid = new Grid(20, 15)
      console.log('MainScene: Grid created successfully', this.grid)

      // 배경 설정
      this.cameras.main.setBackgroundColor('#34495e')

      // 그리드 렌더링용 그래픽스 객체 생성
      this.gridGraphics = this.add.graphics()

      // 큐브 스프라이트 관리를 위한 그룹 생성
      this.cubeSprites = this.add.group()

      // 하이라이트 스프라이트 관리를 위한 그룹 생성
      this.highlightSprites = this.add.group()

      // 히트 테스트 디버깅용 그래픽스 객체 생성
      this.hitTestDebugGraphics = this.add.graphics()
      this.hitTestDebugGraphics.setDepth(10000) // 최상위 레이어에 표시
      this.hitTestDebugGraphics.setVisible(true) // 기본 활성화 필요

      // 외부 SVG 에셋 로딩 확인 (런타임 텍스처 생성 로직 제거)
      this.validateLoadedAssets()

      // 비동기 맵 초기화
      this.initializeGameMapAsync()

      // 마우스 입력 이벤트 설정
      this.input.on('pointerdown', this.handlePointerDown, this)
      this.input.on('pointermove', this.handlePointerMove, this)
      this.input.on('pointerup', this.handlePointerUp, this)

      // 마우스 휠 이벤트 설정 (줌 기능)
      this.input.on('wheel', this.handleWheel, this)

      console.log('MainScene: Scene creation complete')

    } catch (error) {
      console.error('MainScene: Error creating scene:', error)

      // 에러 메시지 표시
      this.add.text(10, 10, '씬 생성 중 오류가 발생했습니다', {
        fontSize: '20px',
        color: '#e74c3c',
        fontFamily: 'Arial'
      })
    }
  }

  /**
   * 게임 맵을 비동기로 초기화
   */
  private async initializeGameMapAsync(): Promise<void> {
    try {
      console.log('MainScene: Initializing GameMap from configuration...')

      // 설정된 초기 맵 경로 사용
      this.gameMap = await GameMap.createFromConfig(this.initialMapPath)
      console.log('MainScene: GameMap initialized successfully', this.gameMap)

      // 전역 접근을 위해 윈도우 객체에 추가 (개발용)
      if (typeof window !== 'undefined') {
        window.gameScene = this
        console.log('MainScene: Added to window.gameScene for testing')
        console.log('MainScene: Use window.gameScene.changeMap("/assets/maps/test-valley.json") to test map switching')
        console.log('MainScene: Use window.gameScene.setZoom(0.5) or window.gameScene.resetZoom() to test zoom')
        console.log('MainScene: Use window.gameScene.setZoomSettings(0.2, 3.0, 0.15) to adjust zoom parameters')
      }

      // 맵 로딩 완료 후 그리드 렌더링
      this.renderGrid()

    } catch (error) {
      console.error('MainScene: Error initializing GameMap:', error)

      // 실패시 기본 맵으로 폴백
      this.gameMap = new GameMap(20, 15)
      console.log('MainScene: Using fallback GameMap')

      // 폴백 맵으로 렌더링
      this.renderGrid()
    }
  }  update(): void {
    // 매 프레임마다 실행되는 업데이트 로직
    // 현재는 비어있음 - 향후 시뮬레이션 업데이트 로직 추가
  }

  private renderGrid(): void {
    if (!this.grid || !this.gameMap || !this.gridGraphics || !this.cubeSprites || !this.highlightSprites) {
      console.warn('MainScene: Grid, GameMap, graphics object, or sprite groups not available - skipping render')
      return
    }

    try {
      // 아이소메트릭 렌더링 설정
      const offsetX = 400 // 화면 중앙으로 이동
      const offsetY = 150

      // 기존 스프라이트들 제거
      this.cubeSprites.clear(true, true)
      this.highlightSprites.clear(true, true)

      // 하이라이트용 그래픽스 클리어 (폴백용)
      this.gridGraphics.clear()
      this.renderQueue = []

      // 모든 타일을 렌더링 큐에 추가하고 깊이 계산
      for (let x = 0; x < this.grid.width; x++) {
        for (let y = 0; y < this.grid.height; y++) {
          const depth = this.calculateDepth(x, y)
          // GameMap에서 높이 정보 가져오기 (0-3 레벨)
          const height = this.gameMap.getTileHeight(x, y)

          // 높이 1 이상인 경우, 먼저 바닥 타일(level-0)을 렌더링 큐에 추가
          if (height > 0) {
            this.renderQueue.push({
              x,
              y,
              depth: depth - 0.1, // 바닥 타일을 큐브보다 먼저 렌더링
              height: 0, // 바닥 타일은 높이 0
              type: 'tile',
              data: {
                color: this.gameMap.getFloorColor(),
                alpha: 0.9,
                isFloorTile: true // 바닥 타일임을 표시
              }
            })
          }          // 높이별 색상 설정
          let tileColor: number
          if (this.heightVisualization) {
            tileColor = this.gameMap.getHeightBasedColor(height)
          } else {
            // 레벨 0은 바닥색, 나머지는 기본 회색
            tileColor = height === 0
              ? this.gameMap.getFloorColor()
              : 0x34495e
          }

          // 메인 타일을 렌더링 큐에 추가 (모든 높이의 타일 렌더링)
          this.renderQueue.push({
            x,
            y,
            depth,
            height,
            type: 'tile',
            data: { color: tileColor, alpha: 0.9 }
          })
        }
      }      // 선택된 타일 하이라이트도 렌더링 큐에 추가 (올바른 깊이 정렬을 위해)
      if (this.selectedTile) {
        const selectedDepth = this.calculateDepth(this.selectedTile.x, this.selectedTile.y)
        const selectedHeight = this.gameMap.getTileHeight(this.selectedTile.x, this.selectedTile.y)
        this.renderQueue.push({
          x: this.selectedTile.x,
          y: this.selectedTile.y,
          depth: selectedDepth + 0.1, // 같은 위치의 큐브보다 약간 앞에 렌더링
          height: selectedHeight,
          type: 'selected-highlight',
          data: {}
        })
      }

      // 호버된 타일 하이라이트도 렌더링 큐에 추가
      if (this.hoveredTile) {
        const hoveredDepth = this.calculateDepth(this.hoveredTile.x, this.hoveredTile.y)
        const hoveredHeight = this.gameMap.getTileHeight(this.hoveredTile.x, this.hoveredTile.y)
        this.renderQueue.push({
          x: this.hoveredTile.x,
          y: this.hoveredTile.y,
          depth: hoveredDepth + 0.05, // 큐브보다 약간 앞에, 선택 하이라이트보다는 뒤에
          height: hoveredHeight,
          type: 'hover-highlight',
          data: {}
        })
      }      // 깊이에 따라 정렬 (깊이가 작을수록 먼저 렌더링)
      this.renderQueue.sort((a, b) => a.depth - b.depth)

      // 정렬된 순서로 렌더링
      for (const item of this.renderQueue) {
        const screenPos = this.grid.gridToScreen({ x: item.x, y: item.y })
        const screenX = offsetX + screenPos.x
        const screenY = offsetY + screenPos.y

        if (item.type === 'tile') {
          // 텍스처 스프라이트로 큐브 렌더링
          this.drawIsometricCubeSprite(screenX, screenY, item.height, item.data?.color, item.data?.alpha)
        } else if (item.type === 'selected-highlight') {
          // 선택된 타일 하이라이트를 스프라이트로 렌더링
          this.drawSelectedHighlightSprite(screenX, screenY, item.height)
        } else if (item.type === 'hover-highlight') {
          // 호버된 타일 하이라이트를 스프라이트로 렌더링
          this.drawHoverHighlightSprite(screenX, screenY, item.height)
        }
      }

      // 격자선 렌더링 (showGrid가 true이고 level-0 타일이 있는 경우)
      if (this.showGrid) {
        this.renderGridLines(offsetX, offsetY)
      }

    } catch (error) {
      console.error('MainScene: Error rendering grid:', error)
    }
  }

  /**
   * 격자선 렌더링 (level-0 타일 경계)
   */
  private renderGridLines(offsetX: number, offsetY: number): void {
    if (!this.grid || !this.gameMap || !this.gridGraphics) return

    // 격자선 스타일 설정
    this.gridGraphics.lineStyle(1, 0x666666, 0.5) // 회색, 50% 투명도

    // level-0 타일들에 대해서만 격자선 그리기
    for (let x = 0; x < this.grid.width; x++) {
      for (let y = 0; y < this.grid.height; y++) {
        const height = this.gameMap.getTileHeight(x, y)

        // level-0 타일에만 격자선 표시
        if (height === 0) {
          const screenPos = this.grid.gridToScreen({ x, y })
          const screenX = offsetX + screenPos.x
          const screenY = offsetY + screenPos.y

          // 아이소메트릭 다이아몬드 격자선 그리기
          this.gridGraphics.beginPath()
          this.gridGraphics.moveTo(screenX, screenY - 16) // 상단
          this.gridGraphics.lineTo(screenX + 32, screenY) // 우측
          this.gridGraphics.lineTo(screenX, screenY + 16) // 하단
          this.gridGraphics.lineTo(screenX - 32, screenY) // 좌측
          this.gridGraphics.closePath()
          this.gridGraphics.strokePath()
        }
      }
    }
  }

  /**
   * 로드된 외부 SVG 에셋들의 존재 여부를 확인
   */
  private validateLoadedAssets(): void {
    console.log('MainScene: Validating loaded SVG assets...')

    const requiredAssets = [
      'cube-level-0', 'cube-level-1', 'cube-level-2', 'cube-level-3',
      'cube-level-3-golden-svg', 'cube-level-3-diamond-svg',
      'highlight-selected-0', 'highlight-selected-1', 'highlight-selected-2', 'highlight-selected-3',
      'highlight-hover-0', 'highlight-hover-1', 'highlight-hover-2', 'highlight-hover-3'
    ]

    const missingAssets: string[] = []

    for (const assetKey of requiredAssets) {
      if (!this.textures.exists(assetKey)) {
        missingAssets.push(assetKey)
      }
    }

    if (missingAssets.length > 0) {
      console.warn('MainScene: Missing SVG assets:', missingAssets)
    } else {
      console.log('MainScene: All required SVG assets loaded successfully')
    }
  }
  /**
   * 아이소메트릭 좌표에서 깊이 값 계산
   * 아이소메트릭 뷰에서는 x + y 값이 클수록 화면 앞쪽에 위치
   */
  private calculateDepth(gridX: number, gridY: number): number {
    return gridX + gridY
  }

  /**
   * 외부 SVG 에셋을 사용한 아이소메트릭 큐브 렌더링
   * 모든 텍스처는 외부 SVG에서 로드되며 런타임 생성 로직 제거
   */
  private drawIsometricCubeSprite(centerX: number, centerY: number, height: number, color?: number, alpha = 0.9): void {
    if (!this.cubeSprites) return

    try {
      // 그리드 좌표 역산 (렌더링 위치에서 그리드 좌표 계산)
      const gridPos = this.screenToGrid(centerX - 400, centerY - 150) // 오프셋 보정

      // 커스텀 텍스처 조건 확인
      const customTextureKey = this.getCustomTextureKey(gridPos.x, gridPos.y, height)

      // 텍스처 키 결정 (커스텀 또는 기본)
      let textureKey: string
      if (customTextureKey && this.textures.exists(customTextureKey)) {
        textureKey = customTextureKey
      } else {
        // 기본 텍스처 키 결정 (높이별, 0-3 레벨 지원)
        switch (height) {
          case 0: textureKey = 'cube-level-0'; break
          case 1: textureKey = 'cube-level-1'; break
          case 2: textureKey = 'cube-level-2'; break
          case 3: textureKey = 'cube-level-3'; break
          default: textureKey = 'cube-level-1'; break
        }
      }

      // 텍스처가 존재하는지 확인
      if (!this.textures.exists(textureKey)) {
        console.warn(`MainScene: SVG texture '${textureKey}' not found, using fallback rendering`)
        this.drawIsometricCube(centerX, centerY, height, color, alpha)
        return
      }

      // 스프라이트 생성 및 위치 설정
      const cubeSprite = this.add.image(centerX, centerY, textureKey)

      // 앵커를 중앙 하단으로 설정
      cubeSprite.setOrigin(0.5, 1.0)

      // 투명도 설정
      cubeSprite.setAlpha(alpha)

      // 외부 SVG 에셋 사용 시에는 색상 오버레이를 적용하지 않음
      // SVG 파일에서 이미 완성된 색상으로 제공되므로 원본 유지

      // 깊이 정렬을 위한 depth 설정
      cubeSprite.setDepth(centerY)

      // 스프라이트 그룹에 추가
      this.cubeSprites.add(cubeSprite)

    } catch (error) {
      console.error('MainScene: Error drawing cube sprite:', error)
      // 에러 발생 시 폴백 렌더링
      this.drawIsometricCube(centerX, centerY, height, color, alpha)
    }
  }

  /**
   * 특정 위치와 높이에 대한 커스텀 텍스처 키를 반환
   * 외부 SVG 에셋만 사용하는 방식으로 변경
   */
  private getCustomTextureKey(gridX: number, gridY: number, height: number): string | null {
    if (!this.grid) return null

    // 예시 1: 중앙 특별 구역 (5x5)의 레벨 3 타일들을 황금 큐브로
    const centerX = Math.floor(this.grid.width / 2)
    const centerY = Math.floor(this.grid.height / 2)

    if (height === 3 &&
        Math.abs(gridX - centerX) <= 2 &&
        Math.abs(gridY - centerY) <= 2) {
      return 'cube-level-3-golden-svg' // 외부 SVG 사용
    }

    // 예시 2: 모서리 구역의 레벨 3 타일들을 다이아몬드 큐브로
    if (height === 3 &&
        (gridX === 0 || gridX === this.grid.width - 1 ||
         gridY === 0 || gridY === this.grid.height - 1)) {
      return 'cube-level-3-diamond-svg' // 외부 SVG 사용
    }

    // 예시 3: 체스판 패턴으로 특별 텍스처 적용
    // if (height === 3 && (gridX + gridY) % 2 === 0) {
    //   return 'cube-level-3-checkered-svg'
    // }

    // 기본값: 커스텀 텍스처를 사용하지 않음
    return null
  }

  /**
   * 화면 좌표를 그리드 좌표로 변환 (역변환)
   * Grid 클래스와 동일한 공식 사용하여 일관성 보장
   * Grid.screenToGrid와 완전히 동일한 구현
   */
  private screenToGrid(screenX: number, screenY: number): { x: number; y: number } {
    if (!this.grid) return { x: 0, y: 0 }

    // Grid 클래스와 완전히 동일한 아이소메트릭 역변환 공식 사용
    const tileWidth = 64
    const tileHeight = 32

    // Grid.screenToGrid와 완전히 동일한 계산 방식
    const gridX = (screenX / (tileWidth / 2) + screenY / (tileHeight / 2)) / 2
    const gridY = (screenY / (tileHeight / 2) - screenX / (tileWidth / 2)) / 2

    return {
      x: Math.round(gridX),
      y: Math.round(gridY)
    }
  }

  /**
   * 아이소메트릭 직육면체(큐브)를 그리는 메서드 (폴백용)
   * 외부 SVG 에셋 로딩 실패 시 사용되는 직접 그리기 방식
   * 레벨 0-3 지원 (레벨 0은 평면 바닥)
   */
  private drawIsometricCube(centerX: number, centerY: number, height: number, color = 0x34495e, alpha = 0.9): void {
    if (!this.cubeSprites) return

    console.warn('MainScene: Using fallback cube rendering - External SVG assets may not be loaded')

    // 임시 그래픽스로 큐브를 그리고 텍스처로 변환
    const tempGraphics = this.add.graphics()
    const tileWidth = 64
    const tileHeight = 32

    if (height === 0) {
      // 레벨 0: 평면 바닥 렌더링
      const floorColor = 0x95a5a6 // 바닥색

      tempGraphics.fillStyle(floorColor, alpha)
      tempGraphics.beginPath()
      tempGraphics.moveTo(0, -tileHeight / 2)
      tempGraphics.lineTo(tileWidth / 2, 0)
      tempGraphics.lineTo(0, tileHeight / 2)
      tempGraphics.lineTo(-tileWidth / 2, 0)
      tempGraphics.closePath()
      tempGraphics.fillPath()

      // 테두리 추가
      tempGraphics.lineStyle(1, 0x7f8c8d, 0.8)
      tempGraphics.strokePath()
    } else {
      // 레벨 1-3: 3D 큐브 렌더링
      const cubeHeight = height * 16

      // 색상 계산
      const topColor = this.lightenColor(color, 0.3)
      const leftColor = this.darkenColor(color, 0.2)
      const rightColor = this.darkenColor(color, 0.4)

      // 큐브 그리기 (기존 로직과 동일)
      tempGraphics.fillStyle(topColor, alpha)
      tempGraphics.beginPath()
      tempGraphics.moveTo(0, -tileHeight / 2 - cubeHeight)
      tempGraphics.lineTo(tileWidth / 2, -cubeHeight)
      tempGraphics.lineTo(0, tileHeight / 2 - cubeHeight)
      tempGraphics.lineTo(-tileWidth / 2, -cubeHeight)
      tempGraphics.closePath()
      tempGraphics.fillPath()

      // 좌측면
      tempGraphics.fillStyle(leftColor, alpha)
      tempGraphics.beginPath()
      tempGraphics.moveTo(-tileWidth / 2, -cubeHeight)
      tempGraphics.lineTo(0, tileHeight / 2 - cubeHeight)
      tempGraphics.lineTo(0, tileHeight / 2)
      tempGraphics.lineTo(-tileWidth / 2, 0)
      tempGraphics.closePath()
      tempGraphics.fillPath()

      // 우측면
      tempGraphics.fillStyle(rightColor, alpha)
      tempGraphics.beginPath()
      tempGraphics.moveTo(tileWidth / 2, -cubeHeight)
      tempGraphics.lineTo(0, tileHeight / 2 - cubeHeight)
      tempGraphics.lineTo(0, tileHeight / 2)
      tempGraphics.lineTo(tileWidth / 2, 0)
      tempGraphics.closePath()
      tempGraphics.fillPath()
    }

    // 위치 설정 및 그룹에 추가
    tempGraphics.setPosition(centerX, centerY)
    tempGraphics.setDepth(centerY)
    this.cubeSprites.add(tempGraphics)
  }

  /**
   * 색상을 밝게 만드는 헬퍼 함수
   */
  private lightenColor(color: number, factor: number): number {
    const r = (color >> 16) & 0xFF
    const g = (color >> 8) & 0xFF
    const b = color & 0xFF

    const newR = Math.min(255, Math.floor(r + (255 - r) * factor))
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor))
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor))

    return (newR << 16) | (newG << 8) | newB
  }

  /**
   * 색상을 어둡게 만드는 헬퍼 함수
   */
  private darkenColor(color: number, factor: number): number {
    const r = (color >> 16) & 0xFF
    const g = (color >> 8) & 0xFF
    const b = color & 0xFF

    const newR = Math.floor(r * (1 - factor))
    const newG = Math.floor(g * (1 - factor))
    const newB = Math.floor(b * (1 - factor))

    return (newR << 16) | (newG << 8) | newB
  }

  /**
   * 3D 아이소메트릭 히트 테스트 - 간소화된 버전
   * Phaser의 기본 기능을 활용하여 성능 최적화
   */
  private performIsometricHitTest(mouseX: number, mouseY: number): { gridX: number; gridY: number; tileHeight: number } | null {
    if (!this.grid || !this.gameMap) return null

    // 카메라 스크롤 위치를 고려한 월드 좌표 계산
    const worldMouseX = mouseX + this.cameras.main.scrollX
    const worldMouseY = mouseY + this.cameras.main.scrollY

    const offsetX = 400
    const offsetY = 150

    // 그리드 렌더링 영역의 대략적인 경계 미리 체크
    const gridScreenBounds = this.calculateGridScreenBounds(offsetX, offsetY)
    if (worldMouseX < gridScreenBounds.left - 50 || worldMouseX > gridScreenBounds.right + 50 ||
        worldMouseY < gridScreenBounds.top - 50 || worldMouseY > gridScreenBounds.bottom + 50) {
      if (this.showHitTestDebug) {
        console.log(`Hit test rejected: Mouse outside grid rendering area`)
      }
      return null
    }

    // 1단계: 대략적인 그리드 좌표 계산 (빠른 필터링)
    const approximateGridPos = this.screenToGrid(worldMouseX - offsetX, worldMouseY - offsetY)

    // 그리드 경계를 더 엄격하게 체크 - 경계 밖 좌표는 완전 차단
    if (approximateGridPos.x < 0 || approximateGridPos.x >= this.grid.width ||
        approximateGridPos.y < 0 || approximateGridPos.y >= this.grid.height) {
      if (this.showHitTestDebug) {
        console.log(`Hit test rejected: Grid pos (${approximateGridPos.x}, ${approximateGridPos.y}) is outside bounds (0-${this.grid.width-1}, 0-${this.grid.height-1})`)
      }
      return null
    }

    // 2단계: 현재 타일과 인접한 타일만 검사 (1x1 또는 3x3 영역)
    // 그리드 경계를 벗어나는 영역은 엄격하게 제외
    const candidateTiles: Array<{ x: number; y: number; depth: number; height: number; isCenterTile: boolean }> = []

    // 검사 범위를 현재 타일 중심으로 제한 (성능 최적화)
    // 정확한 히트 테스트를 위해 주변 1칸까지만 검사
    const minX = Math.max(0, approximateGridPos.x - 1)
    const maxX = Math.min(this.grid.width - 1, approximateGridPos.x + 1)
    const minY = Math.max(0, approximateGridPos.y - 1)
    const maxY = Math.min(this.grid.height - 1, approximateGridPos.y + 1)

    // 디버깅 로그 추가
    if (this.showHitTestDebug) {
      console.log(`Hit test: Mouse(${mouseX}, ${mouseY}) World(${worldMouseX}, ${worldMouseY}) ApproxGrid(${approximateGridPos.x}, ${approximateGridPos.y})`)
      console.log(`Search range: X(${minX}-${maxX}) Y(${minY}-${maxY}) Grid bounds: (0-${this.grid.width-1}, 0-${this.grid.height-1})`)
    }

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const depth = this.calculateDepth(x, y)
        const height = this.gameMap.getTileHeight(x, y)

        // 중앙 타일 여부 확인 (정확히 일치하는 경우만)
        const isCenterTile = (x === approximateGridPos.x && y === approximateGridPos.y)

        // Level 0 타일의 경우 중앙 타일만 포함하여 정확한 히트 테스트 적용
        let shouldInclude = false

        if (height === 0) {
          // Level 0 타일은 중앙 타일인 경우에만 포함
          shouldInclude = isCenterTile
        } else {
          // Level 1+ 타일은 모두 포함 (높이가 있어서 클릭 영역이 넓음)
          shouldInclude = true
        }

        if (shouldInclude) {
          candidateTiles.push({ x, y, depth, height, isCenterTile })
        } else if (this.showHitTestDebug) {
          console.log(`Excluding level-0 tile: (${x},${y}) - not center tile`)
        }
      }
    }

    // 3단계: 중앙 타일 우선, 그 다음 깊이 순으로 정렬하여 검사
    candidateTiles.sort((a, b) => {
      // 중앙 타일을 항상 우선적으로 검사
      if (a.isCenterTile && !b.isCenterTile) return -1
      if (!a.isCenterTile && b.isCenterTile) return 1
      // 중앙 타일이 아닌 경우 깊이 순으로 정렬 (높은 depth = 앞쪽)
      return b.depth - a.depth
    })

    // 디버깅 로그 추가
    if (this.showHitTestDebug) {
      console.log('Candidate tiles (depth sorted):', candidateTiles.map(t => `(${t.x},${t.y},h:${t.height},d:${t.depth}${t.isCenterTile ? ',CENTER' : ''})`))
    }

    // 4단계: Phaser 기본 기능 활용한 간단한 히트 테스트
    for (const tile of candidateTiles) {
      const screenPos = this.grid.gridToScreen({ x: tile.x, y: tile.y })
      const centerX = offsetX + screenPos.x
      const centerY = offsetY + screenPos.y

      // 간소화된 히트 테스트: 다이아몬드 + 높이 보정
      const isHit = this.isPointInTileArea(worldMouseX, worldMouseY, centerX, centerY, tile.height)

      if (this.showHitTestDebug) {
        console.log(`Testing tile (${tile.x},${tile.y}) height:${tile.height} center:(${centerX},${centerY}) -> ${isHit}`)
      }

      if (isHit) {
        if (this.showHitTestDebug) {
          console.log(`✅ Hit detected: tile (${tile.x},${tile.y}) height:${tile.height}`)
        }
        return { gridX: tile.x, gridY: tile.y, tileHeight: tile.height }
      }
    }

    return null
  }

  /**
   * 간소화된 타일 영역 체크 - Phaser 기하학 함수 활용
   */
  private isPointInTileArea(
    pointX: number,
    pointY: number,
    centerX: number,
    centerY: number,
    height: number
  ): boolean {
    const tileWidth = 64
    const tileHeight = 32
    const cubeHeight = height * 16

    // Level 0: 다이아몬드만 체크
    if (height === 0) {
      return this.isPointInDiamond(pointX, pointY, centerX, centerY, tileWidth, tileHeight)
    }

    // Level 1+: 확장된 영역 체크 (사각형 근사)
    const topY = centerY - cubeHeight - tileHeight / 2
    const bottomY = centerY + tileHeight / 2
    const leftX = centerX - tileWidth / 2

    // Phaser의 Rectangle.contains 사용
    const boundingRect = new Phaser.Geom.Rectangle(leftX, topY, tileWidth, bottomY - topY)

    if (Phaser.Geom.Rectangle.Contains(boundingRect, pointX, pointY)) {
      // 사각형 내부에 있으면 다이아몬드 체크로 정밀도 향상
      return this.isPointInDiamond(pointX, pointY, centerX, centerY - cubeHeight, tileWidth, tileHeight) ||
             this.isPointInDiamond(pointX, pointY, centerX, centerY, tileWidth, tileHeight)
    }

    return false
  }

  /**
   * 점이 마름모(다이아몬드) 내부에 있는지 확인
   * 아이소메트릭 다이아몬드에 특화된 정확한 계산
   */
  private isPointInDiamond(pointX: number, pointY: number, centerX: number, centerY: number, width: number, height: number): boolean {
    const dx = pointX - centerX
    const dy = pointY - centerY

    // 아이소메트릭 다이아몬드의 정확한 경계 조건
    // 마름모의 4개 변을 직선 방정식으로 정의하여 내부 체크
    const halfWidth = width / 2
    const halfHeight = height / 2

    // 4개 변의 경계 조건 (더 엄격한 체크):
    // 각 변은 다음과 같은 직선 방정식을 가짐
    const slope = halfHeight / halfWidth

    // 마름모의 각 모서리 좌표
    // 상단: (centerX, centerY - halfHeight)
    // 우측: (centerX + halfWidth, centerY)
    // 하단: (centerX, centerY + halfHeight)
    // 좌측: (centerX - halfWidth, centerY)

    // 4개 변에 대한 내부 체크 (모든 조건을 만족해야 내부)
    const aboveTopRight = dy >= -slope * dx - halfHeight  // 상단-우측 변 위쪽
    const belowBottomRight = dy <= slope * dx + halfHeight  // 하단-우측 변 아래쪽
    const belowBottomLeft = dy <= -slope * dx + halfHeight  // 하단-좌측 변 아래쪽
    const aboveTopLeft = dy >= slope * dx - halfHeight  // 상단-좌측 변 위쪽

    const isInside = aboveTopRight && belowBottomRight && belowBottomLeft && aboveTopLeft

    // 디버깅 정보 출력 (근처 점만)
    if (this.showHitTestDebug && Math.abs(dx) < 40 && Math.abs(dy) < 25) {
      console.log(`Diamond test: point(${pointX.toFixed(1)},${pointY.toFixed(1)}) vs center(${centerX.toFixed(1)},${centerY.toFixed(1)}) -> ${isInside}`)
      console.log(`  dx:${dx.toFixed(1)} dy:${dy.toFixed(1)} | TR:${aboveTopRight} BR:${belowBottomRight} BL:${belowBottomLeft} TL:${aboveTopLeft}`)
    }

    return isInside
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.grid) return

    try {
      // 우클릭인 경우 드래그 모드 시작
      if (pointer.rightButtonDown()) {
        this.isDragging = true
        this.dragStartX = pointer.x
        this.dragStartY = pointer.y
        this.initialCameraX = this.cameras.main.scrollX
        this.initialCameraY = this.cameras.main.scrollY
        return
      }

      // 좌클릭인 경우 타일 선택 처리
      if (pointer.leftButtonDown()) {
        // 3D 아이소메트릭 히트 테스트로 타일 찾기
        const hitResult = this.performIsometricHitTest(pointer.x, pointer.y)

        if (hitResult) {
          const { gridX, gridY, tileHeight } = hitResult

          // 타일 선택 설정 (지속적인 하이라이트)
          this.setSelectedTile(gridX, gridY)

          // React 컴포넌트에 선택된 타일 정보 전달 (콘솔 로그로 확인)
          if (this.onTileSelectedCallback) {
            this.onTileSelectedCallback({ x: gridX, y: gridY, height: tileHeight })
          }

          console.log(`타일 선택됨: (${gridX}, ${gridY}) | 높이: ${tileHeight}`)
        }
      }

    } catch (error) {
      console.error('MainScene: Error handling pointer down:', error)
    }
  }

  /**
   * 마우스 이동 처리 (호버 효과 + 드래그) - 3D 히트 테스트 사용
   */
  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.grid) return

    try {
      // 드래그 중인 경우 카메라 이동 처리
      if (this.isDragging && pointer.rightButtonDown()) {
        const deltaX = pointer.x - this.dragStartX
        const deltaY = pointer.y - this.dragStartY

        // 카메라를 드래그 방향의 반대로 이동 (자연스러운 드래그 느낌)
        this.cameras.main.setScroll(
          this.initialCameraX - deltaX,
          this.initialCameraY - deltaY
        )
        return
      }

      // 드래그 중이 아닌 경우에만 호버 처리
      if (!this.isDragging) {
        // 히트 테스트 디버깅이 활성화된 경우 시각화
        if (this.showHitTestDebug) {
          this.visualizeHitTestArea(pointer.x, pointer.y)
        }

        // 3D 아이소메트릭 히트 테스트로 호버된 타일 찾기
        const hitResult = this.performIsometricHitTest(pointer.x, pointer.y)

        if (hitResult) {
          const { gridX, gridY } = hitResult
          // 현재 호버된 타일과 다른 경우에만 업데이트
          if (!this.hoveredTile || this.hoveredTile.x !== gridX || this.hoveredTile.y !== gridY) {
            this.setHoveredTile(gridX, gridY)
          }
        } else {
          // 히트되지 않은 경우 호버 해제
          this.clearHoveredTile()
        }
      }

    } catch (error) {
      console.error('MainScene: Error handling pointer move:', error)
    }
  }

  /**
   * 마우스 버튼 릴리즈 처리 (드래그 종료)
   */
  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    try {
      // 우클릭 드래그 종료
      if (this.isDragging && pointer.rightButtonReleased()) {
        this.isDragging = false
      }
    } catch (error) {
      console.error('MainScene: Error handling pointer up:', error)
    }
  }

  /**
   * 마우스 휠 처리 (줌 기능)
   */
  private handleWheel(pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number): void {
    try {
      // 현재 카메라 줌 레벨 가져오기
      const currentZoom = this.cameras.main.zoom

      // 휠 방향에 따른 줌 변화량 계산 (deltaY < 0이면 확대, > 0이면 축소)
      const zoomDirection = deltaY > 0 ? -1 : 1
      const zoomDelta = zoomDirection * this.zoomSpeed

      // 새로운 줌 레벨 계산 및 범위 제한 적용
      const newZoom = Phaser.Math.Clamp(currentZoom + zoomDelta, this.minZoom, this.maxZoom)

      // 마우스 포인터 위치를 중심으로 줌 (자연스러운 줌 효과)
      if (newZoom !== currentZoom) {
        // 카메라 스크롤 위치를 고려한 월드 좌표 계산
        const worldMouseX = pointer.x + this.cameras.main.scrollX
        const worldMouseY = pointer.y + this.cameras.main.scrollY

        // 줌 전 마우스 포인터의 월드 좌표 저장
        const preZoomWorldX = worldMouseX / currentZoom
        const preZoomWorldY = worldMouseY / currentZoom

        // 줌 적용
        this.cameras.main.setZoom(newZoom)

        // 줌 후 마우스 포인터의 월드 좌표 계산
        const postZoomWorldX = worldMouseX / newZoom
        const postZoomWorldY = worldMouseY / newZoom

        // 마우스 포인터 위치가 유지되도록 카메라 스크롤 조정
        const scrollDeltaX = (postZoomWorldX - preZoomWorldX) * newZoom
        const scrollDeltaY = (postZoomWorldY - preZoomWorldY) * newZoom

        this.cameras.main.setScroll(
          this.cameras.main.scrollX + scrollDeltaX,
          this.cameras.main.scrollY + scrollDeltaY
        )

        console.log(`MainScene: Zoom changed from ${currentZoom.toFixed(2)} to ${newZoom.toFixed(2)}`)
      }

    } catch (error) {
      console.error('MainScene: Error handling wheel:', error)
    }
  }

  /**
   * 선택된 타일 하이라이트를 외부 SVG 스프라이트로 렌더링 (0-3 레벨 지원)
   */
  private drawSelectedHighlightSprite(centerX: number, centerY: number, height: number): void {
    if (!this.highlightSprites) return

    // 레벨 0-3 모두 지원
    const textureKey = `highlight-selected-${height}`

    if (!this.textures.exists(textureKey)) {
      console.warn(`MainScene: SVG highlight texture '${textureKey}' not found, using fallback`)
      this.drawSelectedIsometricHighlightDirect(centerX, centerY, height)
      return
    }

    const highlightSprite = this.add.image(centerX, centerY, textureKey)
    highlightSprite.setOrigin(0.5, 1.0)
    highlightSprite.setDepth(centerY + 0.1) // 큐브보다 약간 앞에
    this.highlightSprites.add(highlightSprite)
  }

  /**
   * 호버된 타일 하이라이트를 외부 SVG 스프라이트로 렌더링 (0-3 레벨 지원)
   */
  private drawHoverHighlightSprite(centerX: number, centerY: number, height: number): void {
    if (!this.highlightSprites) return

    // 레벨 0-3 모두 지원
    const textureKey = `highlight-hover-${height}`

    if (!this.textures.exists(textureKey)) {
      console.warn(`MainScene: SVG highlight texture '${textureKey}' not found, using fallback`)
      this.drawHoverIsometricHighlightDirect(centerX, centerY, height)
      return
    }

    const highlightSprite = this.add.image(centerX, centerY, textureKey)
    highlightSprite.setOrigin(0.5, 1.0)
    highlightSprite.setDepth(centerY + 0.05) // 큐브보다 약간 앞에, 선택보다는 뒤에
    this.highlightSprites.add(highlightSprite)
  }

  /**
   * 선택된 타일 하이라이트를 직접 그리기 (폴백용)
   */
  private drawSelectedIsometricHighlightDirect(centerX: number, centerY: number, height: number): void {
    if (!this.gridGraphics) return

    const tileWidth = 64
    const tileHeight = 32
    const cubeHeight = height * 16

    // 선택 하이라이트 색상 (밝은 노란색/금색)
    const topColor = 0xf1c40f
    const strokeColor = 0xffffff

    // 상단 마름모 위치 (큐브 높이만큼 위로)
    const topCenterY = centerY - cubeHeight

    // 윗면 마름모만 그리기 (채우기)
    this.gridGraphics.fillStyle(topColor, 0.7)
    this.gridGraphics.beginPath()
    this.gridGraphics.moveTo(centerX, topCenterY - tileHeight / 2)
    this.gridGraphics.lineTo(centerX + tileWidth / 2, topCenterY)
    this.gridGraphics.lineTo(centerX, topCenterY + tileHeight / 2)
    this.gridGraphics.lineTo(centerX - tileWidth / 2, topCenterY)
    this.gridGraphics.closePath()
    this.gridGraphics.fillPath()

    // 테두리
    this.gridGraphics.lineStyle(3, strokeColor, 0.9)
    this.gridGraphics.strokePath()
  }

  /**
   * 호버된 타일 하이라이트를 직접 그리기 (깊이 정렬된 렌더링 큐에서 사용)
   */
  private drawHoverIsometricHighlightDirect(centerX: number, centerY: number, height: number): void {
    if (!this.gridGraphics) return

    const tileWidth = 64
    const tileHeight = 32
    const cubeHeight = height * 16

    // 호버 하이라이트 색상 (연한 파란색)
    const topColor = 0x74b9ff
    const strokeColor = 0x0984e3

    // 상단 마름모 위치 (큐브 높이만큼 위로)
    const topCenterY = centerY - cubeHeight

    // 윗면 마름모만 그리기 (채우기)
    this.gridGraphics.fillStyle(topColor, 0.4)
    this.gridGraphics.beginPath()
    this.gridGraphics.moveTo(centerX, topCenterY - tileHeight / 2)
    this.gridGraphics.lineTo(centerX + tileWidth / 2, topCenterY)
    this.gridGraphics.lineTo(centerX, topCenterY + tileHeight / 2)
    this.gridGraphics.lineTo(centerX - tileWidth / 2, topCenterY)
    this.gridGraphics.closePath()
    this.gridGraphics.fillPath()

    // 테두리
    this.gridGraphics.lineStyle(2, strokeColor, 0.8)
    this.gridGraphics.strokePath()
  }

  /**
   * 타일 선택 설정
   */
  setSelectedTile(x: number, y: number): void {
    this.selectedTile = { x, y }
    // 그리드 다시 렌더링하여 하이라이트 업데이트
    if (this.grid && this.gridGraphics) {
      this.renderGrid()
    }
  }

  /**
   * 타일 선택 해제
   */
  clearSelectedTile(): void {
    this.selectedTile = null
    if (this.highlightGraphics) {
      this.highlightGraphics.destroy()
      this.highlightGraphics = null
    }
  }

  /**
   * 호버 타일 설정
   */
  setHoveredTile(x: number, y: number): void {
    this.hoveredTile = { x, y }
    // 호버 하이라이트는 이제 렌더링 큐에서 처리되므로 전체 그리드 재렌더링
    if (this.grid && this.gridGraphics) {
      this.renderGrid()
    }
  }

  /**
   * 호버 타일 해제
   */
  clearHoveredTile(): void {
    this.hoveredTile = null
    // 호버 해제 시에도 그리드 재렌더링하여 호버 하이라이트 제거
    if (this.grid && this.gridGraphics) {
      this.renderGrid()
    }
    // 기존 호버 그래픽스 정리 (혹시 남아있을 경우)
    if (this.hoverGraphics) {
      this.hoverGraphics.destroy()
      this.hoverGraphics = null
    }
  }

  /**
   * 히트 테스트 영역 시각화 (디버깅용)
   */
  private visualizeHitTestArea(mouseX: number, mouseY: number): void {
    if (!this.grid || !this.gameMap || !this.hitTestDebugGraphics) {
      console.warn('MainScene: visualizeHitTestArea - Required objects not available')
      return
    }

    // 이전 디버깅 그래픽스 클리어
    this.hitTestDebugGraphics.clear()

    // 카메라 스크롤 위치를 고려한 월드 좌표 계산
    const worldMouseX = mouseX + this.cameras.main.scrollX
    const worldMouseY = mouseY + this.cameras.main.scrollY

    const offsetX = 400
    const offsetY = 150

    // 대략적인 그리드 좌표 계산
    const approximateGridPos = this.screenToGrid(worldMouseX - offsetX, worldMouseY - offsetY)

    // 근사 좌표가 그리드 경계 밖인 경우 시각화 조기 종료
    if (approximateGridPos.x < -1 || approximateGridPos.x > this.grid.width ||
        approximateGridPos.y < -1 || approximateGridPos.y > this.grid.height) {
      // 마우스 포인터만 표시하고 종료
      this.hitTestDebugGraphics.fillStyle(0xffffff, 0.8)
      this.hitTestDebugGraphics.fillCircle(worldMouseX, worldMouseY, 3)
      return
    }

    // 검사 대상 타일들 - performIsometricHitTest와 동일한 로직 사용
    const candidateTiles: Array<{ x: number; y: number; depth: number; height: number; isCenterTile: boolean }> = []

    // 검사 범위를 그리드 경계 내로 엄격하게 제한
    const minX = Math.max(0, approximateGridPos.x - 1)
    const maxX = Math.min(this.grid.width - 1, approximateGridPos.x + 1)
    const minY = Math.max(0, approximateGridPos.y - 1)
    const maxY = Math.min(this.grid.height - 1, approximateGridPos.y + 1)

    // 유효한 검사 범위가 없는 경우 조기 종료
    if (minX > maxX || minY > maxY) {
      // 마우스 포인터만 표시하고 종료
      this.hitTestDebugGraphics.fillStyle(0xffffff, 0.8)
      this.hitTestDebugGraphics.fillCircle(worldMouseX, worldMouseY, 3)
      return
    }

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const depth = this.calculateDepth(x, y)
        const height = this.gameMap.getTileHeight(x, y)

        // 중앙 타일 여부 확인 (실제 그리드 좌표 기준, 경계 내에서만)
        const isCenterTile = (x === approximateGridPos.x && y === approximateGridPos.y &&
                             approximateGridPos.x >= 0 && approximateGridPos.x < this.grid.width &&
                             approximateGridPos.y >= 0 && approximateGridPos.y < this.grid.height)

        // performIsometricHitTest와 동일한 엄격한 필터링 조건 적용
        let shouldInclude = false

        if (height === 0) {
          // Level 0 타일은 중앙 타일이거나, 높이 시각화/격자 표시 모드에서만 포함
          // 기본 모드에서는 중앙 타일(마우스 바로 아래)만 허용
          shouldInclude = isCenterTile || this.heightVisualization || this.showGrid
        } else {
          // Level 1+ 타일은 항상 포함 (높이가 있어서 클릭 가능)
          shouldInclude = true
        }

        if (shouldInclude) {
          candidateTiles.push({ x, y, depth, height, isCenterTile })
        }
      }
    }

    // 각 후보 타일에 대해 히트 테스트 영역 시각화
    for (const tile of candidateTiles) {
      const screenPos = this.grid.gridToScreen({ x: tile.x, y: tile.y })
      const centerX = offsetX + screenPos.x
      const centerY = offsetY + screenPos.y

      // 히트 테스트 성공 여부 확인
      const isHit = this.isPointInTileArea(worldMouseX, worldMouseY, centerX, centerY, tile.height)

      if (isHit) {
        // 히트 성공 시 밝은 녹색으로 강조
        this.drawHitTestDebugArea(centerX, centerY, tile.height, 0x00ff00, 0.6)
      } else {
        // 히트 실패 시 연한 빨간색으로 표시
        this.drawHitTestDebugArea(centerX, centerY, tile.height, 0xff0000, 0.3)
      }
    }

    // 마우스 포인터 위치 표시 (흰색 원)
    this.hitTestDebugGraphics.fillStyle(0xffffff, 0.8)
    this.hitTestDebugGraphics.fillCircle(worldMouseX, worldMouseY, 3)

    // 디버깅 정보 콘솔 출력
    if (this.showHitTestDebug) {
      console.log(`Hit test debug: Mouse(${mouseX}, ${mouseY}) World(${worldMouseX}, ${worldMouseY}) Candidates: ${candidateTiles.length} Range: X(${minX}-${maxX}) Y(${minY}-${maxY})`)
      console.log('Visualized candidate tiles:', candidateTiles.map(t => `(${t.x},${t.y},h:${t.height}${t.isCenterTile ? ',CENTER' : ',ADJACENT'})`))

      // 실제 선택된 타일 정보와 비교
      if (this.hoveredTile) {
        console.log(`🎯 Currently hovered tile: (${this.hoveredTile.x}, ${this.hoveredTile.y})`)
        const hoveredScreenPos = this.grid.gridToScreen({ x: this.hoveredTile.x, y: this.hoveredTile.y })
        const hoveredCenterX = offsetX + hoveredScreenPos.x
        const hoveredCenterY = offsetY + hoveredScreenPos.y
        console.log(`🎯 Hovered tile screen position: (${hoveredCenterX}, ${hoveredCenterY})`)

        // 히트테스트 디버깅 영역과 실제 선택 타일의 좌표 차이 확인
        const closestCandidate = candidateTiles.find(t => t.x === this.hoveredTile!.x && t.y === this.hoveredTile!.y)
        if (closestCandidate) {
          console.log(`✅ Hovered tile found in candidates`)
        } else {
          console.log(`❌ Hovered tile NOT found in candidates - coordinate mismatch!`)
        }
      }
    }
  }

  /**
   * 히트 테스트 디버깅 영역 그리기
   */
  private drawHitTestDebugArea(centerX: number, centerY: number, height: number, color: number, alpha: number): void {
    if (!this.hitTestDebugGraphics) return

    const tileWidth = 64
    const tileHeight = 32
    const cubeHeight = height * 16

    if (height === 0) {
      // Level 0: 다이아몬드만 그리기
      this.hitTestDebugGraphics.fillStyle(color, alpha)
      this.hitTestDebugGraphics.beginPath()
      this.hitTestDebugGraphics.moveTo(centerX, centerY - tileHeight / 2)
      this.hitTestDebugGraphics.lineTo(centerX + tileWidth / 2, centerY)
      this.hitTestDebugGraphics.lineTo(centerX, centerY + tileHeight / 2)
      this.hitTestDebugGraphics.lineTo(centerX - tileWidth / 2, centerY)
      this.hitTestDebugGraphics.closePath()
      this.hitTestDebugGraphics.fillPath()

      // 테두리 그리기
      this.hitTestDebugGraphics.lineStyle(2, color, Math.min(1.0, alpha + 0.2))
      this.hitTestDebugGraphics.strokePath()
    } else {
      // Level 1+: 사각형 영역 + 상단/하단 다이아몬드
      const topY = centerY - cubeHeight - tileHeight / 2
      const bottomY = centerY + tileHeight / 2
      const leftX = centerX - tileWidth / 2

      // 사각형 영역
      this.hitTestDebugGraphics.fillStyle(color, alpha * 0.5)
      this.hitTestDebugGraphics.fillRect(leftX, topY, tileWidth, bottomY - topY)

      // 상단 다이아몬드
      this.hitTestDebugGraphics.fillStyle(color, alpha)
      this.hitTestDebugGraphics.beginPath()
      this.hitTestDebugGraphics.moveTo(centerX, centerY - cubeHeight - tileHeight / 2)
      this.hitTestDebugGraphics.lineTo(centerX + tileWidth / 2, centerY - cubeHeight)
      this.hitTestDebugGraphics.lineTo(centerX, centerY - cubeHeight + tileHeight / 2)
      this.hitTestDebugGraphics.lineTo(centerX - tileWidth / 2, centerY - cubeHeight)
      this.hitTestDebugGraphics.closePath()
      this.hitTestDebugGraphics.fillPath()

      // 하단 다이아몬드
      this.hitTestDebugGraphics.beginPath()
      this.hitTestDebugGraphics.moveTo(centerX, centerY - tileHeight / 2)
      this.hitTestDebugGraphics.lineTo(centerX + tileWidth / 2, centerY)
      this.hitTestDebugGraphics.lineTo(centerX, centerY + tileHeight / 2)
      this.hitTestDebugGraphics.lineTo(centerX - tileWidth / 2, centerY)
      this.hitTestDebugGraphics.closePath()
      this.hitTestDebugGraphics.fillPath()

      // 테두리 그리기 (전체 영역에 대해)
      this.hitTestDebugGraphics.lineStyle(2, color, Math.min(1.0, alpha + 0.2))
      this.hitTestDebugGraphics.strokePath()
    }
  }

  /**
   * 그리드가 렌더링될 화면 영역의 경계를 계산
   */
  private calculateGridScreenBounds(offsetX: number, offsetY: number): { left: number; right: number; top: number; bottom: number } {
    if (!this.grid) {
      return { left: 0, right: 0, top: 0, bottom: 0 }
    }

    // 그리드의 네 모서리 좌표를 화면 좌표로 변환
    const topLeft = this.grid.gridToScreen({ x: 0, y: 0 })
    const topRight = this.grid.gridToScreen({ x: this.grid.width - 1, y: 0 })
    const bottomLeft = this.grid.gridToScreen({ x: 0, y: this.grid.height - 1 })
    const bottomRight = this.grid.gridToScreen({ x: this.grid.width - 1, y: this.grid.height - 1 })

    // 오프셋 적용
    const corners = [
      { x: offsetX + topLeft.x, y: offsetY + topLeft.y },
      { x: offsetX + topRight.x, y: offsetY + topRight.y },
      { x: offsetX + bottomLeft.x, y: offsetY + bottomLeft.y },
      { x: offsetX + bottomRight.x, y: offsetY + bottomRight.y }
    ]

    // 최소/최대 좌표 계산
    const left = Math.min(...corners.map(c => c.x))
    const right = Math.max(...corners.map(c => c.x))
    const top = Math.min(...corners.map(c => c.y))
    const bottom = Math.max(...corners.map(c => c.y))

    return { left, right, top, bottom }
  }

  /**
   * 현재 줌 레벨 반환
   */
  getCurrentZoom(): number {
    return this.cameras.main.zoom
  }

  /**
   * 줌 레벨을 특정 값으로 설정 (애니메이션 없음)
   */
  setZoom(zoom: number): void {
    const clampedZoom = Phaser.Math.Clamp(zoom, this.minZoom, this.maxZoom)
    this.cameras.main.setZoom(clampedZoom)
    console.log(`MainScene: Zoom set to ${clampedZoom.toFixed(2)}`)
  }

  /**
   * 줌을 기본값(1.0)으로 리셋
   */
  resetZoom(): void {
    this.cameras.main.setZoom(1.0)
    console.log('MainScene: Zoom reset to 1.0')
  }

  /**
   * 줌 설정값 변경
   */
  setZoomSettings(minZoom?: number, maxZoom?: number, zoomSpeed?: number): void {
    if (minZoom !== undefined) {
      this.minZoom = Math.max(0.1, minZoom)
    }
    if (maxZoom !== undefined) {
      this.maxZoom = Math.min(10.0, maxZoom)
    }
    if (zoomSpeed !== undefined) {
      this.zoomSpeed = Math.max(0.01, Math.min(1.0, zoomSpeed))
    }

    // 현재 줌이 새로운 범위를 벗어나면 조정
    const currentZoom = this.cameras.main.zoom
    if (currentZoom < this.minZoom || currentZoom > this.maxZoom) {
      const clampedZoom = Phaser.Math.Clamp(currentZoom, this.minZoom, this.maxZoom)
      this.cameras.main.setZoom(clampedZoom)
    }

    console.log(`MainScene: Zoom settings updated - min: ${this.minZoom}, max: ${this.maxZoom}, speed: ${this.zoomSpeed}`)
  }
}
