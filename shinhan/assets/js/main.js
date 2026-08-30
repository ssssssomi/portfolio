(function(){
  "use strict";

  /* ======================================================================
     헤더: 스크롤 전 투명 → 스크롤 시 블러 화이트 + 진행률 바
     ====================================================================== */
  var header = document.getElementById('siteHeader');
  var progress = document.getElementById('scrollProgress');
  var ticking = false;

  function paintScroll(){
    var y = window.scrollY;
    if (y > 24) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }
    ticking = false;
  }
  document.addEventListener('scroll', function(){
    if (!ticking) { ticking = true; window.requestAnimationFrame(paintScroll); }
  }, { passive: true });
  paintScroll();

  /* ======================================================================
     스크롤 리빌
     ====================================================================== */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealTargets = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function(el){ el.classList.add('is-in'); });
  } else {
    var revealIO = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        var siblings = Array.prototype.slice.call(en.target.parentNode.children);
        var order = Math.min(siblings.indexOf(en.target), 5);
        en.target.style.transitionDelay = (order * 70) + 'ms';
        en.target.classList.add('is-in');
        revealIO.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(function(el){ revealIO.observe(el); });
  }

  /* ======================================================================
     모바일 전체 메뉴
     ====================================================================== */
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

  /* ======================================================================
     헤더 검색 토글
     ====================================================================== */
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

  /* ======================================================================
     마켓 데이터
     · KOSPI/KOSDAQ 종가는 2026.07.28 기준, 나머지는 시안용 예시 데이터
     ====================================================================== */
  var KOSPI_LABELS = ['07.01','07.02','07.03','07.06','07.07','07.08','07.09','07.10','07.13','07.14',
                      '07.15','07.16','07.17','07.20','07.21','07.22','07.23','07.24','07.27','07.28'];
  var KOSPI_VALUES = [6180.22,6244.10,6210.55,6301.87,6388.40,6352.19,6427.66,6510.03,6588.71,6640.25,
                      6712.90,6690.44,6775.18,6842.37,6901.55,6870.12,6812.44,6788.90,6755.75,6023.66];
  var KOSDAQ_VALUES = [742.10,749.30,745.88,752.61,758.90,754.22,760.15,766.44,772.80,778.05,
                       783.66,780.12,788.40,794.20,799.55,792.30,781.44,774.90,764.86,705.85];

  var VOLUME = [
    { label:'1주', value:9.8 }, { label:'2주', value:8.6 }, { label:'3주', value:11.4 }, { label:'4주', value:12.9 },
    { label:'5주', value:10.2 }, { label:'6주', value:12.1 }, { label:'7주', value:13.3 }, { label:'8주', value:14.2 }
  ];

  var ALLOC = [
    { label:'국내주식',  value:38, color:'#4C7DFF' },
    { label:'해외주식',  value:24, color:'#7C6FF0' },
    { label:'펀드·ETF',  value:18, color:'#00BFA5' },
    { label:'채권·RP',   value:12, color:'#F5A623' },
    { label:'연금',      value:8,  color:'#FF7A9C' }
  ];

  var ONLINE = [
    { label:'23.01', value:1.1 }, { label:'23.07', value:2.0 }, { label:'24.01', value:3.4 },
    { label:'24.07', value:6.2 }, { label:'25.01', value:9.5 }, { label:'25.07', value:13.2 },
    { label:'26.01', value:19.2 }
  ];

  var SPARKS = {
    heroKospi: { data: KOSPI_VALUES, up: false },
    kospi:     { data: KOSPI_VALUES, up: false },
    kosdaq:    { data: KOSDAQ_VALUES, up: false },
    's-005930': { data: [254,256,253,258,261,259,262,264,260,258,254,220], up:false },
    's-000660': { data: [1780,1802,1795,1830,1845,1861,1874,1852,1840,1828,1816,1550], up:false },
    's-402340': { data: [1050,1062,1058,1075,1088,1096,1104,1090,1078,1064,1096,925], up:false },
    's-009150': { data: [1260,1272,1268,1285,1298,1310,1322,1308,1296,1284,1325,1114], up:false },
    'u-1': { data: [2620,2640,2610,2680,2740,2790,2860,2900,2980,3010,3035,3945], up:true },
    'u-2': { data: [1290,1300,1288,1310,1332,1350,1372,1390,1412,1425,1433,1862], up:true },
    'u-3': { data: [4980,5010,4990,5060,5120,5180,5230,5280,5320,5330,5330,6920], up:true },
    'u-4': { data: [4460,4480,4470,4520,4560,4600,4640,4680,4720,4760,4810,5800], up:true }
  };

  /* ======================================================================
     차트 렌더
     ====================================================================== */
  if (window.ssCharts) {
    var C = window.ssCharts;

    /* 스파크라인 */
    document.querySelectorAll('[data-spark]').forEach(function(host){
      var cfg = SPARKS[host.getAttribute('data-spark')];
      if (cfg) C.spark(host, cfg.data, cfg.up);
    });

    /* KOSPI 추이 + 기간 탭 */
    var kospiHost = document.querySelector('[data-chart="kospi"]');
    if (kospiHost) {
      var drawKospi = function(count){
        C.line(kospiHost, {
          data: KOSPI_LABELS.slice(-count).map(function(l, i){
            return { label: l, value: KOSPI_VALUES.slice(-count)[i] };
          }),
          accent: '#4C7DFF',
          accent2: '#94ABFA',
          decimals: 2,
          yTicks: 4,
          yFormat: function(v){ return C.fmt(v, 0); },
          label: 'KOSPI 최근 추이 그래프. 자세한 수치는 아래 요약을 참고하세요.'
        });
        kospiHost.querySelector('svg').setAttribute('aria-describedby', 'kospiSummary');
      };
      drawKospi(20);

      var rangeBtns = document.querySelectorAll('.ss-chart-range button');
      rangeBtns.forEach(function(btn){
        btn.addEventListener('click', function(){
          rangeBtns.forEach(function(b){ b.classList.remove('is-on'); b.setAttribute('aria-pressed', 'false'); });
          btn.classList.add('is-on');
          btn.setAttribute('aria-pressed', 'true');
          drawKospi(parseInt(btn.getAttribute('data-range'), 10));
        });
      });
    }

    /* 포트폴리오 구성 도넛 */
    var allocHost = document.querySelector('[data-chart="alloc"]');
    if (allocHost) {
      C.donut(allocHost, {
        data: ALLOC,
        centerLabel: '국내주식',
        centerValue: '38%',
        label: '고객 포트폴리오 구성 도넛 그래프. 국내주식 38퍼센트, 해외주식 24퍼센트, 펀드·ETF 18퍼센트, 채권·RP 12퍼센트, 연금 8퍼센트.'
      });
    }

    /* 거래대금 막대 */
    var volHost = document.querySelector('[data-chart="volume"]');
    if (volHost) {
      C.bar(volHost, {
        data: VOLUME,
        accent: '#00A88E',
        accent2: '#7CE8D2',
        trackColor: 'rgba(255,255,255,.13)',
        unit: '조원',
        decimals: 1,
        yTicks: 3,
        yFormat: function(v){ return C.fmt(v, 0); },
        showAverage: true,
        label: '최근 8주 거래대금 막대 그래프. 1주 9.8조원에서 8주 14.2조원까지 늘었습니다.'
      });
    }

    /* 온라인 거래 비중 */
    var onlineHost = document.querySelector('[data-chart="online"]');
    if (onlineHost) {
      C.growth(onlineHost, {
        data: ONLINE,
        label: '온라인 거래 비중 추이 그래프. 2023년 1월 1.1퍼센트에서 2026년 1월 19.2퍼센트로 늘었습니다.'
      });
    }
  }

  /* ======================================================================
     인기 판매상품 프로모 배너 슬라이더
     ====================================================================== */
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

  /* ======================================================================
     상품 유형 탭 (펀드 / ELS·DLS / 랩)
     ====================================================================== */
  var bestTabs = document.querySelectorAll('.ss-best--tab');
  bestTabs.forEach(function(tab){
    tab.addEventListener('click', function(e){
      e.preventDefault();
      bestTabs.forEach(function(t){ t.removeAttribute('aria-current'); });
      tab.setAttribute('aria-current', 'true');
    });
  });

  /* ======================================================================
     푸터 바로가기 커스텀 셀렉트 (리스트박스 패턴)
     ====================================================================== */
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
