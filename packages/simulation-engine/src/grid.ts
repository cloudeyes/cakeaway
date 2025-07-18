/**
 * 2D 그리드 좌표를 나타내는 타입
 */
export interface GridPosition {
  x: number;
  y: number;
}

/**
 * 아이소메트릭 화면 좌표를 나타내는 타입
 */
export interface ScreenPosition {
  x: number;
  y: number;
}

/**
 * 타일 타입 열거형
 */
export const TileType = {
  EMPTY: 'empty',
  FLOOR: 'floor',
  WALL: 'wall',
  CONVEYOR: 'conveyor',
  EQUIPMENT: 'equipment'
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

/**
 * 게임 오브젝트 기본 인터페이스
 */
export interface GameObject {
  id: string;
  position: GridPosition;
  type: string;
  created: number;
  updated: number;
}

/**
 * 게임 이벤트 타입
 */
export interface GameEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

/**
 * 게임 상태 인터페이스
 */
export interface GameState {
  grid: Grid;
  gameObjects: Map<string, GameObject>;
  tick: number;
  lastUpdate: number;
  events: GameEvent[];
}

/**
 * 기본 타일 클래스
 */
export class Tile {
  public readonly position: GridPosition;
  public type: TileType;
  public gameObject: GameObject | null;
  public readonly created: number;
  public updated: number;

  constructor(position: GridPosition, type: TileType = TileType.EMPTY) {
    this.position = position;
    this.type = type;
    this.gameObject = null;
    this.created = Date.now();
    this.updated = this.created;
  }

  /**
   * 타일이 비어있는지 확인
   */
  public isEmpty(): boolean {
    return this.type === TileType.EMPTY && this.gameObject === null;
  }

  /**
   * 타일에 게임 오브젝트 배치
   */
  public placeObject(gameObject: GameObject): boolean {
    try {
      if (!this.isEmpty()) {
        console.warn(`Tile at (${this.position.x}, ${this.position.y}) is not empty`);
        return false;
      }

      this.gameObject = gameObject;
      this.updated = Date.now();
      return true;
    } catch (error) {
      console.error('Error placing object on tile:', error);
      return false;
    }
  }

  /**
   * 타일에서 게임 오브젝트 제거
   */
  public removeObject(): GameObject | null {
    try {
      const removedObject = this.gameObject;
      this.gameObject = null;
      this.updated = Date.now();
      return removedObject;
    } catch (error) {
      console.error('Error removing object from tile:', error);
      return null;
    }
  }

  /**
   * 타일 상태를 JSON으로 직렬화
   */
  public toJSON(): Record<string, unknown> {
    return {
      position: this.position,
      type: this.type,
      gameObject: this.gameObject,
      created: this.created,
      updated: this.updated
    };
  }
}

/**
 * 그리드 시스템 클래스
 */
export class Grid {
  public readonly width: number;
  public readonly height: number;
  private tiles: Tile[][];
  private readonly created: number;
  private updated: number;

  constructor(width: number, height: number) {
    if (width <= 0 || height <= 0) {
      throw new Error('Grid dimensions must be positive');
    }

    this.width = width;
    this.height = height;
    this.created = Date.now();
    this.updated = this.created;
    this.tiles = this.initializeTiles();
  }

  /**
   * 타일 배열 초기화
   */
  private initializeTiles(): Tile[][] {
    const tiles: Tile[][] = [];

    for (let x = 0; x < this.width; x++) {
      tiles[x] = [];
      for (let y = 0; y < this.height; y++) {
        tiles[x]![y] = new Tile({ x, y }, TileType.FLOOR);
      }
    }

    return tiles;
  }

  /**
   * 좌표가 그리드 범위 내에 있는지 확인
   */
  public isValidPosition(position: GridPosition): boolean {
    return position.x >= 0 && position.x < this.width &&
           position.y >= 0 && position.y < this.height;
  }

  /**
   * 지정된 위치의 타일 반환
   */
  public getTile(position: GridPosition): Tile | null {
    try {
      if (!this.isValidPosition(position)) {
        return null;
      }
      return this.tiles[position.x]?.[position.y] ?? null;
    } catch (error) {
      console.error('Error getting tile:', error);
      return null;
    }
  }

  /**
   * 지정된 위치에 타일 설정
   */
  public setTile(position: GridPosition, tile: Tile): boolean {
    try {
      if (!this.isValidPosition(position)) {
        console.warn(`Invalid position: (${position.x}, ${position.y})`);
        return false;
      }

      this.tiles[position.x]![position.y] = tile;
      this.updated = Date.now();
      return true;
    } catch (error) {
      console.error('Error setting tile:', error);
      return false;
    }
  }

  /**
   * 지정된 위치에 게임 오브젝트 배치
   */
  public placeObject(position: GridPosition, gameObject: GameObject): boolean {
    try {
      const tile = this.getTile(position);
      if (!tile) {
        console.warn(`No tile at position (${position.x}, ${position.y})`);
        return false;
      }

      return tile.placeObject(gameObject);
    } catch (error) {
      console.error('Error placing object on grid:', error);
      return false;
    }
  }

  /**
   * 지정된 위치에서 게임 오브젝트 제거
   */
  public removeObject(position: GridPosition): GameObject | null {
    try {
      const tile = this.getTile(position);
      if (!tile) {
        return null;
      }

      return tile.removeObject();
    } catch (error) {
      console.error('Error removing object from grid:', error);
      return null;
    }
  }

  /**
   * 2D 그리드 좌표를 아이소메트릭 화면 좌표로 변환
   */
  public gridToScreen(gridPos: GridPosition): ScreenPosition {
    const tileWidth = 64; // 타일 너비
    const tileHeight = 32; // 타일 높이

    const screenX = (gridPos.x - gridPos.y) * (tileWidth / 2);
    const screenY = (gridPos.x + gridPos.y) * (tileHeight / 2);

    return { x: screenX, y: screenY };
  }

  /**
   * 아이소메트릭 화면 좌표를 2D 그리드 좌표로 변환
   */
  public screenToGrid(screenPos: ScreenPosition): GridPosition {
    const tileWidth = 64;
    const tileHeight = 32;

    const gridX = (screenPos.x / (tileWidth / 2) + screenPos.y / (tileHeight / 2)) / 2;
    const gridY = (screenPos.y / (tileHeight / 2) - screenPos.x / (tileWidth / 2)) / 2;

    return {
      x: Math.floor(gridX),
      y: Math.floor(gridY)
    };
  }

  /**
   * 모든 타일을 순회하며 콜백 함수 실행
   */
  public forEachTile(callback: (tile: Tile, position: GridPosition) => void): void {
    try {
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          const tile = this.tiles[x]?.[y];
          if (tile) {
            callback(tile, { x, y });
          }
        }
      }
    } catch (error) {
      console.error('Error iterating tiles:', error);
    }
  }

  /**
   * 그리드 상태를 JSON으로 직렬화
   */
  public toJSON(): Record<string, unknown> {
    return {
      width: this.width,
      height: this.height,
      tiles: this.tiles.map(row => row.map(tile => tile.toJSON())),
      created: this.created,
      updated: this.updated
    };
  }
}

