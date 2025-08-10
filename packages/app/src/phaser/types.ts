// MainScene 관련 타입 및 인터페이스

export interface RenderQueueItem {
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
