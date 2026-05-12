/* seasons_page.js : seasons.html 전용 제어 */

var SEASONS_LIST = ['spring', 'summer', 'autumn', 'winter'];
var SEASON_META = {
  spring: { emoji: '🌸', name: '봄' },
  summer: { emoji: '☀️', name: '여름' },
  autumn: { emoji: '🍂', name: '가을' },
  winter: { emoji: '❄️', name: '겨울' }
};

var currentSeasonIdx = 0;
var currentYear = parseInt(sessionStorage.getItem('year') || '2026');

function changeSeason(dir) {
  currentSeasonIdx = (currentSeasonIdx + dir + 4) % 4;
  goToSeasonIdx(currentSeasonIdx);
}

function goToSeasonIdx(idx) {
  currentSeasonIdx = idx;
  var track = document.getElementById('seasonTrack');
  if (track) {
    track.style.transform = 'translateX(-' + (idx * 100) + '%)';
  }
  for (var i = 0; i < 4; i++) {
    var dot = document.getElementById('dot-' + i);
    if (dot) {
      dot.classList.toggle('active', i === idx);
    }
  }
  updateTopbar();
}

function updateTopbar() {
  var season = SEASONS_LIST[currentSeasonIdx];
  var meta = SEASON_META[season];

  var topEmoji = document.getElementById('topEmoji');
  var topSeason = document.getElementById('topSeason');
  var topYear = document.getElementById('topYear');
  if (topEmoji) topEmoji.textContent = meta.emoji;
  if (topSeason) topSeason.textContent = meta.name;
  if (topYear) topYear.textContent = currentYear + '년';

  var t = Math.max(0, Math.min(1, (currentYear - 2026) / 24));
  var g = 1 / (1 + Math.exp(-8 * (t - 0.5)));
  var topHeat = document.getElementById('topHeat');
  var topShannon = document.getElementById('topShannon');
  if (topHeat) topHeat.textContent = '-' + (g * 2.6).toFixed(1) + 'C';
  if (topShannon) topShannon.textContent = (3.8 + g * 0.5).toFixed(2);
}

function getCurrentSeason() {
  return SEASONS_LIST[currentSeasonIdx];
}

document.addEventListener('DOMContentLoaded', function() {
  // URL 파라미터로 시작 계절 결정
  var params = new URLSearchParams(location.search);
  var initSeason = params.get('season') || 'spring';
  var idx = SEASONS_LIST.indexOf(initSeason);
  currentSeasonIdx = idx >= 0 ? idx : 0;

  // 버튼 이벤트
  var btnLeft = document.getElementById('btnLeft');
  var btnRight = document.getElementById('btnRight');
  if (btnLeft) btnLeft.addEventListener('click', function() { changeSeason(-1); });
  if (btnRight) btnRight.addEventListener('click', function() { changeSeason(1); });

  // 인디케이터 클릭
  for (var i = 0; i < 4; i++) {
    (function(idx) {
      var dot = document.getElementById('dot-' + idx);
      if (dot) dot.addEventListener('click', function() { goToSeasonIdx(idx); });
    })(i);
  }

  // 팝업 닫기
  var overlay = document.getElementById('popupOverlay');
  var closeBtn = document.getElementById('popupClose');
  if (overlay) overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closePopup();
  });
  if (closeBtn) closeBtn.addEventListener('click', closePopup);

  // 키보드
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') changeSeason(-1);
    if (e.key === 'ArrowRight') changeSeason(1);
  });

  // 초기화
  goToSeasonIdx(currentSeasonIdx);

  // plants 데이터 로드 후 업데이트
  loadPlantsData().then(function() {
    initLoader();
    updateAllSeasons(currentYear);
  });
});