/**
 * 기본 게임 오브젝트 클래스
 */
export class BaseGameObject implements GameObject {
  public readonly id: string;
  public position: GridPosition;
  public readonly type: string;
  public readonly created: number;
  public updated: number;

  constructor(id: string, position: GridPosition, type: string) {
    this.id = id;
    this.position = position;
    this.type = type;
    this.created = Date.now();
    this.updated = this.created;
  }

  /**
   * 게임 오브젝트 위치 이동
   */
  public moveTo(newPosition: GridPosition): void {
    try {
      this.position = newPosition;
      this.updated = Date.now();
    } catch (error) {
      console.error('Error moving game object:', error);
    }
  }

  /**
   * 게임 오브젝트 업데이트 (오버라이드 가능)
   */
  public update(_deltaTime: number): void {
    // 기본 구현 - 하위 클래스에서 오버라이드
    this.updated = Date.now();
  }

  /**
   * 게임 오브젝트 상태를 JSON으로 직렬화
   */
  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      position: this.position,
      type: this.type,
      created: this.created,
      updated: this.updated
    };
  }
}

/**
 * 좌표 유틸리티 함수들
 */
export class GridUtils {
  /**
   * 두 좌표 간 거리 계산 (맨하탄 거리)
   */
  public static getManhattanDistance(pos1: GridPosition, pos2: GridPosition): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  /**
   * 두 좌표 간 거리 계산 (유클리드 거리)
   */
  public static getEuclideanDistance(pos1: GridPosition, pos2: GridPosition): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 두 좌표가 같은지 확인
   */
  public static isEqual(pos1: GridPosition, pos2: GridPosition): boolean {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }

  /**
   * 좌표 주변의 인접한 좌표들 반환
   */
  public static getAdjacentPositions(position: GridPosition): GridPosition[] {
    return [
      { x: position.x - 1, y: position.y },     // 왼쪽
      { x: position.x + 1, y: position.y },     // 오른쪽
      { x: position.x, y: position.y - 1 },     // 위쪽
      { x: position.x, y: position.y + 1 }      // 아래쪽
    ];
  }
}

// 기본 내보내기
export { Grid as default };
