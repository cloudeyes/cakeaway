/**
 * E2E 테스트에서 사용하는 공용 유틸리티 함수들
 */

/**
 * RGB 색상 문자열을 Hex 색상 코드로 변환
 * @param rgb - RGB 색상 문자열 (예: "rgb(248, 250, 252)")
 * @returns Hex 색상 코드 (예: "#f8fafc") 또는 원본 문자열 (매치되지 않는 경우)
 */
export const rgbToHex = (rgb: string): string => {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return rgb

  const [, r, g, b] = match
  const toHex = (n: string) => parseInt(n).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * 브라우저에서 실행할 수 있는 테마 색상 헬퍼 함수들
 * page.evaluate()에서 사용하기 위한 함수들
 */
export const browserHelpers = {
  /**
   * CSS 변수에서 테마 색상을 가져오는 함수
   * @returns 라이트/다크 모드 배경색 정의
   */
  getThemeColors: () => {
    const computedStyle = window.getComputedStyle(document.documentElement)

    const lightBg = computedStyle.getPropertyValue('--color-game-bg-light').trim()
    const darkBg = computedStyle.getPropertyValue('--color-game-bg-dark').trim()

    return {
      light: lightBg,
      dark: darkBg
    }
  },

  /**
   * 요소의 배경색을 Hex 형태로 가져오는 함수
   * @param element - DOM 요소
   * @returns Hex 색상 코드
   */
  getElementBgColorAsHex: (element: Element): string => {
    const rgb = window.getComputedStyle(element).backgroundColor
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!match) return rgb

    const [, r, g, b] = match
    const toHex = (n: string) => parseInt(n).toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }
}
