const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* 마우스가 실제로 있는 환경인지. 화면 폭이 아니라 포인터 종류로 판단해야
   769px 이상 터치 태블릿에서 커서가 사라지는 문제가 생기지 않는다. */
const FINE_POINTER = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

/* 부드러운 스크롤 이동 (기본 해시 점프 대신) */
function goTo(id){
  const t = document.getElementById(id);
  if(t) t.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
}

/* ══ 1. NAV + HERO NAV ══
   앵커에 href가 있으므로 JS가 없어도 해시로 이동한다. 있으면 부드럽게. */
document.querySelectorAll('[data-target]').forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault();
    goTo(a.dataset.target);
  });
});

/* ══ 2. CURSOR + TRAIL ══ */
const dot=document.getElementById('cur-dot'),ring=document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
if(FINE_POINTER){
  document.body.classList.add('has-cursor');

  let lastTrail = 0;
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    dot.style.left=mx+'px';dot.style.top=my+'px';

    /* 예전엔 mousemove마다 div를 만들어 초당 수백 개 노드가 생겼다.
       40ms 간격으로 제한해 히어로 캔버스와 함께 돌아도 부담이 없게 한다. */
    if(REDUCE) return;
    const now = e.timeStamp;
    if(now - lastTrail < 40) return;
    lastTrail = now;
    const t=document.createElement('div');
    t.className='trail';
    t.style.cssText=`left:${mx}px;top:${my}px;width:6px;height:6px;`;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),600);
  },{passive:true});

  document.addEventListener('mousedown',()=>ring.classList.add('c'));
  document.addEventListener('mouseup',()=>ring.classList.remove('c'));
  (function la(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(la)})();

  document.querySelectorAll('a,button,.work-row,.skill-tag').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('h'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('h'));
  });
}

/* ══ 3. NAV SCROLL ══ */
const mainNav=document.getElementById('mainNav');
function updateNavBg(){
  const y=window.scrollY||document.documentElement.scrollTop||0;
  mainNav.classList.toggle('scrolled',y>10);
}
window.addEventListener('scroll',updateNavBg,{passive:true});
updateNavBg();

/* ══ 4. PAGE DOTS ══ */
const pgLines=document.querySelectorAll('.pg-line');
const pageEls=['p1','p2','p3','p7','p6','p5','p4'].map(id=>document.getElementById(id));

pageEls.forEach(p=>new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const i=pageEls.indexOf(e.target);
    pgLines.forEach((l,j)=>{
      l.classList.toggle('active',j===i);
      l.setAttribute('aria-current',j===i?'true':'false');
    });
  });
},{threshold:.3}).observe(p));

/* ══ 5. REVEAL ══ */
const rvIO=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    e.target.classList.add('in');
    rvIO.unobserve(e.target);   /* 한 번 나타나면 더 관찰하지 않는다 */
  });
},{threshold:.1,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.rv').forEach(el=>rvIO.observe(el));

/* ══ 6. SCRAMBLE (portfolio 타이틀) ══ */
const CHARS='abcdefghijklmnopqrstuvwxyz0123456789';
function scramble(el,final,dur=1000){
  const cs=[...final];let f=0;const tf=Math.floor(dur/36);
  const id=setInterval(()=>{
    el.textContent=cs.map((c,i)=>{if(c===' ')return c;const p=f/tf;if(i/cs.length<p*1.3)return c;return CHARS[Math.floor(Math.random()*CHARS.length)];}).join('');
    f++;if(f>=tf){clearInterval(id);el.textContent=final;}
  },36);
}
if(!REDUCE){
  new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting)setTimeout(()=>scramble(document.getElementById('heroTitle'),'portfolio',1000),1400);
  },{threshold:.5}).observe(document.getElementById('p1'));
}

/* ══ 7. TYPING EFFECT (서브 태그) ══ */
(function(){
  const el=document.getElementById('typingTag');
  if(!el)return;
  const text='Communication Web Publisher';

  /* 모션 최소화 설정이면 타이핑 없이 문구만 */
  if(REDUCE){ el.textContent=text; return; }

  let i=0;
  const cursor=document.createElement('span');
  cursor.className='typing-cursor';
  el.appendChild(cursor);

  function type(){
    if(i<text.length){
      el.insertBefore(document.createTextNode(text[i]),cursor);
      i++;
      setTimeout(type, i===1?60:55+Math.random()*30);
    } else {
      setTimeout(()=>cursor.remove(),3000);
    }
  }
  setTimeout(type, 1800);
})();

/* ══ 8. PROJECT NUMBER SCRAMBLE on hover ══ */
if(FINE_POINTER && !REDUCE){
  const NUM_CHARS='0123456789';
  document.querySelectorAll('.work-row').forEach(row=>{
    const idx=row.querySelector('.w-idx');
    if(!idx)return;
    const original=idx.textContent;
    let raf=null;
    row.addEventListener('mouseenter',()=>{
      let f=0;const tf=12;
      cancelAnimationFrame(raf);
      (function run(){
        if(f<tf){
          idx.textContent=NUM_CHARS[Math.floor(Math.random()*NUM_CHARS.length)].padStart(2,'0');
          f++;raf=requestAnimationFrame(run);
        } else {
          idx.textContent=original;
        }
      })();
    });
    row.addEventListener('mouseleave',()=>{
      cancelAnimationFrame(raf);
      idx.textContent=original;
    });
  });
}

/* ══ 9. ACCORDION ══
   role="button"이 붙은 div이므로 Enter/Space도 직접 처리하고
   aria-expanded로 열림 상태를 스크린리더에 알린다. */
function toggleWork(row){
  const item=row.closest('.work-item');
  const willOpen=!item.classList.contains('open');
  document.querySelectorAll('.work-item.open').forEach(i=>{
    i.classList.remove('open');
    i.querySelector('.work-row').setAttribute('aria-expanded','false');
  });
  item.classList.toggle('open',willOpen);
  row.setAttribute('aria-expanded',String(willOpen));
}
document.querySelectorAll('.work-row').forEach(row=>{
  row.addEventListener('click',()=>toggleWork(row));
  row.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
      e.preventDefault();
      toggleWork(row);
    }
  });
});

/* ══ 10. PAGE SWEEP on dot click ══
   예전엔 dot에 "부드러운 스크롤"과 "스윕 후 즉시 이동" 두 핸들러가 같이 붙어
   한 번 누르면 두 동작이 겹쳤다. 이제 이동은 여기서만 한다. */
(function(){
  const sweep=document.getElementById('pageSweep');
  pgLines.forEach(l=>{
    l.addEventListener('click',()=>{
      const target=pageEls[+l.dataset.i];
      if(!target)return;

      if(!sweep||REDUCE){ goTo(target.id); return; }

      sweep.classList.remove('in','out');
      void sweep.offsetWidth;
      sweep.classList.add('in');
      setTimeout(()=>{
        target.scrollIntoView({behavior:'instant'});
        sweep.classList.remove('in');
        void sweep.offsetWidth;
        sweep.classList.add('out');
        sweep.addEventListener('animationend',()=>sweep.classList.remove('out'),{once:true});
      },450);
    });
  });
})();
