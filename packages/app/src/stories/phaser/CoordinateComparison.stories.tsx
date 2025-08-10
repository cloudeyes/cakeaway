import type { Meta, StoryObj } from '@storybook/react-vite'
import { CoordinateComparison } from './CoordinateComparison'

const meta: Meta<typeof CoordinateComparison> = {
  title: 'Phaser.js Learning/Coordinate Comparison',
  component: CoordinateComparison,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**2D vs 아이소메트릭 좌표 변환 비교**

이 예제는 동일한 그리드 데이터를 2D와 아이소메트릭 방식으로 렌더링하여
좌표 변환의 차이점을 직접 비교할 수 있게 해줍니다.

**학습 목표:**
- 2D와 아이소메트릭 좌표계의 근본적 차이 이해
- 동일한 마우스 위치에서 다른 타일이 선택되는 이유 파악
- 각 좌표계의 장단점 비교
- 실제 게임 개발에서의 선택 기준 이해

**시각적 차이점:**
- **왼쪽 (2D)**: 직교 격자, 간단한 좌표 계산
- **오른쪽 (아이소메트릭)**: 다이아몬드 격자, 복잡한 좌표 변환

이 비교를 통해 아이소메트릭 시스템의 복잡성과 그 이유를 이해할 수 있습니다.
        `
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CoordinateComparison>

export const Default: Story = {
  name: '2D vs 아이소메트릭 비교',
  parameters: {
    docs: {
      description: {
        story: '마우스를 움직여서 동일한 위치에서 2D와 아이소메트릭 좌표계가 어떻게 다르게 반응하는지 확인하세요.'
      }
    }
  }
}

export const CoordinateTransforms: Story = {
  name: '좌표 변환 상세',
  parameters: {
    docs: {
      description: {
        story: `
**좌표 변환 비교:**

**2D 직교 좌표계:**
\`\`\`typescript
// 간단한 나눗셈으로 그리드 좌표 계산
const gridX = Math.floor((screenX - offsetX) / tileSize)
const gridY = Math.floor((screenY - offsetY) / tileSize)

// 화면 좌표 계산
const screenX = gridX * tileSize + offsetX
const screenY = gridY * tileSize + offsetY
\`\`\`

**아이소메트릭 좌표계:**
\`\`\`typescript
// 복잡한 행렬 변환
const gridX = (isoX / (tileWidth/2) + isoY / (tileHeight/2)) / 2
const gridY = (isoY / (tileHeight/2) - isoX / (tileWidth/2)) / 2

// 역변환
const isoX = (gridX - gridY) * (tileWidth / 2)
const isoY = (gridX + gridY) * (tileHeight / 2)
\`\`\`

**성능 차이:**
- 2D: O(1) 상수 시간 계산
- 아이소메트릭: O(1)이지만 더 많은 연산 필요

**정확도 차이:**
- 2D: 완벽한 정확도 (정사각형 히트박스)
- 아이소메트릭: 추가적인 히트 테스트 필요 (다이아몬드 모양)
        `
      }
    }
  }
}

export const WhenToUse: Story = {
  name: '언제 어떤 것을 사용할까?',
  parameters: {
    docs: {
      description: {
        story: `
**2D 직교 좌표계를 선택하는 경우:**
- 간단한 퍼즐 게임 (테트리스, 매치-3)
- 플랫포머 게임
- UI 요소가 많은 게임
- 개발 속도가 중요한 프로젝트
- 명확한 격자 기반 게임

**아이소메트릭을 선택하는 경우:**
- 건설/경영 시뮬레이션 (심시티, 롤러코스터 타이쿤)
- 전략 게임 (문명, 에이지 오브 엠파이어)
- RPG 게임
- 3D 느낌을 주면서도 2D 개발의 단순함을 유지하고 싶은 경우
- 시각적 임팩트가 중요한 게임

**Cakeaway 프로젝트의 선택:**
롤러코스터 타이쿤 스타일의 케이크 공장 건설 게임이므로 아이소메트릭이 적합합니다.
- 공장 건물의 3D 느낌
- 복잡한 생산 라인의 시각적 표현
- 플레이어의 몰입감 증대

**결론:**
아이소메트릭은 더 복잡하지만, 적절한 게임 장르에서는 그 복잡성이 충분히 가치가 있습니다.
        `
      }
    }
  }
}
