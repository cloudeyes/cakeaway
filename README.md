# 🍰 Cakeaway

> 🎮 **AI 기반 케이크 공장 시뮬레이션 게임**
> 최첨단 웹 기술로 구축되고 Vibe Coding 방법론으로 개발됨

Cakeaway는 롤러코스터 타이쿤의 전략적 깊이와 현대 웹 기술을 결합한 혁신적인 **케이크 공장 건설 시뮬레이션 게임**입니다. 플레이어는 아이소메트릭 화면에서 복잡한 생산 라인을 설계하고 최적화하며, 레시피를 관리하고, EIN/ECN 프로세스를 구현하며, 동적인 시장 조건에 적응합니다.y

[![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-v19-61dafb.svg)](https://reactjs.org/)
[![Phaser.js](https://img.shields.io/badge/Phaser.js-v3.9-orange.svg)](https://phaser.io/)
[![Vite](https://img.shields.io/badge/Vite-v7-646cff.svg)](https://vitejs.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-yellow.svg)](https://pnpm.io/)

## ✨ 주요 기능

### 🏭 **공장 시뮬레이션**
- **아이소메트릭 2.5D 그래픽**: 직관적인 3D 느낌의 공장 레이아웃을 2D 렌더링으로 구현
- **생산 라인 관리**: 복잡한 케이크 제조 프로세스 설계
- **레시피 시스템**: 맞춤형 제조 단계를 통한 다양한 케이크 타입 연구 개발
- **EIN/ECN 프로세스**: 생산 최적화를 위한 엔지니어링 변경 관리

### 📊 **전략적 게임플레이**
- **시장 역학**: 실시간 가격 변동 및 수요 예측
- **자원 관리**: 시장 동향 기반 전략적 원자재 조달
- **설비 최적화**: 장비 스케줄링 및 디스패치 최적화
- **품질 관리**: 전체 배포 전 제한된 생산에서 레시피 테스트

### 🤖 **AI 기반 개발**
- **Vibe Coding**: 자연어 프롬프트를 통해 80-95%의 코드 생성
- **AI 생성 그래픽**: Midjourney, Leonardo AI를 사용한 완전한 비주얼 에셋 제작
- **AI 기반 사운드**: Suno AI, ElevenLabs로 생성된 배경 음악 및 효과음
- **빠른 프로토타이핑**: 가속화된 개발을 위한 Tower of Time 방법론

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js** v22+ (LTS 권장)
- **pnpm** v10+ (패키지 매니저)
- **최신 브라우저** (Chrome, Firefox, Safari)

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-org/cakeaway.git
cd cakeaway

# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev
```

### 첫 실행

```bash
# 모든 패키지를 개발 모드로 실행
pnpm dev

# 특정 패키지 실행
pnpm --filter @cakeaway/app dev
pnpm --filter @cakeaway/simulation-engine dev

# 테스트 실행
pnpm test

# 프로덕션 빌드
pnpm build
```

## 🏗️ 아키텍처

### 모노레포 구조

```
cakeaway/
├── packages/
│   ├── app/                    # 🎨 React v19 + Phaser.js 프론트엔드
│   │   ├── src/
│   │   │   ├── components/     # React UI 컴포넌트
│   │   │   ├── phaser/        # Phaser.js 게임 씬
│   │   │   ├── hooks/         # React 상태 관리
│   │   │   └── types/         # TypeScript 정의
│   │   └── public/            # 정적 에셋
│   │
│   └── simulation-engine/      # ⚙️ 순수 TypeScript 게임 로직
│       ├── src/
│       │   ├── core/          # 핵심 게임 객체 (Grid, Tile, GameObject)
│       │   ├── systems/       # 생산 및 물류 시스템
│       │   ├── utils/         # 유틸리티 함수
│       │   └── types/         # 타입 정의
│       └── tests/             # 단위 테스트
│
├── docs/                      # 📚 프로젝트 문서
│   ├── overview.md            # 프로젝트 비전 및 아키텍처
│   ├── onboarding.md          # 개발자 설정 가이드
│   └── requirements.md        # 원본 요구사항 분석
│
├── .cursor/                   # 🤖 AI 코딩 설정
└── .github/                   # GitHub 워크플로우 및 템플릿
```

### 기술 스택

| 카테고리 | 기술 | 버전 | 목적 |
|----------|------|------|------|
| **언어** | TypeScript | v5 | 엄격한 타입 시스템, 최신 JavaScript |
| **프론트엔드** | React | v19 | UI 컴포넌트, 상태 관리 |
| **게임 엔진** | Phaser.js | v3.9 | 2D 렌더링, 아이소메트릭 그래픽 |
| **빌드 도구** | Vite | v7 | 빠른 개발, 최적화된 빌드 |
| **패키지 매니저** | pnpm | v8+ | 워크스페이스 관리, 빠른 설치 |
| **테스팅** | vitest | 최신 | 단위 테스트, 통합 테스트 |

## 🎯 게임 시스템

### 핵심 게임플레이 루프

1. **🏭 공장 계획**: 아이소메트릭 그리드에서 최적의 설비 레이아웃 설계
2. **📋 레시피 관리**: 케이크 제조 프로세스 개발 및 테스트
3. **🚚 물류 설정**: 효율적인 자재 흐름을 위한 컨베이어 시스템 구축
4. **📈 시장 분석**: 가격 동향 모니터링 및 생산량 조정
5. **🔧 프로세스 최적화**: 지속적인 개선을 위한 EIN/ECN 변경 구현

### 주요 시스템

```typescript
// 생산 시스템
interface IProductionFacility {
  id: string;
  type: FacilityType;
  recipe: Recipe;
  efficiency: number;
  status: ProductionStatus;
}

// 물류 시스템
interface IConveyorSystem {
  path: GridCoordinate[];
  speed: number;
  capacity: number;
  items: Item[];
}

// 시장 시스템
interface IMarketData {
  materialPrices: Record<MaterialType, number>;
  productDemand: Record<CakeType, number>;
  trends: MarketTrend[];
}
```

## 🤖 Vibe Coding 워크플로우

### AI 기반 개발

이 프로젝트는 AI가 자연어 프롬프트를 통해 대부분의 코드를 생성하는 **Vibe Coding** 방법론을 활용합니다:

```bash
# AI 개발 환경 설정
brew install --cask cursor                    # 메인 AI 코딩 도구
code --install-extension GitHub.copilot       # 보조 AI 어시스턴트
```

### 개발 워크플로우

1. **🎯 요구사항 정의**: 명확하고 구체적인 프롬프트 작성
2. **🤖 코드 생성**: Cursor Agent 모드로 대량 코드 생성
3. **🔧 정제 및 테스트**: AI 피드백과 디버깅으로 반복 개선
4. **✅ 통합**: AI 생성 코드를 기존 시스템과 통합

### AI 프롬프트 예시

```
"아이소메트릭 타일 렌더러를 Phaser.js v3.9로 생성하세요:
- 2D 그리드 좌표를 아이소메트릭 디스플레이로 변환
- 적절한 z-ordering을 위한 깊이 정렬 처리
- 스프라이트 기반 타일 렌더링 지원
- TypeScript 엄격 모드 준수 포함"
```

## 🎨 비주얼 스타일

### 아트 디렉션

- **🎨 아이소메트릭 2.5D**: 깔끔하고 현대적인 산업 미학
- **🎨 색상 팔레트**: 따뜻한 케이크 색상 (베이지, 브라운) + 차가운 기계 색상 (블루, 그레이)
- **🎨 스타일**: 미묘한 그라데이션과 그림자가 있는 픽셀 퍼펙트 스프라이트

### AI 생성 에셋

모든 비주얼 에셋은 AI 도구를 사용하여 제작됩니다:

- **컨셉 아트**: 스타일 가이드 및 영감을 위한 Midjourney
- **스프라이트**: 게임 오브젝트 및 설비를 위한 Leonardo AI
- **애니메이션**: 캐릭터 움직임을 위한 AI 스프라이트 시트 생성기
- **UI 요소**: 상업적으로 안전한 인터페이스 그래픽을 위한 Adobe Firefly

## 🚀 개발 로드맵

### 📅 2주 MVP 타임라인

| 주차 | 일정 | 중점 사항 | 결과물 |
|------|------|-----------|---------|
| **1주차** | 1-2일 | 프로젝트 설정 + Phaser 통합 | 작동하는 모노레포, 기본 렌더링 |
| | 3-4일 | 아이소메트릭 렌더링 + AI 그래픽 | 에셋이 적용된 시각적 게임 월드 |
| | 5일 | 마우스 상호작용 + 설비 배치 | 인터랙티브 공장 건설 |
| **2주차** | 6-7일 | 생산 시스템 + 컨베이어 로직 | 작동하는 생산 라인 |
| | 8-9일 | React UI + 상태 동기화 | 완성된 게임 인터페이스 |
| | 10일 | 폴리싱 + 배포 | 배포 가능한 MVP |

### 🎯 MVP 이후 기능

- **🔬 고급 레시피 시스템**: 복잡한 다단계 케이크 제조
- **📊 시장 경제**: 동적 가격 책정 및 수요 예측
- **👥 멀티플레이어 모드**: 협동 공장 관리
- **📱 모바일 최적화**: 터치 친화적 인터페이스 적응

## 🧪 테스트 전략

### 테스트 커버리지

```bash
# 모든 테스트 실행
pnpm test

# 특정 패키지 테스트
pnpm --filter @cakeaway/simulation-engine test
pnpm --filter @cakeaway/app test

# 커버리지 리포트 생성
pnpm test:coverage
```

### 테스트 철학

- **🔧 단위 테스트**: 핵심 시뮬레이션 로직 (생산, 물류)
- **🔗 통합 테스트**: React-Phaser 통신
- **🎮 E2E 테스트**: 완전한 게임플레이 시나리오
- **🤖 AI 지원 테스트**: 상세한 프롬프트를 통한 자동화된 테스트 생성

## 📈 성능 최적화

### 렌더링 성능

```typescript
// Phaser.js 최적화
- 게임 엔티티를 위한 오브젝트 풀링
- 스프라이트 효율성을 위한 텍스처 아틀라스
- 화면 밖 오브젝트를 위한 렌더 컬링
- 효율적인 좌표 변환

// React 최적화
- 비용이 많이 드는 컴포넌트를 위한 React.memo
- 무거운 계산을 위한 useMemo
- 큰 목록을 위한 가상화
- 상태 관리 최적화
```

### 빌드 최적화

```bash
# 최적화된 프로덕션 빌드
pnpm build

# 번들 분석
pnpm build:analyze

# 성능 프로파일링
pnpm build:profile
```

## 🚀 배포

### 지원 플랫폼

| 플랫폼 | 방법 | 명령어 |
|--------|------|--------|
| **웹** | Vercel/Netlify | `vercel --prod` |
| **데스크톱** | Electron | `pnpm build:electron` |
| **모바일** | Capacitor | `pnpm build:mobile` |

### 환경 설정

```bash
# 개발 환경
cp .env.example .env.local

# 프로덕션 환경
cp .env.example .env.production
```

## 🤝 기여하기

### 개발 환경 설정

1. **📖 문서 읽기**: [`docs/onboarding.md`](docs/onboarding.md)부터 시작
2. **🔧 환경 설정**: Cursor, pnpm, 의존성 설치
3. **🎯 이슈 선택**: GitHub Issues에서 초보자용 이슈 확인
4. **🤖 AI 도구 사용**: 빠른 개발을 위한 Vibe Coding 활용

### 코딩 표준

- **📝 TypeScript**: 엄격 모드, `any` 타입 금지
- **🎨 포맷팅**: 프로젝트 설정과 함께 Prettier 사용
- **🔍 린팅**: 커스텀 규칙과 함께 ESLint 사용
- **✅ 테스팅**: 모든 새로운 기능에 대해 vitest 사용

### Pull Request 프로세스

1. **🌿 기능 브랜치 생성**: `git checkout -b feature/amazing-feature`
2. **🤖 코드 생성**: 프로젝트 가이드라인을 따라 AI 도구 사용
3. **✅ 변경 사항 테스트**: 모든 테스트 통과 확인
4. **📝 문서화**: 관련 문서 업데이트
5. **🚀 PR 제출**: 설명에 사용된 AI 프롬프트 포함

## 📚 문서

### 필수 읽기 자료

- **[📖 프로젝트 개요](docs/overview.md)**: 비전, 아키텍처, 기술 전략
- **[🚀 온보딩 가이드](docs/onboarding.md)**: 완전한 개발자 설정 및 워크플로우
- **[📋 요구사항](docs/requirements.md)**: 원본 타당성 분석 및 계획

### API 문서

- **시뮬레이션 엔진**: 자동 생성된 TypeScript 문서
- **React 컴포넌트**: Storybook 컴포넌트 라이브러리
- **Phaser 씬**: 인라인 JSDoc 문서

## 🎮 데모 및 스크린샷

### 라이브 데모

🔗 **[Cakeaway 플레이](https://cakeaway-demo.vercel.app)** (출시 예정)

### 스크린샷

| 기능 | 미리보기 |
|------|----------|
| **공장 레이아웃** | ![공장 스크린샷](docs/screenshots/factory.png) |
| **생산 UI** | ![UI 스크린샷](docs/screenshots/ui.png) |
| **아이소메트릭 뷰** | ![아이소메트릭 스크린샷](docs/screenshots/isometric.png) |

## 🏆 프로젝트 상태

### 현재 상태: **MVP 개발 중** 🚧

- ✅ **아키텍처**: 모노레포 설정 완료
- ✅ **AI 도구**: Cursor 및 Copilot 구성 완료
- 🚧 **핵심 시스템**: 생산 로직 진행 중
- 🚧 **그래픽**: AI 에셋 생성 진행 중
- ⏳ **UI 통합**: React-Phaser 연결 대기 중
- ⏳ **테스팅**: 테스트 스위트 구현 예정

### 성능 지표

- **🤖 AI 코드 생성**: 코드베이스의 80-95% 목표
- **⚡ 개발 속도**: 기존 방법 대비 5-10배 빠름
- **🎯 MVP 타임라인**: 2주 (근무일 10일)
- **📊 테스트 커버리지**: 시뮬레이션 엔진 90%+ 목표

## 🔮 미래 비전

### 장기 목표

- **🌍 교육 플랫폼**: 학습을 위한 제조 프로세스 시뮬레이션
- **🏭 산업 도구**: 실제 공장 최적화 및 교육
- **🎮 게임 플랫폼**: 다른 시뮬레이션 게임을 위한 프레임워크
- **🤖 AI 쇼케이스**: AI 기반 게임 개발의 데모

### 기술적 진화

- **🔄 실시간 멀티플레이어**: WebRTC 기반 협업 게임플레이
- **🧠 AI NPC**: 지능형 공장 근로자 및 관리자
- **🌐 Web3 통합**: 블록체인 기반 공장 소유권
- **📱 AR/VR 지원**: 몰입형 공장 관리 경험

## 📞 지원 및 커뮤니티

### 도움 받기

- **📚 문서**: 먼저 `docs/` 디렉토리 확인
- **🐛 버그 리포트**: GitHub Issues 템플릿 사용
- **💡 기능 요청**: GitHub Discussions 사용
- **💬 질문**: GitHub Discussions Q&A 섹션

### 커뮤니티 가이드라인

- **🤝 서로 존중하기**: 포용적이고 환영하는 환경
- **📚 지식 공유**: 다른 사람들의 Vibe Coding 학습 도움
- **🤖 AI 사용 문서화**: 효과적인 프롬프트 및 기법 공유
- **🎮 재미에 집중**: 우리는 게임을 만들고 있다는 것을 기억하세요!

## 📄 라이선스

이 프로젝트는 **MIT 라이선스**에 따라 라이선스가 부여됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- **🏗️ Tower of Time**: AI 기반 게임 개발 방법론의 영감
- **🎮 롤러코스터 타이쿤**: 게임 디자인 영감 및 메커니즘
- **🤖 Cursor & GitHub Copilot**: 이 프로젝트를 가능하게 한 AI 개발 도구
- **🎨 Midjourney & Leonardo AI**: 게임 아트 생성을 위한 창의적 AI 도구
- **🚀 Vercel & Netlify**: 웹 배포를 위한 배포 플랫폼

---

<div align="center">

**🍰 Cakeaway와 함께 즐거운 코딩을! 🍰**

*한 번에 하나의 AI 프롬프트로 게임 개발의 미래를 구축하고 있습니다.*

[![GitHub stars](https://img.shields.io/github/stars/your-org/cakeaway?style=social)](https://github.com/your-org/cakeaway)
[![Follow on Twitter](https://img.shields.io/twitter/follow/cakeaway?style=social)](https://twitter.com/cakeaway)

</div>