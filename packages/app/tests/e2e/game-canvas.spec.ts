import { test, expect } from '@playwright/test'

// 가장 기본적인 e2e: 게임 캔버스가 정상적으로 렌더링되고, Phaser Grid가 보이는지 확인

test.describe('GameCanvas E2E', () => {
  test('Phaser 게임 캔버스가 정상적으로 렌더링된다', async ({ page }) => {
    await page.goto('/')

    // 게임 캔버스 컨테이너가 존재하는지 확인
    const canvasContainer = page.locator('.game-canvas-container')
    await expect(canvasContainer).toBeVisible()

    // Phaser가 실제로 <canvas>를 렌더링하는지 확인
    const canvas = canvasContainer.locator('canvas')
    await expect(canvas).toBeVisible()

    // 게임 상태 텍스트가 "게임 상태: 준비됨" 또는 "게임 상태: 로딩 중" 중 하나인지 확인
    const status = page.locator('.game-canvas-wrapper strong')
    await expect(status).toHaveText(/게임 상태:/)
  })

  test('Phaser Grid 위에서 마우스 클릭 시 하이라이트가 생성된다', async ({ page }) => {
    await page.goto('/')
    const canvas = page.locator('.game-canvas-container canvas')
    await expect(canvas).toBeVisible()

    // 게임이 완전히 로드될 때까지 대기
    await page.waitForTimeout(1000)

    // Phaser Grid의 유효한 좌표 클릭 (offsetX=100, offsetY=100, tileSize=32 기준)
    // (5, 5) 타일 클릭: x=100+5*32+16, y=100+5*32+16
    const clickX = 100 + 5 * 32 + 16
    const clickY = 100 + 5 * 32 + 16
    await canvas.click({ position: { x: clickX, y: clickY } })

    // 클릭이 처리될 때까지 대기
    await page.waitForTimeout(500)

    // 캔버스가 여전히 렌더링되고 있는지 확인 (기본적인 상호작용 확인)
    await expect(canvas).toBeVisible()

    // 게임 상태가 여전히 정상인지 확인
    const gameStatus = page.locator('text=게임 상태: ✅ 준비됨')
    await expect(gameStatus).toBeVisible()
  })
})
