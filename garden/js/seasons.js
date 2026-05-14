/* seasons.js : 생장 데이터 + seasons.html 슬라이드 제어 */

var GROWTH_COLORS = ['#E8F5A3','#B8E04A','#78C028','#3E8C14','#1A5C0A'];
var SEASONS_LIST  = ['spring','summer','autumn','winter'];
var SEASON_META   = {
  spring: { emoji:'🌸', name:'봄',   label:'🌸 봄'   },
  summer: { emoji:'☀️', name:'여름', label:'☀️ 여름' },
  autumn: { emoji:'🍂', name:'가을', label:'🍂 가을' },
  winter: { emoji:'❄️', name:'겨울', label:'❄️ 겨울' }
};

/* 계절별 생태 가중치 (여름=1.0 기준 정규화) */
var SEASON_FACTORS = {
  spring: { heat: 0.65, shannon: 0.80, solar: 0.52, nBase: 28 },
  summer: { heat: 1.00, shannon: 1.00, solar: 1.00, nBase: 58 },
  autumn: { heat: 0.75, shannon: 0.73, solar: 0.52, nBase: 38 },
  winter: { heat: 0.25, shannon: 0.40, solar: 0.09, nBase: 11 }
};

/* 계절별 유입 동물 이모지 (simulation.html 카드용) */
var SEASON_FAUNA_ICONS = {
  spring:  [['🐝','꿀벌'],['🐝','뒤영벌'],['🪰','꽃등에'],['🦋','나비'],['🐸','청개구리'],['🐦','동박새'],['🐦','박새']],
  summer:  [['🐝','꿀벌'],['🦋','나비'],['🦋','박각시나방'],['🪲','잠자리'],['🪰','꽃등에'],['🐞','무당벌레'],['🐦','꾀꼬리'],['🐦','제비'],['🐸','청개구리']],
  autumn:  [['🐝','꿀벌'],['🦋','나비'],['🐞','무당벌레'],['🐦','직박구리'],['🐦','황여새'],['🐦','개똥지빠귀'],['🐦','물총새']],
  winter:  [['🐦','동박새'],['🐦','박새'],['🐦','직박구리'],['🐦','오목눈이'],['🐦','황여새'],['🐦','개똥지빠귀'],['🐞','무당벌레']]
};

var currentSeasonIdx = 0;

/* ── 공통 계산 함수 ── */
function calcG(year) {
  var t = Math.max(0, Math.min(1, (year - 2026) / 24));
  return 1 / (1 + Math.exp(-8 * (t - 0.5)));
}

/**
 * 생태 지수 계산 (Shannon H', Pielou J', Margalef d)
 * season: 'spring'|'summer'|'autumn'|'winter' (없으면 summer 기준)
 */
function calcEcoIndices(year, season) {
  var g  = calcG(year);
  var sf = SEASON_FACTORS[season] || SEASON_FACTORS['summer'];
  var t  = Math.max(0, Math.min(1, (year - 2026) / 24));

  /* ① Shannon H' */
  var H = (1.0 + g * 2.1) * sf.shannon;

  /* ② 종 수 S — 계절별 목록 길이 기반 */
  var icons = SEASON_FAUNA_ICONS[season] || SEASON_FAUNA_ICONS['summer'];
  var S = Math.max(1, Math.round(icons.length * (0.5 + t * 0.5)));

  /* ③ 총 개체수 N */
  var N = Math.max(2, Math.round((sf.nBase + g * 120) * (0.5 + t * 0.5)));

  /* ④ Pielou's Evenness  J' = H' / ln(S) */
  var J = S > 1 ? Math.min(1, H / Math.log(S)) : 1;

  /* ⑤ Margalef's Richness  d = (S-1) / ln(N) */
  var d = N > 1 ? (S - 1) / Math.log(N) : 0;

  return {
    H:       H.toFixed(2),
    S:       S,
    N:       N,
    J:       J.toFixed(2),
    d:       d.toFixed(2),
    heat:    -(0.1 + g * 1.1) * sf.heat,
    solar:   Math.round((2 + g * 38) * sf.solar)
  };
}

