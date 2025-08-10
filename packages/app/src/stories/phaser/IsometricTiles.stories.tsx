import type { Meta, StoryObj } from '@storybook/react-vite'
import { IsometricTiles } from './IsometricTiles'

const meta: Meta<typeof IsometricTiles> = {
  title: 'Phaser.js Learning/Isometric Tiles',
  component: IsometricTiles,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**아이소메트릭 타일 그리드 시스템**

이 예제는 Phaser.js에서 아이소메트릭(등각투상) 좌표 시스템을 구현하는 방법을 보여줍니다.

**주요 학습 내용:**
- 다이아몬드 모양 아이소메트릭 타일 생성
- 2D 그리드 좌표 ↔ 아이소메트릭 화면 좌표 변환
- 다이아몬드 모양에서의 정확한 히트 테스트
- 아이소메트릭 좌표계의 시각적 이해

**핵심 변환 공식:**

**Grid → Isometric:**
\`\`\`
isoX = (gridX - gridY) × (tileWidth / 2)
isoY = (gridX + gridY) × (tileHeight / 2)
\`\`\`

**Isometric → Grid:**
\`\`\`
gridX = (isoX / (tileWidth/2) + isoY / (tileHeight/2)) / 2
gridY = (isoY / (tileHeight/2) - isoX / (tileWidth/2)) / 2
\`\`\`

**다이아몬드 히트 테스트:**
맨하탄 거리를 이용한 다이아몬드 내부 판정
        `
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof IsometricTiles>

export const Default: Story = {
  name: '아이소메트릭 타일 시스템',
  parameters: {
    docs: {
      description: {
        story: '다이아몬드 모양의 아이소메트릭 타일들로 구성된 그리드입니다. 정확한 좌표 변환과 히트 테스트를 확인할 수 있습니다.'
      }
    }
  }
}

export const CoordinateSystem: Story = {
  name: '좌표계 원리',
  parameters: {
    docs: {
      description: {
        story: `
**아이소메트릭 좌표계의 특징:**

1. **회전된 좌표계**: 기본 2D 그리드를 45도 회전하고 수직으로 압축
2. **다이아몬드 모양**: 정사각형이 다이아몬드로 변환됨
3. **복잡한 히트 테스트**: 직사각형이 아닌 다이아몬드 영역에서의 마우스 감지

**구현 핵심:**

\`\`\`typescript
// 다이아몬드 모양 생성
const points = [
  0, -TILE_HEIGHT / 2,     // 상단
  TILE_WIDTH / 2, 0,       // 우측
  0, TILE_HEIGHT / 2,      // 하단
  -TILE_WIDTH / 2, 0       // 좌측
]

// 다이아몬드 내부 판정
private isPointInDiamond(mouseX: number, mouseY: number, tile: Phaser.GameObjects.Polygon): boolean {
  const centerX = tile.getData('screenX')
  const centerY = tile.getData('screenY')

  const relativeX = mouseX - centerX
  const relativeY = mouseY - centerY

  const normalizedX = Math.abs(relativeX) / (TILE_WIDTH / 2)
  const normalizedY = Math.abs(relativeY) / (TILE_HEIGHT / 2)

  return (normalizedX + normalizedY) <= 1.0
}
\`\`\`
        `
      }
    }
  }
}

export const CommonIssues: Story = {
  name: '일반적인 문제들',
  parameters: {
    docs: {
      description: {
        story: `
**아이소메트릭 구현 시 흔한 문제들:**

1. **부정확한 좌표 변환**
   - 공식 실수로 인한 잘못된 타일 선택
   - 해결: 정확한 수학 공식 사용 및 테스트

2. **히트 테스트 오류**
   - 직사각형 히트박스로 인한 부정확한 감지
   - 해결: 다이아몬드 모양에 맞는 히트 테스트 구현

3. **타일 정렬 문제**
   - 타일들이 제대로 정렬되지 않는 현상
   - 해결: 오프셋과 타일 크기 정확히 계산

4. **성능 최적화**
   - 실시간 좌표 변환으로 인한 성능 저하
   - 해결: 캐싱, 영역 제한, 최적화된 알고리즘 사용

**디버깅 팁:**
- 빨간 점: 마우스 위치
- 초록 점: 계산된 타일 중심
- 좌표 정보를 실시간으로 확인
        `
      }
    }
  }
}
