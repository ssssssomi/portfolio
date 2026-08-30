/* ==========================================================================
   ss-charts — 외부 라이브러리 없이 데이터에서 SVG를 그리는 초경량 차트 엔진
   --------------------------------------------------------------------------
   · 라인/영역, 막대, 도넛, 스파크라인 4종
   · 눈금은 데이터에서 계산(nice scale)하므로 수치와 그림이 항상 일치
   · 화면에 들어올 때 1회 드로잉 애니메이션 (prefers-reduced-motion 존중)
   · 포인터 호버 시 크로스헤어 + 툴팁, 키보드(←/→)로도 탐색 가능
   ========================================================================== */
(function (global) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var REDUCE = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 유틸 ---------- */
  function s(name, attrs) {
    var e = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function r(n) { return Math.round(n * 100) / 100; }

  function fmt(v, d) {
    d = d == null ? 0 : d;
    return Number(v).toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  /* 데이터 범위에서 사람이 읽기 좋은 눈금 계산 */
  function niceScale(min, max, count) {
    var span = max - min;
    if (span <= 0) span = Math.abs(max) || 1;
    var raw = span / count;
    var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var norm = raw / mag;
    var step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
    step *= mag;
    var lo = Math.floor(min / step) * step;
    var hi = Math.ceil(max / step) * step;
    var ticks = [];
    for (var v = lo; v <= hi + step * 1e-9; v += step) ticks.push(Number(v.toFixed(10)));
    return { lo: lo, hi: hi, ticks: ticks };
  }

  /* Catmull-Rom → 3차 베지어. 제어점 y를 인접 구간으로 제한해 급락 구간 오버슈트 방지 */
  function smoothPath(pts, tension) {
    var t = tension == null ? 0.16 : tension;
    if (!pts.length) return "";
    if (pts.length < 3) return "M" + pts.map(function (p) { return r(p[0]) + " " + r(p[1]); }).join(" L");
    var d = "M" + r(pts[0][0]) + " " + r(pts[0][1]);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var lo = Math.min(p1[1], p2[1]), hi = Math.max(p1[1], p2[1]);
      var c1y = Math.max(lo, Math.min(hi, p1[1] + (p2[1] - p0[1]) * t));
      var c2y = Math.max(lo, Math.min(hi, p2[1] - (p3[1] - p1[1]) * t));
      d += " C" + r(p1[0] + (p2[0] - p0[0]) * t) + " " + r(c1y) +
           "," + r(p2[0] - (p3[0] - p1[0]) * t) + " " + r(c2y) +
           "," + r(p2[0]) + " " + r(p2[1]);
    }
    return d;
  }

  /* --------------------------------------------------------------
     반응형 좌표계 — viewBox를 실제 렌더 폭과 1:1로 맞춘다.
     고정 viewBox를 쓰면 좁은 카드에서 축 라벨이 함께 축소돼 읽히지 않는다.
     -------------------------------------------------------------- */
  function autoSize(host, ratio, minH, maxH) {
    var w = Math.max(260, Math.round(host.clientWidth || 320));
    var hh = Math.round(Math.min(maxH || 1e4, Math.max(minH || 0, w * ratio)));
    return { W: w, H: hh };
  }

  /* 폭이 바뀌면 등록된 차트를 다시 그린다 (애니메이션 없이).
     같은 host는 항상 최신 렌더 함수 하나만 유지 — 기간 탭 전환 시 핸들러가 쌓이지 않게. */
  var redraws = [];
  var resizeTimer;
  global.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      redraws.forEach(function (e) {
        if (Math.abs(e.host.clientWidth - e.w) < 12) return;
        e.w = e.host.clientWidth;
        e.fn();
      });
    }, 180);
  });
  function register(host, fn) {
    for (var i = 0; i < redraws.length; i++) {
      if (redraws[i].host === host) { redraws[i].fn = fn; return; }
    }
    redraws.push({ host: host, w: host.clientWidth, fn: fn });
  }

  /* 화면에 처음 들어올 때 한 번만 콜백 */
  function onReveal(node, fn) {
    if (REDUCE || !("IntersectionObserver" in global)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.disconnect(); fn(); }
      });
    }, { threshold: 0.25 });
    io.observe(node);
  }

  /* 툴팁 (차트 래퍼 기준 절대 위치) */
  function makeTip(host) {
    var tip = h("div", "ss-chart-tip");
    tip.setAttribute("aria-hidden", "true");
    host.appendChild(tip);
    return {
      node: tip,
      show: function (x, y, html) {
        tip.innerHTML = html;
        tip.style.left = x + "%";
        tip.style.top = y + "%";
        tip.classList.add("is-on");
      },
      hide: function () { tip.classList.remove("is-on"); }
    };
  }

  /* ======================================================================
     1) 라인 / 영역 차트
     ====================================================================== */
  function lineChart(host, cfg) {
    if (!cfg._again) { register(host, function () { lineChart(host, Object.assign({}, cfg, { _again: true })); }); }
    var box = autoSize(host, cfg.ratio || 0.46, 200, 360);
    var W = box.W, H = box.H;
    var pad = { l: 54, r: 18, t: 18, b: 34 };
    var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;

    var data = cfg.data;
    var vals = data.map(function (d) { return d.value; });
    var sc = niceScale(Math.min.apply(null, vals), Math.max.apply(null, vals), cfg.yTicks || 4);
    var accent = cfg.accent || "#0046FF";
    var uid = "c" + Math.random().toString(36).slice(2, 8);

    var X = function (i) { return pad.l + (data.length === 1 ? iw / 2 : iw * i / (data.length - 1)); };
    var Y = function (v) { return pad.t + ih - ih * (v - sc.lo) / (sc.hi - sc.lo); };
    var pts = data.map(function (d, i) { return [X(i), Y(d.value)]; });

    host.innerHTML = "";
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "ss-chart-svg", role: "img", "aria-label": cfg.label || "" });

    var defs = s("defs");
    var grad = s("linearGradient", { id: uid + "a", x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.appendChild(s("stop", { offset: "0%", "stop-color": accent, "stop-opacity": ".28" }));
    grad.appendChild(s("stop", { offset: "70%", "stop-color": accent, "stop-opacity": ".04" }));
    grad.appendChild(s("stop", { offset: "100%", "stop-color": accent, "stop-opacity": "0" }));
    defs.appendChild(grad);
    var lg = s("linearGradient", { id: uid + "l", x1: "0", y1: "0", x2: "1", y2: "0" });
    lg.appendChild(s("stop", { offset: "0%", "stop-color": cfg.accent2 || "#94ABFA" }));
    lg.appendChild(s("stop", { offset: "100%", "stop-color": accent }));
    defs.appendChild(lg);
    svg.appendChild(defs);

    /* 가로 그리드 + y축 라벨 */
    var gGrid = s("g", { class: "ss-chart-grid" });
    sc.ticks.forEach(function (t) {
      var y = Y(t);
      gGrid.appendChild(s("line", { x1: pad.l, y1: r(y), x2: W - pad.r, y2: r(y) }));
      var tx = s("text", { x: pad.l - 10, y: r(y + 4), "text-anchor": "end", class: "ss-chart-axis" });
      tx.textContent = cfg.yFormat ? cfg.yFormat(t) : fmt(t);
      gGrid.appendChild(tx);
    });
    svg.appendChild(gGrid);

    /* x축 라벨 — 폭에 맞춰 솎아내기 */
    var every = Math.max(1, Math.ceil(data.length / 6));
    var gX = s("g");
    var lastIdx = data.length - 1;
    data.forEach(function (d, i) {
      if (i % every && i !== lastIdx) return;
      /* 마지막 라벨과 겹칠 만큼 가까우면 생략 */
      if (i !== lastIdx && lastIdx - i < every * 0.7) return;
      var tx = s("text", { x: r(X(i)), y: H - 10, "text-anchor": i === 0 ? "start" : i === data.length - 1 ? "end" : "middle", class: "ss-chart-axis" });
      tx.textContent = d.label;
      gX.appendChild(tx);
    });
    svg.appendChild(gX);

    /* 영역 + 라인 */
    var linePath = smoothPath(pts);
    var area = s("path", {
      d: linePath + " L" + r(X(data.length - 1)) + " " + (pad.t + ih) + " L" + pad.l + " " + (pad.t + ih) + " Z",
      fill: "url(#" + uid + "a)", class: "ss-chart-area"
    });
    svg.appendChild(area);
    var line = s("path", { d: linePath, fill: "none", stroke: "url(#" + uid + "l)", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round", class: "ss-chart-line" });
    svg.appendChild(line);

    /* 마지막 지점 강조 */
    var last = pts[pts.length - 1];
    var halo = s("circle", { cx: r(last[0]), cy: r(last[1]), r: "11", fill: accent, opacity: ".16", class: "ss-chart-halo" });
    var dot = s("circle", { cx: r(last[0]), cy: r(last[1]), r: "5", fill: "#fff", stroke: accent, "stroke-width": "3.5" });
    svg.appendChild(halo); svg.appendChild(dot);

    /* 호버 레이어 */
    var gHover = s("g", { class: "ss-chart-hover" });
    var cross = s("line", { x1: 0, y1: pad.t, x2: 0, y2: pad.t + ih, class: "ss-chart-cross" });
    var hdot = s("circle", { r: "6", fill: "#fff", stroke: accent, "stroke-width": "3.5" });
    gHover.appendChild(cross); gHover.appendChild(hdot);
    svg.appendChild(gHover);

    host.appendChild(svg);
    var tip = makeTip(host);

    function focus(i) {
      var d = data[i];
      gHover.classList.add("is-on");
      cross.setAttribute("x1", r(X(i))); cross.setAttribute("x2", r(X(i)));
      hdot.setAttribute("cx", r(X(i))); hdot.setAttribute("cy", r(Y(d.value)));
      var prev = i > 0 ? data[i - 1].value : null;
      var diff = prev == null ? null : d.value - prev;
      var rate = prev == null ? null : (diff / prev) * 100;
      var sign = diff == null ? "" : diff > 0 ? "is-up-text" : diff < 0 ? "is-down-text" : "";
      tip.show(
        (X(i) / W) * 100, (Y(d.value) / H) * 100,
        '<b>' + d.label + '</b><span>' + fmt(d.value, cfg.decimals) + (cfg.unit || "") + '</span>' +
        (diff == null ? "" : '<em class="' + sign + '">' + (diff > 0 ? "+" : "") + fmt(diff, cfg.decimals) + " (" + (rate > 0 ? "+" : "") + rate.toFixed(2) + "%)</em>")
      );
    }
    function blur() { gHover.classList.remove("is-on"); tip.hide(); }

    function idxFromEvent(e) {
      var box = svg.getBoundingClientRect();
      var rel = (e.clientX - box.left) / box.width * W;
      var i = Math.round((rel - pad.l) / (iw / (data.length - 1)));
      return Math.max(0, Math.min(data.length - 1, i));
    }
    svg.addEventListener("pointermove", function (e) { focus(idxFromEvent(e)); });
    svg.addEventListener("pointerleave", blur);
    svg.addEventListener("pointerdown", function (e) { focus(idxFromEvent(e)); });

    /* 키보드 탐색 */
    var cur = data.length - 1;
    svg.setAttribute("tabindex", "0");
    svg.addEventListener("focus", function () { focus(cur); });
    svg.addEventListener("blur", blur);
    svg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { cur = Math.min(data.length - 1, cur + 1); focus(cur); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { cur = Math.max(0, cur - 1); focus(cur); e.preventDefault(); }
    });

    /* 드로잉 애니메이션 */
    if (!REDUCE && !cfg._again) {
      var len = line.getTotalLength ? line.getTotalLength() : 1200;
      line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
      area.style.opacity = 0; halo.style.opacity = 0; dot.style.opacity = 0;
      onReveal(host, function () {
        line.style.transition = "stroke-dashoffset 1.15s cubic-bezier(.16,1,.3,1)";
        line.style.strokeDashoffset = 0;
        area.style.transition = "opacity .8s .25s ease"; area.style.opacity = 1;
        dot.style.transition = halo.style.transition = "opacity .4s .95s ease";
        dot.style.opacity = 1; halo.style.opacity = ".16";
      });
    }
    return { focus: focus, blur: blur };
  }

  /* ======================================================================
     2) 막대 차트
     ====================================================================== */
  function barChart(host, cfg) {
    if (!cfg._again) { register(host, function () { barChart(host, Object.assign({}, cfg, { _again: true })); }); }
    var box = autoSize(host, cfg.ratio || 0.62, 176, 260);
    var W = box.W, H = box.H;
    var pad = { l: 44, r: 14, t: 24, b: 30 };
    var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    var data = cfg.data;
    var vals = data.map(function (d) { return d.value; });
    var sc = niceScale(0, Math.max.apply(null, vals), cfg.yTicks || 3);
    var accent = cfg.accent || "#00A88E";
    var uid = "b" + Math.random().toString(36).slice(2, 8);
    var slot = iw / data.length;
    var bw = Math.min(cfg.barWidth || 34, slot * 0.6);

    host.innerHTML = "";
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "ss-chart-svg", role: "img", "aria-label": cfg.label || "" });
    var defs = s("defs");
    var g1 = s("linearGradient", { id: uid, x1: "0", y1: "0", x2: "0", y2: "1" });
    g1.appendChild(s("stop", { offset: "0%", "stop-color": cfg.accent2 || "#7CE8D2" }));
    g1.appendChild(s("stop", { offset: "100%", "stop-color": accent }));
    defs.appendChild(g1);
    svg.appendChild(defs);

    var Y = function (v) { return pad.t + ih - ih * (v - sc.lo) / (sc.hi - sc.lo); };
    var gGrid = s("g", { class: "ss-chart-grid" });
    sc.ticks.forEach(function (t) {
      var y = Y(t);
      gGrid.appendChild(s("line", { x1: pad.l, y1: r(y), x2: W - pad.r, y2: r(y) }));
      var tx = s("text", { x: pad.l - 10, y: r(y + 4), "text-anchor": "end", class: "ss-chart-axis" });
      tx.textContent = cfg.yFormat ? cfg.yFormat(t) : fmt(t, cfg.decimals);
      gGrid.appendChild(tx);
    });
    svg.appendChild(gGrid);

    /* 평균선 */
    if (cfg.showAverage) {
      var avg = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
      var ay = Y(avg);
      svg.appendChild(s("line", { x1: pad.l, y1: r(ay), x2: W - pad.r, y2: r(ay), class: "ss-chart-avg" }));
      /* 라벨은 왼쪽 시작점에 — 오른쪽에 두면 마지막(최고) 막대와 겹친다 */
      var at = s("text", { x: pad.l + 3, y: r(ay - 7), "text-anchor": "start", class: "ss-chart-avg-label" });
      at.textContent = "평균 " + fmt(avg, cfg.decimals) + (cfg.unit || "");
      svg.appendChild(at);
    }

    var bars = [];
    data.forEach(function (d, i) {
      var x = pad.l + slot * i + (slot - bw) / 2;
      var y = Y(d.value), hgt = pad.t + ih - y;
      var isLast = i === data.length - 1;
      var rect = s("rect", {
        x: r(x), y: r(y), width: r(bw), height: r(Math.max(hgt, 2)), rx: r(bw / 2),
        fill: isLast ? "url(#" + uid + ")" : (cfg.trackColor || "#DCEFEA"),
        class: "ss-chart-bar" + (isLast ? " is-last" : "")
      });
      svg.appendChild(rect);
      bars.push(rect);
      if (slot >= 30 || i % 2 === 0 || i === data.length - 1) {
        var tx = s("text", { x: r(x + bw / 2), y: H - 10, "text-anchor": "middle", class: "ss-chart-axis" });
        tx.textContent = d.label;
        svg.appendChild(tx);
      }
    });

    host.appendChild(svg);
    var tip = makeTip(host);
    bars.forEach(function (rect, i) {
      rect.addEventListener("pointerenter", function () {
        rect.classList.add("is-hot");
        tip.show((parseFloat(rect.getAttribute("x")) + bw / 2) / W * 100, parseFloat(rect.getAttribute("y")) / H * 100,
          "<b>" + data[i].label + (cfg.labelSuffix || "") + "</b><span>" + fmt(data[i].value, cfg.decimals) + (cfg.unit || "") + "</span>");
      });
      rect.addEventListener("pointerleave", function () { rect.classList.remove("is-hot"); tip.hide(); });
    });

    if (!REDUCE && !cfg._again) {
      bars.forEach(function (b) { b.style.transformOrigin = "center bottom"; b.style.transform = "scaleY(0)"; });
      onReveal(host, function () {
        bars.forEach(function (b, i) {
          b.style.transition = "transform .7s cubic-bezier(.16,1,.3,1) " + (i * 60) + "ms";
          b.style.transform = "scaleY(1)";
        });
      });
    }
  }

  /* ======================================================================
     3) 도넛 차트
     ====================================================================== */
  function donutChart(host, cfg) {
    var SZ = 240, R = 92, TH = 26;
    var C = 2 * Math.PI * R;
    var data = cfg.data;
    var total = data.reduce(function (a, d) { return a + d.value; }, 0);

    host.innerHTML = "";
    var wrap = h("div", "ss-donut");
    var figure = h("div", "ss-donut--ring");
    var svg = s("svg", { viewBox: "0 0 " + SZ + " " + SZ, class: "ss-chart-svg", role: "img", "aria-label": cfg.label || "" });
    svg.appendChild(s("circle", { cx: SZ / 2, cy: SZ / 2, r: R, fill: "none", stroke: "var(--ss-line)", "stroke-width": TH * 0.42 }));

    var arcs = [], acc = 0;
    data.forEach(function (d) {
      var seg = C * (d.value / total);
      var arc = s("circle", {
        cx: SZ / 2, cy: SZ / 2, r: R, fill: "none", stroke: d.color, "stroke-width": TH,
        "stroke-linecap": "round",
        "stroke-dasharray": r(Math.max(seg - 4, 1)) + " " + r(C - Math.max(seg - 4, 1)),
        "stroke-dashoffset": r(-acc),
        transform: "rotate(-90 " + SZ / 2 + " " + SZ / 2 + ")",
        class: "ss-donut--arc"
      });
      svg.appendChild(arc);
      arcs.push({ node: arc, seg: seg, acc: acc, data: d });
      acc += seg;
    });
    figure.appendChild(svg);

    var mid = h("div", "ss-donut--center");
    var midTop = h("span", "ss-donut--center-key", cfg.centerLabel || data[0].label);
    var midVal = h("strong", "ss-donut--center-val", (cfg.centerValue != null ? cfg.centerValue : Math.round(data[0].value / total * 100) + "%"));
    mid.appendChild(midTop); mid.appendChild(midVal);
    figure.appendChild(mid);
    wrap.appendChild(figure);

    var legend = h("ul", "ss-donut--legend");
    data.forEach(function (d, i) {
      var li = h("li", "ss-donut--legend-item");
      li.tabIndex = 0;
      var sw = h("span", "ss-donut--swatch"); sw.style.background = d.color;
      var nm = h("span", "ss-donut--legend-name", d.label);
      var vl = h("span", "ss-donut--legend-val", (d.value / total * 100).toFixed(0) + "%");
      li.appendChild(sw); li.appendChild(nm); li.appendChild(vl);
      function on() {
        arcs.forEach(function (a, j) { a.node.classList.toggle("is-dim", j !== i); });
        midTop.textContent = d.label;
        midVal.textContent = (d.value / total * 100).toFixed(0) + "%";
      }
      function off() {
        arcs.forEach(function (a) { a.node.classList.remove("is-dim"); });
        midTop.textContent = cfg.centerLabel || data[0].label;
        midVal.textContent = cfg.centerValue != null ? cfg.centerValue : Math.round(data[0].value / total * 100) + "%";
      }
      li.addEventListener("pointerenter", on);
      li.addEventListener("pointerleave", off);
      li.addEventListener("focus", on);
      li.addEventListener("blur", off);
      arcs[i].node.addEventListener("pointerenter", on);
      arcs[i].node.addEventListener("pointerleave", off);
      legend.appendChild(li);
    });
    wrap.appendChild(legend);
    host.appendChild(wrap);

    if (!REDUCE && !cfg._again) {
      arcs.forEach(function (a) {
        a.node.setAttribute("stroke-dasharray", "0 " + r(C));
      });
      onReveal(host, function () {
        arcs.forEach(function (a, i) {
          a.node.style.transition = "stroke-dasharray .8s cubic-bezier(.16,1,.3,1) " + (i * 110) + "ms, opacity .25s ease";
          a.node.setAttribute("stroke-dasharray", r(Math.max(a.seg - 4, 1)) + " " + r(C - Math.max(a.seg - 4, 1)));
        });
      });
    }
  }

  /* ======================================================================
     4) 컬럼 + 추세선 (다크 카드용)
     ====================================================================== */
  function growthChart(host, cfg) {
    if (!cfg._again) { register(host, function () { growthChart(host, Object.assign({}, cfg, { _again: true })); }); }
    var box = autoSize(host, cfg.ratio || 0.66, 186, 270);
    var W = box.W, H = box.H;
    var pad = { l: 16, r: 16, t: 40, b: 30 };
    var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    var data = cfg.data;
    var maxV = Math.max.apply(null, data.map(function (d) { return d.value; }));
    var uid = "g" + Math.random().toString(36).slice(2, 8);
    var slot = iw / data.length;
    var bw = Math.min(30, slot * 0.52);

    host.innerHTML = "";
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "ss-chart-svg", role: "img", "aria-label": cfg.label || "" });
    var defs = s("defs");
    var g1 = s("linearGradient", { id: uid, x1: "0", y1: "0", x2: "0", y2: "1" });
    g1.appendChild(s("stop", { offset: "0%", "stop-color": "#8FB0FF" }));
    g1.appendChild(s("stop", { offset: "100%", "stop-color": "#2F5BE8" }));
    defs.appendChild(g1);
    var g2 = s("linearGradient", { id: uid + "hi", x1: "0", y1: "0", x2: "0", y2: "1" });
    g2.appendChild(s("stop", { offset: "0%", "stop-color": "#FFFFFF" }));
    g2.appendChild(s("stop", { offset: "100%", "stop-color": "#5B87FF" }));
    defs.appendChild(g2);
    svg.appendChild(defs);

    var Y = function (v) { return pad.t + ih - ih * (v / (maxV * 1.12)); };
    var pts = [];
    var bars = [];
    data.forEach(function (d, i) {
      var x = pad.l + slot * i + (slot - bw) / 2;
      var y = Y(d.value);
      var isLast = i === data.length - 1;
      var rect = s("rect", {
        x: r(x), y: r(y), width: r(bw), height: r(pad.t + ih - y), rx: 6,
        fill: isLast ? "url(#" + uid + "hi)" : "url(#" + uid + ")",
        opacity: isLast ? 1 : 0.45 + 0.4 * (i / (data.length - 1)),
        class: "ss-chart-bar"
      });
      svg.appendChild(rect); bars.push(rect);
      pts.push([x + bw / 2, y]);
      var tx = s("text", { x: r(x + bw / 2), y: H - 12, "text-anchor": "middle", class: "ss-chart-axis is-dark" + (isLast ? " is-strong" : "") });
      tx.textContent = d.label;
      svg.appendChild(tx);
    });

    /* 추세선 */
    var trend = s("path", { d: smoothPath(pts, 0.2), fill: "none", stroke: "#7FA3FF", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-dasharray": "5 7", class: "ss-chart-trend" });
    svg.appendChild(trend);

    /* 마지막 값 강조 라벨 */
    var lastPt = pts[pts.length - 1];
    var badge = s("g", { class: "ss-chart-badge" });
    var bx = Math.min(lastPt[0], W - pad.r - 44);
    badge.appendChild(s("rect", { x: r(bx - 40), y: r(lastPt[1] - 40), width: 80, height: 28, rx: 14, fill: "#4C7DFF" }));
    var btx = s("text", { x: r(bx), y: r(lastPt[1] - 21), "text-anchor": "middle", class: "ss-chart-badge-text" });
    btx.textContent = fmt(data[data.length - 1].value, 1) + "%";
    badge.appendChild(btx);
    svg.appendChild(badge);

    host.appendChild(svg);
    var tip = makeTip(host);
    bars.forEach(function (rect, i) {
      rect.addEventListener("pointerenter", function () {
        tip.show((parseFloat(rect.getAttribute("x")) + bw / 2) / W * 100, parseFloat(rect.getAttribute("y")) / H * 100,
          "<b>" + data[i].label + "</b><span>" + fmt(data[i].value, 1) + "%</span>");
      });
      rect.addEventListener("pointerleave", tip.hide);
    });

    if (!REDUCE && !cfg._again) {
      bars.forEach(function (b) { b.style.transformOrigin = "center bottom"; b.style.transform = "scaleY(0)"; });
      trend.style.opacity = 0; badge.style.opacity = 0;
      onReveal(host, function () {
        bars.forEach(function (b, i) {
          b.style.transition = "transform .65s cubic-bezier(.16,1,.3,1) " + (i * 70) + "ms";
          b.style.transform = "scaleY(1)";
        });
        trend.style.transition = "opacity .5s .6s ease"; trend.style.opacity = 1;
        badge.style.transition = "opacity .4s .85s ease"; badge.style.opacity = 1;
      });
    }
  }

  /* ======================================================================
     5) 스파크라인 (표 안의 미니 추이)
     ====================================================================== */
  function sparkline(host, values, up) {
    var W = 72, H = 26, p = 3;
    var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    var span = max - min || 1;
    var pts = values.map(function (v, i) {
      return [p + (W - p * 2) * i / (values.length - 1), p + (H - p * 2) * (1 - (v - min) / span)];
    });
    var color = up ? "#E0432D" : "#1E64F0";
    host.innerHTML = "";
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "ss-spark", "aria-hidden": "true", focusable: "false" });
    svg.appendChild(s("path", { d: smoothPath(pts, 0.18), fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    svg.appendChild(s("circle", { cx: r(pts[pts.length - 1][0]), cy: r(pts[pts.length - 1][1]), r: "2.6", fill: color }));
    host.appendChild(svg);
  }

  global.ssCharts = {
    line: lineChart,
    bar: barChart,
    donut: donutChart,
    growth: growthChart,
    spark: sparkline,
    reveal: onReveal,
    fmt: fmt
  };
})(window);
