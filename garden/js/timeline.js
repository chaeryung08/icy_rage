/* ── timeline.js : 슬라이더 제어 ── */

function initTimeline() {
  const slider = document.getElementById('yearSlider');
  const badge  = document.getElementById('currentYear');

  slider.addEventListener('input', () => {
    const year = parseInt(slider.value);
    badge.textContent = `${year}년`;
    updateAll(year);
  });
}