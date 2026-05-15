/* ── zones.js : 구역 클릭 팝업 ──
 *
 * 팝업 내용:
 *   - 구역 이름/설명
 *   - 해당 계절에 개화 중인 식물 (plants.json 연동)
 *   - 생장 달성률 (plants.js 로지스틱 모델)
 *   - TODO: 동물 자료 오면 추가
 */

const ZONE_INFO = {
  A: {
    name: 'Site A — 습지 생태계',
    desc: '멸종위기종 및 다양한 습지식물 관찰 공간',
    plants: ['조름나물', '독미나리', '두메부추', '골풀', '꽃창포',
      '긴산꼬리풀', '배초향', '부처꽃', '붓꽃', '물레나물', '히어리', '너도개미자리']
  },
  B: {
    name: 'Site B — 초지 생태계',
    desc: '교관목 및 그래스, 초화류 공간',
    plants: ['배롱나무', '남천', '미스김라일락', '영춘화', '에메랄드 그린',
      '실유카', '삼색조팝', '홍가시나무', '은쑥', '백리향',
      '홍지네고사리', '휴케라', '베르가못', '아주가', '노루오줌']
  },
  C: {
    name: 'Site C — 커뮤니티 공간',
    desc: '습지·비오톱 관찰 및 휴식 공간',
    plants: ['목수국', '낙상홍', '흰말채나무', '꽃범의꼬리', '돌단풍', '은사초']
  },
  D: {
    name: 'Site D — 세덤 정원',
    desc: '겨울에도 상록성을 띠는 세덤 군락지',
    plants: ['블루엔젤', '공조팝', '세잎꿩의비름', '상록기린초',
      '애기기린초', '땅채송화', '블루솔', '알붐']
  }
};

function openZonePopup(zoneId, season) {
  const info = ZONE_INFO[zoneId];
  if (!info) return;

  // 현재 연도 (seasons.html or simulation.html)
  const year = typeof currentYear !== 'undefined'
    ? currentYear
    : parseInt(sessionStorage.getItem('year') || '2025');

  // 생장 달성률 (plants.js)
  const growth = getGrowthInfo(zoneId, year);

  // 해당 계절 개화 식물 (plants.json)
  const blooming = getBloomingPlants(year, season)
    .filter(p => info.plants.includes(p.name));

  // 팝업 내용 구성
  document.getElementById('popupZone').textContent = `Site ${zoneId}`;
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

    <!-- TODO: 동물 자료 오면 여기에 추가 -->
  `;

  document.getElementById('popupOverlay').classList.add('active');
}

function closePopup() {
  document.getElementById('popupOverlay').classList.remove('active');
}