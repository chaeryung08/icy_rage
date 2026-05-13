/* seasons.js : 생장 데이터 + seasons.html 슬라이드 제어 */

var GROWTH_COLORS = ['#E8F5A3','#B8E04A','#78C028','#3E8C14','#1A5C0A'];
var SEASONS_LIST  = ['spring','summer','autumn','winter'];
var SEASON_META   = {
  spring: { emoji:'🌸', name:'봄' },
  summer: { emoji:'☀️', name:'여름' },
  autumn: { emoji:'🍂', name:'가을' },
  winter: { emoji:'❄️', name:'겨울' }
};

/* 계절별 유입 동물 이모지 (simulation.html 카드용) */
var SEASON_FAUNA_ICONS = {
  spring:  [['🐝','꿀벌'],['🐝','뒤영벌'],['🪰','꽃등에'],['🦋','나비'],['🐸','청개구리'],['🐦','동박새'],['🐦','박새']],
  summer:  [['🐝','꿀벌'],['🦋','나비'],['🦋','박각시나방'],['🪲','잠자리'],['🪰','꽃등에'],['🐞','무당벌레'],['🐦','꾀꼬리'],['🐦','제비'],['🐸','청개구리']],
  autumn:  [['🐝','꿀벌'],['🦋','나비'],['🐞','무당벌레'],['🐦','직박구리'],['🐦','황여새'],['🐦','개똥지빠귀'],['🐦','물총새']],
  winter:  [['🐦','동박새'],['🐦','박새'],['🐦','직박구리'],['🐦','오목눈이'],['🐦','황여새'],['🐦','개똥지빠귀'],['🐞','무당벌레']]
};

var currentSeasonIdx = 0;

/* ── simulation.html 용 ── */
function calcG(year) {
  var t = Math.max(0, Math.min(1, (year - 2026) / 24));
  return 1 / (1 + Math.exp(-8 * (t - 0.5)));
}

function updateStats(year) {
  var g = calcG(year);
  var heat    = document.getElementById('statHeat');
  var shannon = document.getElementById('statShannon');
  var solar   = document.getElementById('statSolar');
  var animals = document.getElementById('statAnimals');
  if (heat)    heat.textContent    = '-' + (0.1 + g * 1.1).toFixed(1) + '°C';
  if (shannon) shannon.textContent = (1.0 + g * 2.1).toFixed(2);
  if (solar)   solar.textContent   = Math.round(2 + g * 38) + '%';
  if (animals) animals.textContent = Math.round(3 + g * 15) + '종';
}

function updateAllSeasons(year) {
  SEASONS_LIST.forEach(function(s) { updateOneSeason(s, year); });
  updateAnimalIcons(year);
}

/* simulation.html 계절 카드 동물 아이콘 채우기 */
function updateAnimalIcons(year) {
  var t = Math.max(0, Math.min(1, (year - 2026) / 24));
  SEASONS_LIST.forEach(function(s) {
    var el = document.getElementById('animals-' + s);
    if (!el) return;
    el.innerHTML = '';
    var icons = SEASON_FAUNA_ICONS[s] || [];
    var show = Math.round(icons.length * (0.5 + t * 0.5));
    icons.slice(0, show).forEach(function(pair, i) {
      var span = document.createElement('span');
      span.className = 'animal-icon';
      span.textContent = pair[0];
      span.title = pair[1];
      span.style.animationDelay = (i * 70) + 'ms';
      el.appendChild(span);
    });
  });
}

function updateOneSeason(season, year) {
  var avgIdx = (typeof getAvgGrowthIndex === 'function') ? getAvgGrowthIndex(year, season) : 0;
  /* plants.json 비어있을 때 폴백: PLANT_DB 평균값 기반 */
  if (!avgIdx) {
    var base = {spring:62, summer:78, autumn:69, winter:37}[season] || 60;
    var g2 = calcG(year);
    avgIdx = base * (0.88 + g2 * 0.22);
  }
  var pct    = Math.min(100, Math.round(avgIdx));
  var color  = GROWTH_COLORS[Math.min(Math.floor(pct / 20), 4)];

  var fill  = document.getElementById('growth-' + season);
  var pctEl = document.getElementById('growthPct-' + season);
  if (fill)  { fill.style.width = pct + '%'; fill.style.backgroundColor = color; }
  if (pctEl) pctEl.textContent = pct + '%';

  var blooming = (typeof getBloomingPlants === 'function') ? getBloomingPlants(year, season) : [];
  var chipsEl  = document.getElementById('blooming-' + season);
  /* blooming 데이터가 있을 때만 덮어쓰기 (없으면 renderSeasonChips의 2층 구조 유지) */
  if (chipsEl && blooming.length > 0) {
    chipsEl.innerHTML = blooming.slice(0, 6).map(function(p) {
      return '<span class="bloom-chip' + (p.honey ? ' honey' : '') + '">' + p.name + '</span>';
    }).join('');
  }
}

