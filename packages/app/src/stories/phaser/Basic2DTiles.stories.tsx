import type { Meta, StoryObj } from '@storybook/react-vite'
import { Basic2DTiles } from './Basic2DTiles'

const meta: Meta<typeof Basic2DTiles> = {
  title: 'Phaser.js Learning/Basic 2D Tiles',
  component: Basic2DTiles,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Basic2DTiles>

export const Default: Story = {
  name: '기본 2D 타일 시스템',
  parameters: {
    docs: {
      description: {
        story: '정사각형 타일로 구성된 기본 2D 그리드입니다. 마우스를 올리면 초록색으로, 클릭하면 빨간색으로 하이라이트됩니다.'
      }
    }
  }
}

export const Documentation: Story = {
  name: '사용법 및 원리',
  render: () => {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">2D 타일 시스템 사용법 및 원리</h1>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">📚 학습 목표</h2>
          <p className="text-blue-700">
            Phaser.js의 기본 2D 좌표 시스템을 이해하고, 마우스 상호작용을 통한
            화면 좌표 → 그리드 좌표 변환의 기초를 학습합니다.
          </p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">🏗️ 코드 구조</h2>
            <div className="bg-white border rounded-lg p-4">
              <ol className="space-y-2 text-gray-700">
                <li><strong>1. 타일 생성:</strong> <code className="bg-gray-100 px-2 py-1 rounded">this.add.rectangle()</code>로 정사각형 타일 생성</li>
                <li><strong>2. 좌표 저장:</strong> 각 타일에 그리드 좌표를 <code className="bg-gray-100 px-2 py-1 rounded">setData()</code>로 저장</li>
                <li><strong>3. 마우스 이벤트:</strong> <code className="bg-gray-100 px-2 py-1 rounded">pointermove</code>, <code className="bg-gray-100 px-2 py-1 rounded">pointerdown</code> 이벤트 처리</li>
                <li><strong>4. 좌표 변환:</strong> 화면 좌표를 그리드 좌표로 변환하는 간단한 공식</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">🔧 핵심 함수</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`private getTileAt(x: number, y: number): Phaser.GameObjects.Rectangle | null {
  const gridX = Math.floor((x - 50) / TILE_SIZE)
  const gridY = Math.floor((y - 50) / TILE_SIZE)

  if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
    return this.tiles[gridX][gridY]
  }
  return null
}`}</code></pre>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">📐 좌표 변환 원리</h2>
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2 text-gray-800">화면 좌표 → 그리드 좌표</h3>
                  <div className="bg-yellow-50 p-3 rounded text-sm">
                    <p><strong>공식:</strong></p>
                    <p><code>gridX = Math.floor((mouseX - offsetX) / tileSize)</code></p>
                    <p><code>gridY = Math.floor((mouseY - offsetY) / tileSize)</code></p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-gray-800">핵심 개념</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>오프셋:</strong> 그리드 시작점 보정</li>
                    <li>• <strong>Math.floor:</strong> 소수점 버림으로 정수 좌표</li>
                    <li>• <strong>범위 체크:</strong> 유효한 그리드 내부인지 확인</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">🎯 상호작용</h2>
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="w-8 h-8 bg-blue-500 mx-auto mb-2 rounded"></div>
                  <p className="text-sm"><strong>기본 상태</strong><br/>파란색 타일</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="w-8 h-8 bg-green-500 mx-auto mb-2 rounded"></div>
                  <p className="text-sm"><strong>호버 상태</strong><br/>마우스 올린 타일</p>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <div className="w-8 h-8 bg-red-500 mx-auto mb-2 rounded"></div>
                  <p className="text-sm"><strong>선택 상태</strong><br/>클릭한 타일</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">🚀 다음 단계</h2>
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-green-700 mb-2">
                2D 시스템을 이해했다면 이제 <strong>아이소메트릭 시스템</strong>으로 넘어갑니다:
              </p>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• 다이아몬드 모양 타일</li>
                <li>• 복잡한 좌표 변환 공식</li>
                <li>• 3D 느낌의 시각적 효과</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    )
  },
  parameters: {
    layout: 'fullscreen',
  },
}
