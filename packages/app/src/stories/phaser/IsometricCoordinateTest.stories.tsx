import type { Meta, StoryObj } from '@storybook/react-vite'
import { IsometricCoordinateTest } from './IsometricCoordinateTest'

const meta: Meta<typeof IsometricCoordinateTest> = {
  title: 'Phaser.js Learning/Coordinate Testing',
  component: IsometricCoordinateTest,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**아이소메트릭 좌표 변환 테스트 및 디버깅**

이 컴포넌트는 아이소메트릭 좌표 변환 로직을 체계적으로 테스트하고 문제점을 찾아냅니다.

**테스트 목적:**
- 마우스 좌표 → 그리드 좌표 변환의 정확성 검증
- 사용자 제보 케이스 (300, 158) → Grid (1, 0) 문제 분석
- 경계값 및 반올림 정책 확인
- 좌표 변환 공식의 올바른 구현 검증

**발견 가능한 문제들:**
1. **Math.floor() vs Math.round()**: 반올림 정책 차이
2. **오프셋 계산 오류**: OFFSET_X, OFFSET_Y 값 검증
3. **타일 크기 불일치**: TILE_WIDTH, TILE_HEIGHT와 공식 간의 불일치
4. **좌표계 원점 문제**: 아이소메트릭 좌표계의 원점 설정

이 테스트를 통해 현재 IsometricTiles 컴포넌트의 정확한 문제점을 파악할 수 있습니다.
        `
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof IsometricCoordinateTest>

export const CoordinateDebugging: Story = {
  name: '좌표 변환 테스트',
  parameters: {
    docs: {
      description: {
        story: '아이소메트릭 좌표 변환 로직을 체계적으로 테스트하고 문제점을 찾아냅니다. 특히 (300, 158) 위치에서 Grid (1, 0) 대신 Grid (0, 0)이 선택되는 문제를 분석합니다.'
      }
    }
  }
}

export const TestAnalysis: Story = {
  name: '테스트 분석 가이드',
  parameters: {
    docs: {
      description: {
        story: `
**테스트 분석 방법:**

1. **"테스트 다시 실행" 버튼**: 모든 테스트 케이스 실행
2. **"(300, 158) 케이스 분석" 버튼**: 특정 문제 케이스의 단계별 계산 과정 출력 (브라우저 콘솔 확인)
3. **실패한 테스트 표**: 예상값과 실제값의 차이 확인
4. **전체 테스트 결과**: 모든 테스트의 통과/실패 현황

**주요 확인 포인트:**

\`\`\`typescript
// 현재 구현
const gridX = Math.floor((isoX / (TILE_WIDTH/2) + isoY / (TILE_HEIGHT/2)) / 2)
const gridY = Math.floor((isoY / (TILE_HEIGHT/2) - isoX / (TILE_WIDTH/2)) / 2)

// 문제점: Math.floor()가 항상 적절한가?
// 대안: Math.round() 또는 경계값 처리
\`\`\`

**예상 문제점:**
1. **반올림 정책**: Math.floor() 대신 Math.round() 필요할 수 있음
2. **오프셋 기준점**: 타일 중심이 아닌 다른 점이 기준일 수 있음
3. **타일 크기 일치성**: 실제 렌더링 크기와 계산 크기 불일치

**해결 방향:**
테스트 결과를 보고 가장 많이 실패하는 패턴을 찾아 공식을 수정합니다.
        `
      }
    }
  }
}