/* ── simulation.html 용 ── */
function updateStats(year, season) {
  var s   = season || 'summer';
  var idx = calcEcoIndices(year, s);

  var elHeat    = document.getElementById('statHeat');
  var elShannon = document.getElementById('statShannon');
  var elSolar   = document.getElementById('statSolar');
  var elAnimals = document.getElementById('statAnimals');
  var elPielou  = document.getElementById('statPielou');
  var elMargalef= document.getElementById('statMargalef');
  var elLabel   = document.getElementById('statSeasonLabel');

  if (elHeat)     elHeat.textContent    = idx.heat.toFixed(1) + '°C';
  if (elShannon)  elShannon.textContent = idx.H;
  if (elSolar)    elSolar.textContent   = idx.solar + '%';
  if (elAnimals)  elAnimals.textContent = idx.S + '종';
  if (elPielou)   elPielou.textContent  = idx.J;
  if (elMargalef) elMargalef.textContent= idx.d;
  if (elLabel && SEASON_META[s]) elLabel.textContent = SEASON_META[s].label;
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
  if (!avgIdx) {
    var base = {spring:62, summer:78, autumn:69, winter:37}[season] || 60;
    var g2 = calcG(year);
    avgIdx = base * (0.88 + g2 * 0.22);
  }
  var pct   = Math.min(100, Math.round(avgIdx));
  var color = GROWTH_COLORS[Math.min(Math.floor(pct / 20), 4)];

  var fill  = document.getElementById('growth-' + season);
  var pctEl = document.getElementById('growthPct-' + season);
  if (fill)  { fill.style.width = pct + '%'; fill.style.backgroundColor = color; }
  if (pctEl) pctEl.textContent = pct + '%';

  var blooming = (typeof getBloomingPlants === 'function') ? getBloomingPlants(year, season) : [];
  var chipsEl  = document.getElementById('blooming-' + season);
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

  var idx = calcEcoIndices(year, season);
  var topHeat    = document.getElementById('topHeat');
  var topShannon = document.getElementById('topShannon');
  var topPielou  = document.getElementById('topPielou');
  var topMargalef= document.getElementById('topMargalef');
  if (topHeat)     topHeat.textContent     = idx.heat.toFixed(1) + '°C';
  if (topShannon)  topShannon.textContent  = idx.H;
  if (topPielou)   topPielou.textContent   = idx.J;
  if (topMargalef) topMargalef.textContent = idx.d;
}

function getCurrentSeason() {
  return SEASONS_LIST[currentSeasonIdx];
}

/* seasons.html 초기화 */
document.addEventListener('DOMContentLoaded', function() {
  var track = document.getElementById('seasonTrack');
  if (!track) return; /* simulation.html이면 스킵 */

  var params     = new URLSearchParams(location.search);
  var initSeason = params.get('season') || 'spring';
  var idx        = SEASONS_LIST.indexOf(initSeason);
  currentSeasonIdx = idx >= 0 ? idx : 0;

  var btnLeft  = document.getElementById('btnLeft');
  var btnRight = document.getElementById('btnRight');
  if (btnLeft)  btnLeft.addEventListener('click',  function() { changeSeason(-1); });
  if (btnRight) btnRight.addEventListener('click', function() { changeSeason(1);  });

  for (var i = 0; i < 4; i++) {
    (function(i) {
      var dot = document.getElementById('dot-' + i);
      if (dot) dot.addEventListener('click', function() { goToSeasonIdx(i); });
    })(i);
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft')  changeSeason(-1);
    if (e.key === 'ArrowRight') changeSeason(1);
  });

  goToSeasonIdx(currentSeasonIdx);

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
