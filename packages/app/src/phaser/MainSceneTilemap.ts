import { Grid } from '@cakeaway/simulation-engine'
import Phaser from 'phaser'

/**
 * Phaser.js 메인 게임 씬 - Tilemap 시스템 기반
 * 케이크 공장 시뮬레이션의 기본 렌더링 씬
 */
export class MainSceneTilemap extends Phaser.Scene {
  private grid: Grid | null = null
  private tilemap: Phaser.Tilemaps.Tilemap | null = null
  private tileset: Phaser.Tilemaps.Tileset | null = null
  private layer: Phaser.Tilemaps.TilemapLayer | null = null
  private heightVisualization: boolean = false
  private showGrid: boolean = false
  private selectedTile: { x: number; y: number } | null = null
  private hoveredTile: { x: number; y: number } | null = null
  private onTileSelectedCallback?: (tile: { x: number; y: number; height: number } | null) => void
  private initialMapPath: string = '/assets/tilemaps/default-factory.json'

  // 하이라이트용 그래픽스
  private selectedHighlight: Phaser.GameObjects.Graphics | null = null
  private hoverHighlight: Phaser.GameObjects.Graphics | null = null
  private gridLines: Phaser.GameObjects.Graphics | null = null

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
   * 초기 맵 경로 설정
   */
  public setInitialMapPath(mapPath: string): void {
    // Tilemap 경로를 기존 맵 경로에서 변환
    const tilemapPath = mapPath.replace('/assets/maps/', '/assets/tilemaps/')
    this.initialMapPath = tilemapPath
    this.loadTilemap()
  }

  /**
   * 높이 시각화 토글
   */
  public setHeightVisualization(enabled: boolean): void {
    this.heightVisualization = enabled
    this.updateTileColors()
  }

  /**
   * 격자 표시 토글
   */
  public setShowGrid(enabled: boolean): void {
    this.showGrid = enabled
    this.updateGridDisplay()
  }

  /**
   * 타일 선택 콜백 설정
   */
  public setTileSelectedCallback(callback: (tile: { x: number; y: number; height: number } | null) => void): void {
    this.onTileSelectedCallback = callback
  }

  preload(): void {
    console.log('MainScene: Preloading assets...')

    // 타일셋 이미지 로드
    this.load.image('tileset', '/assets/sprites/tileset-isometric.svg')

    // 초기 타일맵 로드
    this.load.tilemapTiledJSON('defaultMap', this.initialMapPath)
  }

  create(): void {
    console.log('MainScene: Creating scene...')

    try {
      // 그리드 시스템 초기화 (호환성을 위해 유지)
      this.grid = new Grid(20, 15)
      console.log('MainScene: Grid system initialized')

      // 하이라이트용 그래픽스 생성
      this.selectedHighlight = this.add.graphics()
      this.hoverHighlight = this.add.graphics()
      this.gridLines = this.add.graphics()

      // 타일맵 생성
      this.createTilemap()

      // 카메라 설정
      this.setupCamera()

      // 입력 처리 설정
      this.setupInputHandlers()

      console.log('MainScene: Scene creation complete')

    } catch (error) {
      console.error('MainScene: Error creating scene:', error)
    }
  }

  /**
   * 타일맵 로드 및 재생성
   */
  private async loadTilemap(): Promise<void> {
    try {
      // 기존 타일맵 정리
      if (this.layer) {
        this.layer.destroy()
        this.layer = null
      }
      if (this.tilemap) {
        this.tilemap.destroy()
        this.tilemap = null
      }

      // 새 타일맵 로드
      this.load.tilemapTiledJSON('newMap', this.initialMapPath)
      this.load.start()

      this.load.once('complete', () => {
        this.createTilemap()
      })

    } catch (error) {
      console.error('MainScene: Error loading tilemap:', error)
    }
  }

