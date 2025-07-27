import { Bug, Eye, Grid, Layers, Map, Moon, RotateCcw, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import GameCanvas from './components/GameCanvas'

// 사용 가능한 맵 정의
const AVAILABLE_MAPS = [
  {
    id: 'default-factory',
    name: '기본 공장',
    path: '/assets/maps/default-factory.json',
    description: '중앙이 높고 가장자리가 낮은 기본 공장 레이아웃'
  },
  {
    id: 'test-valley',
    name: '테스트 골짜기',
    path: '/assets/maps/test-valley.json',
    description: '중앙이 낮고 주변이 높은 골짜기 레이아웃'
  }
] as const

function App() {
  const [isDark, setIsDark] = useState(false)
  const [heightVisualization, setHeightVisualization] = useState(false) // 기본값을 false로 변경
  const [showGrid, setShowGrid] = useState(false) // 격자 표시 상태
  const [showHitTestDebug, setShowHitTestDebug] = useState(false) // 히트 테스트 디버깅 상태
  const [gameKey, setGameKey] = useState(0)
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number; height: number } | null>(null)
  const [selectedMapId, setSelectedMapId] = useState<string>('default-factory')

  // 시스템 테마 감지 및 초기 설정
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // 테마 토글 함수
  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  // 높이 시각화 토글
  const toggleHeightVisualization = () => {
    setHeightVisualization(!heightVisualization)
  }

  // 격자 표시 토글
  const toggleGrid = () => {
    setShowGrid(!showGrid)
  }

  // 히트 테스트 디버깅 토글
  const toggleHitTestDebug = () => {
    setShowHitTestDebug(!showHitTestDebug)
  }

  // 맵 변경 핸들러
  const handleMapChange = (mapId: string) => {
    setSelectedMapId(mapId)
  }

  // 게임 재시작
  const resetGame = () => {
    setGameKey(prev => prev + 1)
  }

  // 선택된 맵 정보 가져오기
  const selectedMap = AVAILABLE_MAPS.find(map => map.id === selectedMapId) || AVAILABLE_MAPS[0]

  // HTML 루트 요소에 dark 클래스 적용/제거
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-game-bg-light dark:bg-game-bg-dark relative">
      {/* 상단 컨트롤 패널 */}
      <div className="absolute top-4 right-4 flex gap-2">
        {/* 맵 선택 드롭다운 */}
        <div className="relative">
          <select
            value={selectedMapId}
            onChange={(e) => handleMapChange(e.target.value)}
            className="px-3 py-2 pr-8 rounded-md bg-game-status-bg-light dark:bg-game-status-bg-dark border border-game-canvas-border-light dark:border-game-canvas-border-dark text-game-status-text-light dark:text-game-status-text-dark text-sm hover:opacity-80 transition-opacity cursor-pointer appearance-none"
            title="맵 선택"
          >
            {AVAILABLE_MAPS.map((map) => (
              <option key={map.id} value={map.id}>
                {map.name}
              </option>
            ))}
          </select>
          <Map className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-game-status-text-light dark:text-game-status-text-dark pointer-events-none" />
        </div>

        {/* 높이 시각화 토글 버튼 */}
        <button
          onClick={toggleHeightVisualization}
          className={`p-2 rounded-md border transition-all ${
            heightVisualization
              ? 'bg-green-500 text-white border-green-600 shadow-md'
              : 'bg-game-status-bg-light dark:bg-game-status-bg-dark border-game-canvas-border-light dark:border-game-canvas-border-dark text-game-status-text-light dark:text-game-status-text-dark hover:opacity-80'
          }`}
          aria-label="높이 시각화 토글"
          title="높이별 색상 시각화 토글"
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* 격자 표시 토글 버튼 */}
        <button
          onClick={toggleGrid}
          className={`p-2 rounded-md border transition-all ${
            showGrid
              ? 'bg-blue-500 text-white border-blue-600 shadow-md'
              : 'bg-game-status-bg-light dark:bg-game-status-bg-dark border-game-canvas-border-light dark:border-game-canvas-border-dark text-game-status-text-light dark:text-game-status-text-dark hover:opacity-80'
          }`}
          aria-label="격자 표시 토글"
          title="레벨 0 타일 격자선 표시 토글"
        >
          <Grid className="w-5 h-5" />
        </button>

        {/* 히트 테스트 디버깅 토글 버튼 */}
        <button
          onClick={toggleHitTestDebug}
          className={`p-2 rounded-md border transition-all ${
            showHitTestDebug
              ? 'bg-orange-500 text-white border-orange-600 shadow-md'
              : 'bg-game-status-bg-light dark:bg-game-status-bg-dark border-game-canvas-border-light dark:border-game-canvas-border-dark text-game-status-text-light dark:text-game-status-text-dark hover:opacity-80'
          }`}
          aria-label="히트 테스트 디버깅 표시 토글"
          title="히트 테스트 성공 영역 시각화 토글"
        >
          <Bug className="w-5 h-5" />
        </button>

        {/* 게임 재시작 버튼 */}
        <button
          onClick={resetGame}
          className="p-2 rounded-md bg-game-status-bg-light dark:bg-game-status-bg-dark border border-game-canvas-border-light dark:border-game-canvas-border-dark hover:opacity-80 transition-opacity text-game-status-text-light dark:text-game-status-text-dark"
          aria-label="게임 재시작"
          title="게임 재시작"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* 테마 토글 버튼 */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md bg-game-status-bg-light dark:bg-game-status-bg-dark border border-game-canvas-border-light dark:border-game-canvas-border-dark hover:opacity-80 transition-opacity"
          aria-label="테마 변경"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-game-warning" />
          ) : (
            <Moon className="w-5 h-5 text-game-status-text-light dark:text-game-status-text-dark" />
          )}
        </button>
      </div>

      {/* 상태 표시 패널 */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {/* 높이 시각화 상태 */}
        <div className="flex items-center gap-2 bg-game-status-bg-light dark:bg-game-status-bg-dark px-3 py-2 rounded-md border border-game-canvas-border-light dark:border-game-canvas-border-dark">
          <Eye className="w-4 h-4 text-game-status-text-light dark:text-game-status-text-dark" />
          <span className="text-sm text-game-status-text-light dark:text-game-status-text-dark">
            높이 색상: {heightVisualization ? '활성화' : '비활성화'}
          </span>
        </div>

        {/* 격자 표시 상태 */}
        <div className="flex items-center gap-2 bg-game-status-bg-light dark:bg-game-status-bg-dark px-3 py-2 rounded-md border border-game-canvas-border-light dark:border-game-canvas-border-dark">
          <Grid className="w-4 h-4 text-game-status-text-light dark:text-game-status-text-dark" />
          <span className="text-sm text-game-status-text-light dark:text-game-status-text-dark">
            격자선: {showGrid ? '활성화' : '비활성화'}
          </span>
        </div>

        {/* 히트 테스트 디버깅 상태 */}
        <div className="flex items-center gap-2 bg-game-status-bg-light dark:bg-game-status-bg-dark px-3 py-2 rounded-md border border-game-canvas-border-light dark:border-game-canvas-border-dark">
          <Bug className="w-4 h-4 text-game-status-text-light dark:text-game-status-text-dark" />
          <span className="text-sm text-game-status-text-light dark:text-game-status-text-dark">
            히트 테스트: {showHitTestDebug ? '활성화' : '비활성화'}
          </span>
        </div>

        {/* 현재 맵 정보 */}
        <div className="flex items-center gap-2 bg-game-status-bg-light dark:bg-game-status-bg-dark px-3 py-2 rounded-md border border-game-canvas-border-light dark:border-game-canvas-border-dark">
          <Map className="w-4 h-4 text-game-status-text-light dark:text-game-status-text-dark" />
          <span className="text-sm text-game-status-text-light dark:text-game-status-text-dark">
            현재 맵: {selectedMap.name}
          </span>
        </div>
      </div>

      {/* 선택된 타일 정보 표시 */}
      {selectedTile && (
        <div
          className="absolute top-20 left-4 bg-game-status-bg-light dark:bg-game-status-bg-dark px-3 py-2 rounded-md border border-game-canvas-border-light dark:border-game-canvas-border-dark"
          data-testid="selected-tile-info"
          data-tile-x={selectedTile.x}
          data-tile-y={selectedTile.y}
          data-tile-height={selectedTile.height}
        >
          <span className="text-sm text-game-status-text-light dark:text-game-status-text-dark">
            선택된 타일: ({selectedTile.x}, {selectedTile.y}) | 높이: {selectedTile.height}
          </span>
        </div>
      )}

      <h1 className="text-game-text-light dark:text-game-text-dark mb-5 text-2xl font-semibold font-[system-ui,Arial,sans-serif]">
        Cakeaway - 케이크 공장 시뮬레이션
      </h1>

      {/* Phaser.js 게임 캔버스 */}
      <GameCanvas
        key={gameKey}
        width={800}
        height={600}
        heightVisualization={heightVisualization}
        showGrid={showGrid}
        showHitTestDebug={showHitTestDebug}
        mapPath={selectedMap.path}
        onTileSelected={setSelectedTile}
      />

      {/* 맵 설명 및 가이드 */}
      <div className="mt-4 max-w-2xl text-center">
        <p className="text-sm text-game-status-text-light dark:text-game-status-text-dark mb-2">
          🔷 아이소메트릭 3D 타일 시스템 (높이 0-3 레벨)
        </p>
        <p className="text-xs text-game-status-text-light dark:text-game-status-text-dark opacity-75 mb-2">
          <strong>{selectedMap.name}:</strong> {selectedMap.description}
        </p>
        <p className="text-xs text-game-status-text-light dark:text-game-status-text-dark opacity-75">
          타일을 클릭하면 높이와 위치 정보를 확인할 수 있습니다.
          상단 드롭다운에서 다른 맵으로 변경하거나 높이 색상 토글을 활성화해보세요.
        </p>
        <div className="mt-2 flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            높이 0 (바닥)
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            높이 1
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            높이 2
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            높이 3 (최고)
          </span>
        </div>
      </div>
    </div>
  )
}

export default App
