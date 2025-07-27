/**
 * 게임 맵 데이터 및 관리 클래스
 * 케이크 공장 시뮬레이션의 맵 레이아웃과 높이 정보를 관리
 */

export interface MapTileData {
  x: number
  y: number
  height: number // 0-3 레벨 (0: 바닥, 1-3: 높이)
  type: 'floor' | 'tile' | 'special' // 타일 타입
}

export interface MapData {
  width: number
  height: number
  tiles: MapTileData[][]
}

export interface MapConfig {
  name: string
  description: string
  version: string
  width: number
  height: number
  heightMap: number[][]
  specialTiles?: Array<{
    x: number
    y: number
    type: string
    description?: string
  }>
}

/**
 * 게임 맵 관리 클래스
 */
export class GameMap {
  private mapData: MapData
  private mapConfig: MapConfig | null = null

  constructor(width: number, height: number, mapConfigPath?: string) {
    this.mapData = {
      width,
      height,
      tiles: []
    }

    if (mapConfigPath) {
      this.loadMapFromConfig(mapConfigPath)
    } else {
      this.mapData.tiles = this.generateDefaultMap(width, height)
    }
  }

  /**
   * JSON 설정 파일에서 맵 데이터 로드
   */
  private async loadMapFromConfig(configPath: string): Promise<void> {
    try {
      console.log(`GameMap: Loading map configuration from ${configPath}`)

      const response = await fetch(configPath)
      if (!response.ok) {
        throw new Error(`Failed to fetch map config: ${response.statusText}`)
      }

      const config: MapConfig = await response.json()
      this.mapConfig = config

      console.log(`GameMap: Loaded map "${config.name}" (${config.width}x${config.height})`)

      // 설정에서 맵 데이터 생성
      this.mapData = {
        width: config.width,
        height: config.height,
        tiles: this.generateMapFromConfig(config)
      }

    } catch (error) {
      console.error('GameMap: Failed to load map configuration:', error)
      console.log('GameMap: Falling back to default map generation')

      // 실패시 기본 맵 생성
      this.mapData.tiles = this.generateDefaultMap(this.mapData.width, this.mapData.height)
    }
  }

  /**
   * 맵 설정에서 타일 데이터 생성
   */
  private generateMapFromConfig(config: MapConfig): MapTileData[][] {
    const tiles: MapTileData[][] = []

    for (let x = 0; x < config.width; x++) {
      tiles[x] = []
      for (let y = 0; y < config.height; y++) {
        const height = config.heightMap[y][x] // heightMap은 [y][x] 순서
        let tileType: 'floor' | 'tile' | 'special' = height === 0 ? 'floor' : 'tile'

        // 특수 타일 확인
        if (config.specialTiles) {
          const specialTile = config.specialTiles.find(st => st.x === x && st.y === y)
          if (specialTile) {
            tileType = 'special'
          }
        }

        tiles[x][y] = {
          x,
          y,
          height,
          type: tileType
        }
      }
    }

    return tiles
  }

  /**
   * 동기적 맵 로딩 (Phaser에서 사용)
   */
  static async createFromConfig(configPath: string): Promise<GameMap> {
    try {
      console.log(`GameMap: Creating map from config ${configPath}`)

      const response = await fetch(configPath)
      if (!response.ok) {
        throw new Error(`Failed to fetch map config: ${response.statusText}`)
      }

      const config: MapConfig = await response.json()
      const gameMap = new GameMap(config.width, config.height)
      gameMap.mapConfig = config
      gameMap.mapData = {
        width: config.width,
        height: config.height,
        tiles: gameMap.generateMapFromConfig(config)
      }

      console.log(`GameMap: Successfully created map "${config.name}" (${config.width}x${config.height})`)
      return gameMap

    } catch (error) {
      console.error('GameMap: Failed to create map from config:', error)
      console.log('GameMap: Creating default map fallback')

      // 실패시 기본 맵 반환
      return new GameMap(20, 15)
    }
  }

  /**
   * 기본 맵 생성 (0-3 레벨 높이 패턴)
   */
  private generateDefaultMap(width: number, height: number): MapTileData[][] {
    const tiles: MapTileData[][] = []

    for (let x = 0; x < width; x++) {
      tiles[x] = []
      for (let y = 0; y < height; y++) {
        const tileHeight = this.calculateTileHeight(x, y, width, height)
        tiles[x][y] = {
          x,
          y,
          height: tileHeight,
          type: tileHeight === 0 ? 'floor' : 'tile'
        }
      }
    }

    return tiles
  }

