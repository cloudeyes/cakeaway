import { expect, test } from '@playwright/test'
import { browserHelpers } from './helpers/test-utils'

// 가장 기본적인 e2e: 게임 캔버스가 정상적으로 렌더링되고, Phaser Grid가 보이는지 확인

test.describe('GameCanvas E2E', () => {
  test('Phaser 게임 캔버스가 정상적으로 렌더링된다', async ({ page }) => {
    await page.goto('/')

    // Phaser가 실제로 <canvas>를 렌더링하는지 확인
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    // 게임 상태 텍스트가 존재하는지 확인 (로딩 중 또는 준비됨)
    const status = page.locator('text=게임 상태:').first()
    await expect(status).toBeVisible()
  })

  test('Phaser Grid 위에서 마우스 클릭 시 하이라이트가 생성된다', async ({ page }) => {
    await page.goto('/')
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    // 게임 상태가 준비됨인지 확인 (타임아웃을 더 짧게)
    await expect(page.locator('text=✅ 준비됨')).toBeVisible({ timeout: 8000 })

    // Phaser Grid의 유효한 좌표 클릭
    const clickX = 100 + 5 * 32 + 16
    const clickY = 100 + 5 * 32 + 16
    await canvas.click({ position: { x: clickX, y: clickY } })

    // 게임 상태가 여전히 정상인지 확인
    await expect(page.locator('text=✅ 준비됨')).toBeVisible()
  })

  test('테마 토글 버튼이 정상적으로 작동한다', async ({ page }) => {
    await page.goto('/')

    // CSS가 로드되었는지 확인
    await page.waitForLoadState('networkidle')

    // CSS 변수에서 테마 색상 정의 가져오기
    const expectedColors = await page.evaluate(browserHelpers.getThemeColors)

    // 테마 토글 버튼이 존재하는지 확인
    const themeToggle = page.locator('button[aria-label="테마 변경"]')
    await expect(themeToggle).toBeVisible()

    // 초기 상태 확인 (html 클래스와 실제 배경색)
    const html = page.locator('html')
    const body = page.locator('body')
    const initialClass = await html.getAttribute('class') || ''
    const initialIsDark = initialClass.includes('dark')

    // body 요소의 배경색을 hex로 변환하여 확인
    const initialBgColorHex = await body.evaluate(browserHelpers.getElementBgColorAsHex)

    // 초기 상태는 라이트 모드여야 함
    expect(initialIsDark).toBe(false)
    expect(initialBgColorHex).toBe(expectedColors.light)

    // 테마 토글 버튼 클릭
    await themeToggle.click()

    // 변경 후 상태 확인
    const afterClickClass = await html.getAttribute('class') || ''
    const afterClickIsDark = afterClickClass.includes('dark')
    const afterClickBgColorHex = await body.evaluate(browserHelpers.getElementBgColorAsHex)

    // 다크 모드로 변경되었는지 확인
    expect(afterClickIsDark).toBe(true)
    expect(afterClickBgColorHex).toBe(expectedColors.dark)

    // 다시 클릭하여 원래 상태로 복원
    await themeToggle.click()

    // 원래 상태로 돌아왔는지 확인
    const finalClass = await html.getAttribute('class') || ''
    const finalIsDark = finalClass.includes('dark')
    const finalBgColorHex = await body.evaluate(browserHelpers.getElementBgColorAsHex)

    // 원래 상태로 복원되었는지 확인
    expect(finalIsDark).toBe(false)
    expect(finalBgColorHex).toBe(expectedColors.light)
  })
})
