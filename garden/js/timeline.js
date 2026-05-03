/* ── timeline.js : 연도 슬라이더 제어 ──
 *
 * 사용 공식:
 *   슬라이더 값 = 2025 ~ 2051 (step: 2)
 *   2051은 2050으로 표시 처리
 *
 * 과학적 근거:
 *   생장 시뮬레이션은 2년 주기 → 로지스틱 생장 모델(plants.js)과 연동
 */

function initTimeline() {
  const slider = document.getElementById('yearSlider');
  const display = document.getElementById('currentYear');

  slider.addEventListener('input', () => {
    // 2051 → 2050으로 표시
    const year = Math.min(parseInt(slider.value), 2050);
    display.textContent = year;
    updateAll(year);
  });
}