/* ── main.js : simulation.html 전체 제어 ── */
let currentYear = 2026;

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlantsData();
  initTimeline();
  updateAll(2026);
});

function updateAll(year) {
  currentYear = year;
  updateStats(year);
  updateAllSeasons(year);
  if (year >= 2050) {
    document.getElementById('conclusionToast').classList.add('show');
  }
}

function stepYear(dir) {
  const slider = document.getElementById('yearSlider');
  let year = parseInt(slider.value) + dir * 2;
  year = Math.max(2025, Math.min(2050, year));
  slider.value = year;
  document.getElementById('currentYear').textContent = `${year}년`;
  updateAll(year);
}

// 계절 클릭 → seasons.html로 이동 (연도 저장)
function goToSeason(season) {
  sessionStorage.setItem('year', currentYear);
  window.location.href = `seasons.html?season=${season}`;
}

// 카드 호버
function expandCard(card) {
  document.querySelectorAll('.season-card').forEach(c => c.classList.remove('expanded'));
  card.classList.add('expanded');
}
function collapseCard(card) {
  card.classList.remove('expanded');
}