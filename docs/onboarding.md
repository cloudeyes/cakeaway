# Cakeaway 프로젝트 온보딩 가이드

## 프로젝트 소개

**Cakeaway**는 AI 기반 Vibe Coding을 활용하여 개발되는 혁신적인 케이크 공장 시뮬레이션 게임입니다. 이 문서는 개발자가 프로젝트에 참여하기 위해 알아야 할 모든 정보를 담고 있습니다.

## 빠른 시작 가이드

### 1. 개발 환경 요구사항

#### 필수 소프트웨어
- **Node.js**: v22 이상 (LTS 권장)
- **pnpm**: v10 이상 (패키지 매니저)
- **Git**: 최신 버전
- **현대적인 브라우저**: Chrome, Firefox, Safari 등

#### 권장 개발 도구
- **GitHub Copilot**: AI 기반 코드 생성 (메인 개발 도구)
- **VSCode**: GitHub Copilot 확장과 함께 사용
- **Cursor**: 대체 AI 도구 (선택사항)
- **TypeScript**: v5 이상 (자동 설치됨)

### 2. 프로젝트 클론 및 설정

```bash
# 프로젝트 클론
git clone https://github.com/your-org/cakeaway.git
cd cakeaway

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

### 3. 모노레포 구조 이해

```
cakeaway/
├── packages/
│   ├── app/                    # React + Phaser.js 프론트엔드
│   │   ├── src/
│   │   │   ├── components/     # React 컴포넌트
│   │   │   ├── phaser/        # Phaser.js 게임 씬
│   │   │   ├── hooks/         # React 훅
│   │   │   └── types/         # TypeScript 타입 정의
│   │   ├── public/            # 정적 에셋
│   │   ├── vite.config.ts     # Vite 설정 (alias 포함)
│   │   ├── tsconfig.json      # TypeScript 설정
│   │   └── package.json
│   └── simulation-engine/      # 순수 TypeScript 시뮬레이션 엔진
│       ├── src/
│       │   ├── grid.ts        # 그리드 시스템 (기본 구현 완료)
│       │   └── index.ts       # 패키지 내보내기
│       ├── dist/              # 컴파일된 파일
│       ├── tsconfig.json      # TypeScript 설정 (composite: true)
│       └── package.json
├── docs/                      # 프로젝트 문서
├── .github/                   # GitHub 설정 및 Copilot 지침
│   └── copilot-instructions.md
├── pnpm-workspace.yaml        # pnpm 워크스페이스 설정
├── tsconfig.json             # 루트 TypeScript 설정 (Project References)
└── package.json              # 루트 패키지 설정
```

### 4. 개발 명령어

```bash
# 개발 서버 시작 (app 패키지)
pnpm dev

# TypeScript 빌드 (증분 컴파일)
pnpm build

# 타입 체크 (전체 프로젝트)
pnpm type-check

# 와치 모드로 빌드
pnpm build:watch

# 빌드 정리
pnpm clean

# 특정 패키지 명령어
pnpm --filter @cakeaway/app dev
pnpm --filter @cakeaway/simulation-engine build
```

## Vibe Coding 워크플로우

### Vibe Coding이란?

Vibe Coding은 자연어 프롬프트를 통해 AI가 코드의 대부분을 생성하는 개발 방식입니다. 이 프로젝트에서는 80-95%의 코드가 AI에 의해 생성됩니다.

### 주요 AI 도구 설정

#### 1. GitHub Copilot 설정 (메인 도구)

```bash
# VSCode에서 GitHub Copilot 확장 설치
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat
```

**GitHub Copilot 설정 단계:**
1. VSCode에서 GitHub 계정 연결
2. GitHub Copilot Pro 구독 활성화
3. 프로젝트 루트에서 `.github/copilot-instructions.md` 파일 확인
4. 키바인딩 설정:
   - `Cmd + I`: 인라인 채팅 및 코드 생성
   - `Cmd + Shift + I`: 사이드바 채팅 패널
   - `Tab`: 제안 수락

#### 2. Cursor 설정 (대체 도구, 선택사항)

```bash
# Cursor 설치 (macOS)
brew install --cask cursor

