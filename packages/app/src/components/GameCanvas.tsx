import React, { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
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
    <div className="game-canvas-wrapper">
      <div
        ref={containerRef}
        className="game-canvas-container"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: '2px solid #34495e',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {gameStatus === 'loading' && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#ecf0f1',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            게임 로딩 중...
          </div>
        )}

        {gameStatus === 'error' && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#e74c3c',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            게임 로딩 오류
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#ecf0f1',
          borderRadius: '5px',
          fontSize: '14px'
        }}
      >
        <strong>게임 상태:</strong> {gameStatus === 'ready' ? '✅ 준비됨' : gameStatus === 'loading' ? '⏳ 로딩 중' : '❌ 오류'}
      </div>
    </div>
  )
}

export default GameCanvas
