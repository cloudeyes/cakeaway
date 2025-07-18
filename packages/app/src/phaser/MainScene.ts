import Phaser from 'phaser'
import { Grid } from '@cakeaway/simulation-engine'

/**
 * Phaser.js 메인 게임 씬
 * 케이크 공장 시뮬레이션의 기본 렌더링 씬
 */
export class MainScene extends Phaser.Scene {
  private grid: Grid | null = null
  private gridGraphics: Phaser.GameObjects.Graphics | null = null
  private statusText: Phaser.GameObjects.Text | null = null

  constructor() {
    super({ key: 'MainScene' })
  }

  preload(): void {
    console.log('MainScene: Preloading assets...')

    // 임시 색상 팔레트 정의
    this.load.on('complete', () => {
      console.log('MainScene: Asset loading complete')
    })
  }

  create(): void {
    console.log('MainScene: Creating scene...')

    try {
      // 시뮬레이션 엔진 그리드 생성
      this.grid = new Grid(20, 15)
      console.log('MainScene: Grid created successfully', this.grid)

      // 배경 설정
      this.cameras.main.setBackgroundColor('#34495e')

      // 그리드 렌더링용 그래픽스 객체 생성
      this.gridGraphics = this.add.graphics()

      // 상태 텍스트 표시
      this.statusText = this.add.text(10, 10, 'Cakeaway - 케이크 공장 시뮬레이션', {
        fontSize: '24px',
        color: '#ecf0f1',
        fontFamily: 'Arial'
      })

      this.add.text(10, 50, 'Phaser.js v3.9 + React v19 통합 완료', {
        fontSize: '16px',
        color: '#3498db',
        fontFamily: 'Arial'
      })

      // 그리드 렌더링
      this.renderGrid()

      // 마우스 입력 이벤트 설정
      this.input.on('pointerdown', this.handlePointerDown, this)

      console.log('MainScene: Scene creation complete')

    } catch (error) {
      console.error('MainScene: Error creating scene:', error)

      // 에러 메시지 표시
      this.add.text(10, 10, '씬 생성 중 오류가 발생했습니다', {
        fontSize: '20px',
        color: '#e74c3c',
        fontFamily: 'Arial'
      })
    }
  }

  update(): void {
    // 매 프레임마다 실행되는 업데이트 로직
    // 현재는 비어있음 - 향후 시뮬레이션 업데이트 로직 추가
  }

  private renderGrid(): void {
    if (!this.grid || !this.gridGraphics) {
      console.error('MainScene: Grid or graphics object not available')
      return
    }

    try {
      console.log('MainScene: Rendering grid...')

      // 그리드 렌더링 설정
      const tileSize = 32
      const offsetX = 100
      const offsetY = 100

      this.gridGraphics.clear()

      // 그리드 라인 그리기
      this.gridGraphics.lineStyle(1, 0x7f8c8d, 0.5)

      // 세로 라인
      for (let x = 0; x <= this.grid.width; x++) {
        const screenX = offsetX + x * tileSize
        this.gridGraphics.moveTo(screenX, offsetY)
        this.gridGraphics.lineTo(screenX, offsetY + this.grid.height * tileSize)
      }

      // 가로 라인
      for (let y = 0; y <= this.grid.height; y++) {
        const screenY = offsetY + y * tileSize
        this.gridGraphics.moveTo(offsetX, screenY)
        this.gridGraphics.lineTo(offsetX + this.grid.width * tileSize, screenY)
      }

      this.gridGraphics.strokePath()

      // 그리드 정보 표시
      this.add.text(10, 100, `그리드: ${this.grid.width} x ${this.grid.height}`, {
        fontSize: '14px',
        color: '#95a5a6',
        fontFamily: 'Arial'
      })

      console.log('MainScene: Grid rendering complete')

    } catch (error) {
      console.error('MainScene: Error rendering grid:', error)
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.grid) return

    try {
      console.log('MainScene: Pointer down at', pointer.x, pointer.y)

      // 마우스 좌표를 그리드 좌표로 변환 (임시 구현)
      const tileSize = 32
      const offsetX = 100
      const offsetY = 100

      const gridX = Math.floor((pointer.x - offsetX) / tileSize)
      const gridY = Math.floor((pointer.y - offsetY) / tileSize)

      if (gridX >= 0 && gridX < this.grid.width && gridY >= 0 && gridY < this.grid.height) {
        console.log('MainScene: Grid position clicked:', gridX, gridY)

        // 상태 텍스트 업데이트
        if (this.statusText) {
          this.statusText.setText(`클릭한 그리드 위치: (${gridX}, ${gridY})`)
        }

        // 클릭한 타일 하이라이트 (임시 구현)
        const highlightGraphics = this.add.graphics()
        highlightGraphics.fillStyle(0x3498db, 0.3)
        highlightGraphics.fillRect(
          offsetX + gridX * tileSize,
          offsetY + gridY * tileSize,
          tileSize,
          tileSize
        )

        // 1초 후 하이라이트 제거
        this.time.delayedCall(1000, () => {
          highlightGraphics.destroy()
        })
      }

    } catch (error) {
      console.error('MainScene: Error handling pointer down:', error)
    }
  }
}