  /**
   * 특정 위치의 타일 높이 계산 (0-3 레벨)
   * 0: 기본 바닥 (배경과 구분되는 바닥색)
   * 1-3: 높이별 큐브
   */
  private calculateTileHeight(x: number, y: number, mapWidth: number, mapHeight: number): number {
    // 중앙 기준 거리 계산
    const centerX = Math.floor(mapWidth / 2)
    const centerY = Math.floor(mapHeight / 2)
    const distanceFromCenter = Math.abs(x - centerX) + Math.abs(y - centerY)

    // 가장자리는 레벨 0 (바닥)
    if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
      return 0
    }

    // 중앙부터 높이 패턴 생성
    if (distanceFromCenter <= 2) return 3      // 중앙: 높이 3
    else if (distanceFromCenter <= 4) return 2 // 중간: 높이 2
    else if (distanceFromCenter <= 6) return 1 // 외곽: 높이 1
    else return 0                               // 가장자리: 바닥 0
  }

  /**
   * 맵 설정 정보 가져오기
   */
  getMapConfig(): MapConfig | null {
    return this.mapConfig
  }

  /**
   * 특정 위치의 타일 높이 가져오기
   */
  getTileHeight(x: number, y: number): number {
    if (x < 0 || x >= this.mapData.width || y < 0 || y >= this.mapData.height) {
      return 0 // 맵 범위 밖은 바닥으로 처리
    }
    return this.mapData.tiles[x][y].height
  }

  /**
   * 특정 위치의 타일 데이터 가져오기
   */
  getTileData(x: number, y: number): MapTileData | null {
    if (x < 0 || x >= this.mapData.width || y < 0 || y >= this.mapData.height) {
      return null
    }
    return this.mapData.tiles[x][y]
  }

  /**
   * 맵 크기 가져오기
   */
  getMapSize(): { width: number; height: number } {
    return {
      width: this.mapData.width,
      height: this.mapData.height
    }
  }

  /**
   * 전체 맵 데이터 가져오기
   */
  getMapData(): MapData {
    return this.mapData
  }

  /**
   * 특정 위치의 타일 높이 설정 (향후 건설 시스템용)
   */
  setTileHeight(x: number, y: number, height: number): boolean {
    if (x < 0 || x >= this.mapData.width || y < 0 || y >= this.mapData.height) {
      return false
    }

    if (height < 0 || height > 3) {
      return false
    }

    this.mapData.tiles[x][y].height = height
    this.mapData.tiles[x][y].type = height === 0 ? 'floor' : 'tile'
    return true
  }

  /**
   * 높이별 색상 반환 (높이 시각화용)
   */
  getHeightBasedColor(height: number): number {
    switch (height) {
      case 0: return 0x7f8c8d // 바닥: 밝은 회색
      case 1: return 0x3498db // 레벨 1: 파란색
      case 2: return 0x2ecc71 // 레벨 2: 녹색
      case 3: return 0xe74c3c // 레벨 3: 빨간색
      default: return 0x34495e // 기본: 어두운 회색
    }
  }

  /**
   * 레벨 0 바닥 색상 (배경과 구분되는 기본 바닥색)
   */
  getFloorColor(): number {
    return 0x95a5a6 // 밝은 회색 바닥색 (배경 #34495e와 구분)
  }

  /**
   * 런타임에 다른 맵으로 변경
   */
  async changeMap(configPath: string): Promise<boolean> {
    try {
      console.log(`GameMap: Changing map to ${configPath}`)

      const response = await fetch(configPath)
      if (!response.ok) {
        throw new Error(`Failed to fetch map config: ${response.statusText}`)
      }

      const config: MapConfig = await response.json()
      this.mapConfig = config

      // 새 맵 데이터 생성
      this.mapData = {
        width: config.width,
        height: config.height,
        tiles: this.generateMapFromConfig(config)
      }

      console.log(`GameMap: Successfully changed to map "${config.name}"`)
      return true

    } catch (error) {
      console.error('GameMap: Failed to change map:', error)
      return false
    }
  }
}

export default GameMap
