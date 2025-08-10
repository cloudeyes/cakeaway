import type { Meta, StoryObj } from '@storybook/react-vite'
import RootCauseAnalysis from './RootCauseAnalysis'

const meta = {
  title: 'Phaser/6. Root Cause Analysis',
  component: RootCauseAnalysis,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof RootCauseAnalysis>

export default meta
type Story = StoryObj<typeof meta>

export const Analysis: Story = {
  name: '근본 원인 분석',
  parameters: {
    docs: {
      description: {
        story: `
### +1 보정이 필요한 근본 원인 분석

이 도구는 아이소메트릭 좌표 변환에서 \`+1\` 보정이 왜 필요한지를 수학적으로 깊이 분석합니다.

**핵심 가설:**
아이소메트릭 좌표 변환에서 +1 보정이 필요한 이유는 **좌표계 원점의 정의 차이**에서 비롯됩니다.

**분석 방법:**
1. 각 그리드 포인트에서 포워드/역변환 과정 상세 추적
2. 타일 중심점 vs 시작점 기준 차이 분석
3. Raw 계산값 vs 반올림 vs +1 보정 결과 비교
4. 체계적 오프셋 패턴 감지

**결과:**
- Raw 계산값이 항상 실제 그리드 좌표보다 작게 나옴
- 이는 렌더링과 수학적 변환의 기준점 불일치를 의미
- +1 보정이 현재로서는 가장 정확한 해결책

**권장사항:**
현재는 +1 보정을 사용하되, 향후 타일 렌더링 위치를 조정하여 보정 없이 정확한 변환이 가능하도록 개선
        `,
      },
    },
  },
}
