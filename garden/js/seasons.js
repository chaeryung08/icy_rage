/* ── seasons.js : 생장 바 & 수치 업데이트 ──
 *
 * 사용 모델: 로지스틱 생장 모델 (plants.js 참조)
 * 열섬 완화: 천홍쿤(2022) Envi-Met 연구 기준 최대 –2.6°C
 * 태양복사: 옥상녹화 연구 기준 최대 58% 감소
 * Shannon H': 현재 3.8 → 2050년 최대 4.3 예측
 */

// 생장 단계 색상
const GROWTH_COLORS = ['#E8F5A3','#B8E04A','#78C028','#3E8C14','#1A5C0A'];

// 수치 업데이트
function updateStats(year) {
  const t = (year - 2025) / 25; // 0~1

  // 로지스틱 곡선으로 부드럽게 증가
  const growth = logistic(t, 0.18, 0.5);

  // 열섬 완화 (최대 –2.6°C)
  const heat = (growth * 2.6).toFixed(1);
  document.getElementById('statHeat').textContent = `–${heat}°C`;

  // Shannon H' (3.8 → 4.3)
  const shannon = (3.8 + growth * 0.5).toFixed(2);
  document.getElementById('statShannon').textContent = shannon;

  // 태양복사 감소 (최대 58%)
  const solar = Math.round(growth * 58);
  document.getElementById('statSolar').textContent = `${solar}%`;
}

// 각 계절 카드 생장 바 업데이트
function updateGrowthBars(year) {
  const t = (year - 2025) / 25;
  const pct = Math.round(logistic(t, 0.18, 0.5) * 100);

  // 생장 단계 색상 결정
  const colorIdx = Math.min(Math.floor(pct / 20), 4);
  const color = GROWTH_COLORS[colorIdx];

  ['spring','summer','autumn','winter'].forEach(season => {
    const bar = document.getElementById(`growth-${season}`);
    if (!bar) return;
    bar.style.width = `${pct}%`;
    bar.style.backgroundColor = color;
  });
}

// 로지스틱 함수
// H(t) = 1 / (1 + e^(-k*(t-t0)))
// 과학적 근거: Verhulst(1838) 생태학 표준 생장 모델
function logistic(t, k, t0) {
  return 1 / (1 + Math.exp(-k * 10 * (t - t0)));
}