import React, { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

interface ComparisonInfo {
  mouseX: number
  mouseY: number
  grid2D: { x: number; y: number }
  gridIso: { x: number; y: number }
  screen2D: { x: number; y: number }
  screenIso: { x: number; y: number }
}

/**
 * 2D vs 아이소메트릭 좌표 변환 비교 예제
 * - 동일한 그리드에서 2D와 아이소메트릭 렌더링 비교
 * - 실시간 좌표 변환 과정 시각화
 */
export const CoordinateComparison: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)
  const [comparisonData, setComparisonData] = useState<ComparisonInfo | null>(null)

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return

    const TILE_SIZE = 24
    const TILE_WIDTH = 48
    const TILE_HEIGHT = 24
    const GRID_SIZE = 6

    class ComparisonScene extends Phaser.Scene {
      private coordinateText: Phaser.GameObjects.Text | null = null
      private cursor2D: Phaser.GameObjects.Graphics | null = null
      private cursorIso: Phaser.GameObjects.Graphics | null = null

      constructor() {
        super({ key: 'ComparisonScene' })
      }

      create() {
        this.cameras.main.setBackgroundColor('#34495e')

        // 제목들
        this.add.text(50, 20, '2D Grid', {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold'
        })

        this.add.text(350, 20, 'Isometric Grid', {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold'
        })

        // 2D 그리드 생성
        this.create2DGrid()

        // 아이소메트릭 그리드 생성
        this.createIsometricGrid()

        // 커서 그래픽스
        this.cursor2D = this.add.graphics()
        this.cursorIso = this.add.graphics()

        // 좌표 정보 텍스트
        this.coordinateText = this.add.text(10, 350, '', {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 8, y: 4 }
        })

        // 설명 텍스트
        this.add.text(10, 280, 'Move mouse to see coordinate conversion', {
          fontSize: '14px',
          color: '#ecf0f1'
        })

        this.add.text(10, 300, 'Left: 2D orthogonal | Right: Isometric diamond', {
          fontSize: '12px',
          color: '#bdc3c7'
        })

        // 마우스 이벤트
        this.input.on('pointermove', this.handlePointerMove, this)
      }

      private create2DGrid() {
        const startX = 50
        const startY = 50

        for (let x = 0; x < GRID_SIZE; x++) {
          for (let y = 0; y < GRID_SIZE; y++) {
            const tileX = startX + x * TILE_SIZE
            const tileY = startY + y * TILE_SIZE

            // 2D 사각형 타일
            const tile = this.add.rectangle(
              tileX + TILE_SIZE / 2,
              tileY + TILE_SIZE / 2,
              TILE_SIZE - 1,
              TILE_SIZE - 1,
              0x3498db,
              0.7
            )
            tile.setStrokeStyle(1, 0xffffff, 0.5)

            // 좌표 표시
            this.add.text(tileX + 2, tileY + 2, `${x},${y}`, {
              fontSize: '8px',
              color: '#ffffff'
            })
          }
        }

        // 2D 영역 테두리
        this.add.rectangle(
          startX + (GRID_SIZE * TILE_SIZE) / 2,
          startY + (GRID_SIZE * TILE_SIZE) / 2,
          GRID_SIZE * TILE_SIZE,
          GRID_SIZE * TILE_SIZE
        ).setStrokeStyle(2, 0xe74c3c, 1.0)
      }

      private createIsometricGrid() {
        const startX = 450
        const startY = 120

        for (let x = 0; x < GRID_SIZE; x++) {
          for (let y = 0; y < GRID_SIZE; y++) {
            // 그리드를 아이소메트릭 좌표로 변환
            const isoCoords = this.gridToIsometric(x, y)
            const tileX = startX + isoCoords.x
            const tileY = startY + isoCoords.y

            // 다이아몬드 모양 타일
            const points = [
              0, -TILE_HEIGHT / 2,
              TILE_WIDTH / 2, 0,
              0, TILE_HEIGHT / 2,
              -TILE_WIDTH / 2, 0
            ]

            const diamond = this.add.polygon(tileX, tileY, points, 0x9b59b6, 0.7)
            diamond.setStrokeStyle(1, 0xffffff, 0.5)

            // 좌표 표시
            this.add.text(tileX - 8, tileY - 4, `${x},${y}`, {
              fontSize: '8px',
              color: '#ffffff'
            })
          }
        }
      }

      private gridToIsometric(gridX: number, gridY: number): { x: number; y: number } {
        const isoX = (gridX - gridY) * (TILE_WIDTH / 2)
        const isoY = (gridX + gridY) * (TILE_HEIGHT / 2)
        return { x: isoX, y: isoY }
      }

      private screen2DToGrid(screenX: number, screenY: number): { x: number; y: number } {
        const startX = 50
        const startY = 50
        const gridX = Math.floor((screenX - startX) / TILE_SIZE)
        const gridY = Math.floor((screenY - startY) / TILE_SIZE)
        return { x: Math.max(0, Math.min(GRID_SIZE - 1, gridX)), y: Math.max(0, Math.min(GRID_SIZE - 1, gridY)) }
      }

      private screenIsoToGrid(screenX: number, screenY: number): { x: number; y: number } {
        const startX = 450
        const startY = 120
        const relativeX = screenX - startX
        const relativeY = screenY - startY

        const gridX = (relativeX / (TILE_WIDTH / 2) + relativeY / (TILE_HEIGHT / 2)) / 2
        const gridY = (relativeY / (TILE_HEIGHT / 2) - relativeX / (TILE_WIDTH / 2)) / 2

        return {
          x: Math.max(0, Math.min(GRID_SIZE - 1, Math.floor(gridX))),
          y: Math.max(0, Math.min(GRID_SIZE - 1, Math.floor(gridY)))
        }
      }

      private handlePointerMove(pointer: Phaser.Input.Pointer) {
        // 2D 좌표 변환
        const grid2D = this.screen2DToGrid(pointer.x, pointer.y)
        const screen2D = {
          x: 50 + grid2D.x * TILE_SIZE + TILE_SIZE / 2,
          y: 50 + grid2D.y * TILE_SIZE + TILE_SIZE / 2
        }

        // 아이소메트릭 좌표 변환
        const gridIso = this.screenIsoToGrid(pointer.x, pointer.y)
        const isoCoords = this.gridToIsometric(gridIso.x, gridIso.y)
        const screenIso = {
          x: 450 + isoCoords.x,
          y: 120 + isoCoords.y
        }

        // 커서 표시 업데이트
        this.updateCursors(screen2D, screenIso)

        // React 컴포넌트에 데이터 전달
        setComparisonData({
          mouseX: Math.round(pointer.x),
          mouseY: Math.round(pointer.y),
          grid2D,
          gridIso,
          screen2D: { x: Math.round(screen2D.x), y: Math.round(screen2D.y) },
          screenIso: { x: Math.round(screenIso.x), y: Math.round(screenIso.y) }
        })

        // 화면 좌표 정보 업데이트
        if (this.coordinateText) {
          this.coordinateText.setText(
            `Mouse: (${Math.round(pointer.x)}, ${Math.round(pointer.y)}) | ` +
            `2D Grid: (${grid2D.x}, ${grid2D.y}) | ` +
            `Iso Grid: (${gridIso.x}, ${gridIso.y})`
          )
        }
      }

      private updateCursors(screen2D: { x: number; y: number }, screenIso: { x: number; y: number }) {
        // 2D 커서
        this.cursor2D?.clear()
        this.cursor2D?.fillStyle(0xe74c3c, 0.8)
        this.cursor2D?.fillCircle(screen2D.x, screen2D.y, 8)
        this.cursor2D?.lineStyle(2, 0xffffff, 1.0)
        this.cursor2D?.strokeCircle(screen2D.x, screen2D.y, 8)

        // 아이소메트릭 커서
        this.cursorIso?.clear()
        this.cursorIso?.fillStyle(0x27ae60, 0.8)
        this.cursorIso?.fillCircle(screenIso.x, screenIso.y, 8)
        this.cursorIso?.lineStyle(2, 0xffffff, 1.0)
        this.cursorIso?.strokeCircle(screenIso.x, screenIso.y, 8)
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 650,
      height: 400,
      parent: gameRef.current,
      backgroundColor: '#34495e',
      scene: ComparisonScene
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
      <h3 className="text-lg font-bold mb-4">2D vs 아이소메트릭 좌표 변환 비교</h3>
      <div className="mb-4 space-y-2">
        <p className="text-sm text-gray-600">
          • 왼쪽: 2D 직교 그리드 (빨간 원)
        </p>
        <p className="text-sm text-gray-600">
          • 오른쪽: 아이소메트릭 다이아몬드 그리드 (초록 원)
        </p>
        <p className="text-sm text-gray-600">
          • 마우스를 움직여서 좌표 변환 과정을 확인하세요
        </p>
      </div>

      <div ref={gameRef} className="border border-gray-300 rounded" />

      {comparisonData && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-red-50 rounded">
            <h4 className="font-semibold text-red-700 mb-2">2D 직교 좌표계</h4>
            <div className="text-sm space-y-1">
              <p><strong>마우스:</strong> ({comparisonData.mouseX}, {comparisonData.mouseY})</p>
              <p><strong>그리드:</strong> ({comparisonData.grid2D.x}, {comparisonData.grid2D.y})</p>
              <p><strong>타일 중심:</strong> ({comparisonData.screen2D.x}, {comparisonData.screen2D.y})</p>
              <p className="text-xs text-gray-600 mt-2">
                변환: floor((mouse - offset) / tileSize)
              </p>
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded">
            <h4 className="font-semibold text-green-700 mb-2">아이소메트릭 좌표계</h4>
            <div className="text-sm space-y-1">
              <p><strong>마우스:</strong> ({comparisonData.mouseX}, {comparisonData.mouseY})</p>
              <p><strong>그리드:</strong> ({comparisonData.gridIso.x}, {comparisonData.gridIso.y})</p>
              <p><strong>타일 중심:</strong> ({comparisonData.screenIso.x}, {comparisonData.screenIso.y})</p>
              <p className="text-xs text-gray-600 mt-2">
                변환: 2D ↔ 아이소메트릭 행렬 변환
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-50 rounded">
        <h4 className="font-semibold mb-2">핵심 차이점:</h4>
        <div className="text-sm space-y-1">
          <p><strong>2D:</strong> 단순한 나눗셈으로 그리드 좌표 계산</p>
          <p><strong>아이소메트릭:</strong> 회전된 좌표계로 인한 복잡한 변환 필요</p>
          <p><strong>문제:</strong> 아이소메트릭에서는 다이아몬드 모양 때문에 정확한 히트 테스트가 중요</p>
        </div>
      </div>
    </div>
  )
}
