/* ══ HERO 3D PARTICLE FIELD ══
   외부 라이브러리 없이 canvas 2D에 직접 원근 투영을 계산해 그린다.
   - 파티클은 [-1,1]^3 큐브 안에 분포, 카메라 yaw/pitch를 회전시켜 3D 감을 만든다.
   - 마우스 위치가 목표 회전각이 되고, 실제 각도는 매 프레임 이징으로 따라간다.
   - 가까운 파티클끼리 실선으로 연결 (화면 좌표 그리드 버킷으로 O(n) 근사) */
(function(){
  const cv = document.getElementById('hero3d');
  if(!cv || !cv.getContext) return;

  const ctx = cv.getContext('2d', { alpha:true });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch  = window.innerWidth <= 768 || ('ontouchstart' in window);

  /* ── 튜닝 값 ── */
  const FOV       = 2.35;   // 클수록 원근 왜곡이 약해짐
  const DEPTH     = 1.9;    // z 분포 범위
  const DRIFT     = 0.00035;// 마우스가 없을 때의 상시 회전 속도
  const EASE      = 0.045;  // 카메라가 목표 각도를 따라가는 속도
  const MAX_YAW   = 0.55;   // 마우스로 돌아갈 수 있는 최대 각도(rad)
  const MAX_PITCH = 0.32;
  const LINK_PX   = 118;    // 이 화면거리 안이면 선으로 연결
  const MAX_LINKS = 4;      // 파티클 하나가 그릴 수 있는 최대 선 개수

  let W = 0, H = 0, dpr = 1, scale = 0, cx = 0, cy = 0;
  let yaw = 0, pitch = 0, tYaw = 0, tPitch = 0, drift = 0;
  let parts = [], raf = null, running = false;

  /* 화면 면적에 비례해 파티클 수를 정한다 (모바일은 절반 이하) */
  function count(){
    const base = Math.round((W * H) / 4200);
    return Math.max(80, Math.min(touch ? 130 : 420, base));
  }

  function build(){
    const n = count();
    parts = new Array(n);
    for(let i = 0; i < n; i++){
      // 구 형태로 뿌리면 화면 밖 낭비가 적다: 방향 벡터 * 반지름^(1/3)
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r  = Math.cbrt(Math.random());
      parts[i] = {
        x: Math.sin(ph) * Math.cos(th) * r * 1.55,
        y: Math.sin(ph) * Math.sin(th) * r * 1.0,
        z: Math.cos(ph) * r * DEPTH,
        // 각 파티클이 제자리에서 아주 느리게 흔들리도록 위상/속도를 따로 준다
        ph: Math.random() * Math.PI * 2,
        sp: 0.0006 + Math.random() * 0.0011,
        am: 0.02 + Math.random() * 0.05,
        // 10% 정도는 조금 크고 밝은 강조 입자
        big: Math.random() < 0.1
      };
    }
  }

  function resize(){
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width  = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.max(W, H) * 0.52;
    cx = W / 2; cy = H / 2;
    build();
  }

  /* 화면 좌표 기준 그리드 버킷 — 전수 비교(O(n²)) 대신 이웃 셀만 확인 */
  const grid = new Map();
  function key(gx, gy){ return gx * 100000 + gy; }

  function frame(){
    if(!running) return;
    raf = requestAnimationFrame(frame);

    drift += DRIFT;
    yaw   += (tYaw   + drift - yaw)   * EASE;
    pitch += (tPitch - pitch) * EASE;

    const sy = Math.sin(yaw),   cyw = Math.cos(yaw);
    const sp = Math.sin(pitch), cph = Math.cos(pitch);

    ctx.clearRect(0, 0, W, H);
    grid.clear();

    const drawn = [];
    for(let i = 0; i < parts.length; i++){
      const p = parts[i];
      p.ph += p.sp;
      const wob = Math.sin(p.ph) * p.am;

      const x = p.x, y = p.y + wob, z = p.z;
      // Y축 회전 → X축 회전
      const x1 = x * cyw - z * sy;
      const z1 = x * sy  + z * cyw;
      const y2 = y * cph - z1 * sp;
      const z2 = y * sp  + z1 * cph;

      const dz = FOV + z2;
      if(dz < 0.35) continue;            // 카메라 뒤 / 너무 가까운 입자는 버림
      const d  = FOV / dz;               // 원근 계수 (멀수록 작다)

      const px = cx + x1 * d * scale;
      const py = cy + y2 * d * scale;
      if(px < -60 || px > W + 60 || py < -60 || py > H + 60) continue;

      // 깊이 안개: 뒤쪽 입자는 흐려지고 작아진다
      const t  = Math.max(0, Math.min(1, (d - 0.45) / 0.85));
      const a  = (p.big ? 0.34 : 0.20) + t * (p.big ? 0.62 : 0.52);
      const rd = (p.big ? 1.9 : 1.15) * d;

      ctx.globalAlpha = a;
      // 흰 패널 위 — 옅은 회색 점이라야 타이포를 방해하지 않는다
      ctx.fillStyle = '#B9BBBE';
      ctx.beginPath();
      ctx.arc(px, py, rd, 0, Math.PI * 2);
      ctx.fill();

      const idx = drawn.length;
      drawn.push({ px, py, a, links: 0 });
      const gx = (px / LINK_PX) | 0, gy = (py / LINK_PX) | 0;
      const k = key(gx, gy);
      const cell = grid.get(k);
      if(cell) cell.push(idx); else grid.set(k, [idx]);
    }

    /* 연결선: 자기 셀 + 이웃 8칸만 검사 */
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = '#D3D5D8';
    const lim2 = LINK_PX * LINK_PX;
    for(let i = 0; i < drawn.length; i++){
      const A = drawn[i];
      if(A.links >= MAX_LINKS) continue;
      const gx = (A.px / LINK_PX) | 0, gy = (A.py / LINK_PX) | 0;
      for(let ox = -1; ox <= 1 && A.links < MAX_LINKS; ox++){
        for(let oy = -1; oy <= 1 && A.links < MAX_LINKS; oy++){
          const cell = grid.get(key(gx + ox, gy + oy));
          if(!cell) continue;
          for(let c = 0; c < cell.length; c++){
            const j = cell[c];
            if(j <= i) continue;           // 같은 쌍을 두 번 그리지 않는다
            const B = drawn[j];
            if(B.links >= MAX_LINKS) continue;
            const dx = A.px - B.px, dy = A.py - B.py;
            const d2 = dx * dx + dy * dy;
            if(d2 > lim2) continue;
            // 가까울수록, 그리고 양쪽 다 앞에 있을수록 진하게
            const near = 1 - Math.sqrt(d2) / LINK_PX;
            ctx.globalAlpha = near * Math.min(A.a, B.a) * 0.42;
            ctx.beginPath();
            ctx.moveTo(A.px, A.py);
            ctx.lineTo(B.px, B.py);
            ctx.stroke();
            A.links++; B.links++;
            if(A.links >= MAX_LINKS) break;
          }
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function start(){ if(!running){ running = true; raf = requestAnimationFrame(frame); } }
  function stop(){ running = false; if(raf) cancelAnimationFrame(raf); raf = null; }

  /* 정지 상태 한 컷만 그리기 (모션 축소 설정) */
  function still(){ running = true; frame(); running = false; if(raf) cancelAnimationFrame(raf); }

  resize();
  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { resize(); if(reduce) still(); }, 160);
  });

  if(reduce){ still(); return; }

  if(!touch){
    window.addEventListener('mousemove', e => {
      tYaw   =  (e.clientX / window.innerWidth  - 0.5) * 2 * MAX_YAW;
      tPitch = -(e.clientY / window.innerHeight - 0.5) * 2 * MAX_PITCH;
    }, { passive:true });
  }

  /* 히어로가 화면 밖으로 나가면 렌더를 멈춘다 (배터리/CPU 절약) */
  const host = document.getElementById('p1');
  if('IntersectionObserver' in window && host){
    new IntersectionObserver(es => {
      es[0].isIntersecting ? start() : stop();
    }, { threshold:0.01 }).observe(host);
  } else {
    start();
  }
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  start();
})();
