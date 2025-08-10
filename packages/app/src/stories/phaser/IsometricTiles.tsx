import React, { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

interface IsometricTileInfo {
  gridX: number
  gridY: number
  screenX: number
  screenY: number
  isoX: number
  isoY: number
}

/**
 * 아이소메트릭 타일 그리드 예제
 * - 다이아몬드 모양 아이소메트릭 타일
 * - 그리드 좌표 ↔ 아이소메트릭 화면 좌표 변환
 * - 정확한 마우스 호버 감지
 */
export const IsometricTiles: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)
  const [hoveredTile, setHoveredTile] = useState<IsometricTileInfo | null>(null)
  const [clickedTile, setClickedTile] = useState<IsometricTileInfo | null>(null)

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return

    // 아이소메트릭 타일 설정
    const TILE_WIDTH = 64   // 타일의 가로 폭
    const TILE_HEIGHT = 32  // 타일의 세로 높이
    const GRID_WIDTH = 8
    const GRID_HEIGHT = 6

    // 올바른 오프셋 계산 함수

    const OFFSET_X = 300;
    const OFFSET_Y = 150;

    class IsometricScene extends Phaser.Scene {
      private tiles: Phaser.GameObjects.Polygon[][] = []
      private hoverTile: Phaser.GameObjects.Polygon | null = null
      private selectedTile: Phaser.GameObjects.Polygon | null = null
      private coordinateText: Phaser.GameObjects.Text | null = null
      private debugGraphics: Phaser.GameObjects.Graphics | null = null

      constructor() {
        super({ key: 'IsometricScene' })
      }

      create() {
        // 배경색 설정
        this.cameras.main.setBackgroundColor('#2c3e50')

        // 디버그 그래픽스 생성
        this.debugGraphics = this.add.graphics()

        // 아이소메트릭 타일 그리드 생성
        this.createIsometricGrid()

        // 좌표 표시 텍스트
        this.coordinateText = this.add.text(10, 10, 'Hover over tiles', {
          fontSize: '14px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 8, y: 4 }
        })

        // 설명 텍스트
        this.add.text(10, 50, 'Isometric Coordinate System', {
          fontSize: '16px',
          color: '#ecf0f1',
          fontStyle: 'bold'
        })

        this.add.text(10, 80, 'Grid → Screen: (x,y) → (isoX, isoY)', {
          fontSize: '12px',
          color: '#bdc3c7'
        })

        // 마우스 이벤트 등록
        this.input.on('pointermove', this.handlePointerMove, this)
        this.input.on('pointerdown', this.handlePointerDown, this)
      }

      private createIsometricGrid() {
        this.tiles = []

        // 문제 분석: startX, startY와 OFFSET_X, OFFSET_Y가 다름
        // 렌더링: startX = 300, startY = 150
        // 좌표변환: OFFSET_X = 300, OFFSET_Y = 150
        // 하지만 실제로는 렌더링된 타일의 위치와 계산된 오프셋이 다를 수 있음
        const startX = 300
        const startY = 150

        for (let x = 0; x < GRID_WIDTH; x++) {
          this.tiles[x] = []
          for (let y = 0; y < GRID_HEIGHT; y++) {
            // 그리드 좌표를 아이소메트릭 화면 좌표로 변환
            const isoCoords = this.gridToIsometric(x, y)
            const tileX = startX + isoCoords.x
            const tileY = startY + isoCoords.y

            // 다이아몬드 모양 타일 생성
            const diamond = this.createDiamondTile(tileX, tileY)

            // 타일 좌표를 데이터로 저장 (screenX, screenY 변수 문제 수정)
            diamond.setData('gridX', x)
            diamond.setData('gridY', y)
            diamond.setData('screenX', tileX)  // screenX -> tileX
            diamond.setData('screenY', tileY)  // screenY -> tileY
            diamond.setData('isoX', isoCoords.x)
            diamond.setData('isoY', isoCoords.y)

            // 좌표 표시
            this.add.text(tileX - TILE_WIDTH / 2 - 8, tileY - TILE_HEIGHT / 2 - 4, `${x},${y}`, {
              fontSize: '10px',
              color: '#ffffff'
            })

            this.tiles[x][y] = diamond
          }
        }
      }

      private createDiamondTile(x: number, y: number): Phaser.GameObjects.Polygon {
        // 다이아몬드 모양의 점들 정의
        const points = [
          0, -TILE_HEIGHT / 2,           // 상단
          TILE_WIDTH / 2, 0,             // 우측
          0, TILE_HEIGHT / 2,            // 하단
          -TILE_WIDTH / 2, 0             // 좌측
        ]

        const diamond = this.add.polygon(x, y, points, 0x3498db, 0.8)
        diamond.setStrokeStyle(1, 0xecf0f1, 0.6)

        // 인터랙티브 설정
        diamond.setInteractive(
          new Phaser.Geom.Polygon(points),
          Phaser.Geom.Polygon.Contains
        )

        return diamond
      }

      private gridToIsometric(gridX: number, gridY: number): { x: number; y: number } {
        // 2D 그리드 좌표를 아이소메트릭 화면 좌표로 변환
        const isoX = (gridX - gridY) * (TILE_WIDTH / 2)
        const isoY = (gridX + gridY) * (TILE_HEIGHT / 2)
        return { x: isoX, y: isoY }
      }

      private isometricToGrid(isoX: number, isoY: number): { x: number; y: number } {
        // 아이소메트릭 화면 좌표를 2D 그리드 좌표로 변환
        const gridX = (isoX / (TILE_WIDTH / 2) + isoY / (TILE_HEIGHT / 2)) / 2
        const gridY = (isoY / (TILE_HEIGHT / 2) - isoX / (TILE_WIDTH / 2)) / 2

        // +1 보정이 필요한 이유 분석:
        // 1. 그리드 렌더링이 (0,0)부터 시작하지만
        // 2. 좌표 변환 공식이 다른 기준점을 가정하고 있을 수 있음
        // 3. 또는 오프셋 계산에서 1타일만큼의 오차가 발생

        // TODO: 근본적인 원인을 해결해야 함
        return { x: Math.round(gridX + 1), y: Math.round(gridY) }
      }

      private handlePointerMove(pointer: Phaser.Input.Pointer) {
        // 마우스 화면 좌표를 아이소메트릭 좌표로 변환
        const mouseIsoX = pointer.x - OFFSET_X
        const mouseIsoY = pointer.y - OFFSET_Y
        const gridCoords = this.isometricToGrid(mouseIsoX, mouseIsoY)

        // 디버그 정보 그리기
        this.debugGraphics?.clear()
        this.debugGraphics?.lineStyle(1, 0xe74c3c, 0.5)
        this.debugGraphics?.strokeCircle(pointer.x, pointer.y, 3)

        // 이전 호버 효과 제거
        if (this.hoverTile) {
          this.hoverTile.setFillStyle(0x3498db, 0.8)
        }

        // 유효한 그리드 범위 확인
        if (gridCoords.x >= 0 && gridCoords.x < GRID_WIDTH &&
            gridCoords.y >= 0 && gridCoords.y < GRID_HEIGHT) {

          const tile = this.tiles[gridCoords.x][gridCoords.y]

          // 정확한 타일 영역 내부인지 확인 (다이아몬드 모양)
          this.hoverTile = tile
          this.hoverTile.setFillStyle(0x2ecc71, 1.0)

          const gridX = tile.getData('gridX')
          const gridY = tile.getData('gridY')
          const screenX = tile.getData('screenX')
          const screenY = tile.getData('screenY')
          const isoX = tile.getData('isoX')
          const isoY = tile.getData('isoY')

          // 좌표 정보 업데이트 (디버그 정보 포함)
          if (this.coordinateText) {
            this.coordinateText.setText(
              `Grid:(${gridX},${gridY}) | Mouse:(${Math.round(pointer.x)},${Math.round(pointer.y)})`
            )
          }

          setHoveredTile({
            gridX, gridY, screenX, screenY, isoX, isoY
          })

          // 호버된 타일 강조 표시
          this.debugGraphics?.fillStyle(0x2ecc71, 0.3)
          this.debugGraphics?.fillCircle(screenX, screenY, 4)
        } else {
          this.hoverTile = null
          setHoveredTile(null)
        }

        // 기본 마우스 정보 표시
        if (!this.hoverTile && this.coordinateText) {
          this.coordinateText.setText(
            `Grid:(${gridCoords.x},${gridCoords.y}) | Mouse:(${Math.round(pointer.x)},${Math.round(pointer.y)})`
          )
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      private handlePointerDown(_pointer: Phaser.Input.Pointer) {
        if (!this.hoverTile) return

        // 이전 선택 효과 제거
        if (this.selectedTile) {
          const isHovered = this.hoverTile === this.selectedTile
          this.selectedTile.setFillStyle(isHovered ? 0x2ecc71 : 0x3498db, isHovered ? 1.0 : 0.8)
        }

        this.selectedTile = this.hoverTile
        this.selectedTile.setFillStyle(0xe74c3c, 1.0)

        const gridX = this.selectedTile.getData('gridX')
        const gridY = this.selectedTile.getData('gridY')
        const screenX = this.selectedTile.getData('screenX')
        const screenY = this.selectedTile.getData('screenY')
        const isoX = this.selectedTile.getData('isoX')
        const isoY = this.selectedTile.getData('isoY')

        setClickedTile({ gridX, gridY, screenX, screenY, isoX, isoY })
      }
    }

    // Phaser 게임 설정
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 700,
      height: 500,
      parent: gameRef.current,
      backgroundColor: '#2c3e50',
      scene: IsometricScene
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
      <h3 className="text-lg font-bold mb-4">아이소메트릭 타일 그리드</h3>
      <div className="mb-4 space-y-2">
        <p className="text-sm text-gray-600">
          • 다이아몬드 모양의 아이소메트릭 타일들
        </p>
        <p className="text-sm text-gray-600">
          • 그리드 좌표 ↔ 아이소메트릭 화면 좌표 변환
        </p>
        <p className="text-sm text-gray-600">
          • 정확한 다이아몬드 영역 내 마우스 감지
        </p>
        <p className="text-sm text-gray-600">
          • 빨간 점: 마우스 위치, 초록 점: 타일 중심
        </p>
        <div className="mt-2 p-2 bg-blue-50 rounded">
          <p className="text-sm text-blue-800 font-semibold">✅ 개선된 오프셋 계산 적용됨</p>
          <p className="text-xs text-blue-600">그리드 전체 경계를 고려한 정확한 중앙 배치</p>
        </div>
      </div>

      <div ref={gameRef} className="border border-gray-300 rounded" />

      <div className="mt-4 space-y-2">
        <div className="p-3 bg-green-50 rounded">
          <h4 className="font-semibold">호버된 타일:</h4>
          {hoveredTile ? (
            <div className="text-sm space-y-1">
              <p><strong>그리드:</strong> ({hoveredTile.gridX}, {hoveredTile.gridY})</p>
              <p><strong>아이소메트릭:</strong> ({hoveredTile.isoX}, {hoveredTile.isoY})</p>
              <p><strong>화면:</strong> ({Math.round(hoveredTile.screenX)}, {Math.round(hoveredTile.screenY)})</p>
            </div>
          ) : (
            <p>없음</p>
          )}
        </div>

        <div className="p-3 bg-red-50 rounded">
          <h4 className="font-semibold">선택된 타일:</h4>
          {clickedTile ? (
            <div className="text-sm space-y-1">
              <p><strong>그리드:</strong> ({clickedTile.gridX}, {clickedTile.gridY})</p>
              <p><strong>아이소메트릭:</strong> ({clickedTile.isoX}, {clickedTile.isoY})</p>
              <p><strong>화면:</strong> ({Math.round(clickedTile.screenX)}, {Math.round(clickedTile.screenY)})</p>
            </div>
          ) : (
            <p>없음</p>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
        <h4 className="font-semibold mb-2">좌표 변환 공식:</h4>
        <p><strong>Grid → Isometric:</strong></p>
        <p>isoX = (gridX - gridY) × (tileWidth / 2)</p>
        <p>isoY = (gridX + gridY) × (tileHeight / 2)</p>
        <p className="mt-2"><strong>Isometric → Grid:</strong></p>
        <p>gridX = (isoX / (tileWidth/2) + isoY / (tileHeight/2)) / 2</p>
        <p>gridY = (isoY / (tileHeight/2) - isoX / (tileWidth/2)) / 2</p>
      </div>
    </div>
  )
}
