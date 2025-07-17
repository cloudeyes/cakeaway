# CakeAway

CakeAway는 케이크 공장 건설과 운영을 시뮬레이션하는 웹 기반 게임입니다.
AI 기반 개발 방식(Vibe Coding)을 적극 활용하며, pnpm monore포 구조로 구성되어 있습니다.

## 주요 기술 및 구조

- **Frontend:**
  - `@cakeaway/app`: React v19, Phaser.js v3.9 기반 UI
- **Simulation Engine:**
  - `@cakeaway/simulation-engine`: 순수 TypeScript v5 기반 공장 시뮬레이션 로직
- **빌드/테스트:** Vite v7, vitest, pnpm

## 개발 철학

- **Vibe Coding:**
  - 자연어 프롬프트와 AI(예: Cursor, Copilot)로 코드 생성 및 반복 개선
  - MCP(Model Context Protocol) 기반 컨텍스트 관리
- **워크플로우:**
  - 모든 변경은 Pull Request로 리뷰 후 병합
  - 코드 스타일, 커밋 메시지, 린트 규칙 등은 문서화 및 자동화
  - 주요 개발/운영 가이드와 API 문서는 `/docs` 폴더에 기록

## 2주 개발 계획 (MVP)

1. **1주차:**
   - 모노레포/엔진 구조 설계, pnpm-workspace.yaml 및 패키지 초기화, vitest 환경 구축
   - 기본 UI 및 시뮬레이션 로직 구현
2. **2주차:**
   - Phaser.js 기반 UI, React-Phaser 통합, 이벤트 핸들러/설비 배치
   - 생산/물류 시뮬레이션, 상태 동기화, Vite 빌드/배포, 최종 폴리싱

## 참고 문서

- 개발자 온보딩 및 상세 가이드: [`docs/onboarding.md`](docs/onboarding.md)
- 프로젝트 개요 및 개발 계획: [`docs/overview.md`](docs/overview.md)
- AI 프롬프트 및 규칙: `.cursor/rules`, `PROMPTS.md` (추후 추가)

---

원하는 추가 정보나 세부 항목이 있으면 말씀해 주세요.
이 내용을 `README.md`에 반영하겠습니다.