  /**
   * 타일맵 생성
   */
  private createTilemap(): void {
    try {
      // 타일맵 생성
      this.tilemap = this.make.tilemap({
        key: this.cache.tilemap.has('newMap') ? 'newMap' : 'defaultMap'
      })

      // 타일셋 추가
      this.tileset = this.tilemap.addTilesetImage('IsometricTiles', 'tileset')

      if (!this.tileset) {
        console.error('MainScene: Failed to create tileset')
        return
      }

      // 레이어 생성
      this.layer = this.tilemap.createLayer('BaseLayer', this.tileset, 0, 0)

      if (!this.layer) {
        console.error('MainScene: Failed to create layer')
        return
      }

      // 타일맵 중앙 정렬
      const mapWidth = this.tilemap.widthInPixels
      const mapHeight = this.tilemap.heightInPixels
      this.layer.setPosition(
        (this.cameras.main.width - mapWidth) / 2,
        (this.cameras.main.height - mapHeight) / 2 - 100
      )

      console.log('MainScene: Tilemap created successfully')

      // 초기 상태 적용
      this.updateTileColors()
      this.updateGridDisplay()

    } catch (error) {
      console.error('MainScene: Error creating tilemap:', error)
    }
  }

  /**
   * 타일 색상 업데이트 (높이 시각화)
   */
  private updateTileColors(): void {
    if (!this.layer || !this.tilemap) return

    if (this.heightVisualization) {
      // 높이별 색상 적용
      this.layer.forEachTile((tile) => {
        const tileIndex = tile.index
        let tint: number

        switch (tileIndex) {
          case 1: tint = 0xbdc3c7; break // Level 0 - 회색
          case 2: tint = 0x3498db; break // Level 1 - 파란색
          case 3: tint = 0x27ae60; break // Level 2 - 녹색
          case 4: tint = 0xe74c3c; break // Level 3 - 빨간색
          default: tint = 0xffffff; break
        }

        tile.tint = tint
      })
    } else {
      // 기본 색상으로 복원
      this.layer.forEachTile((tile) => {
        tile.tint = 0xffffff
      })
    }
  }

  /**
   * 격자 표시 업데이트
   */
  private updateGridDisplay(): void {
    if (!this.gridLines || !this.tilemap || !this.layer) return

    this.gridLines.clear()

    if (this.showGrid) {
      this.gridLines.lineStyle(1, 0x666666, 0.5)

      // 레벨 0 타일들에만 격자선 표시
      this.layer.forEachTile((tile) => {
        if (tile.index === 1) { // Level 0 타일
          const worldX = this.layer!.tileToWorldX(tile.x)! + this.layer!.x
          const worldY = this.layer!.tileToWorldY(tile.y)! + this.layer!.y

          // 아이소메트릭 다이아몬드 격자선
          this.gridLines!.beginPath()
          this.gridLines!.moveTo(worldX + 32, worldY)
          this.gridLines!.lineTo(worldX + 64, worldY + 16)
          this.gridLines!.lineTo(worldX + 32, worldY + 32)
          this.gridLines!.lineTo(worldX, worldY + 16)
          this.gridLines!.closePath()
          this.gridLines!.strokePath()
        }
      })
    }
  }

