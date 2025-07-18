import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Grid, TileType } from '@cakeaway/simulation-engine'
import type { GridPosition } from '@cakeaway/simulation-engine'
import GameCanvas from './components/GameCanvas'

function App() {
  const [count, setCount] = useState(0)
  const [grid, setGrid] = useState<Grid | null>(null)
  const [gridInfo, setGridInfo] = useState<string>('')

  useEffect(() => {
    try {
      // simulation-engine 직접 사용 테스트
      const newGrid = new Grid(10, 10)
      const centerPosition: GridPosition = { x: 5, y: 5 }

      // 타일 정보 가져오기
      const centerTile = newGrid.getTile(centerPosition)
      if (centerTile) {
        centerTile.type = TileType.EQUIPMENT
        const screenPos = newGrid.gridToScreen(centerPosition)
        setGridInfo(`Grid created: ${newGrid.width}x${newGrid.height}, Center tile at screen (${screenPos.x}, ${screenPos.y})`)
      }

      setGrid(newGrid)
      console.log('Grid successfully created from simulation-engine:', newGrid)
    } catch (error) {
      console.error('Error creating grid:', error)
      setGridInfo('Error creating grid')
    }
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Cakeaway - 케이크 공장 시뮬레이션</h1>

      {/* Phaser.js 게임 캔버스 */}
      <div style={{ margin: '20px 0' }}>
        <GameCanvas width={800} height={600} />
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <h3>Simulation Engine Test:</h3>
          <p>{gridInfo}</p>
          <p>Grid instance: {grid ? '✅ Created' : '❌ Not created'}</p>
        </div>
      </div>
      <p className="read-the-docs">
        TypeScript Project References로 빌드 없이 실시간 개발 가능
      </p>
    </>
  )
}

export default App
