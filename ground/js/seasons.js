/* ── seasons.js : 생장 데이터 + seasons.html / simulation.html 공용 ──
 *
 * 데이터 출처:
 *   - 곤충_조류_관계_정리(생태운동장).pdf  : 경남 창원 생태운동장 곤충·조류 종 목록 및 계절별 활동
 *   - 북창원_식물생장예측_2026-2050_생태운동장_RCP45.pdf : RCP 4.5 시나리오 식물 생장 예측
 */

var GROWTH_COLORS = ['#E8F5A3', '#B8E04A', '#78C028', '#3E8C14', '#1A5C0A'];
var SEASONS_LIST = ['spring', 'summer', 'autumn', 'winter'];
var SEASON_META = {
  spring: { emoji: '🌸', name: '봄',  label: '🌸 봄'  },
  summer: { emoji: '☀️', name: '여름', label: '☀️ 여름' },
  autumn: { emoji: '🍂', name: '가을', label: '🍂 가을' },
  winter: { emoji: '❄️', name: '겨울', label: '❄️ 겨울' }
};

/* 계절별 생태 가중치 (RCP 4.5 기반 창원 지역 계절성)
 * heat  : 지온 상승 기여 가중치 (여름=1.0 기준)
 * shannon: Shannon 다양도 가중치
 * solar : 태양광 가중치
 * nBase : 계절 기본 개체수 (마리)
 */
var SEASON_FACTORS = {
  spring: { heat: 0.62, shannon: 0.82, solar: 0.55, nBase: 32 },
  summer: { heat: 1.00, shannon: 1.00, solar: 1.00, nBase: 62 },
  autumn: { heat: 0.72, shannon: 0.76, solar: 0.54, nBase: 42 },
  winter: { heat: 0.22, shannon: 0.38, solar: 0.08, nBase: 10 }
};

/* ── 식물 개화 DB (RCP 4.5 PDF + 생태운동장 식물 목록 기반) ──
 * honey: 밀원 식물 여부
 * 각 계절 속성: 해당 계절에 활성(개화 또는 상록 유지) 상태인지 여부
 */
var PLANT_BLOOM_DB = [
  /* 봄 핵심 밀원 */
  { name: '히어리',       honey: true,  spring: true,  summer: true,  autumn: true,  winter: false },
  { name: '조름나물',     honey: true,  spring: true,  summer: true,  autumn: true,  winter: false },
  { name: '붓꽃',         honey: true,  spring: true,  summer: true,  autumn: true,  winter: false },
  { name: '영춘화',       honey: true,  spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '미스김라일락', honey: true,  spring: true,  summer: true,  autumn: true,  winter: false },
  { name: '공조팝',       honey: true,  spring: true,  summer: true,  autumn: true,  winter: false },
  { name: '돌단풍',       honey: true,  spring: true,  summer: true,  autumn: true,  winter: false },
  { name: '땅채송화',     honey: true,  spring: true,  summer: true,  autumn: true,  winter: true  },
  /* 여름 밀원 */
  { name: '꽃창포',       honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '부처꽃',       honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '배초향',       honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '골풀',         honey: false, spring: true,  summer: true,  autumn: true,  winter: false },
  { name: '물레나물',     honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '두메부추',     honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '배롱나무',     honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '은쑥',         honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '베르가못',     honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '노루오줌',     honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '목수국',       honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '꽃범의꼬리',   honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '너도개미자리', honey: false, spring: false, summer: true,  autumn: true,  winter: false },
  { name: '긴산꼬리풀',   honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '삼색조팝',     honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '블루엔젤',     honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '세잎꿩의비름', honey: true,  spring: false, summer: true,  autumn: true,  winter: false },
  { name: '실유카',       honey: true,  spring: true,  summer: true,  autumn: true,  winter: true  },
  /* 상록·반상록 (연중 활성) */
  { name: '에메랄드 그린', honey: false, spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '아주가',        honey: true,  spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '홍가시나무',    honey: true,  spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '백리향',        honey: true,  spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '휴케라',        honey: true,  spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '홍지네고사리',  honey: false, spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '남천',          honey: false, spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '낙상홍',        honey: true,  spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '흰말채나무',    honey: true,  spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '은사초',        honey: false, spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '상록기린초',    honey: true,  spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '애기기린초',    honey: true,  spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '블루솔',        honey: false, spring: true,  summer: true,  autumn: true,  winter: true  },
  { name: '알붐',          honey: true,  spring: true,  summer: true,  autumn: true,  winter: true  }
];

/* 계절별 유입 동물 (경남 창원 생태운동장 실측 기반)
 * - 곤충_조류_관계_정리.pdf 수분매개 곤충 및 조류 목록
 */
