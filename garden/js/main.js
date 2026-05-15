/* main.js */
var currentYear = 2026;
var currentHoverSeason = null;

<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', function() {
=======
document.addEventListener('DOMContentLoaded', function () {
>>>>>>> 1eee942 (5차 수정)

  /* 슬라이더 */
  var slider = document.getElementById('yearSlider');
  var display = document.getElementById('currentYear');

  if (slider) {
<<<<<<< HEAD
    slider.addEventListener('input', function() {
=======
    slider.addEventListener('input', function () {
>>>>>>> 1eee942 (5차 수정)
      currentYear = parseInt(slider.value);
      if (display) display.textContent = currentYear + '년';
      updateAll(currentYear, currentHoverSeason);
    });
  }

  /* < > 버튼 */
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');
  if (btnPrev) {
<<<<<<< HEAD
    btnPrev.addEventListener('click', function() {
=======
    btnPrev.addEventListener('click', function () {
>>>>>>> 1eee942 (5차 수정)
      currentYear = Math.max(2026, currentYear - 2);
      if (slider) slider.value = currentYear;
      if (display) display.textContent = currentYear + '년';
      updateAll(currentYear, currentHoverSeason);
    });
  }
  if (btnNext) {
<<<<<<< HEAD
    btnNext.addEventListener('click', function() {
=======
    btnNext.addEventListener('click', function () {
>>>>>>> 1eee942 (5차 수정)
      currentYear = Math.min(2050, currentYear + 2);
      if (slider) slider.value = currentYear;
      if (display) display.textContent = currentYear + '년';
      updateAll(currentYear, currentHoverSeason);
    });
  }

  /* 계절 카드 호버 확대 + 클릭 이동 */
  var seasons = ['spring', 'summer', 'autumn', 'winter'];
<<<<<<< HEAD
  seasons.forEach(function(season) {
    var card = document.getElementById('card-' + season);
    if (!card) return;

    card.addEventListener('mouseenter', function() {
      seasons.forEach(function(s) {
=======
  seasons.forEach(function (season) {
    var card = document.getElementById('card-' + season);
    if (!card) return;

    card.addEventListener('mouseenter', function () {
      seasons.forEach(function (s) {
>>>>>>> 1eee942 (5차 수정)
        var c = document.getElementById('card-' + s);
        if (c) c.classList.remove('expanded');
      });
      card.classList.add('expanded');
    });

<<<<<<< HEAD
    card.addEventListener('mouseleave', function() {
      card.classList.remove('expanded');
    });

    card.addEventListener('click', function() {
=======
    card.addEventListener('mouseleave', function () {
      card.classList.remove('expanded');
    });

    card.addEventListener('click', function () {
>>>>>>> 1eee942 (5차 수정)
      sessionStorage.setItem('year', currentYear);
      window.location.href = 'seasons.html?season=' + season;
    });
  });

  /* 초기 업데이트 */
  updateAll(2026, 'spring');
});

/* 카드 hover 시 해당 계절 stats 반영 */
function expandCard(el) {
  var season = el && el.id ? el.id.replace('card-', '') : null;
  if (!season) return;
  currentHoverSeason = season;
  if (typeof updateStats === 'function') updateStats(currentYear, season);
}

function collapseCard(el) {
  var season = el && el.id ? el.id.replace('card-', '') : null;
  currentHoverSeason = null;
  /* hover 해제 후 가장 먼저 나타난 계절(봄)로 복원 */
  if (typeof updateStats === 'function') updateStats(currentYear, 'spring');
}

function updateAll(year, season) {
  currentYear = year;
  if (typeof updateStats === 'function') updateStats(year, season || 'spring');
  if (typeof updateAllSeasons === 'function') updateAllSeasons(year);
  var toast = document.getElementById('conclusionToast');
  if (toast && year >= 2050) toast.classList.add('show');
<<<<<<< HEAD
}
=======
}
>>>>>>> 1eee942 (5차 수정)
