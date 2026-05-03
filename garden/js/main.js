/* ── main.js : 전체 제어 ── */

// 현재 연도 (슬라이더와 연동)
let currentYear = 2025;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  initTimeline();
  initSeasons();
  initZones();
  updateAll(currentYear);
});

// 연도 변경 시 전체 업데이트
function updateAll(year) {
  currentYear = year;
  updateSeasonInfo(year);   // seasons.js
  updateZoneColors(year);   // zones.js
  // TODO: 동물 데이터 준비되면 아래 주석 해제
  // updateAnimals(year);   // animals.js
}
