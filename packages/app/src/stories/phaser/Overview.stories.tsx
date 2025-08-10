import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

const OverviewComponent: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Phaser.js 학습 가이드</h1>
      <p className="text-gray-600 mb-6">
        왼쪽 사이드바에서 각 예제를 선택하여 단계별로 학습하세요.
      </p>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">1. Basic 2D Tiles</h3>
          <p className="text-blue-600 text-sm">기본 2D 좌표계와 타일 시스템</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-800">2. Isometric Tiles</h3>
          <p className="text-purple-600 text-sm">아이소메트릭 좌표계와 다이아몬드 타일</p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800">3. Coordinate Comparison</h3>
          <p className="text-green-600 text-sm">2D vs 아이소메트릭 비교 분석</p>
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof OverviewComponent> = {
  title: 'Phaser.js Learning/Overview',
  component: OverviewComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Phaser.js 아이소메트릭 좌표 변환 학습 가이드

이 섹션은 **Cakeaway 프로젝트**에서 발생한 아이소메트릭 좌표 변환 문제를 해결하기 위해 만들어진 학습 자료입니다.

## 🎯 학습 목표

현재 Cakeaway 프로젝트의 MainScene에서 마우스 호버 시 아이소메트릭 타일의 위치가 부정확하게 대응되는 문제를 이해하고 해결합니다.

## 📚 학습 순서

### 1. [Basic 2D Tiles](/?path=/docs/phaser-js-learning-basic-2d-tiles--docs)
- Phaser.js의 기본 2D 좌표 시스템 이해
- 간단한 마우스 호버 및 클릭 이벤트 처리
- 화면 좌표 → 그리드 좌표 변환의 기초

### 2. [Isometric Tiles](/?path=/docs/phaser-js-learning-isometric-tiles--docs)
- 아이소메트릭 좌표계의 이해
- 다이아몬드 모양 타일에서의 정확한 히트 테스트
- 2D ↔ 아이소메트릭 좌표 변환 공식

### 3. [Coordinate Comparison](/?path=/docs/phaser-js-learning-coordinate-comparison--docs)
- 2D와 아이소메트릭의 직접 비교
- 동일한 마우스 위치에서 다른 결과가 나오는 이유
- 각 좌표계의 장단점 분석

### 4. [Coordinate Test](/?path=/docs/phaser-js-learning-isometric-coordinate-test--docs)
- 좌표 변환 정확도 검증 도구
- 실제 오프셋 계산 vs 이론적 계산 비교
- 다양한 테스트 케이스로 검증

### 5. [Coordinate Analysis](/?path=/docs/phaser-coordinate-analysis--docs)
- **+1 보정이 필요한 이유 수학적 분석**
- 좌표계 원점과 렌더링 시작점 불일치 문제
- 부동소수점 반올림 오차 및 해결책

### 6. [Root Cause Analysis](/?path=/docs/phaser-root-cause-analysis--docs)
- **근본 원인 심층 분석**
- 타일 렌더링 위치 vs 수학적 변환 기준점 차이
- 체계적 오프셋 패턴 감지 및 해결 방향

## 🔧 현재 문제 분석

**Cakeaway MainScene의 문제점:**
1. **부정확한 좌표 변환**: 마우스 위치를 그리드 좌표로 변환할 때 오차 발생
2. **히트 테스트 문제**: 직사각형 히트박스를 사용하여 다이아몬드 타일에서 부정확한 감지
3. **오프셋 계산 오류**: 타일 배치와 마우스 좌표 간의 오프셋 불일치

## 🚀 해결 방향

이 학습 자료를 통해:
1. **올바른 좌표 변환 공식** 이해
2. **정확한 히트 테스트 방법** 학습
3. **실제 적용 가능한 코드 패턴** 습득

## 💡 핵심 개념

### 좌표 변환 공식
\`\`\`typescript
// Grid → Isometric
isoX = (gridX - gridY) × (tileWidth / 2)
isoY = (gridX + gridY) × (tileHeight / 2)

// Isometric → Grid
gridX = (isoX / (tileWidth/2) + isoY / (tileHeight/2)) / 2
gridY = (isoY / (tileHeight/2) - isoX / (tileWidth/2)) / 2
\`\`\`

### 다이아몬드 히트 테스트
\`\`\`typescript
// 맨하탄 거리를 이용한 다이아몬드 내부 판정
const normalizedX = Math.abs(relativeX) / (tileWidth / 2)
const normalizedY = Math.abs(relativeY) / (tileHeight / 2)
return (normalizedX + normalizedY) <= 1.0
\`\`\`

---

**💻 각 예제를 직접 실행해보면서 마우스 좌표와 계산 결과를 비교해보세요!**
        `
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof OverviewComponent>

export const LearningGuide: Story = {
  name: '학습 가이드',
}
