/* ── seasons.js : 생장 바 & 수치 업데이트 ──
 *
 * plants.json 실제 데이터 연동
 * 생장 지수: GDD 기반 로지스틱 모델 (plants.js)
 * 열섬 완화: 천홍쿤(2022) 최대 –2.6°C
 * 태양복사: 옥상녹화 연구 최대 58% 감소
 * Shannon H': 3.8 → 4.3 (2025→2050)
 */

const GROWTH_COLORS = ['#E8F5A3','#B8E04A','#78C028','#3E8C14','#1A5C0A'];

// 상단 수치 업데이트
function updateStats(year) {
  const t = Math.max(0, Math.min(1, (year-2025)/25));
  const g = logisticSimple(t);

  const heatEl    = document.getElementById('statHeat');
  const shannonEl = document.getElementById('statShannon');
  const solarEl   = document.getElementById('statSolar');

  if (heatEl)    heatEl.textContent    = `–${(g*2.6).toFixed(1)}°C`;
  if (shannonEl) shannonEl.textContent = (3.8 + g*0.5).toFixed(2);
  if (solarEl)   solarEl.textContent   = `${Math.round(g*58)}%`;
}

// 모든 계절 업데이트
function updateAllSeasons(year) {
  ['spring','summer','autumn','winter'].forEach(s => updateOneSeason(s, year));
}

// 계절 하나 업데이트
function updateOneSeason(season, year) {
  // plants.json 실제 생장 지수 사용
  const avgIdx = getAvgGrowthIndex(year, season);
  const pct    = Math.min(100, Math.round(avgIdx));
  const color  = GROWTH_COLORS[Math.min(Math.floor(pct/20), 4)];

  // 생장 바
  const fill  = document.getElementById(`growth-${season}`);
  const pctEl = document.getElementById(`growthPct-${season}`);
  if (fill)  { fill.style.width = `${pct}%`; fill.style.backgroundColor = color; }
  if (pctEl) pctEl.textContent = `${pct}%`;

  // 개화 식물 칩
  const blooming = getBloomingPlants(year, season);
  const chipsEl  = document.getElementById(`blooming-${season}`);
  if (chipsEl) {
    chipsEl.innerHTML = blooming.slice(0,6).map(p =>
      `<span class="bloom-chip${p.honey?' honey':''}">${p.name}</span>`
    ).join('');
  }

  // TODO: 동물 자료 오면 animal-layer 업데이트
}

// 단순 로지스틱 (수치 계산용)
function logisticSimple(t) {
  return 1 / (1 + Math.exp(-8*(t-0.5)));
}