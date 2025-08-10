import React, { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

interface TileInfo {
  x: number
  y: number
  screenX: number
  screenY: number
}

/**
 * **기본 2D 타일 그리드 시스템**
 *
 * 이 예제는 Phaser.js의 기본적인 2D 좌표 시스템을 보여줍니다.
 *
 * **주요 학습 내용:**
 * - 정사각형 타일 배치
 * - 화면 좌표 → 그리드 좌표 변환
 * - 마우스 이벤트 처리
 * - 타일 하이라이트 및 선택
 *
 * **좌표 변환 공식:**
 *
 * ```typescript
 * // 화면 좌표를 그리드 좌표로 변환
 * const gridX = Math.floor((x - OFFSET_X) / TILE_SIZE)
 * const gridY = Math.floor((y - OFFSET_Y) / TILE_SIZE)
 * ```
 *
 * 이것은 가장 간단한 형태의 좌표 변환으로, 아이소메트릭 시스템의 기초가 됩니다.
 */
export const Basic2DTiles: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)
  const [hoveredTile, setHoveredTile] = useState<TileInfo | null>(null)
  const [clickedTile, setClickedTile] = useState<TileInfo | null>(null)

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return

    // 타일 설정
    const TILE_SIZE = 32
    const GRID_WIDTH = 10
    const GRID_HEIGHT = 8

    const OFFSET_X = 15
    const OFFSET_Y = 50

    class Basic2DScene extends Phaser.Scene {
      private tiles: Phaser.GameObjects.Rectangle[][] = []
      private hoverTile: Phaser.GameObjects.Rectangle | null = null
      private selectedTile: Phaser.GameObjects.Rectangle | null = null
      private coordinateText: Phaser.GameObjects.Text | null = null

      constructor() {
        super({ key: 'Basic2DScene' })
      }

      create() {
        // 배경색 설정
        this.cameras.main.setBackgroundColor('#1a1a2e')

        // 타일 그리드 생성
        this.createTileGrid()

        // 좌표 표시 텍스트
        this.coordinateText = this.add.text(10, 10, 'Hover over tiles', {
          fontSize: '16px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 8, y: 4 }
        })

        // 마우스 이벤트 등록
        this.input.on('pointermove', this.handlePointerMove, this)
        this.input.on('pointerdown', this.handlePointerDown, this)
      }

      private createTileGrid() {
        this.tiles = []

        for (let x = 0; x < GRID_WIDTH; x++) {
          this.tiles[x] = []
          for (let y = 0; y < GRID_HEIGHT; y++) {
            const screenX = x * TILE_SIZE + TILE_SIZE / 2 + OFFSET_X
            const screenY = y * TILE_SIZE + TILE_SIZE / 2 + OFFSET_Y

            // 타일 생성 (정사각형)
            const tile = this.add.rectangle(
              screenX,
              screenY,
              TILE_SIZE - 2,
              TILE_SIZE - 2,
              0x4a90e2,
              0.7
            )

            // 테두리 추가
            tile.setStrokeStyle(1, 0xffffff, 0.5)

            // 타일 좌표를 데이터로 저장
            tile.setData('gridX', x)
            tile.setData('gridY', y)
            tile.setData('screenX', screenX)
            tile.setData('screenY', screenY)

            this.tiles[x][y] = tile
          }
        }
      }

      private handlePointerMove(pointer: Phaser.Input.Pointer) {
        // 현재 호버된 타일 찾기
        const hoveredObject = this.getTileAt(pointer.x, pointer.y)

        // 이전 호버 효과 제거
        if (this.hoverTile) {
          this.hoverTile.setFillStyle(0x4a90e2, 0.7)
        }

        if (hoveredObject) {
          // 새로운 호버 효과 적용
          this.hoverTile = hoveredObject
          this.hoverTile.setFillStyle(0x7bed9f, 0.9)

          const gridX = this.hoverTile.getData('gridX')
          const gridY = this.hoverTile.getData('gridY')
          const screenX = this.hoverTile.getData('screenX')
          const screenY = this.hoverTile.getData('screenY')

          // 좌표 정보 업데이트
          if (this.coordinateText) {
            this.coordinateText.setText(
              `Grid: (${gridX}, ${gridY}) | Screen: (${screenX}, ${screenY}) | Mouse: (${Math.round(pointer.x)}, ${Math.round(pointer.y)})`
            )
          }

          // React 컴포넌트에 정보 전달
          setHoveredTile({ x: gridX, y: gridY, screenX, screenY })
        } else {
          this.hoverTile = null
          if (this.coordinateText) {
            this.coordinateText.setText(`Mouse: (${Math.round(pointer.x)}, ${Math.round(pointer.y)})`)
          }
          setHoveredTile(null)
        }
      }

      private handlePointerDown(pointer: Phaser.Input.Pointer) {
        const clickedObject = this.getTileAt(pointer.x, pointer.y)

        // 이전 선택 효과 제거
        if (this.selectedTile) {
          const isHovered = this.hoverTile === this.selectedTile
          this.selectedTile.setFillStyle(isHovered ? 0x7bed9f : 0x4a90e2, isHovered ? 0.9 : 0.7)
        }

        if (clickedObject) {
          this.selectedTile = clickedObject
          this.selectedTile.setFillStyle(0xe74c3c, 1.0)

          const gridX = this.selectedTile.getData('gridX')
          const gridY = this.selectedTile.getData('gridY')
          const screenX = this.selectedTile.getData('screenX')
          const screenY = this.selectedTile.getData('screenY')

          setClickedTile({ x: gridX, y: gridY, screenX, screenY })
        }
      }

      private getTileAt(x: number, y: number): Phaser.GameObjects.Rectangle | null {
        // 화면 좌표를 그리드 좌표로 변환
        const gridX = Math.floor((x - OFFSET_X) / TILE_SIZE)
        const gridY = Math.floor((y - OFFSET_Y) / TILE_SIZE)

        // 유효한 범위 확인
        if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
          return this.tiles[gridX][gridY]
        }

        return null
      }
    }

    // Phaser 게임 설정
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 600,
      height: 400,
      parent: gameRef.current,
      backgroundColor: '#1a1a2e',
      scene: Basic2DScene,
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      }
    }

    phaserGameRef.current = new Phaser.Game(config)

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [])

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">기본 2D 타일 그리드</h3>
      <div className="mb-4 space-y-2">
        <p className="text-sm text-gray-600">
          • 마우스를 타일 위로 올리면 초록색으로 하이라이트됩니다
        </p>
        <p className="text-sm text-gray-600">
          • 타일을 클릭하면 빨간색으로 선택됩니다
        </p>
        <p className="text-sm text-gray-600">
          • 좌표 변환: 화면 좌표 → 그리드 좌표
        </p>
      </div>

      <div ref={gameRef} className="border border-gray-300 rounded" />

      <div className="mt-4 space-y-2">
        <div className="p-3 bg-blue-50 rounded">
          <h4 className="font-semibold">호버된 타일:</h4>
          {hoveredTile ? (
            <p>그리드: ({hoveredTile.x}, {hoveredTile.y}) | 화면: ({hoveredTile.screenX}, {hoveredTile.screenY})</p>
          ) : (
            <p>없음</p>
          )}
        </div>

        <div className="p-3 bg-red-50 rounded">
          <h4 className="font-semibold">선택된 타일:</h4>
          {clickedTile ? (
            <p>그리드: ({clickedTile.x}, {clickedTile.y}) | 화면: ({clickedTile.screenX}, {clickedTile.screenY})</p>
          ) : (
            <p>없음</p>
          )}
        </div>
      </div>
    </div>
  )
}
