import type { Meta, StoryObj } from '@storybook/react-vite'
import CoordinateAnalysis from './CoordinateAnalysis'

const meta = {
  title: 'Phaser/5. Coordinate Analysis',
  component: CoordinateAnalysis,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CoordinateAnalysis>

export default meta
type Story = StoryObj<typeof meta>

export const Analysis: Story = {
  name: '+1 보정 분석',
  parameters: {
    docs: {
      description: {
        story: `
### +1 보정이 필요한 이유 분석

이 분석 도구는 아이소메트릭 좌표 변환에서 \`+1\` 보정이 왜 필요한지를 수학적으로 분석합니다.

**분석 과정:**
1. 그리드 좌표를 아이소메트릭 좌표로 변환
2. 화면 좌표로 변환 후 마우스 위치 시뮬레이션
3. 마우스 위치를 다시 그리드 좌표로 역변환
4. 원래 함수 vs +1 보정 함수 결과 비교

**예상 원인:**
- 아이소메트릭 좌표계의 원점과 렌더링 시작점 불일치
- 타일 중심점 vs 타일 시작점 기준 차이
- 부동소수점 반올림 오차

표에서 녹색은 정확한 매핑, 빨간색은 부정확한 매핑을 나타냅니다.
        `,
      },
    },
  },
}
