import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 15_000, // Agent 모드에서 빠른 실행을 위해 15초로 단축
  expect: {
    timeout: 3_000, // expect 타임아웃도 단축
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1, // Agent 모드에서 안정성을 위해 1개 워커 사용
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: true,
    actionTimeout: 5_000, // 액션 타임아웃 설정
    navigationTimeout: 10_000, // 네비게이션 타임아웃 설정
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    cwd: new URL('.', import.meta.url).pathname,
    timeout: 30_000, // 웹서버 시작 타임아웃 단축
  },
})
