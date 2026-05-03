/* ── zones.js : 구역 클릭 & 팝업 제어 ── */

// 구역별 식물 정보
// TODO: plants.json 연동 후 이 데이터를 동적으로 불러오기
const ZONE_DATA = {
  A: {
    name: 'Site A — 습지 생태계 공간',
    desc: '멸종위기종 및 다양한 습지식물을 관찰할 수 있는 공간',
    plants: ['조름나물','독미나리','두메부추','골풀','꽃창포','긴산꼬리풀','배초향','부처꽃','붓꽃','물레나물'],
    type: '습지·음지형'
  },
  B: {
    name: 'Site B — 초지 생태계 공간',
    desc: '다양한 교관목 및 그래스, 초화류를 만날 수 있는 공간',
    plants: ['남천','배롱나무','미스김라일락','영춘화','에메랄드그린','실유카','삼색조팝','홍가시나무','은쑥','백리향','홍지네고사리','휴케라','베르가못','아주가','노루오줌'],
    type: '초지·관목형'
  },
  C: {
    name: 'Site C — 커뮤니티 공간',
    desc: '습지 및 비오톱을 관찰하고 휴식할 수 있는 커뮤니티 공간',
    plants: ['목수국','낙상홍','흰말채나무','조름나물','독미나리','골풀','긴산꼬리풀','꽃범의꼬리','부처꽃','붓꽃','돌단풍','은사초'],
    type: '관찰·커뮤니티형'
  },
  D: {
    name: 'Site D — 세덤 정원',
    desc: '겨울에도 상록성을 띠는 세덤 식물 군락지',
    plants: ['블루엔젤','공조팝','세잎꿩의비름','상록기린초','두메부추','애기기린초','땅채송화','블루솔','알붐'],
    type: '세덤·상록형'
  }
};

function initZones() {
  document.querySelectorAll('.zone-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      const zone = tag.dataset.zone;
      openPopup(zone);
    });
  });
}

function openPopup(zoneId) {
  const data = ZONE_DATA[zoneId];
  const year = currentYear;

  // 생장 단계 계산 (plants.js)
  const growthInfo = getGrowthInfo(zoneId, year);

  // 팝업 내용 채우기
  document.getElementById('popupZone').textContent = `Site ${zoneId} · ${data.type}`;
  document.getElementById('popupTitle').textContent = data.name;

  document.getElementById('popupPlants').innerHTML =
    `<p style="margin-bottom:4px;font-weight:500;color:#333">주요 식물 (${data.plants.length}종)</p>
     <p>${data.plants.join(' · ')}</p>
     <p style="margin-top:6px;font-size:11px;color:#999">${data.desc}</p>`;

  document.getElementById('popupGrowth').innerHTML =
    `<span class="growth-label">${year}년 생장</span>
     <div class="growth-bar">
       <div class="growth-fill"
            style="width:${growthInfo.percent}%;
                   background:${growthInfo.color}">
       </div>
     </div>
     <span class="growth-label" style="text-align:right">${growthInfo.stage}단계</span>`;

  // 팝업 열기
  document.getElementById('popupOverlay').classList.add('active');
}

function closePopup() {
  document.getElementById('popupOverlay').classList.remove('active');
}