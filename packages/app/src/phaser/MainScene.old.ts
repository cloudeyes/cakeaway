import { Grid } from '@cakeaway/simulation-engine'
import Phaser from 'phaser'
import { GameMap } from './GameMap'

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

  // 스프라이트 관리를 위한 그룹
  private cubeSprites: Phaser.GameObjects.Group | null = null
  private highlightSprites: Phaser.GameObjects.Group | null = null

  // 카메라 드래그 관련 변수들
  private isDragging: boolean = false
  private dragStartX: number = 0
  private dragStartY: number = 0
  private initialCameraX: number = 0
  private initialCameraY: number = 0

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

      // 외부 SVG 에셋 로딩 확인 (런타임 텍스처 생성 로직 제거)
      this.validateLoadedAssets()

      // 비동기 맵 초기화
      this.initializeGameMapAsync()

      // 마우스 입력 이벤트 설정
      this.input.on('pointerdown', this.handlePointerDown, this)
      this.input.on('pointermove', this.handlePointerMove, this)
      this.input.on('pointerup', this.handlePointerUp, this)

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
        ;(window as typeof window & { gameScene: MainScene }).gameScene = this
        console.log('MainScene: Added to window.gameScene for testing')
        console.log('MainScene: Use window.gameScene.changeMap("/assets/maps/test-valley.json") to test map switching')
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
      console.log('MainScene: Rendering isometric grid with texture sprites and depth sorting...')

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

          // 높이별 색상 설정
          let tileColor: number
          if (this.heightVisualization) {
            tileColor = this.gameMap.getHeightBasedColor(height)
          } else {
            // 레벨 0은 바닥색, 나머지는 기본 회색
            tileColor = height === 0
              ? this.gameMap.getFloorColor()
              : 0x34495e
          }

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

      console.log('MainScene: Isometric grid rendering with texture sprites and depth sorting complete')

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
   */
  private screenToGrid(screenX: number, screenY: number): { x: number; y: number } {
    if (!this.grid) return { x: 0, y: 0 }

    // 아이소메트릭 역변환 공식
    const tileWidth = 64
    const tileHeight = 32

    // 스크린 좌표를 정규화
    const normalizedX = screenX / (tileWidth / 2)
    const normalizedY = screenY / (tileHeight / 2)

    // 그리드 좌표 계산
    const gridX = Math.floor((normalizedX + normalizedY) / 2)
    const gridY = Math.floor((normalizedY - normalizedX) / 2)

    // 경계 확인
    const clampedX = Math.max(0, Math.min(this.grid.width - 1, gridX))
    const clampedY = Math.max(0, Math.min(this.grid.height - 1, gridY))

    return { x: clampedX, y: clampedY }
  }  /**
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
   * 3D 아이소메트릭 히트 테스트 - 마우스 좌표에서 실제 큐브와 충돌하는 타일 찾기
   * 카메라 스크롤 위치를 고려하여 정확한 월드 좌표 계산
   */
  private performIsometricHitTest(mouseX: number, mouseY: number): { gridX: number; gridY: number; tileHeight: number } | null {
    if (!this.grid || !this.gameMap) return null

    // 카메라 스크롤 위치를 고려한 월드 좌표 계산
    const worldMouseX = mouseX + this.cameras.main.scrollX
    const worldMouseY = mouseY + this.cameras.main.scrollY

    const offsetX = 400
    const offsetY = 150
    const tileWidth = 64
    const tileHeight = 32

    // 깊이 순으로 정렬된 타일들을 앞에서부터 검사 (front-to-back)
    const sortedTiles = []
    for (let x = 0; x < this.grid.width; x++) {
      for (let y = 0; y < this.grid.height; y++) {
        const depth = this.calculateDepth(x, y)
        const height = this.gameMap.getTileHeight(x, y)
        sortedTiles.push({ x, y, depth, height })
      }
    }

    // 깊이가 큰 것부터 검사 (화면 앞쪽부터) - 올바른 정렬
    sortedTiles.sort((a, b) => b.depth - a.depth)

    for (const tile of sortedTiles) {
      const screenPos = this.grid.gridToScreen({ x: tile.x, y: tile.y })
      const centerX = offsetX + screenPos.x
      const centerY = offsetY + screenPos.y
      const cubeHeight = tile.height * 16

      // 3D 큐브의 각 면에 대해 히트 테스트 (카메라 스크롤을 고려한 월드 좌표 사용)
      if (this.isPointInIsometricCube(worldMouseX, worldMouseY, centerX, centerY, tileWidth, tileHeight, cubeHeight)) {
        return { gridX: tile.x, gridY: tile.y, tileHeight: tile.height }
      }
    }

    return null
  }

  /**
   * 점이 아이소메트릭 큐브 내부에 있는지 확인
   */
  private isPointInIsometricCube(
    pointX: number,
    pointY: number,
    centerX: number,
    centerY: number,
    tileWidth: number,
    tileHeight: number,
    cubeHeight: number
  ): boolean {
    // 1. 윗면 (마름모) 체크
    if (this.isPointInDiamond(pointX, pointY, centerX, centerY - cubeHeight, tileWidth, tileHeight)) {
      return true
    }

    // 2. 왼쪽 면 (평행사변형) 체크
    if (this.isPointInLeftFace(pointX, pointY, centerX, centerY, tileWidth, tileHeight, cubeHeight)) {
      return true
    }

    // 3. 오른쪽 면 (평행사변형) 체크
    if (this.isPointInRightFace(pointX, pointY, centerX, centerY, tileWidth, tileHeight, cubeHeight)) {
      return true
    }

    return false
  }

  /**
   * 점이 마름모(다이아몬드) 내부에 있는지 확인
   */
  private isPointInDiamond(pointX: number, pointY: number, centerX: number, centerY: number, width: number, height: number): boolean {
    const dx = Math.abs(pointX - centerX)
    const dy = Math.abs(pointY - centerY)

    // 마름모의 경계 조건: |x|/halfWidth + |y|/halfHeight <= 1
    return (dx / (width / 2)) + (dy / (height / 2)) <= 1.0
  }

  /**
   * 점이 왼쪽 면에 있는지 확인
   */
  private isPointInLeftFace(
    pointX: number,
    pointY: number,
    centerX: number,
    centerY: number,
    tileWidth: number,
    tileHeight: number,
    cubeHeight: number
  ): boolean {
    // 왼쪽 면의 네 꼭짓점
    const topLeft = { x: centerX - tileWidth / 2, y: centerY - cubeHeight }
    const topRight = { x: centerX, y: centerY + tileHeight / 2 - cubeHeight }
    const bottomRight = { x: centerX, y: centerY + tileHeight / 2 }
    const bottomLeft = { x: centerX - tileWidth / 2, y: centerY }

    return this.isPointInQuadrilateral(pointX, pointY, [topLeft, topRight, bottomRight, bottomLeft])
  }

  /**
   * 점이 오른쪽 면에 있는지 확인
   */
  private isPointInRightFace(
    pointX: number,
    pointY: number,
    centerX: number,
    centerY: number,
    tileWidth: number,
    tileHeight: number,
    cubeHeight: number
  ): boolean {
    // 오른쪽 면의 네 꼭짓점
    const topLeft = { x: centerX, y: centerY + tileHeight / 2 - cubeHeight }
    const topRight = { x: centerX + tileWidth / 2, y: centerY - cubeHeight }
    const bottomRight = { x: centerX + tileWidth / 2, y: centerY }
    const bottomLeft = { x: centerX, y: centerY + tileHeight / 2 }

    return this.isPointInQuadrilateral(pointX, pointY, [topLeft, topRight, bottomRight, bottomLeft])
  }

  /**
   * 점이 사각형 내부에 있는지 확인 (광선 투사 알고리즘)
   */
  private isPointInQuadrilateral(pointX: number, pointY: number, vertices: { x: number; y: number }[]): boolean {
    let inside = false
    const n = vertices.length

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = vertices[i].x
      const yi = vertices[i].y
      const xj = vertices[j].x
      const yj = vertices[j].y

      if (((yi > pointY) !== (yj > pointY)) && (pointX < (xj - xi) * (pointY - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }

    return inside
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
}
