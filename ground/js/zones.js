/* ── zones.js : 구역 클릭 팝업 (ground) ──
 *
 * 구역 3개 (스케치 기반):
 *   1 — 외곽 생태 링
 *   2 — 중앙 교목 군락
 *   3 — 암석 건생 구역
 */

const ZONE_INFO = {
  '1': {
    name: '구역 1 — 외곽 생태 링',
    desc: '정원 외곽을 둘러싸는 초화·관목 군락. 하천 수공간에 인접하며 계절마다 다양한 꽃이 이어져 핀다.',
    plants: [
      '삼각수목', '애기아주까리', '산사초', '선인장', '타가수목',
      '금낭화', '산채비름', '세네시아', '수선화', '화지',
      '쑥 모로스', '천엽충', '바리미나', '에란', '크마들',
      '코더이드', '아산파라서', '이끼류', '전복초', '금다순',
      '워가족', '항새여덟'
    ]
  },
  '2': {
    name: '구역 2 — 중앙 교목 군락',
    desc: '정원 중심부의 교목·관목 군락. 수고형 나무들이 그늘을 형성하고 조류·곤충 서식지 역할을 한다.',
    plants: [
      '사명안개나무', '그린라이온', '항궁클나석', '산클나무',
      '흥꽃풀', '드윈보러씨', '벚나무', '먹나무',
      '참나무', '매비들이', '명화나무'
    ]
  },
  '3': {
    name: '구역 3 — 암석 건생 구역',
    desc: '암석 지형을 활용한 건생 식물 군락. 척박한 환경에 적응한 식물들이 경관석과 어우러져 자란다.',
    plants: [
      '족단화', '유담자작나무', '흰말채나무', '향나무',
      '선만초', '하산나무', '원많채나무',
      '삼지락나무', '항박복나무', '원망가자니가'
    ]
  }
};

function openZonePopup(zoneId, season) {
  const info = ZONE_INFO[String(zoneId)];
  if (!info) return;

  const year = typeof currentYear !== 'undefined'
    ? currentYear
    : parseInt(sessionStorage.getItem('year') || '2026');

  /* 생장 달성률 */
  const growth = (typeof getGrowthInfo === 'function')
    ? getGrowthInfo(zoneId, year)
    : calcDefaultGrowth(zoneId, year);

  /* 계절 개화 식물 (plants.json 연동, 없으면 빈 배열) */
  const blooming = (typeof getBloomingPlants === 'function')
    ? getBloomingPlants(year, season).filter(p => info.plants.includes(p.name))
    : [];

  document.getElementById('popupZone').textContent = `구역 ${zoneId}`;
  document.getElementById('popupTitle').textContent = info.name;
  document.getElementById('popupBody').innerHTML = `
    <p style="font-size:12px;color:#999;margin-bottom:10px">${info.desc}</p>

    <p style="font-size:12px;font-weight:500;margin-bottom:4px;color:#333">
      주요 식물 (${info.plants.length}종)
    </p>
    <p style="font-size:12px;color:#555;line-height:1.8;margin-bottom:10px">
      ${info.plants.join(' · ')}
    </p>

    ${blooming.length ? `
    <p style="font-size:12px;font-weight:500;margin-bottom:4px;color:#e91e63">
      🌸 이번 계절 개화 중 (${blooming.length}종)
    </p>
    <p style="font-size:12px;color:#e91e63;margin-bottom:10px">
      ${blooming.map(p => p.honey ? `🍯${p.name}` : p.name).join(' · ')}
    </p>` : ''}

    <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#777;margin-bottom:4px">
      <span>${year}년 생장 달성률</span>
      <div style="flex:1;height:6px;background:#eee;border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${growth.percent}%;background:${growth.color};
                    border-radius:3px;transition:width 0.6s"></div>
      </div>
      <span style="font-weight:600;color:#333">${growth.percent}%</span>
    </div>
    <p style="font-size:11px;color:#aaa">${growth.label} (${growth.stage}단계)</p>
  `;

  document.getElementById('popupOverlay').classList.add('active');
}

/* getGrowthInfo 없을 때 사용하는 기본 계산 */
function calcDefaultGrowth(zoneId, year) {
  const t = Math.max(0, Math.min(1, (year - 2026) / 24));
  const g = 1 / (1 + Math.exp(-8 * (t - 0.5)));
  const base = { '1': 60, '2': 72, '3': 55 }[String(zoneId)] || 60;
  const pct = Math.min(100, Math.round(base * (0.88 + g * 0.22)));
  const colors = ['#E8F5A3', '#B8E04A', '#78C028', '#3E8C14', '#1A5C0A'];
  const stages = ['초기 정착', '생육 시작', '군락 형성', '성숙 단계', '극상 군락'];
  const si = Math.min(4, Math.floor(pct / 20));
  return { percent: pct, color: colors[si], label: stages[si], stage: si + 1 };
}

function closePopup() {
  document.getElementById('popupOverlay').classList.remove('active');
}
