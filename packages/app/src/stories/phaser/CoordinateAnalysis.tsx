import { useEffect, useState } from 'react'

// 아이소메트릭 설정
const TILE_WIDTH = 64
const TILE_HEIGHT = 32
const GRID_WIDTH = 8
const GRID_HEIGHT = 6
const CANVAS_WIDTH = 700
const CANVAS_HEIGHT = 500

// 그리드 중앙 배치를 위한 오프셋 계산
function calculateCorrectOffset() {
  // 전체 그리드의 아이소메트릭 크기 계산
  const totalIsoWidth = (GRID_WIDTH + GRID_HEIGHT) * (TILE_WIDTH / 2)
  const totalIsoHeight = (GRID_WIDTH + GRID_HEIGHT) * (TILE_HEIGHT / 2)

  // 중앙 정렬 오프셋
  const offsetX = (CANVAS_WIDTH - totalIsoWidth) / 2
  const offsetY = (CANVAS_HEIGHT - totalIsoHeight) / 2 - 50

  return { offsetX, offsetY }
}

const { offsetX: OFFSET_X, offsetY: OFFSET_Y } = calculateCorrectOffset()

// 좌표 변환 함수들
function gridToIsometric(gridX: number, gridY: number) {
  const isoX = (gridX - gridY) * (TILE_WIDTH / 2)
  const isoY = (gridX + gridY) * (TILE_HEIGHT / 2)
  return { x: isoX, y: isoY }
}

function isometricToGrid_Original(isoX: number, isoY: number) {
  const gridX = (isoX / (TILE_WIDTH / 2) + isoY / (TILE_HEIGHT / 2)) / 2
  const gridY = (isoY / (TILE_HEIGHT / 2) - isoX / (TILE_WIDTH / 2)) / 2
  return {
    x: Math.round(gridX),
    y: Math.round(gridY),
    raw: { x: gridX, y: gridY }
  }
}

function isometricToGrid_WithCompensation(isoX: number, isoY: number) {
  const gridX = (isoX / (TILE_WIDTH / 2) + isoY / (TILE_HEIGHT / 2)) / 2
  const gridY = (isoY / (TILE_HEIGHT / 2) - isoX / (TILE_WIDTH / 2)) / 2
  return {
    x: Math.round(gridX + 1), // +1 보정
    y: Math.round(gridY),
    raw: { x: gridX, y: gridY }
  }
}

interface AnalysisData {
  gridX: number
  gridY: number
  isoX: number
  isoY: number
  screenX: number
  screenY: number
  mouseX: number
  mouseY: number
  reversedOriginal: ReturnType<typeof isometricToGrid_Original>
  reversedCompensated: ReturnType<typeof isometricToGrid_WithCompensation>
}

