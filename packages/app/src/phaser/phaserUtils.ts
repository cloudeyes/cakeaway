// Phaser 관련 유틸리티 함수

export function clampZoom(zoom: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, zoom))
}

// ...추가 유틸리티 함수는 이후 구현