  /**
   * 카메라 설정
   */
  private setupCamera(): void {
    // 카메라 줌 및 드래그 설정
    this.cameras.main.setZoom(1)
    this.cameras.main.setBounds(-400, -300, 1600, 1200)

    // 휠 줌 지원
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
      const camera = this.cameras.main
      const zoomFactor = deltaY > 0 ? 0.9 : 1.1
      const newZoom = Phaser.Math.Clamp(camera.zoom * zoomFactor, 0.5, 2.0)
      camera.setZoom(newZoom)
    })
  }

  /**
   * 입력 처리 설정
   */
  private setupInputHandlers(): void {
    // 마우스 입력 처리
    this.input.on('pointerdown', this.handlePointerDown, this)
    this.input.on('pointermove', this.handlePointerMove, this)
    this.input.on('pointerup', this.handlePointerUp, this)
  }

  /**
   * 포인터 다운 처리
   */
  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (pointer.rightButtonDown()) {
      // 우클릭 드래그 시작
      this.isDragging = true
      this.dragStartX = pointer.x
      this.dragStartY = pointer.y
      this.initialCameraX = this.cameras.main.scrollX
      this.initialCameraY = this.cameras.main.scrollY
    } else if (pointer.leftButtonDown()) {
      // 좌클릭 타일 선택
      this.handleTileClick(pointer)
    }
  }

  /**
   * 포인터 이동 처리
   */
  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.isDragging && pointer.rightButtonDown()) {
      // 카메라 드래그
      const deltaX = pointer.x - this.dragStartX
      const deltaY = pointer.y - this.dragStartY
      this.cameras.main.setScroll(
        this.initialCameraX - deltaX,
        this.initialCameraY - deltaY
      )
    } else {
      // 호버 처리
      this.handleTileHover(pointer)
    }
  }

  /**
   * 포인터 업 처리
   */
  private handlePointerUp(): void {
    this.isDragging = false
  }

  /**
   * 타일 클릭 처리
   */
  private handleTileClick(pointer: Phaser.Input.Pointer): void {
    if (!this.layer || !this.tilemap) return

    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    const pointerTileX = this.layer.worldToTileX(worldPoint.x - this.layer.x)
    const pointerTileY = this.layer.worldToTileY(worldPoint.y - this.layer.y)

    if (pointerTileX !== null && pointerTileY !== null) {
      const tile = this.tilemap.getTileAt(pointerTileX, pointerTileY)

      if (tile) {
        this.selectedTile = { x: pointerTileX, y: pointerTileY }
        this.updateSelectedHighlight()

        // 콜백 호출
        if (this.onTileSelectedCallback) {
          const height = this.getTileHeight(tile.index)
          this.onTileSelectedCallback({
            x: pointerTileX,
            y: pointerTileY,
            height
          })
        }
      }
    }
  }

  /**
   * 타일 호버 처리
   */
  private handleTileHover(pointer: Phaser.Input.Pointer): void {
    if (!this.layer || !this.tilemap) return

    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    const pointerTileX = this.layer.worldToTileX(worldPoint.x - this.layer.x)
    const pointerTileY = this.layer.worldToTileY(worldPoint.y - this.layer.y)

    if (pointerTileX !== null && pointerTileY !== null) {
      const tile = this.tilemap.getTileAt(pointerTileX, pointerTileY)

      if (tile) {
        this.hoveredTile = { x: pointerTileX, y: pointerTileY }
        this.updateHoverHighlight()
      }
    } else {
      this.hoveredTile = null
      this.updateHoverHighlight()
    }
  }

  /**
   * 선택 하이라이트 업데이트
   */
  private updateSelectedHighlight(): void {
    if (!this.selectedHighlight || !this.layer) return

    this.selectedHighlight.clear()

    if (this.selectedTile) {
      const worldX = this.layer.tileToWorldX(this.selectedTile.x)! + this.layer.x
      const worldY = this.layer.tileToWorldY(this.selectedTile.y)! + this.layer.y

      this.selectedHighlight.lineStyle(3, 0xffd700, 0.8)
      this.selectedHighlight.beginPath()
      this.selectedHighlight.moveTo(worldX + 32, worldY)
      this.selectedHighlight.lineTo(worldX + 64, worldY + 16)
      this.selectedHighlight.lineTo(worldX + 32, worldY + 32)
      this.selectedHighlight.lineTo(worldX, worldY + 16)
      this.selectedHighlight.closePath()
      this.selectedHighlight.strokePath()
    }
  }

  /**
   * 호버 하이라이트 업데이트
   */
  private updateHoverHighlight(): void {
    if (!this.hoverHighlight || !this.layer) return

    this.hoverHighlight.clear()

    if (this.hoveredTile) {
      const worldX = this.layer.tileToWorldX(this.hoveredTile.x)! + this.layer.x
      const worldY = this.layer.tileToWorldY(this.hoveredTile.y)! + this.layer.y

      this.hoverHighlight.lineStyle(2, 0xffffff, 0.6)
      this.hoverHighlight.beginPath()
      this.hoverHighlight.moveTo(worldX + 32, worldY)
      this.hoverHighlight.lineTo(worldX + 64, worldY + 16)
      this.hoverHighlight.lineTo(worldX + 32, worldY + 32)
      this.hoverHighlight.lineTo(worldX, worldY + 16)
      this.hoverHighlight.closePath()
      this.hoverHighlight.strokePath()
    }
  }

  /**
   * 타일 인덱스에서 높이 계산
   */
  private getTileHeight(tileIndex: number): number {
    switch (tileIndex) {
      case 1: return 0 // Level 0
      case 2: return 1 // Level 1
      case 3: return 2 // Level 2
      case 4: return 3 // Level 3
      default: return 0
    }
  }

  /**
   * 맵 변경
   */
  public async changeMap(mapPath: string): Promise<void> {
    const tilemapPath = mapPath.replace('/assets/maps/', '/assets/tilemaps/')
    this.initialMapPath = tilemapPath
    await this.loadTilemap()
  }
}
