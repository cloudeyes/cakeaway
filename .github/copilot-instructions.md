# Cakeaway 프로젝트 GitHub Copilot 지침서

이 문서는 Cakeaway 프로젝트에서 작업하는 AI 코딩 에이전트를 위한 **핵심 컨텍스트**를 제공합니다.
**상세 가이드라인은 `docs/onboarding.md`, 아키텍처 정보는 `docs/overview.md`를 참조하세요.**

## ⚠️ 절대 준수 사항

- **금지**: `logs/` 디렉토리 파일 읽기/참조 절대 금지
- **TypeScript**: v5 엄격 모드 필수, `any` 타입 사용 금지
- **아키텍처**: 모노레포 구조 준수, 패키지 간 관심사 분리 엄격 준수
- **개발 방식**: Vibe Coding - GitHub Copilot 기반으로 80-95% 코드 생성
- **금지**: 임의로 React 프로젝트 생성 금지.
  - **항상 Vite React TypeScript 템플릿으로 프로젝트 생성**: `pnpm create vite@latest --template react-ts <패키지명>`
- **도구**: 2025년 7월 기준 최신 도구 사용
  - **Node.js**: v22 최신 LTS 버전 사용
  - **pnpm**: v10 최신 버전 사용
  - **Phaser.js**: v3.9 버전 사용

## 핵심 프로젝트 컨텍스트

### 프로젝트 개요

**Cakeaway**는 현대적인 웹 기술로 구축된 혁신적인 케이크 공장 건설 시뮬레이션 게임입니다.
아이소메트릭 그래픽, 생산 라인 최적화, AI 기반 개발을 특징으로 하는 롤러코스터 타이쿤 스타일의 케이크 제조 게임입니다.

### 아키텍처 & 구조

```
@cakeaway (pnpm monorepo)
├── packages/
│   ├── app/                 # React v19 UI + Phaser.js v3.9 렌더링
│   │   ├── src/
│   │   │   ├── components/  # React 컴포넌트
│   │   │   ├── phaser/      # Phaser.js 게임 씬
│   │   │   └── hooks/       # React 상태 관리
│   │   ├── vite.config.ts   # Vite 설정 (alias 포함)
│   │   └── tsconfig.json    # TypeScript 설정
│   └── simulation-engine/   # 순수 TypeScript v5 게임 로직
│       ├── src/
│       │   ├── grid.ts      # 그리드 시스템 (기본 구현 완료)
│       │   └── index.ts     # 패키지 내보내기
│       └── tsconfig.json    # TypeScript 설정 (composite: true)
├── pnpm-workspace.yaml      # pnpm 워크스페이스 설정
├── tsconfig.json            # 루트 TypeScript 설정 (Project References)
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

   - **Vibe Coding**: GitHub Copilot 기반으로 80-95% 코드 생성
   - **반복적 개발**: 매일 플레이 가능한 빌드를 목표로 하는 2주 MVP
   - **AI 우선 그래픽**: 모든 시각적 에셋에 Midjourney, Leonardo AI 사용
   - **워크스페이스 에이전트**: 멀티 파일 편집 및 프로젝트 전체 컨텍스트 활용

4. **TypeScript Project References 활용**:
   - **증분 컴파일**: `tsc --build`로 변경된 파일만 컴파일
   - **타입 안전성**: 패키지 간 타입 체크 및 인텔리센스 지원
   - **개발 경험**: 빌드 없이 실시간 타입 체크 및 자동 완성
   - **Vite Alias**: simulation-engine을 TypeScript 소스로 직접 참조

### 핵심 게임 시스템

1. **그리드 시스템 (Grid System)**: 아이소메트릭 타일 기반 공장 레이아웃 (기본 구현 완료)
2. **생산 시스템 (Production System)**: 레시피 기반 케이크 제조
3. **물류 시스템 (Logistics System)**: 컨베이어 벨트 및 아이템 이동
4. **EIN/ECN 프로세스**: 엔지니어링 변경 관리 시뮬레이션
5. **시장 시스템 (Market System)**: 실시간 가격 변동 및 수요

## 핵심 개발 패턴

### 필수 코드 패턴

1. **에러 처리**: 모든 함수에 try-catch 블록 필수
2. **로깅**: 디버깅을 위한 적절한 콘솔 로그 포함
3. **타입 안전성**: 모든 함수 매개변수와 반환값에 명시적 타입 지정
4. **성능 최적화**: React v19 Compiler 활용, React.memo, useMemo, 객체 풀링 적용

### pnpm 워크스페이스 명령어

1. **개발 서버**: `pnpm dev` (app 패키지 실행)
2. **빌드**: `pnpm build` (증분 컴파일)
3. **타입 체크**: `pnpm type-check` (전체 프로젝트)
4. **와치 모드**: `pnpm build:watch` (파일 변경 감지)

### GitHub Copilot 2025 활용 지침

1. **워크스페이스 에이전트 활용**: `@workspace` 태그로 프로젝트 전체 컨텍스트 활용
2. **멀티 파일 편집**: 여러 파일을 동시에 수정하는 복잡한 작업 처리
3. **구체적 프롬프트**: 작업 패키지, 기술 스택 버전, 에러 처리 요구사항 명시
4. **문서 참조**: Phaser.js v3.9, React v19 공식 문서 참조
5. **완전한 코드**: 부분 코드가 아닌 실행 가능한 완전한 구현 생성
6. **테스트 고려**: 생성된 코드에 대한 테스트 케이스 포함

## 문서 참조 가이드

- **개발 환경 설정**: `docs/onboarding.md` 참조
- **전체 아키텍처**: `docs/overview.md` 참조
- **프로젝트 요구사항**: `docs/requirements.md` 참조
- **게임 기획 및 시스템**: `docs/game-design.md` 참조
- **AI 도구 활용법**: `docs/ai-tools-guide.md` 참조
- **개발 일정**: `docs/schedule.md` 참조
- **핵심 비즈니스 컨텍스트**: `docs/core-context.md` 참조
- **빌드/테스트 문제**: `docs/onboarding.md` 참조

**중요**: 이 프로젝트는 GitHub Copilot이 대부분의 코드를 생성하는 Vibe Coding 방식으로 개발되지만,
항상 아키텍처 원칙과 타입 안전성을 준수해야 합니다.
