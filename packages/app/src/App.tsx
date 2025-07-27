import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import GameCanvas from './components/GameCanvas'

function App() {
  const [isDark, setIsDark] = useState(false)

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
      {/* 테마 토글 버튼 */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-md bg-game-status-bg-light dark:bg-game-status-bg-dark border border-game-canvas-border-light dark:border-game-canvas-border-dark hover:opacity-80 transition-opacity"
        aria-label="테마 변경"
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-game-warning" />
        ) : (
          <Moon className="w-5 h-5 text-game-status-text-light dark:text-game-status-text-dark" />
        )}
      </button>

      <h1 className="text-game-text-light dark:text-game-text-dark mb-5 text-2xl font-semibold font-[system-ui,Arial,sans-serif]">
        Cakeaway - 케이크 공장 시뮬레이션
      </h1>

      {/* Phaser.js 게임 캔버스 */}
      <GameCanvas width={800} height={600} />
    </div>
  )
}export default App