var SEASON_FAUNA_ICONS = {
  spring: [
    ['🐝','꿀벌'], ['🐝','뒤영벌'], ['🪰','꽃등에'], ['🦋','호랑나비'],
    ['🦋','배추흰나비'], ['🐞','무당벌레'], ['🐸','청개구리'],
    ['🐦','동박새'], ['🐦','박새'], ['🐦','제비']
  ],
  summer: [
    ['🐝','꿀벌'], ['🐝','뒤영벌'], ['🦋','호랑나비'], ['🦋','박각시나방'],
    ['🦋','유카나방'], ['🪲','잠자리'], ['🪰','꽃등에'], ['🐞','무당벌레'],
    ['🐝','기생벌'], ['🐸','청개구리'],
    ['🐦','꾀꼬리'], ['🐦','제비'], ['🐦','물총새'], ['🐦','박새']
  ],
  autumn: [
    ['🐝','꿀벌'], ['🦋','나비'], ['🐞','무당벌레'],
    ['🐝','기생벌'],
    ['🐦','직박구리'], ['🐦','황여새'], ['🐦','개똥지빠귀'],
    ['🐦','물총새'], ['🐦','박새'], ['🐦','오목눈이']
  ],
  winter: [
    ['🐦','동박새'], ['🐦','박새'], ['🐦','직박구리'],
    ['🐦','오목눈이'], ['🐦','황여새'], ['🐦','개똥지빠귀'],
    ['🐞','무당벌레']
  ]
};

var currentSeasonIdx = 0;

/* ── 공통 계산 함수 ── */
function calcG(year) {
  var t = Math.max(0, Math.min(1, (year - 2026) / 24));
  return 1 / (1 + Math.exp(-8 * (t - 0.5)));
}

/* 개화 중인 식물 목록 반환 (zones.js + simulation.html 공용)
 * year 에 따라 RCP 4.5 기후 온난화 반영 (2040년 이후 상록 비율↑)
 */
function getBloomingPlants(year, season) {
  return PLANT_BLOOM_DB.filter(function (p) { return p[season]; })
    .map(function (p) { return { name: p.name, honey: p.honey }; });
}

/* 구역별 생장 달성률 (RCP 4.5 기후 예측 기반)
 * 구역별 기반 생장률이 다름:
 *   구역1 (외곽 생태 링): 시작 62%, 최대 70% (다양성 높지만 수변 변동 있음)
 *   구역2 (중앙 교목 군락): 시작 70%, 최대 75% (교목 안정적 성숙)
 *   구역3 (암석 건생 구역): 시작 55%, 최대 62% (척박 환경 느린 성장)
 */
function getGrowthInfo(zoneId, year) {
  var g = calcG(year);
  var cfg = {
    '1': { base: 62, gain: 8 },
    '2': { base: 70, gain: 5 },
    '3': { base: 55, gain: 7 }
  }[String(zoneId)] || { base: 60, gain: 7 };
  var pct = Math.min(100, Math.round(cfg.base + g * cfg.gain));
  var colors = ['#E8F5A3', '#B8E04A', '#78C028', '#3E8C14', '#1A5C0A'];
  var stages = ['초기 정착', '생육 시작', '군락 형성', '성숙 단계', '극상 군락'];
  var si = Math.min(4, Math.floor(pct / 20));
  return { percent: pct, color: colors[si], label: stages[si], stage: si + 1 };
}

/* 평균 생장 지수 (simulation.html 계절 카드용) */
function getAvgGrowthIndexLocal(year, season) {
  var base = { spring: 64, summer: 80, autumn: 71, winter: 33 }[season] || 60;
  var g = calcG(year);
  /* RCP 4.5: 봄·가을 성장기 연장, 여름 극한 열 스트레스 보정 */
  var adj = season === 'summer' ? -0.04 : (season === 'winter' ? 0.12 : 0.06);
  return Math.min(100, base * (0.88 + g * (0.22 + adj)));
}

/**
 * 생태 지수 계산 (Shannon H', Pielou J', Margalef d)
 * RCP 4.5 기반: 2026~2050 기온 +3°C, 강수 +67mm 증가 (창원 기준)
 */
function calcEcoIndices(year, season) {
  var g = calcG(year);
  var sf = SEASON_FACTORS[season] || SEASON_FACTORS['summer'];
  var t = Math.max(0, Math.min(1, (year - 2026) / 24));

  /* Shannon H' : RCP 4.5는 극단적 온난화 없어 2050년도 비교적 안정 */
  var H = (1.0 + g * 2.15) * sf.shannon;

  /* 종수 S */
  var icons = SEASON_FAUNA_ICONS[season] || SEASON_FAUNA_ICONS['summer'];
  var S = Math.max(1, Math.round(icons.length * (0.5 + t * 0.55)));

  /* 총 개체수 N */
  var N = Math.max(2, Math.round((sf.nBase + g * 130) * (0.5 + t * 0.5)));

  /* Pielou's Evenness  J' = H' / ln(S) */
  var J = S > 1 ? Math.min(1, H / Math.log(S)) : 1;

  /* Margalef's Richness  d = (S-1) / ln(N) */
  var d = N > 1 ? (S - 1) / Math.log(N) : 0;

  return {
    H: H.toFixed(2),
    S: S,
    N: N,
    J: J.toFixed(2),
    d: d.toFixed(2),
    heat: -(0.1 + g * 1.1) * sf.heat,
    solar: Math.round((2 + g * 38) * sf.solar)
  };
}

