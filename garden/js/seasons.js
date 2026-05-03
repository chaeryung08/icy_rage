/* ── seasons.js : 사계절 카드 제어 ──
 *
 * 호버 → 확대 (expandCard / collapseCard)
 * 연도 변경 → 계절별 개화 식물 정보 업데이트
 */

// 계절별 주요 개화 식물 (별빛 정원 기준)
// TODO: plants.json 데이터 연동 후 동적으로 변경
const SEASON_PLANTS = {
  spring: {
    label: '봄 개화',
    plants: ['영춘화', '진달래', '수수꽃다리', '공조팝'],
    color: '#f48fb1'
  },
  summer: {
    label: '여름 개화',
    plants: ['에키네시아', '가우라', '원추리', '리아트리스', '블루엔젤'],
    color: '#81c784'
  },
  autumn: {
    label: '가을 개화',
    plants: ['구절초', '층꽃', '두메부추'],
    color: '#ffb74d'
  },
  winter: {
    label: '상록 유지',
    plants: ['눈향', '에메랄드그린', '황금측백', '은쑥'],
    color: '#90caf9'
  }
};

function initSeasons() {
  // 초기 렌더
  ['spring','summer','autumn','winter'].forEach(s => renderSeasonInfo(s, 2025));
}

function renderSeasonInfo(season, year) {
  const el = document.getElementById(`info-${season}`);
  if (!el) return;
  const data = SEASON_PLANTS[season];
  // 연도에 따라 개화 식물 수 증가 표현 (2년마다 1종씩 추가)
  const bonus = Math.floor((year - 2025) / 4);
  const count = data.plants.length + bonus;
  el.innerHTML = `<span style="color:${data.color};font-weight:600">${data.label}</span>
    <br>주요 식물 약 ${count}종 활성`;
}

function updateSeasonInfo(year) {
  ['spring','summer','autumn','winter'].forEach(s => renderSeasonInfo(s, year));
}

// 호버 확대
function expandCard(card) {
  // 다른 카드 축소
  document.querySelectorAll('.season-card').forEach(c => c.classList.remove('expanded'));
  card.classList.add('expanded');

  // 해당 계절 캔버스 그리기
  const season = card.dataset.season;
  drawGardenCanvas(season, currentYear);
}

function collapseCard(card) {
  card.classList.remove('expanded');
}

/* ── 탑뷰 정원 캔버스 그리기 ──
 *
 * 별빛 정원 ㄱ자 형태를 Canvas 2D API로 표현
 * 구역별 색상 = 생장 단계 색상 (plants.js 에서 가져옴)
 *
 * 과학적 원리:
 *   생장 단계 색상(연노랑→짙은 초록)은 로지스틱 생장 모델 결과값
 *   열섬 완화 효과는 녹지 피복률에 비례 (천홍쿤, 2022)
 */
function drawGardenCanvas(season, year) {
  const canvas = document.getElementById(`canvas-${season}`);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W;
  canvas.height = H;

  ctx.clearRect(0, 0, W, H);

  // 계절 배경
  const seasonBg = {
    spring: '#fce4ec',
    summer: '#e8f5e9',
    autumn: '#fff8e1',
    winter: '#e3f2fd'
  };
  ctx.fillStyle = seasonBg[season];
  ctx.fillRect(0, 0, W, H);

  // 생장 단계 가져오기 (plants.js 에서 계산)
  const growthColors = getGrowthColors(year);

  // ── 정원 ㄱ자 형태 그리기 ──
  // 상단 가로 구역 (Site B + Site C)
  drawZone(ctx, W*0.05, H*0.05, W*0.9,  H*0.45, growthColors.B, 'B', season);
  // 하단 세로 구역 (Site A)
  drawZone(ctx, W*0.05, H*0.5,  W*0.45, H*0.44, growthColors.A, 'A', season);
  // 우측 구역 (Site D)
  drawZone(ctx, W*0.52, H*0.15, W*0.42, H*0.25, growthColors.D, 'D', season);
  // 중앙 커뮤니티 (Site C)
  drawZone(ctx, W*0.25, H*0.28, W*0.45, H*0.2,  growthColors.C, 'C', season);

  // 산책로 (회색)
  ctx.fillStyle = 'rgba(200,200,200,0.5)';
  ctx.beginPath();
  ctx.roundRect(W*0.18, H*0.22, W*0.64, H*0.08, 6);
  ctx.fill();

  // 건물 벽 표시
  ctx.fillStyle = 'rgba(180,160,140,0.4)';
  ctx.fillRect(0, 0, W, H*0.04);
  ctx.fillRect(0, 0, W*0.04, H);
}

function drawZone(ctx, x, y, w, h, color, zoneId, season) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.restore();

  // 구역 이름
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.font = `bold ${Math.max(10, w*0.08)}px sans-serif`;
  ctx.fillText(`Site ${zoneId}`, x + 8, y + 18);
}