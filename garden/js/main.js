/* main.js */
var currentYear = 2026;

document.addEventListener('DOMContentLoaded', function() {

  /* 슬라이더 */
  var slider = document.getElementById('yearSlider');
  var display = document.getElementById('currentYear');

  if (slider) {
    slider.addEventListener('input', function() {
      currentYear = parseInt(slider.value);
      if (display) display.textContent = currentYear + '년';
      updateAll(currentYear);
    });
  }

  /* < > 버튼 */
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');
  if (btnPrev) {
    btnPrev.addEventListener('click', function() {
      currentYear = Math.max(2026, currentYear - 2);
      if (slider) slider.value = currentYear;
      if (display) display.textContent = currentYear + '년';
      updateAll(currentYear);
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', function() {
      currentYear = Math.min(2050, currentYear + 2);
      if (slider) slider.value = currentYear;
      if (display) display.textContent = currentYear + '년';
      updateAll(currentYear);
    });
  }

  /* 계절 카드 호버 확대 + 클릭 이동 */
  var seasons = ['spring', 'summer', 'autumn', 'winter'];
  seasons.forEach(function(season) {
    var card = document.getElementById('card-' + season);
    if (!card) return;

    card.addEventListener('mouseenter', function() {
      seasons.forEach(function(s) {
        var c = document.getElementById('card-' + s);
        if (c) c.classList.remove('expanded');
      });
      card.classList.add('expanded');
    });

    card.addEventListener('mouseleave', function() {
      card.classList.remove('expanded');
    });

    card.addEventListener('click', function() {
      sessionStorage.setItem('year', currentYear);
      window.location.href = 'seasons.html?season=' + season;
    });
  });

  /* 초기 업데이트 */
  updateAll(2026);
});

function updateAll(year) {
  currentYear = year;
  if (typeof updateStats === 'function') updateStats(year);
  if (typeof updateAllSeasons === 'function') updateAllSeasons(year);
  var toast = document.getElementById('conclusionToast');
  if (toast && year >= 2050) toast.classList.add('show');
}