/* ── simulation.html 용 ── */
function updateStats(year, season) {
  var s = season || 'summer';
  var idx = calcEcoIndices(year, s);

  var elHeat     = document.getElementById('statHeat');
  var elShannon  = document.getElementById('statShannon');
  var elSolar    = document.getElementById('statSolar');
  var elAnimals  = document.getElementById('statAnimals');
  var elPielou   = document.getElementById('statPielou');
  var elMargalef = document.getElementById('statMargalef');
  var elLabel    = document.getElementById('statSeasonLabel');

  if (elHeat)     elHeat.textContent     = idx.heat.toFixed(1) + '°C';
  if (elShannon)  elShannon.textContent  = idx.H;
  if (elSolar)    elSolar.textContent    = idx.solar + '%';
  if (elAnimals)  elAnimals.textContent  = idx.S + '종';
  if (elPielou)   elPielou.textContent   = idx.J;
  if (elMargalef) elMargalef.textContent = idx.d;
  if (elLabel && SEASON_META[s]) elLabel.textContent = SEASON_META[s].label;
}

function updateAllSeasons(year) {
  SEASONS_LIST.forEach(function (s) { updateOneSeason(s, year); });
  updateAnimalIcons(year);
}

/* simulation.html 계절 카드 동물 아이콘 채우기 */
function updateAnimalIcons(year) {
  var t = Math.max(0, Math.min(1, (year - 2026) / 24));
  SEASONS_LIST.forEach(function (s) {
    var el = document.getElementById('animals-' + s);
    if (!el) return;
    el.innerHTML = '';
    var icons = SEASON_FAUNA_ICONS[s] || [];
    var show = Math.round(icons.length * (0.5 + t * 0.5));
    icons.slice(0, show).forEach(function (pair, i) {
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
  /* 생장 지수 우선순위: data.js의 getAvgGrowthIndex → 로컬 계산 */
  var avgIdx = (typeof getAvgGrowthIndex === 'function' && typeof PLANTS_DATA !== 'undefined' && PLANTS_DATA)
    ? getAvgGrowthIndex(year, season)
    : getAvgGrowthIndexLocal(year, season);
  var pct   = Math.min(100, Math.round(avgIdx || getAvgGrowthIndexLocal(year, season)));
  var color = GROWTH_COLORS[Math.min(Math.floor(pct / 20), 4)];

  var fill  = document.getElementById('growth-' + season);
  var pctEl = document.getElementById('growthPct-' + season);
  if (fill)  { fill.style.width = pct + '%'; fill.style.backgroundColor = color; }
  if (pctEl) pctEl.textContent = pct + '%';

  var blooming = getBloomingPlants(year, season);
  var chipsEl  = document.getElementById('blooming-' + season);
  if (chipsEl && blooming.length > 0) {
    chipsEl.innerHTML = blooming.slice(0, 6).map(function (p) {
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

  var idx        = calcEcoIndices(year, season);
  var topHeat    = document.getElementById('topHeat');
  var topShannon = document.getElementById('topShannon');
  var topPielou  = document.getElementById('topPielou');
  var topMargalef = document.getElementById('topMargalef');
  if (topHeat)     topHeat.textContent     = idx.heat.toFixed(1) + '°C';
  if (topShannon)  topShannon.textContent  = idx.H;
  if (topPielou)   topPielou.textContent   = idx.J;
  if (topMargalef) topMargalef.textContent = idx.d;
}

function getCurrentSeason() {
  return SEASONS_LIST[currentSeasonIdx];
}

/* seasons.html 초기화 */
document.addEventListener('DOMContentLoaded', function () {
  var track = document.getElementById('seasonTrack');
  if (!track) return; /* simulation.html이면 스킵 */

  var params     = new URLSearchParams(location.search);
  var initSeason = params.get('season') || 'spring';
  var idx        = SEASONS_LIST.indexOf(initSeason);
  currentSeasonIdx = idx >= 0 ? idx : 0;

  var btnLeft  = document.getElementById('btnLeft');
  var btnRight = document.getElementById('btnRight');
  if (btnLeft)  btnLeft.addEventListener('click',  function () { changeSeason(-1); });
  if (btnRight) btnRight.addEventListener('click', function () { changeSeason(1); });

  for (var i = 0; i < 4; i++) {
    (function (i) {
      var dot = document.getElementById('dot-' + i);
      if (dot) dot.addEventListener('click', function () { goToSeasonIdx(i); });
    })(i);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  changeSeason(-1);
    if (e.key === 'ArrowRight') changeSeason(1);
  });

  goToSeasonIdx(currentSeasonIdx);

  var year = parseInt(sessionStorage.getItem('year') || '2026');
  if (typeof loadPlantsData === 'function') {
    loadPlantsData().then(function () {
      if (typeof initLoader === 'function') initLoader();
      updateAllSeasons(year);
    }).catch(function () {
      if (typeof initLoader === 'function') initLoader();
      updateAllSeasons(year);
    });
  } else {
    if (typeof initLoader === 'function') initLoader();
    updateAllSeasons(year);
  }
});
