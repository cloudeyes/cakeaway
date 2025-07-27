import Phaser from 'phaser'
import React, { useEffect, useRef, useState } from 'react'
import { MainScene } from '../phaser/MainScene'

interface GameCanvasProps {
  width?: number
  height?: number
}

/**
 * React 컴포넌트에 Phaser.js 게임 인스턴스를 통합하는 컴포넌트
 * Phaser.js v3.9와 React v19를 연동하여 게임 캔버스를 렌더링
 */
export const GameCanvas: React.FC<GameCanvasProps> = ({
  width = 800,
  height = 600
}) => {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameStatus, setGameStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!containerRef.current) {
      console.error('GameCanvas: Container ref is null')
      setGameStatus('error')
      return
    }

    try {
      // Phaser 게임 설정
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width,
        height,
        parent: containerRef.current,
        backgroundColor: '#2c3e50',
        scene: [MainScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        render: {
          pixelArt: true,
          antialias: false
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      }

      console.log('GameCanvas: Creating Phaser game instance with config:', config)

      // Phaser 게임 인스턴스 생성
      gameRef.current = new Phaser.Game(config)

      // 게임 준비 완료 이벤트 리스너
      gameRef.current.events.on('ready', () => {
        console.log('GameCanvas: Phaser game is ready')
        setGameStatus('ready')
      })

      // 에러 이벤트 리스너
      gameRef.current.events.on('error', (error: Error) => {
        console.error('GameCanvas: Phaser game error:', error)
        setGameStatus('error')
      })

    } catch (error) {
      console.error('GameCanvas: Error creating Phaser game:', error)
      setGameStatus('error')
    }

    // 정리 함수
    return () => {
      if (gameRef.current) {
        console.log('GameCanvas: Destroying Phaser game instance')
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [width, height])

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="relative border-2 border-game-canvas-border-light dark:border-game-canvas-border-dark rounded-md"
        style={{ width, height }}
      >
        {gameStatus === 'loading' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-game-text-dark text-lg font-bold">
            게임 로딩 중...
          </div>
        )}

        {gameStatus === 'error' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-game-error text-lg font-bold">
            게임 로딩 오류
          </div>
        )}
      </div>

      <div className="mt-2.5 px-3 py-2 bg-game-status-bg-light dark:bg-game-status-bg-dark rounded-md text-sm text-game-status-text-light dark:text-game-status-text-dark">
        <strong>게임 상태:</strong> {gameStatus === 'ready' ? (
          <span className="text-game-success">✅ 준비됨</span>
        ) : gameStatus === 'loading' ? (
          <span className="text-game-warning">⏳ 로딩 중</span>
        ) : (
          <span className="text-game-error">❌ 오류</span>
        )}
      </div>
    </div>
  )
}

export default GameCanvas
