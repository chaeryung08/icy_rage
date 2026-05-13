/* ── main.js : 전체 제어 ── */

let currentYear = 2025;

document.addEventListener('DOMContentLoaded', () => {
    initTimeline();
    updateAll(2025);
});

function updateAll(year) {
    currentYear = year;
    updateStats(year);
    updateGrowthBars(year);
    // TODO: 동물 자료 오면 아래 주석 해제
    // updateAnimals(year);

    // 2050 도달 시 conclusion으로 이동
    if (year >= 2050) {
        setTimeout(() => {
            window.location.href = 'conclusion.html';
        }, 800);
    }
}

// 계절 페이지로 이동
function goToSeason(season) {
    // 현재 연도 저장 후 이동
    sessionStorage.setItem('year', currentYear);
    window.location.href = `${season}.html`;
}

// 카드 호버
function expandCard(card) {
    document.querySelectorAll('.season-card').forEach(c => c.classList.remove('expanded'));
    card.classList.add('expanded');
}
function collapseCard(card) {
    card.classList.remove('expanded');
}