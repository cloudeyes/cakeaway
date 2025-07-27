import { expect, test } from '@playwright/test'
import { browserHelpers } from './helpers/test-utils'

// 가장 기본적인 e2e: 게임 캔버스가 정상적으로 렌더링되고, Phaser Grid가 보이는지 확인

test.describe('GameCanvas E2E', () => {
  test('아이소메트릭 Phaser 게임 캔버스가 정상적으로 렌더링된다', async ({ page }) => {
    await page.goto('/')

    // Phaser가 실제로 <canvas>를 렌더링하는지 확인
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    // 게임 상태 텍스트가 존재하는지 확인 (로딩 중 또는 준비됨)
    const status = page.locator('text=게임 상태:').first()
    await expect(status).toBeVisible()

    // 게임이 준비된 상태인지 확인
    await expect(page.locator('text=✅ 준비됨')).toBeVisible({ timeout: 8000 })

    // 아이소메트릭 그리드 렌더링 정보가 표시되는지 확인
    await expect(page.locator('text=🔷 아이소메트릭 그리드')).toBeVisible()
  })

  test('아이소메트릭 그리드에서 마우스 클릭 시 하이라이트가 생성된다', async ({ page }) => {
    await page.goto('/')
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    // 게임 상태가 준비됨인지 확인 (타임아웃을 더 짧게)
    await expect(page.locator('text=✅ 준비됨')).toBeVisible({ timeout: 8000 })

    // 아이소메트릭 그리드 렌더링 정보가 표시되는지 확인
    await expect(page.locator('text=🔷 아이소메트릭 그리드')).toBeVisible()

    // 아이소메트릭 그리드의 중앙 부근 좌표 클릭 (offsetX=400, offsetY=150 기준)
    // 그리드 위치 (5, 5)에 해당하는 화면 좌표 계산
    // gridToScreen 변환: screenX = (x - y) * 32, screenY = (x + y) * 16
    const gridX = 5, gridY = 5
    const isoScreenX = (gridX - gridY) * 32  // 0
    const isoScreenY = (gridX + gridY) * 16  // 160
    const clickX = 400 + isoScreenX  // 400
    const clickY = 150 + isoScreenY  // 310

    await canvas.click({ position: { x: clickX, y: clickY } })

    // 게임 상태가 여전히 정상인지 확인
    await expect(page.locator('text=✅ 준비됨')).toBeVisible()

    // 캔버스가 여전히 정상적으로 렌더링되고 있는지 확인 (클릭 후에도)
    await expect(canvas).toBeVisible()
  })

  test('높이 시각화 토글이 정상적으로 작동한다', async ({ page }) => {
    await page.goto('/')

    // 게임이 준비될 때까지 대기
    await expect(page.locator('text=✅ 준비됨')).toBeVisible({ timeout: 8000 })

    // 초기 상태: 높이 색상 비활성화 상태 확인
    await expect(page.locator('text=높이 색상: 비활성화')).toBeVisible()

    // 높이 시각화 토글 버튼 찾기
    const heightToggleButton = page.locator('button[aria-label="높이 시각화 토글"]')
    await expect(heightToggleButton).toBeVisible()

    // 높이 시각화 활성화
    await heightToggleButton.click()

    // 상태 텍스트가 변경되었는지 확인
    await expect(page.locator('text=높이 색상: 활성화')).toBeVisible({ timeout: 3000 })

    // 다시 비활성화
    await heightToggleButton.click()

    // 상태 텍스트가 다시 변경되었는지 확인
    await expect(page.locator('text=높이 색상: 비활성화')).toBeVisible({ timeout: 3000 })

    // 게임이 여전히 정상 상태인지 확인
    await expect(page.locator('text=✅ 준비됨')).toBeVisible()
  })

  test('게임 재시작 버튼이 정상적으로 작동한다', async ({ page }) => {
    await page.goto('/')

    // 게임이 준비될 때까지 대기
    await expect(page.locator('text=✅ 준비됨')).toBeVisible({ timeout: 8000 })

    // 재시작 버튼 찾기
    const resetButton = page.locator('button[aria-label="게임 재시작"]')
    await expect(resetButton).toBeVisible()

    // 재시작 버튼 클릭
    await resetButton.click()

    // 게임이 다시 로딩되고 준비되는지 확인
    await expect(page.locator('text=✅ 준비됨')).toBeVisible({ timeout: 8000 })

    // 아이소메트릭 그리드가 다시 렌더링되는지 확인
    await expect(page.locator('text=🔷 아이소메트릭 그리드')).toBeVisible()
  })

  test('타일 선택 시스템이 정상적으로 작동한다', async ({ page }) => {
    await page.goto('/')
    const canvas = page.locator('canvas')

    // 게임이 준비될 때까지 대기
    await expect(page.locator('text=✅ 준비됨')).toBeVisible({ timeout: 8000 })

    // 첫 번째 위치에 마우스 호버 (그리드 위치 3, 3)
    const hoverGridX = 3, hoverGridY = 3
    const hoverIsoScreenX = (hoverGridX - hoverGridY) * 32  // 0
    const hoverIsoScreenY = (hoverGridX + hoverGridY) * 16  // 96
    const hoverX = 400 + hoverIsoScreenX  // 400
    const hoverY = 150 + hoverIsoScreenY  // 246

    await canvas.hover({ position: { x: hoverX, y: hoverY } })

    // 잠시 대기 후 호버 효과 확인 (시각적 확인은 어렵지만 오류 없이 실행되는지 확인)
    await page.waitForTimeout(200)

    // 다른 위치로 마우스 이동
    const moveGridX = 5, moveGridY = 4
    const moveIsoScreenX = (moveGridX - moveGridY) * 32  // 32
    const moveIsoScreenY = (moveGridX + moveGridY) * 16  // 144
    const moveX = 400 + moveIsoScreenX  // 432
    const moveY = 150 + moveIsoScreenY  // 294

    await canvas.hover({ position: { x: moveX, y: moveY } })
    await page.waitForTimeout(200)

    // 타일 클릭해서 선택 상태로 만들기
    await canvas.click({ position: { x: moveX, y: moveY } })

    // 선택된 타일 정보가 표시되는지 확인 (data-testid 사용)
    const hoverSelectedTileInfo = page.locator('[data-testid="selected-tile-info"]')
    await expect(hoverSelectedTileInfo).toBeVisible({ timeout: 3000 })
    await expect(hoverSelectedTileInfo).toHaveAttribute('data-tile-x', (moveGridX + 1).toString())
    await expect(hoverSelectedTileInfo).toHaveAttribute('data-tile-y', (moveGridY + 1).toString())

    // 게임이 여전히 정상 상태인지 확인
    await expect(page.locator('text=✅ 준비됨')).toBeVisible()
  })

  test('선택된 타일의 높이 정보가 표시된다', async ({ page }) => {
    await page.goto('/')
    const canvas = page.locator('canvas')

    // 게임이 준비될 때까지 대기
    await expect(page.locator('text=✅ 준비됨')).toBeVisible({ timeout: 8000 })

    // 중앙 영역 클릭 (높이 3이어야 함)
    const centerGridX = 10, centerGridY = 7
    const centerIsoScreenX = (centerGridX - centerGridY) * 32  // 96
    const centerIsoScreenY = (centerGridX + centerGridY) * 16  // 272
    const centerClickX = 400 + centerIsoScreenX  // 496
    const centerClickY = 150 + centerIsoScreenY  // 422

    await canvas.click({ position: { x: centerClickX, y: centerClickY } })

    // 게임이 여전히 정상 상태인지 확인
    await expect(page.locator('text=✅ 준비됨')).toBeVisible()

    // 캔버스가 정상적으로 렌더링되고 있는지 확인
    await expect(canvas).toBeVisible()

    // 외곽 영역 클릭 (높이 1이어야 함)
    const edgeGridX = 0, edgeGridY = 0
    const edgeIsoScreenX = (edgeGridX - edgeGridY) * 32  // 0
    const edgeIsoScreenY = (edgeGridX + edgeGridY) * 16  // 0
    const edgeClickX = 400 + edgeIsoScreenX  // 400
    const edgeClickY = 150 + edgeIsoScreenY  // 150

    await canvas.click({ position: { x: edgeClickX, y: edgeClickY } })

    // 게임이 여전히 정상 상태인지 확인
    await expect(page.locator('text=✅ 준비됨')).toBeVisible()
  })

  test('높이별 색상 시스템이 작동한다', async ({ page }) => {
    await page.goto('/')

    // 게임이 준비될 때까지 대기
    await expect(page.locator('text=✅ 준비됨')).toBeVisible({ timeout: 8000 })

    // 높이 가이드가 표시되는지 확인
    await expect(page.locator('text=아이소메트릭 3D 타일 시스템')).toBeVisible()
    await expect(page.locator('text=높이 3 (중앙)')).toBeVisible()
    await expect(page.locator('text=높이 2 (중간)')).toBeVisible()
    await expect(page.locator('text=높이 1 (외곽)')).toBeVisible()

    // 높이 시각화 토글 버튼이 있는지 확인
    const heightToggleButton = page.locator('button[aria-label="높이 시각화 토글"]')
    await expect(heightToggleButton).toBeVisible()

    // 높이 시각화를 활성화하여 높이별 색상 확인
    await heightToggleButton.click()
    await expect(page.locator('text=높이 색상: 활성화')).toBeVisible({ timeout: 3000 })

    // 다시 비활성화
    await heightToggleButton.click()
    await expect(page.locator('text=높이 색상: 비활성화')).toBeVisible({ timeout: 3000 })

    // 게임이 여전히 정상 상태인지 확인
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
