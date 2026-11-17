/* SO MI GYEONG — Portfolio v2 */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* 1. 스크롤 등장 효과 — 화면에 들어온 요소에만 .is-in 부여 */
  var items = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* 2. 프로젝트 "자세히 보기" — aria-expanded와 hidden을 함께 토글 */
  document.querySelectorAll('[data-toggle]').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    var label = btn.firstChild; // 보이는 텍스트 노드
    if (!panel) return;

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
      label.nodeValue = open ? '자세히 보기' : '접기';
    });
  });

  /* 3. 테이프 문구 채우기 — 한 바퀴 분량이 테이프 폭보다 길어야 흐름이 끊기지 않는다 */
  document.querySelectorAll('.tape-track').forEach(function (track) {
    var unit = track.innerHTML;          // 마크업에는 같은 묶음이 2번 들어 있다
    var tapeW = track.parentElement.offsetWidth;
    var guard = 0;
    while (track.scrollWidth / 2 < tapeW && guard < 8) {
      track.innerHTML += unit;
      guard++;
    }
    track.innerHTML += track.innerHTML; // 앞 절반 = 뒤 절반 → -50% 이동 시 이음매 없음
  });

  /* 4. 탭 키로 숨겨진 등장 요소에 들어가면 바로 보이게 */
  document.addEventListener('focusin', function (e) {
    var rv = e.target.closest && e.target.closest('.rv');
    if (rv) rv.classList.add('is-in');
  });
})();
