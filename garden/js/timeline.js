/* ── timeline.js : 슬라이더 + 버튼 제어 ── */

function initTimeline() {
  const slider = document.getElementById('yearSlider');
  const display = document.getElementById('currentYear');

  // 슬라이더 드래그
  slider.addEventListener('input', () => {
    const year = parseInt(slider.value);
    display.textContent = `${year}년`;
    updateAll(year);
  });
}

// [<] [>] 버튼으로 2년씩 이동
function stepYear(dir) {
  const slider = document.getElementById('yearSlider');
  const display = document.getElementById('currentYear');
  let year = parseInt(slider.value) + dir * 2;
  year = Math.max(2025, Math.min(2050, year));
  slider.value = year;
  display.textContent = `${year}년`;
  updateAll(year);
}