# 또는 공식 사이트에서 다운로드
# https://cursor.sh/
```

**Cursor 설정 단계:**
1. Cursor 실행 후 OpenAI API 키 또는 Claude 모델 연결
2. 프로젝트 루트에서 `.cursor/rules` 파일 확인
3. 키바인딩 설정:
   - `Cmd + K`: 코드 생성
   - `Cmd + L`: 채팅 모드
   - `Cmd + I`: 인라인 편집

### 효과적인 프롬프트 작성법

#### 좋은 프롬프트 예시 (GitHub Copilot 2025)
```
"@workspace Phaser.js v3.9를 사용하여 아이소메트릭 타일맵을 렌더링하는 코드를 생성하세요.
- TypeScript 엄격 모드를 준수하고
- 2D 그리드 좌표를 아이소메트릭 좌표로 변환하는 함수 포함
- 타일 깊이 정렬 구현
- 에러 처리 및 디버그 로그 추가
- React v19 상태 관리와 연동"
```

#### 피해야 할 프롬프트
```
"게임 만들어줘"  # 너무 모호함
"버그 고쳐줘"    # 구체적인 정보 부족
```

## 개발 워크플로우

### 일반적인 개발 사이클

1. **요구사항 분석** (30분)
   - 구현할 기능 명확히 정의
   - 관련 파일 및 시스템 파악

2. **AI 코드 생성** (1시간)
   - GitHub Copilot 워크스페이스 에이전트로 기본 구조 생성
   - 구체적인 프롬프트로 세부 구현

3. **테스트 및 디버깅** (1시간)
   - 생성된 코드 실행 테스트
   - 버그 발견 시 GitHub Copilot에게 로그 공유하여 수정

4. **통합 및 최적화** (30분)
   - 기존 코드와 통합
   - 성능 최적화 및 코드 정리

### 브랜치 전략

```bash
# 기본 브랜치 구조
main                    # 안정적인 배포 버전
├── develop            # 개발 통합 브랜치
├── feature/ui-system  # UI 관련 기능 개발
├── feature/simulation # 시뮬레이션 로직 개발
└── hotfix/bug-fix     # 긴급 버그 수정
```

### 커밋 컨벤션

```bash
# 커밋 메시지 형식
type(scope): description

# 예시
feat(simulation): Add production system with recipe management
fix(ui): Fix React state synchronization with Phaser
docs(onboarding): Update development workflow guide
```

## 코딩 컨벤션

### TypeScript 스타일 가이드

#### 네이밍 컨벤션
- **클래스**: PascalCase (`GameEngine`, `ProductionFacility`)
- **함수/변수**: camelCase (`calculateProduction`, `gameState`)
- **상수**: UPPER_SNAKE_CASE (`MAX_PRODUCTION_RATE`)
- **인터페이스**: `I` 접두사 (`IGameObject`, `IProductionSystem`)

#### 코드 예시
```typescript
// 좋은 예시
interface IProductionFacility {
  readonly id: string;
  readonly type: FacilityType;
  productionRate: number;
  isActive: boolean;
}

class OvenFacility implements IProductionFacility {
  constructor(
    public readonly id: string,
    public readonly type: FacilityType.OVEN,
    public productionRate: number = 1.0
  ) {}

  public startProduction(): void {
    // 구현
  }
}
```

### React 컴포넌트 가이드

#### 컴포넌트 구조
```typescript
// 좋은 예시
interface GameCanvasProps {
  width: number;
  height: number;
  onGameStateChange: (state: GameState) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  width,
  height,
  onGameStateChange,
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Phaser 게임 초기화
  }, []);

  return <div id="game-canvas" />;
};
```

## 테스트 전략

### 단위 테스트 (vitest)

```bash
# 테스트 실행
pnpm test

# 특정 패키지 테스트
pnpm --filter @cakeaway/simulation-engine test

# 테스트 커버리지
pnpm test:coverage
```

#### 테스트 작성 예시
```typescript
import { describe, it, expect } from 'vitest';
import { ProductionSystem } from '../src/systems/production';

describe('ProductionSystem', () => {
  it('should produce items at correct rate', () => {
    const system = new ProductionSystem();
    const facility = createMockFacility();

    system.addFacility(facility);
    system.update(1000); // 1초 업데이트

    expect(facility.inventory.length).toBe(1);
  });
});
```

### 통합 테스트

```typescript
// React-Phaser 통합 테스트
import { render, screen } from '@testing-library/react';
import { GameCanvas } from '../src/components/GameCanvas';

