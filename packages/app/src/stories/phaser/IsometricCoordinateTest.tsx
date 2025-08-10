import React, { useEffect, useState } from 'react'

interface CoordinateTestResult {
  mouseX: number
  mouseY: number
  expectedGridX: number
  expectedGridY: number
  actualGridX: number
  actualGridY: number
  isoX: number
  isoY: number
  passed: boolean
}

/**
 * 아이소메트릭 좌표 변환 테스트 컴포넌트
 * 실제 좌표 변환 로직을 검증하고 문제점을 찾아냅니다
 */
export const IsometricCoordinateTest: React.FC = () => {
  const [testResults, setTestResults] = useState<CoordinateTestResult[]>([])

  // 테스트용 상수들 (IsometricTiles와 동일)
  const TILE_WIDTH = 64
  const TILE_HEIGHT = 32
  const GRID_WIDTH = 8
  const GRID_HEIGHT = 6

  // 기존 오프셋 (문제가 있을 것으로 추정)
  const OFFSET_X_OLD = 300
  const OFFSET_Y_OLD = 150

  // 올바른 오프셋 계산
  // 아이소메트릭 그리드의 시각적 중심을 화면 중앙에 배치하려면
  // 그리드 전체의 경계를 고려해야 함
  const calculateCorrectOffset = () => {
    // 그리드의 경계점들 계산
    const topLeft = gridToIsometric(0, 0) // 좌상단
    const topRight = gridToIsometric(GRID_WIDTH-1, 0) // 우상단
    const bottomLeft = gridToIsometric(0, GRID_HEIGHT-1) // 좌하단
    const bottomRight = gridToIsometric(GRID_WIDTH-1, GRID_HEIGHT-1) // 우하단

    // 전체 그리드의 경계 계산
    const minX = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x)
    const maxX = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x)
    const minY = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y)
    const maxY = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y)

    // 화면 크기 (IsometricTiles 컴포넌트와 동일)
    const SCREEN_WIDTH = 700
    const SCREEN_HEIGHT = 500

    // 그리드를 화면 중앙에 배치하기 위한 오프셋
    const gridCenterX = (minX + maxX) / 2
    const gridCenterY = (minY + maxY) / 2
    const screenCenterX = SCREEN_WIDTH / 2
    const screenCenterY = SCREEN_HEIGHT / 2

    const correctOffsetX = screenCenterX - gridCenterX
    const correctOffsetY = screenCenterY - gridCenterY

    return {
      correctOffsetX: Math.round(correctOffsetX),
      correctOffsetY: Math.round(correctOffsetY),
      gridBounds: { minX, maxX, minY, maxY },
      gridCenter: { x: gridCenterX, y: gridCenterY }
    }
  }

  const offsetInfo = calculateCorrectOffset()
  const OFFSET_X = offsetInfo.correctOffsetX
  const OFFSET_Y = offsetInfo.correctOffsetY

  // 좌표 변환 함수들 (IsometricTiles와 동일)
  const gridToIsometric = (gridX: number, gridY: number): { x: number; y: number } => {
    const isoX = (gridX - gridY) * (TILE_WIDTH / 2)
    const isoY = (gridX + gridY) * (TILE_HEIGHT / 2)
    return { x: isoX, y: isoY }
  }

  const isometricToGrid = (isoX: number, isoY: number): { x: number; y: number } => {
    const gridX = (isoX / (TILE_WIDTH / 2) + isoY / (TILE_HEIGHT / 2)) / 2
    const gridY = (isoY / (TILE_HEIGHT / 2) - isoX / (TILE_WIDTH / 2)) / 2
    return { x: Math.round(gridX), y: Math.round(gridY) }
  }

  const mouseToGrid = (mouseX: number, mouseY: number): { x: number; y: number } => {
    const mouseIsoX = mouseX - OFFSET_X
    const mouseIsoY = mouseY - OFFSET_Y
    return isometricToGrid(mouseIsoX, mouseIsoY)
  }

  const runCoordinateTests = () => {
    const tests: Array<{
      mouseX: number
      mouseY: number
      expectedGridX: number
      expectedGridY: number
      description: string
    }> = [
      // 기본 테스트 케이스들
      { mouseX: OFFSET_X, mouseY: OFFSET_Y, expectedGridX: 0, expectedGridY: 0, description: 'Grid (0,0) 중심 - 계산된 오프셋' },

      // 사용자 제보 케이스 - 이제 올바른 오프셋으로 다시 검증
      { mouseX: 300, mouseY: 158, expectedGridX: 0, expectedGridY: 1, description: '사용자 제보: (300,158) → Grid(0,1)' },

      // 기존 오프셋으로 Grid (0,0) 테스트
      { mouseX: OFFSET_X_OLD, mouseY: OFFSET_Y_OLD, expectedGridX: 0, expectedGridY: 0, description: 'Grid (0,0) 중심 - 기존 오프셋' },

      // Grid (0,1)의 실제 중심점 계산
      // Grid (0,1): isoX = (0-1)*32 = -32, isoY = (0+1)*16 = 16
      // 화면: (300-32, 150+16) = (268, 166)
      { mouseX: 268, mouseY: 166, expectedGridX: 0, expectedGridY: 1, description: 'Grid (0,1) 계산된 중심' },

      // Grid (1,0)의 실제 중심점 계산
      // Grid (1,0): isoX = (1-0)*32 = 32, isoY = (1+0)*16 = 16
      // 화면: (300+32, 150+16) = (332, 166)
      { mouseX: 332, mouseY: 166, expectedGridX: 1, expectedGridY: 0, description: 'Grid (1,0) 계산된 중심' },

      // 각 타일의 정확한 중심점들을 계산해서 테스트
      ...generateTileTestCases()
    ]

    const results: CoordinateTestResult[] = tests.map(test => {
      const actualGrid = mouseToGrid(test.mouseX, test.mouseY)
      const mouseIsoX = test.mouseX - OFFSET_X
      const mouseIsoY = test.mouseY - OFFSET_Y

      const passed = actualGrid.x === test.expectedGridX && actualGrid.y === test.expectedGridY

      return {
        mouseX: test.mouseX,
        mouseY: test.mouseY,
        expectedGridX: test.expectedGridX,
        expectedGridY: test.expectedGridY,
        actualGridX: actualGrid.x,
        actualGridY: actualGrid.y,
        isoX: mouseIsoX,
        isoY: mouseIsoY,
        passed
      }
    })

    setTestResults(results)
  }

  const generateTileTestCases = () => {
    const testCases = []

    // 그리드 (0,0)부터 (3,3)까지의 각 타일 중심점에서 테스트
    for (let gridX = 0; gridX <= 3; gridX++) {
      for (let gridY = 0; gridY <= 3; gridY++) {
        const isoCoords = gridToIsometric(gridX, gridY)
        const screenX = isoCoords.x + OFFSET_X
        const screenY = isoCoords.y + OFFSET_Y

        testCases.push({
          mouseX: screenX,
          mouseY: screenY,
          expectedGridX: gridX,
          expectedGridY: gridY,
          description: `Grid (${gridX},${gridY}) 중심`
        })

        // 타일 가장자리 테스트도 추가
        testCases.push({
          mouseX: screenX + 5,
          mouseY: screenY,
          expectedGridX: gridX,
          expectedGridY: gridY,
          description: `Grid (${gridX},${gridY}) 우측`
        })

        testCases.push({
          mouseX: screenX,
          mouseY: screenY + 5,
          expectedGridX: gridX,
          expectedGridY: gridY,
          description: `Grid (${gridX},${gridY}) 하단`
        })
      }
    }

    return testCases
  }

  // 상세 분석 함수
  const analyzeSpecificCase = (mouseX: number, mouseY: number) => {
    console.log('=== 좌표 변환 상세 분석 ===')
    console.log(`마우스 위치: (${mouseX}, ${mouseY})`)

    console.log('\n--- 기존 오프셋으로 계산 ---')
    const mouseIsoX_old = mouseX - OFFSET_X_OLD
    const mouseIsoY_old = mouseY - OFFSET_Y_OLD
    console.log(`기존 오프셋 적용 후: (${mouseIsoX_old}, ${mouseIsoY_old})`)

    const gridXFloat_old = (mouseIsoX_old / (TILE_WIDTH / 2) + mouseIsoY_old / (TILE_HEIGHT / 2)) / 2
    const gridYFloat_old = (mouseIsoY_old / (TILE_HEIGHT / 2) - mouseIsoX_old / (TILE_WIDTH / 2)) / 2
    console.log(`기존 오프셋 gridX: ${gridXFloat_old.toFixed(3)}, gridY: ${gridYFloat_old.toFixed(3)}`)
    console.log(`기존 오프셋 결과: (${Math.round(gridXFloat_old)}, ${Math.round(gridYFloat_old)})`)

    console.log('\n--- 계산된 오프셋으로 계산 ---')
    const mouseIsoX = mouseX - OFFSET_X
    const mouseIsoY = mouseY - OFFSET_Y
    console.log(`계산된 오프셋 적용 후: (${mouseIsoX}, ${mouseIsoY})`)

    const gridXFloat = (mouseIsoX / (TILE_WIDTH / 2) + mouseIsoY / (TILE_HEIGHT / 2)) / 2
    const gridYFloat = (mouseIsoY / (TILE_HEIGHT / 2) - mouseIsoX / (TILE_WIDTH / 2)) / 2
    console.log(`계산된 오프셋 gridX: ${gridXFloat.toFixed(3)}, gridY: ${gridYFloat.toFixed(3)}`)
    console.log(`계산된 오프셋 결과: (${Math.round(gridXFloat)}, ${Math.round(gridYFloat)})`)

    console.log('\n--- 오프셋 차이 분석 ---')
    console.log(`오프셋 차이: (${OFFSET_X - OFFSET_X_OLD}, ${OFFSET_Y - OFFSET_Y_OLD})`)
    console.log(`아이소메트릭 좌표 차이: (${mouseIsoX - mouseIsoX_old}, ${mouseIsoY - mouseIsoY_old})`)

    // 역변환으로 검증
    const reverseIso = gridToIsometric(Math.round(gridXFloat), Math.round(gridYFloat))
    const reverseScreen = {
      x: reverseIso.x + OFFSET_X,
      y: reverseIso.y + OFFSET_Y
    }
    console.log(`\n--- 역변환 검증 ---`)
    console.log(`Grid (${Math.round(gridXFloat)}, ${Math.round(gridYFloat)})의 화면 좌표: (${reverseScreen.x}, ${reverseScreen.y})`)
    console.log(`원래 마우스 위치와의 차이: (${Math.abs(reverseScreen.x - mouseX)}, ${Math.abs(reverseScreen.y - mouseY)})`)

    return {
      oldOffset: { gridX: Math.round(gridXFloat_old), gridY: Math.round(gridYFloat_old) },
      newOffset: { gridX: Math.round(gridXFloat), gridY: Math.round(gridYFloat) }
    }
  }

  useEffect(() => {
    runCoordinateTests()

    // 사용자가 제보한 케이스 상세 분석
    console.log('사용자 제보 케이스 분석:')
    analyzeSpecificCase(300, 158)
  }, [])

  const failedTests = testResults.filter(result => !result.passed)

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">아이소메트릭 좌표 변환 테스트</h3>

      <div className="mb-4">
        <button
          onClick={runCoordinateTests}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          테스트 다시 실행
        </button>
        <button
          onClick={() => analyzeSpecificCase(300, 158)}
          className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          (300, 158) 케이스 분석
        </button>
      </div>

      <div className="mb-4 p-3 bg-gray-100 rounded">
        <h4 className="font-semibold mb-2">테스트 설정:</h4>
        <p className="text-sm">TILE_WIDTH: {TILE_WIDTH}, TILE_HEIGHT: {TILE_HEIGHT}</p>
        <p className="text-sm">GRID_SIZE: {GRID_WIDTH} × {GRID_HEIGHT}</p>
        <div className="mt-2 p-2 bg-blue-50 rounded">
          <p className="text-sm font-semibold text-blue-800">오프셋 비교:</p>
          <p className="text-sm">기존 OFFSET: ({OFFSET_X_OLD}, {OFFSET_Y_OLD})</p>
          <p className="text-sm">계산된 OFFSET: ({OFFSET_X}, {OFFSET_Y})</p>
          <p className="text-sm text-blue-600">
            차이: ({OFFSET_X - OFFSET_X_OLD}, {OFFSET_Y - OFFSET_Y_OLD})
          </p>
        </div>
        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
          <p><strong>그리드 경계:</strong> X[{offsetInfo.gridBounds.minX}, {offsetInfo.gridBounds.maxX}], Y[{offsetInfo.gridBounds.minY}, {offsetInfo.gridBounds.maxY}]</p>
          <p><strong>그리드 중심:</strong> ({offsetInfo.gridCenter.x.toFixed(1)}, {offsetInfo.gridCenter.y.toFixed(1)})</p>
        </div>
      </div>

      <div className="mb-4 p-3 rounded" style={{ backgroundColor: failedTests.length > 0 ? '#fee' : '#efe' }}>
        <h4 className="font-semibold">
          테스트 결과: {testResults.length - failedTests.length}/{testResults.length} 통과
        </h4>
        {failedTests.length > 0 && (
          <p className="text-red-600 text-sm mt-1">
            {failedTests.length}개의 테스트가 실패했습니다.
          </p>
        )}
      </div>

      {/* 실패한 테스트만 표시 */}
      {failedTests.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-red-700">❌ 실패한 테스트:</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-red-50">
                  <th className="border px-2 py-1 text-xs">마우스</th>
                  <th className="border px-2 py-1 text-xs">아이소메트릭</th>
                  <th className="border px-2 py-1 text-xs">예상 그리드</th>
                  <th className="border px-2 py-1 text-xs">실제 그리드</th>
                  <th className="border px-2 py-1 text-xs">오차</th>
                </tr>
              </thead>
              <tbody>
                {failedTests.map((result, index) => (
                  <tr key={index} className="bg-red-25">
                    <td className="border px-2 py-1 text-xs">
                      ({result.mouseX}, {result.mouseY})
                    </td>
                    <td className="border px-2 py-1 text-xs">
                      ({result.isoX}, {result.isoY})
                    </td>
                    <td className="border px-2 py-1 text-xs">
                      ({result.expectedGridX}, {result.expectedGridY})
                    </td>
                    <td className="border px-2 py-1 text-xs font-bold text-red-600">
                      ({result.actualGridX}, {result.actualGridY})
                    </td>
                    <td className="border px-2 py-1 text-xs">
                      Δx:{result.actualGridX - result.expectedGridX},
                      Δy:{result.actualGridY - result.expectedGridY}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 모든 테스트 결과 */}
      <div>
        <h4 className="font-semibold mb-2">전체 테스트 결과:</h4>
        <div className="overflow-x-auto max-h-60">
          <table className="min-w-full bg-white border text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-2 py-1">마우스 (x,y)</th>
                <th className="border px-2 py-1">아이소메트릭 (x,y)</th>
                <th className="border px-2 py-1">예상 그리드</th>
                <th className="border px-2 py-1">실제 그리드</th>
                <th className="border px-2 py-1">결과</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, index) => (
                <tr key={index} className={result.passed ? 'bg-green-25' : 'bg-red-25'}>
                  <td className="border px-2 py-1">
                    ({result.mouseX}, {result.mouseY})
                  </td>
                  <td className="border px-2 py-1">
                    ({result.isoX}, {result.isoY})
                  </td>
                  <td className="border px-2 py-1">
                    ({result.expectedGridX}, {result.expectedGridY})
                  </td>
                  <td className="border px-2 py-1">
                    ({result.actualGridX}, {result.actualGridY})
                  </td>
                  <td className="border px-2 py-1">
                    {result.passed ? '✅' : '❌'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded">
        <h4 className="font-semibold mb-2">분석 포인트:</h4>
        <ul className="text-sm space-y-1">
          <li>• Math.floor() 사용으로 인한 경계값 처리 문제</li>
          <li>• 오프셋(OFFSET_X, OFFSET_Y) 계산 확인</li>
          <li>• 타일 크기와 좌표 변환 공식의 일치성</li>
          <li>• 아이소메트릭 좌표계에서의 반올림 정책</li>
        </ul>
      </div>
    </div>
  )
}