/* ── seasons.html 슬라이드 제어 ── */
function changeSeason(dir) {
  currentSeasonIdx = (currentSeasonIdx + dir + 4) % 4;
  goToSeasonIdx(currentSeasonIdx);
}

function goToSeasonIdx(idx) {
  currentSeasonIdx = idx;
  var track = document.getElementById('seasonTrack');
  if (track) track.style.transform = 'translateX(-' + (idx * 100) + '%)';

  for (var i = 0; i < 4; i++) {
    var dot = document.getElementById('dot-' + i);
    if (dot) dot.classList.toggle('active', i === idx);
  }
  updateTopbar();
}

function updateTopbar() {
  var season = SEASONS_LIST[currentSeasonIdx];
  var meta   = SEASON_META[season];
  var year   = parseInt(sessionStorage.getItem('year') || '2026');

  var topEmoji  = document.getElementById('topEmoji');
  var topSeason = document.getElementById('topSeason');
  var topYear   = document.getElementById('topYear');
  if (topEmoji)  topEmoji.textContent  = meta.emoji;
  if (topSeason) topSeason.textContent = meta.name;
  if (topYear)   topYear.textContent   = year + '년';

  var t = Math.max(0, Math.min(1, (year - 2026) / 24));
  var g = 1 / (1 + Math.exp(-8 * (t - 0.5)));
  var topHeat    = document.getElementById('topHeat');
  var topShannon = document.getElementById('topShannon');
  if (topHeat)    topHeat.textContent    = '-' + (0.1 + g * 1.1).toFixed(1) + '°C';
  if (topShannon) topShannon.textContent = (1.0 + g * 2.1).toFixed(2);
}

function getCurrentSeason() {
  return SEASONS_LIST[currentSeasonIdx];
}

/* seasons.html 초기화 */
document.addEventListener('DOMContentLoaded', function() {
  var track = document.getElementById('seasonTrack');
  if (!track) return; /* simulation.html이면 스킵 */

  /* URL 파라미터로 시작 계절 결정 */
  var params     = new URLSearchParams(location.search);
  var initSeason = params.get('season') || 'spring';
  var idx        = SEASONS_LIST.indexOf(initSeason);
  currentSeasonIdx = idx >= 0 ? idx : 0;

  /* < > 버튼 */
  var btnLeft  = document.getElementById('btnLeft');
  var btnRight = document.getElementById('btnRight');
  if (btnLeft)  btnLeft.addEventListener('click',  function() { changeSeason(-1); });
  if (btnRight) btnRight.addEventListener('click', function() { changeSeason(1);  });

  /* 인디케이터 dots */
  for (var i = 0; i < 4; i++) {
    (function(i) {
      var dot = document.getElementById('dot-' + i);
      if (dot) dot.addEventListener('click', function() { goToSeasonIdx(i); });
    })(i);
  }

  /* 키보드 */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft')  changeSeason(-1);
    if (e.key === 'ArrowRight') changeSeason(1);
  });

  /* 초기 위치 */
  goToSeasonIdx(currentSeasonIdx);

  /* 데이터 로드 */
  var year = parseInt(sessionStorage.getItem('year') || '2026');
  if (typeof loadPlantsData === 'function') {
    loadPlantsData().then(function() {
      if (typeof initLoader === 'function') initLoader();
      updateAllSeasons(year);
    }).catch(function() {
      if (typeof initLoader === 'function') initLoader();
    });
  } else {
    if (typeof initLoader === 'function') initLoader();
  }
});