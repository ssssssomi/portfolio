(function(){
  "use strict";

  /* 헤더: 스크롤 전 투명 → 스크롤 시 블러 화이트 */
  var header = document.getElementById('siteHeader');
  var onScroll = function(){
    if (window.scrollY > 24) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 모바일 전체 메뉴 */
  var toggle = document.getElementById('menuToggle');
  var closeBtn = document.getElementById('menuClose');
  var panel = document.getElementById('mobilePanel');

  function openMenu(){
    panel.hidden = false;
    requestAnimationFrame(function(){ panel.classList.add('is-open'); });
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function closeMenu(){
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    toggle.focus();
    window.setTimeout(function(){ panel.hidden = true; }, 320);
  }
  toggle.addEventListener('click', function(){
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });
  closeBtn.addEventListener('click', closeMenu);
  panel.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key !== 'Tab') return;
    var focusables = panel.querySelectorAll('a[href], button:not([disabled])');
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  panel.querySelectorAll('a').forEach(function(link){ link.addEventListener('click', closeMenu); });

  var mq = window.matchMedia('(min-width:1080px)');
  mq.addEventListener('change', function(e){
    if (e.matches) {
      panel.classList.remove('is-open');
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* 헤더 검색 토글 */
  var searchToggle = document.getElementById('searchToggle');
  var searchBox = document.getElementById('searchBox');
  var searchInput = document.getElementById('searchInput');
  searchToggle.addEventListener('click', function(){
    var open = searchBox.classList.toggle('is-open');
    searchToggle.setAttribute('aria-expanded', open);
    searchToggle.setAttribute('aria-label', open ? '검색 닫기' : '검색 열기');
    if (open) searchInput.focus();
    else searchInput.value = '';
  });
  searchInput.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { searchBox.classList.remove('is-open'); searchToggle.setAttribute('aria-expanded','false'); searchToggle.focus(); }
  });
  document.addEventListener('click', function(e){
    if (searchBox.classList.contains('is-open') && !searchBox.contains(e.target) && !searchToggle.contains(e.target)) {
      searchBox.classList.remove('is-open');
      searchToggle.setAttribute('aria-expanded','false');
    }
  });

  /* 인기 판매상품 프로모 배너 슬라이더 */
  var promoSlides = [
    { badge: "신한투자증권", title: "여유로운 은퇴 준비<br>퇴직연금" },
    { badge: "연금", title: "안정적인 노후생활 보장<br>연금저축계좌" },
    { badge: "뱅킹", title: "하루만 맡겨도<br>이자를 받는 CMA" },
    { badge: "뱅킹", title: "달러만 가지고 계신가요?<br>외화 RP 매매" }
  ];
  var promoIdx = 0;
  var promoTitle = document.getElementById('promoTitle');
  var promoBadge = document.getElementById('promoBadge');
  var promoCount = document.getElementById('promoCount');

  function promoRender(){
    var s = promoSlides[promoIdx];
    promoBadge.textContent = s.badge;
    promoTitle.innerHTML = s.title;
    promoCount.textContent = (promoIdx + 1) + " / " + promoSlides.length;
    [promoTitle, promoBadge].forEach(function(el){
      el.classList.remove('is-switching');
      void el.offsetWidth; /* 리플로우로 애니메이션 재시작 */
      el.classList.add('is-switching');
    });
  }
  document.getElementById('promoNext').addEventListener('click', function(){
    promoIdx = (promoIdx + 1) % promoSlides.length;
    promoRender();
  });
  document.getElementById('promoPrev').addEventListener('click', function(){
    promoIdx = (promoIdx - 1 + promoSlides.length) % promoSlides.length;
    promoRender();
  });

  /* 푸터 바로가기 커스텀 셀렉트 (리스트박스 패턴) */
  var qsBtn = document.getElementById('quickSelectBtn');
  var qsPanel = document.getElementById('quickSelectPanel');
  var qsList = document.getElementById('quickSelectList');
  var qsLabel = document.getElementById('quickSelectLabel');
  var qsWrap = document.getElementById('quickSelect');
  var qsGo = document.getElementById('footerQuickGo');
  var qsOptions = Array.prototype.slice.call(qsList.querySelectorAll('[role="option"]'));
  var qsValue = '';

  function qsOpen(){
    qsPanel.hidden = false;
    qsBtn.setAttribute('aria-expanded','true');
    var cur = qsList.querySelector('[aria-selected="true"]') || qsOptions[0];
    cur.focus();
  }
  function qsClose(focusBtn){
    qsPanel.hidden = true;
    qsBtn.setAttribute('aria-expanded','false');
    if (focusBtn) qsBtn.focus();
  }
  function qsPick(opt){
    qsOptions.forEach(function(o){ o.setAttribute('aria-selected','false'); });
    opt.setAttribute('aria-selected','true');
    qsLabel.textContent = opt.textContent;
    qsLabel.removeAttribute('data-placeholder');
    qsValue = opt.getAttribute('data-value') || '';
    qsClose(true);
  }
  qsBtn.addEventListener('click', function(){
    qsPanel.hidden ? qsOpen() : qsClose(true);
  });
  qsOptions.forEach(function(opt){
    opt.addEventListener('click', function(){ qsPick(opt); });
    opt.addEventListener('keydown', function(e){
      var i = qsOptions.indexOf(opt);
      if (e.key === 'ArrowDown'){ e.preventDefault(); (qsOptions[i+1] || qsOptions[0]).focus(); }
      else if (e.key === 'ArrowUp'){ e.preventDefault(); (qsOptions[i-1] || qsOptions[qsOptions.length-1]).focus(); }
      else if (e.key === 'Home'){ e.preventDefault(); qsOptions[0].focus(); }
      else if (e.key === 'End'){ e.preventDefault(); qsOptions[qsOptions.length-1].focus(); }
      else if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); qsPick(opt); }
      else if (e.key === 'Escape'){ qsClose(true); }
      else if (e.key === 'Tab'){ qsClose(false); }
    });
  });
  document.addEventListener('click', function(e){
    if (!qsWrap.contains(e.target) && !qsPanel.hidden) qsClose(false);
  });
  qsGo.addEventListener('click', function(){
    if (qsValue) window.location.href = qsValue;
    else qsOpen();
  });
})();
