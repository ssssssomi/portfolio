const isMobile=()=>window.innerWidth<=768||('ontouchstart' in window);

/* NAV + HERO NAV smooth scroll (data-target 기반) */
document.querySelectorAll('[data-target]').forEach(a=>{
  a.style.cursor='pointer';
  a.addEventListener('click',()=>{
    const t=document.getElementById(a.dataset.target);
    if(t)t.scrollIntoView({behavior:'smooth'});
  });
});

/* ══ 2. CURSOR + TRAIL ══ */
const dot=document.getElementById('cur-dot'),ring=document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
if(!isMobile()){
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    dot.style.left=mx+'px';dot.style.top=my+'px';
    // trail
    const t=document.createElement('div');
    t.className='trail';
    t.style.cssText=`left:${mx}px;top:${my}px;width:6px;height:6px;`;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),600);
  });
  document.addEventListener('mousedown',()=>ring.classList.add('c'));
  document.addEventListener('mouseup',()=>ring.classList.remove('c'));
  (function la(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(la)})();
  document.querySelectorAll('a,button,.work-row,.pg-line,.skill-tag').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('h'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('h'));
  });
}

/* ══ 3. NAV SCROLL ══ */
const mainNav=document.getElementById('mainNav');
function updateNavBg(){
  const y=window.scrollY||document.documentElement.scrollTop||document.body.scrollTop||0;
  mainNav.classList.toggle('scrolled',y>10);
}
window.addEventListener('scroll',updateNavBg,{passive:true});
document.addEventListener('scroll',updateNavBg,{passive:true,capture:true});

/* ══ 4. PAGE DOTS ══ */
const pgLines=document.querySelectorAll('.pg-line');
const pageEls=['p1','p2','p3','p5','p4'].map(id=>document.getElementById(id));
pgLines.forEach(l=>{l.addEventListener('click',()=>pageEls[+l.dataset.i].scrollIntoView({behavior:'smooth'}));});
pageEls.forEach(p=>new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){const i=pageEls.indexOf(e.target);pgLines.forEach((l,j)=>l.classList.toggle('active',j===i));}});
},{threshold:.3}).observe(p));

/* ══ 5. REVEAL ══ */
const rvIO=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');});},{threshold:.1});
document.querySelectorAll('.rv').forEach(el=>rvIO.observe(el));
setTimeout(()=>document.querySelectorAll('#p1 .rv').forEach(el=>el.classList.add('in')),100);

/* ══ 6. SCRAMBLE (portfolio 타이틀) ══ */
const CHARS='abcdefghijklmnopqrstuvwxyz0123456789';
function scramble(el,final,dur=1000){
  const cs=[...final];let f=0;const tf=Math.floor(dur/36);
  const id=setInterval(()=>{
    el.textContent=cs.map((c,i)=>{if(c===' ')return c;const p=f/tf;if(i/cs.length<p*1.3)return c;return CHARS[Math.floor(Math.random()*CHARS.length)];}).join('');
    f++;if(f>=tf){clearInterval(id);el.textContent=final;}
  },36);
}
new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting)setTimeout(()=>scramble(document.getElementById('heroTitle'),'portfolio',1000),1400);
},{threshold:.5}).observe(document.getElementById('p1'));

/* ══ 7. TYPING EFFECT (서브 태그) ══ */
(function(){
  const el=document.getElementById('typingTag');
  if(!el)return;
  const text='Communication Web Publisher';
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
if(!isMobile()){
  const NUM_CHARS='0123456789';
  document.querySelectorAll('.work-row').forEach(row=>{
    const idx=row.querySelector('.w-idx');
    if(!idx)return;
    const original=idx.textContent;
    let raf=null;
    row.addEventListener('mouseenter',()=>{
      let f=0,tf=12;
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

/* ══ 9. ACCORDION ══ */
document.querySelectorAll('.work-row').forEach(row=>{
  row.addEventListener('click',()=>{
    const item=row.closest('.work-item');
    const isOpen=item.classList.contains('open');
    document.querySelectorAll('.work-item.open').forEach(i=>i.classList.remove('open'));
    if(!isOpen)item.classList.add('open');
  });
});

/* ══ 10. PAGE SWEEP on dot click ══ */
(function(){
  const sweep=document.getElementById('pageSweep');
  if(!sweep)return;
  pgLines.forEach(l=>{
    l.addEventListener('click',()=>{
      sweep.classList.remove('in','out');
      void sweep.offsetWidth;
      sweep.classList.add('in');
      const target=pageEls[+l.dataset.i];
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
