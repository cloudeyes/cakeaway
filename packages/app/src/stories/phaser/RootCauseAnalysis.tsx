import { useEffect, useState } from 'react'

// 아이소메트릭 설정
const TILE_WIDTH = 64
const TILE_HEIGHT = 32
const GRID_WIDTH = 8
const GRID_HEIGHT = 6
const CANVAS_WIDTH = 700
const CANVAS_HEIGHT = 500

// 오프셋 계산
function calculateCorrectOffset() {
  const totalIsoWidth = (GRID_WIDTH + GRID_HEIGHT) * (TILE_WIDTH / 2)
  const totalIsoHeight = (GRID_WIDTH + GRID_HEIGHT) * (TILE_HEIGHT / 2)
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

interface DetailedAnalysis {
  gridX: number
  gridY: number
  // 포워드 변환
  theoreticalIsoX: number
  theoreticalIsoY: number
  actualScreenX: number
  actualScreenY: number
  // 타일 중심점 vs 시작점
  tileCenterX: number
  tileCenterY: number
  tileStartX: number
  tileStartY: number
  // 역변환 분석
  mouseAtCenterX: number
  mouseAtCenterY: number
  mouseIsoX: number
  mouseIsoY: number
  // 수학적 계산
  rawGridX: number
  rawGridY: number
  roundedGridX: number
  roundedGridY: number
  compensatedGridX: number
  compensatedGridY: number
  // 오차 분석
  errorFromRaw: { x: number, y: number }
  errorFromRounded: { x: number, y: number }
  errorFromCompensated: { x: number, y: number }
}

export default function RootCauseAnalysis() {
  const [analysisData, setAnalysisData] = useState<DetailedAnalysis[]>([])
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    // 특히 문제가 되는 (1,0) 포인트와 주변 포인트들
    const testPoints = [
      { gridX: 0, gridY: 0 },
      { gridX: 1, gridY: 0 }, // 문제의 포인트
      { gridX: 2, gridY: 0 },
      { gridX: 0, gridY: 1 },
      { gridX: 1, gridY: 1 },
    ]

    const analysis: DetailedAnalysis[] = testPoints.map(point => {
      // 1. 포워드 변환: 그리드 → 아이소메트릭
      const iso = gridToIsometric(point.gridX, point.gridY)
      const screenX = iso.x + OFFSET_X
      const screenY = iso.y + OFFSET_Y

      // 2. 타일의 중심점과 시작점 계산
      const tileCenterX = screenX + TILE_WIDTH / 2
      const tileCenterY = screenY + TILE_HEIGHT / 2
      const tileStartX = screenX
      const tileStartY = screenY

      // 3. 마우스가 타일 중심에 있을 때 시뮬레이션
      const mouseAtCenterX = tileCenterX
      const mouseAtCenterY = tileCenterY

      // 4. 역변환: 마우스 → 아이소메트릭 → 그리드
      const mouseIsoX = mouseAtCenterX - OFFSET_X
      const mouseIsoY = mouseAtCenterY - OFFSET_Y

      // 5. 수학적 계산
      const rawGridX = (mouseIsoX / (TILE_WIDTH / 2) + mouseIsoY / (TILE_HEIGHT / 2)) / 2
      const rawGridY = (mouseIsoY / (TILE_HEIGHT / 2) - mouseIsoX / (TILE_WIDTH / 2)) / 2

      const roundedGridX = Math.round(rawGridX)
      const roundedGridY = Math.round(rawGridY)

      const compensatedGridX = Math.round(rawGridX + 1)
      const compensatedGridY = Math.round(rawGridY)

      // 6. 오차 계산
      const errorFromRaw = {
        x: Math.abs(rawGridX - point.gridX),
        y: Math.abs(rawGridY - point.gridY)
      }
      const errorFromRounded = {
        x: Math.abs(roundedGridX - point.gridX),
        y: Math.abs(roundedGridY - point.gridY)
      }
      const errorFromCompensated = {
        x: Math.abs(compensatedGridX - point.gridX),
        y: Math.abs(compensatedGridY - point.gridY)
      }

      return {
        gridX: point.gridX,
        gridY: point.gridY,
        theoreticalIsoX: iso.x,
        theoreticalIsoY: iso.y,
        actualScreenX: screenX,
        actualScreenY: screenY,
        tileCenterX,
        tileCenterY,
        tileStartX,
        tileStartY,
        mouseAtCenterX,
        mouseAtCenterY,
        mouseIsoX,
        mouseIsoY,
        rawGridX,
        rawGridY,
        roundedGridX,
        roundedGridY,
        compensatedGridX,
        compensatedGridY,
        errorFromRaw,
        errorFromRounded,
        errorFromCompensated
      }
    })

    setAnalysisData(analysis)

    // 인사이트 생성
    const newInsights: string[] = []

    // 패턴 분석
    const rawXErrors = analysis.map(d => d.errorFromRaw.x)
    const roundedXErrors = analysis.map(d => d.errorFromRounded.x)
    const compensatedXErrors = analysis.map(d => d.errorFromCompensated.x)

    const avgRawXError = rawXErrors.reduce((a, b) => a + b, 0) / rawXErrors.length
    const avgRoundedXError = roundedXErrors.reduce((a, b) => a + b, 0) / roundedXErrors.length
    const avgCompensatedXError = compensatedXErrors.reduce((a, b) => a + b, 0) / compensatedXErrors.length

    newInsights.push(`평균 Raw X 오차: ${avgRawXError.toFixed(3)}`)
    newInsights.push(`평균 Rounded X 오차: ${avgRoundedXError.toFixed(3)}`)
    newInsights.push(`평균 Compensated X 오차: ${avgCompensatedXError.toFixed(3)}`)

    // 특정 패턴 감지
    const problemPoint = analysis.find(d => d.gridX === 1 && d.gridY === 0)
    if (problemPoint) {
      newInsights.push(`문제점 (1,0): Raw=${problemPoint.rawGridX.toFixed(3)}, 실제로는 ${problemPoint.rawGridX + 1}에 가까움`)
      newInsights.push(`이는 아이소메트릭 좌표계에서 X축 방향으로 ${1 - problemPoint.rawGridX}만큼의 체계적 오프셋이 있음을 의미`)
    }

    // 타일 중심점 vs 시작점 분석
    const centerVsStart = analysis.map(d => ({
      gridX: d.gridX,
      gridY: d.gridY,
      centerOffset: Math.abs(d.tileCenterX - d.mouseAtCenterX),
      startOffset: Math.abs(d.tileStartX - d.mouseAtCenterX)
    }))

    if (centerVsStart.some(c => c.centerOffset > 0.1)) {
      newInsights.push('타일 중심점 계산에 오차가 있습니다.')
    }

    setInsights(newInsights)
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        아이소메트릭 +1 보정 근본 원인 분석
      </h1>

      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <h2 className="text-lg font-semibold text-red-800 mb-2">🔍 핵심 가설</h2>
        <p className="text-red-700 text-sm">
          아이소메트릭 좌표 변환에서 +1 보정이 필요한 이유는 <strong>좌표계 원점의 정의 차이</strong>에서 비롯됩니다.
          렌더링 시에는 타일을 (0,0)부터 시작하지만, 수학적 변환에서는 다른 기준점을 사용하는 것으로 추정됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3">📊 상세 분석 데이터</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-1">Grid</th>
                  <th className="p-1">Raw Grid</th>
                  <th className="p-1">Rounded</th>
                  <th className="p-1">+1 보정</th>
                  <th className="p-1">오차</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.map((data, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-1 font-medium">({data.gridX},{data.gridY})</td>
                    <td className="p-1">({data.rawGridX.toFixed(2)},{data.rawGridY.toFixed(2)})</td>
                    <td className="p-1 text-center">
                      <span className={`inline-block px-1 rounded ${
                        data.errorFromRounded.x === 0 && data.errorFromRounded.y === 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        ({data.roundedGridX},{data.roundedGridY})
                      </span>
                    </td>
                    <td className="p-1 text-center">
                      <span className={`inline-block px-1 rounded ${
                        data.errorFromCompensated.x === 0 && data.errorFromCompensated.y === 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        ({data.compensatedGridX},{data.compensatedGridY})
                      </span>
                    </td>
                    <td className="p-1">
                      <div>R: {(data.errorFromRounded.x + data.errorFromRounded.y).toFixed(1)}</div>
                      <div>C: {(data.errorFromCompensated.x + data.errorFromCompensated.y).toFixed(1)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3">🧠 분석 인사이트</h3>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="text-sm bg-blue-50 p-2 rounded">
                {insight}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-3">🔬 수학적 분석</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">포워드 변환 (Grid → Isometric)</h4>
            <code className="block bg-white p-2 rounded">
              isoX = (gridX - gridY) × 32<br/>
              isoY = (gridX + gridY) × 16
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-2">역변환 (Isometric → Grid)</h4>
            <code className="block bg-white p-2 rounded">
              gridX = (isoX/32 + isoY/16) / 2<br/>
              gridY = (isoY/16 - isoX/32) / 2
            </code>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">📍 좌표계 기준점 차이</h4>
          <p className="text-sm text-yellow-700">
            현재 설정: OFFSET_X={OFFSET_X.toFixed(1)}, OFFSET_Y={OFFSET_Y.toFixed(1)}<br/>
            이 오프셋은 그리드를 화면 중앙에 배치하기 위한 것이지만,
            아이소메트릭 수학적 변환의 기준점과 일치하지 않는 것으로 보입니다.
          </p>
        </div>
      </div>

      <div className="bg-green-50 border rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-3">💡 결론 및 해결책</h3>
        <div className="space-y-2 text-sm text-green-700">
          <p>
            <strong>원인:</strong> 아이소메트릭 렌더링 시 타일의 시작점과 수학적 변환의 기준점이 일치하지 않음
          </p>
          <p>
            <strong>임시 해결책:</strong> +1 보정을 통해 올바른 그리드 좌표 획득
          </p>
          <p>
            <strong>근본 해결책:</strong> 오프셋 계산을 수정하여 렌더링과 수학적 변환의 기준점을 일치시킴
          </p>
          <p>
            <strong>권장사항:</strong> 현재는 +1 보정을 사용하되, 향후 타일 렌더링 위치를 조정하여 보정 없이 정확한 변환이 가능하도록 개선
          </p>
        </div>
      </div>
    </div>
  )
}