describe('GameCanvas Integration', () => {
  it('should initialize Phaser game correctly', () => {
    render(<GameCanvas width={800} height={600} />);

    // Phaser 게임 인스턴스 확인
    expect(screen.getByTestId('game-canvas')).toBeInTheDocument();
  });
});
```

## 디버깅 및 문제 해결

### 일반적인 문제 해결

#### 1. Phaser.js 관련 이슈
```typescript
// 디버그 로그 추가
console.log('Phaser game state:', game.scene.getScenes());
console.log('Texture cache:', game.textures.list);
```

#### 2. React 상태 동기화 이슈
```typescript
// React DevTools 활용
// 상태 변경 로그
useEffect(() => {
  console.log('Game state changed:', gameState);
}, [gameState]);
```

#### 3. TypeScript 타입 오류
```typescript
// 타입 가드 함수 사용
function isProductionFacility(obj: any): obj is IProductionFacility {
  return obj && typeof obj.productionRate === 'number';
}
```

### AI 디버깅 워크플로우

1. **에러 로그 수집**: 콘솔 에러 및 스택 트레이스 복사
2. **Cursor 채팅 모드**: 에러 로그를 AI에게 공유
3. **프롬프트 예시**:
   ```
   "다음 에러가 발생했습니다. 원인을 분석하고 수정 코드를 제안해주세요:

   [에러 로그 붙여넣기]

   관련 파일: src/systems/production.ts"
   ```

## 성능 최적화

### Phaser.js 최적화 팁

```typescript
// 오브젝트 풀링 사용
class GameObjectPool {
  private static instance: GameObjectPool;
  private pools: Map<string, GameObject[]> = new Map();

  getObject(type: string): GameObject {
    const pool = this.pools.get(type) || [];
    return pool.pop() || this.createObject(type);
  }

  returnObject(type: string, obj: GameObject): void {
    const pool = this.pools.get(type) || [];
    pool.push(obj);
    this.pools.set(type, pool);
  }
}
```

### React 최적화 팁

```typescript
// React.memo 사용
const GameUI = React.memo(({ gameState }: { gameState: GameState }) => {
  return (
    <div>
      <ProductionPanel production={gameState.production} />
      <InventoryPanel inventory={gameState.inventory} />
    </div>
  );
});

// useMemo 최적화
const expensiveCalculation = useMemo(() => {
  return calculateOptimalProduction(gameState);
}, [gameState.facilities, gameState.resources]);
```

## 배포 가이드

### 로컬 빌드

```bash
# 프로덕션 빌드
pnpm build

# 빌드 프리뷰
pnpm preview
```

### 배포 환경

#### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

#### Netlify 배포
```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 배포
netlify deploy --prod --dir=dist
```

## 문서화 가이드

### 코드 문서화

```typescript
/**
 * 생산 시설의 생산 속도를 계산합니다.
 * @param facility - 생산 시설 객체
 * @param efficiency - 효율성 계수 (0.0 ~ 1.0)
 * @returns 초당 생산량
 */
export function calculateProductionRate(
  facility: IProductionFacility,
  efficiency: number = 1.0
): number {
  return facility.baseProductionRate * efficiency;
}
```

### README 업데이트

각 패키지의 README.md는 다음 구조를 따릅니다:
- 패키지 설명
- 설치 방법
- 사용 예시
- API 문서 링크

## 팀 협업 가이드

### 코드 리뷰 프로세스

1. **AI 생성 코드 검토**: 생성된 코드의 품질 및 의도 확인
2. **타입 안전성 검사**: TypeScript 타입 정의 적절성 확인
3. **성능 영향 분석**: 추가된 코드의 성능 영향 평가
4. **테스트 커버리지**: 새로운 코드에 대한 테스트 작성 확인

### 커뮤니케이션 채널

- **GitHub Issues**: 버그 리포트 및 기능 요청
- **GitHub Discussions**: 아키텍처 논의 및 아이디어 공유
- **PR Comments**: 코드 리뷰 및 구체적인 피드백

## 추가 리소스

### 학습 자료

- **Phaser.js 공식 문서**: https://phaser.io/learn
- **React v19 문서**: https://react.dev/
- **TypeScript 핸드북**: https://www.typescriptlang.org/docs/
- **pnpm 워크스페이스**: https://pnpm.io/workspaces

### AI 도구 활용 가이드

- **Cursor 공식 문서**: https://cursor.sh/docs
- **GitHub Copilot 가이드**: https://github.com/features/copilot
- **프롬프트 엔지니어링 가이드**: 내부 문서 참조

## 문제 해결 및 지원

### 자주 발생하는 문제

1. **pnpm 의존성 문제**: `pnpm install --force` 실행
2. **TypeScript 컴파일 오류**: `pnpm --filter [package] build` 개별 확인
3. **Phaser.js 로딩 문제**: 브라우저 개발자 도구 네트워크 탭 확인

### 지원 요청

문제가 해결되지 않을 경우:
1. GitHub Issues에 상세한 정보와 함께 이슈 생성
2. 에러 로그, 환경 정보, 재현 단계 포함
3. AI 도구 사용 시 관련 프롬프트도 함께 공유

이 온보딩 가이드를 통해 프로젝트에 빠르게 적응하고, Vibe Coding의 혁신적인 개발 방식을 경험해보세요!
