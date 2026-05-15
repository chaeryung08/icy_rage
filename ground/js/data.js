/* ── data.js : plants.json 로드 ──
 * plants.json을 fetch로 불러와서 전역변수에 저장
 */
let PLANTS_DATA = null;

async function loadPlantsData() {
  try {
    const res = await fetch('src_plants/plants.json');
    PLANTS_DATA = await res.json();
    console.log('식물 데이터 로드 완료:', Object.keys(PLANTS_DATA.baseInfo).length, '종');
  } catch (e) {
    console.warn('plants.json 로드 실패, 기본값 사용');
    PLANTS_DATA = { baseInfo: {}, yearData: {} };
  }
}

// 해당 연도에 가장 가까운 데이터 연도 반환 (2026~2050 짝수)
function getNearestYear(year) {
  const available = [2026, 2028, 2030, 2032, 2034, 2036, 2038, 2040, 2042, 2044, 2046, 2048, 2050];
  if (year <= 2026) return '2026';
  if (year >= 2050) return '2050';
  // 올림 처리 (2027 → 2028)
  const found = available.find(y => y >= year);
  return String(found || 2050);
}

// 해당 연도+계절 식물 데이터 반환
function getPlantsForYearSeason(year, season) {
  if (!PLANTS_DATA) return [];
  const yr = getNearestYear(year);
  const data = PLANTS_DATA.yearData[yr];
  if (!data) return [];
  return data.map(p => ({
    ...p,
    seasonData: p[season]
  }));
}

// 평균 생장 지수 계산
function getAvgGrowthIndex(year, season) {
  const plants = getPlantsForYearSeason(year, season);
  if (!plants.length) return 0;
  const sum = plants.reduce((acc, p) => {
    const idx = p.seasonData?.growthIndex;
    return acc + (typeof idx === 'number' ? idx : 0);
  }, 0);
  return sum / plants.length;
}

// 개화 중인 식물 목록
function getBloomingPlants(year, season) {
  return getPlantsForYearSeason(year, season)
    .filter(p => p.seasonData?.bloom)
    .map(p => ({ name: p.name, honey: p.honey }));
}