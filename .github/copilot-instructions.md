# Cakeaway 프로젝트 GitHub Copilot 지침서

이 문서는 Cakeaway 프로젝트에서 작업하는 AI 코딩 에이전트를 위한 핵심 컨텍스트를 제공합니다.
**상세한 가이드라인, 워크플로우, 개발 계획은 반드시 `docs/onboarding.md`와 `docs/overview.md`를 참조하세요.**

## ⚠️ 중요한 제약 사항

- **절대 금지**: `logs/` 디렉토리의 파일을 읽거나 참조하지 마세요
- **필수 준수**: TypeScript v5 엄격 모드 사용 - `any` 타입 절대 금지
- **아키텍처 원칙**: 모노레포 구조 준수 - 패키지 간 관심사 혼합 금지
- **개발 철학**: Vibe Coding 원칙 - 복잡한 로직은 설명적 프롬프트 작성

## 핵심 프로젝트 컨텍스트

### 프로젝트 개요

**Cakeaway**는 현대적인 웹 기술로 구축된 혁신적인 케이크 공장 건설 시뮬레이션 게임입니다.
아이소메트릭 그래픽, 생산 라인 최적화, AI 기반 개발을 특징으로 하는 롤러코스터 타이쿤 스타일의 케이크 제조 게임입니다.

### 아키텍처 & 구조

```
@cakeaway (pnpm monorepo)
├── packages/
│   ├── app/                 # React v19 UI + Phaser.js v3.9 렌더링
│   └── simulation-engine/   # 순수 TypeScript v5 게임 로직
└── docs/                    # 프로젝트 문서
```

### 핵심 설계 결정 사항

1. **관심사 분리 (Separation of Concerns)**:

   - `@cakeaway/app`: UI 레이어 (React 컴포넌트, Phaser 씬, 사용자 상호작용)
   - `@cakeaway/simulation-engine`: 비즈니스 로직 (게임 상태, 생산 시스템, 계산)

2. **기술 스택 (2025.07 버전)**:

   - **TypeScript v5**: 엄격 모드, any 타입 금지
   - **React v19**: 최신 기능 및 훅
   - **Phaser.js v3.9**: 아이소메트릭 뷰 2D 렌더링
   - **Vite v7**: 빌드 도구 및 개발 서버
   - **pnpm**: 워크스페이스 패키지 관리
   - **vitest**: 테스팅 프레임워크

3. **개발 철학**:
   - **Vibe Coding**: AI가 자연어 프롬프트로 80-95% 코드 생성
   - **반복적 개발**: 매일 플레이 가능한 빌드를 목표로 하는 2주 MVP
   - **AI 우선 그래픽**: 모든 시각적 에셋에 Midjourney, Leonardo AI 사용

### 핵심 게임 시스템

1. **그리드 시스템 (Grid System)**: 아이소메트릭 타일 기반 공장 레이아웃
2. **생산 시스템 (Production System)**: 레시피 기반 케이크 제조
3. **물류 시스템 (Logistics System)**: 컨베이어 벨트 및 아이템 이동
4. **EIN/ECN 프로세스**: 엔지니어링 변경 관리 시뮬레이션
5. **시장 시스템 (Market System)**: 실시간 가격 변동 및 수요

### 공통 패턴

1. **상태 관리**:

   - React 훅으로 UI 상태 관리
   - simulation-engine에서 순수 함수 사용
   - 패키지 간 이벤트 기반 통신

2. **에러 처리**:

   - 항상 try-catch 블록 포함
   - 컨텍스트 정보와 함께 에러 로깅
   - 비중요 기능 실패 시 우아한 성능 저하

3. **성능**:

   - 비용이 많이 드는 컴포넌트에 React.memo 사용
   - Phaser 객체에 객체 풀링 구현
   - 시뮬레이션 틱 주기 최적화

4. **테스트**:
   - simulation-engine 로직 단위 테스트
   - React-Phaser 통신 통합 테스트
   - 핵심 게임 루프 E2E 테스트

## AI 코딩 가이드라인

### 효과적인 프롬프트 작성

- 작업 중인 패키지를 구체적으로 명시
- 필요시 Phaser.js v3.9 또는 React v19 문서 참조
- TypeScript 엄격 모드 준수 요청
- 에러 처리 및 로깅 포함 요청

### 코드 생성 모범 사례

- 완전하고 작동하는 코드 블록 생성
- 적절한 TypeScript 타입 및 인터페이스 포함
- 복잡한 함수에 JSDoc 주석 추가
- 기존 파일 구조 및 네이밍 컨벤션 준수

### 문서 참조 시점

- **빌드/테스트 문제**: `docs/onboarding.md` 확인
- **아키텍처 결정**: `docs/overview.md` 확인
- **게임 디자인 질문**: `docs/requirements.md` 확인
- **기술 구현**: 패키지별 README 파일 확인

**중요**: 이것은 AI가 대부분의 코드 생성을 담당하는 Vibe Coding 프로젝트이지만, 항상 아키텍처 원칙과 기술적 제약 사항을 준수해야 합니다.