export default function CoordinateAnalysis() {
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([])

  useEffect(() => {
    // 분석할 그리드 포인트들 (특히 문제가 되는 구간)
    const testPoints = [
      { gridX: 0, gridY: 0 },
      { gridX: 1, gridY: 0 },
      { gridX: 2, gridY: 0 },
      { gridX: 0, gridY: 1 },
      { gridX: 1, gridY: 1 },
      { gridX: 2, gridY: 1 },
    ]

    const analysis: AnalysisData[] = testPoints.map(point => {
      // 그리드 좌표를 아이소메트릭 좌표로 변환
      const iso = gridToIsometric(point.gridX, point.gridY)

      // 화면 좌표 계산
      const screenX = iso.x + OFFSET_X
      const screenY = iso.y + OFFSET_Y

      // 마우스가 타일 중앙에 있을 때 좌표 (약간의 오프셋 추가로 실제 상황 시뮬레이션)
      const mouseX = screenX + 8  // 타일 중앙에서 약간 오른쪽
      const mouseY = screenY + 4  // 타일 중앙에서 약간 아래

      // 마우스 좌표를 다시 아이소메트릭 좌표로 변환
      const mouseIsoX = mouseX - OFFSET_X
      const mouseIsoY = mouseY - OFFSET_Y

      // 원래 함수와 보정된 함수로 역변환
      const reversedOriginal = isometricToGrid_Original(mouseIsoX, mouseIsoY)
      const reversedCompensated = isometricToGrid_WithCompensation(mouseIsoX, mouseIsoY)

      return {
        gridX: point.gridX,
        gridY: point.gridY,
        isoX: iso.x,
        isoY: iso.y,
        screenX,
        screenY,
        mouseX,
        mouseY,
        reversedOriginal,
        reversedCompensated
      }
    })

    setAnalysisData(analysis)
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        아이소메트릭 좌표 변환 분석: +1 보정이 필요한 이유
      </h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">분석 개요</h2>
        <p className="text-sm text-gray-700 mb-2">
          각 그리드 포인트에 대해 다음 과정을 시뮬레이션합니다:
        </p>
        <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
          <li>그리드 좌표 → 아이소메트릭 좌표 → 화면 좌표 변환</li>
          <li>타일 중앙 근처의 마우스 위치 시뮬레이션 (+8, +4 오프셋)</li>
          <li>마우스 위치 → 아이소메트릭 좌표 → 그리드 좌표 역변환</li>
          <li>원래 함수 vs +1 보정 함수 결과 비교</li>
        </ol>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-1 p-2 bg-gray-100 text-xs font-medium">
          <div className="col-span-2">원본 Grid</div>
          <div className="col-span-2">아이소메트릭</div>
          <div className="col-span-2">화면 좌표</div>
          <div className="col-span-2">마우스 위치</div>
          <div className="col-span-2">원래 역변환</div>
          <div className="col-span-2">+1 보정</div>
        </div>

        {analysisData.map((data, index) => (
          <div key={index} className="grid grid-cols-12 gap-1 p-2 border-t text-xs">
            <div className="col-span-2">
              <div className="font-medium">({data.gridX}, {data.gridY})</div>
            </div>

            <div className="col-span-2">
              <div>X: {data.isoX.toFixed(1)}</div>
              <div>Y: {data.isoY.toFixed(1)}</div>
            </div>

            <div className="col-span-2">
              <div>X: {data.screenX.toFixed(1)}</div>
              <div>Y: {data.screenY.toFixed(1)}</div>
            </div>

            <div className="col-span-2">
              <div>X: {data.mouseX.toFixed(1)}</div>
              <div>Y: {data.mouseY.toFixed(1)}</div>
            </div>

            <div className="col-span-2">
              <div className={`font-medium ${
                data.reversedOriginal.x === data.gridX && data.reversedOriginal.y === data.gridY
                  ? 'text-green-600' : 'text-red-600'
              }`}>
                ({data.reversedOriginal.x}, {data.reversedOriginal.y})
              </div>
              <div className="text-gray-500">
                Raw: ({data.reversedOriginal.raw.x.toFixed(2)}, {data.reversedOriginal.raw.y.toFixed(2)})
              </div>
            </div>

            <div className="col-span-2">
              <div className={`font-medium ${
                data.reversedCompensated.x === data.gridX && data.reversedCompensated.y === data.gridY
                  ? 'text-green-600' : 'text-red-600'
              }`}>
                ({data.reversedCompensated.x}, {data.reversedCompensated.y})
              </div>
              <div className="text-gray-500">
                Raw: ({data.reversedCompensated.raw.x.toFixed(2)}, {data.reversedCompensated.raw.y.toFixed(2)})
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">수학적 분석</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>현재 변환 공식:</strong></p>
            <p>• gridX = (isoX/32 + isoY/16) / 2</p>
            <p>• gridY = (isoY/16 - isoX/32) / 2</p>

            <p><strong>오프셋 설정:</strong></p>
            <p>• OFFSET_X = {OFFSET_X.toFixed(1)}</p>
            <p>• OFFSET_Y = {OFFSET_Y.toFixed(1)}</p>

            <p><strong>예상 문제:</strong></p>
            <p>• 아이소메트릭 좌표계의 원점과 렌더링 시작점 불일치</p>
            <p>• 타일 중심점 vs 타일 시작점 기준 차이</p>
            <p>• 부동소수점 반올림 오차</p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">결론</h3>
          <p className="text-sm text-green-700">
            위 표에서 <span className="text-green-600 font-medium">녹색</span>은 정확한 매핑을,
            <span className="text-red-600 font-medium">빨간색</span>은 부정확한 매핑을 나타냅니다.
            +1 보정이 더 정확한 결과를 제공하는지 확인할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
