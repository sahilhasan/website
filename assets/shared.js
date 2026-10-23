/* shasan.me shared helpers: animation loop, canvas sizing, storage, Dots mark.
   Loaded by every page before its own game script. */

const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const MARK='M185.9,148.12a36,36,0,0,0-48.29-31.91,8.13,8.13,0,0,1-8.6-1.82l-.47-.46a8,8,0,0,1-1.85-8.48,36.13,36.13,0,0,0,0-24.94A8,8,0,0,1,128.56,72l.38-.37a8.13,8.13,0,0,1,8.6-1.82,35.93,35.93,0,1,0-21.4-21.4,8.13,8.13,0,0,1-1.82,8.6l-.33.34a8,8,0,0,1-8.49,1.85,36.11,36.11,0,0,0-25,0A8,8,0,0,1,72,57.37l-.42-.43a8.13,8.13,0,0,1-1.82-8.6,35.93,35.93,0,1,0-21.4,21.4,8.13,8.13,0,0,1,8.6,1.82l.43.42a8,8,0,0,1,1.85,8.48,36.11,36.11,0,0,0,0,25A8,8,0,0,1,57.39,114l-.37.36a8.13,8.13,0,0,1-8.6,1.82,35.93,35.93,0,1,0,21.4,21.4,8.13,8.13,0,0,1,1.82-8.6l.4-.41a8,8,0,0,1,8.47-1.85,36.13,36.13,0,0,0,24.94,0,8,8,0,0,1,8.48,1.85l.46.47a8.13,8.13,0,0,1,1.82,8.6,36,36,0,1,0,69.69,10.51Z',MARKP=new Path2D(MARK),Y='#f5f543';
const markSVG=(st)=>`<svg viewBox="0 0 190 188" style="${st}" aria-hidden="true"><path fill="currentColor" d="${MARK}"/></svg>`;
function drawMark(x,cx,cy,size,col){x.save();x.translate(cx-size/2,cy-size/2);x.scale(size/188,size/188);x.fillStyle=col;x.fill(MARKP);x.restore()}
const CUR=['$','€','¥','£'];
function scene(el,fn){let vis=true,last=performance.now();
  if('IntersectionObserver' in window)new IntersectionObserver(e=>{vis=e[e.length-1].isIntersecting}).observe(el);
  let first=2;function f(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(vis||first>0){first--;fn(RM?0:dt,now/1000)}requestAnimationFrame(f)}requestAnimationFrame(f)}
function fit(c,el){const d=devicePixelRatio||1,w=el.clientWidth,h=el.clientHeight;c.width=Math.round(w*d);c.height=Math.round(h*d);const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return{w,h,x}}
function rng(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function shade(hex,f){const n=parseInt(hex.slice(1),16);const c=[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*f))));return`rgb(${c[0]},${c[1]},${c[2]})`}
const lerp=(a,b,t)=>a+(b-a)*Math.max(0,Math.min(1,t));
function path(pts,t){ // pts: [[time,x,y],...]
  if(t<=pts[0][0]) return pts[0].slice(1);
  for(let i=1;i<pts.length;i++){ if(t<=pts[i][0]){const [t0,x0,y0]=pts[i-1],[t1,x1,y1]=pts[i];const k=(t-t0)/(t1-t0);return [lerp(x0,x1,k),lerp(y0,y1,k)];} }
  return pts[pts.length-1].slice(1);
}

/* Mark a world as visited so the hub can show a check next to it. */
function markVisited(world){store.set('shasan.visited.'+world,true)}

/* Pause menu shared by every game: Resume, Restart, Worlds.
   Each game places the button (o.btnParent), styles .pz with its own look,
   freezes its loop while m.open is true, and calls m.toggle() on Escape. */
const WORLDS_URL='../';
function pauseMenu(screen,o){o=o||{};
  const btn=document.createElement('button');btn.type='button';btn.className='pz-btn';btn.title='Pause (Esc)';btn.setAttribute('aria-label','Pause (Esc)');btn.innerHTML='<i></i><i></i>';
  const ov=document.createElement('div');ov.className='pz';ov.hidden=true;ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Paused');
  ov.innerHTML='<div class="pz-box"><h3>Paused</h3><button type="button" data-a="resume">Resume</button><button type="button" data-a="restart">Restart</button><button type="button" data-a="worlds">Worlds</button></div>';
  (o.btnParent||screen).appendChild(btn);screen.appendChild(ov);
  const rs=ov.querySelector('[data-a=restart]');
  const m={open:false,btn,ov,
    show(){if(m.open)return;m.open=true;rs.hidden=!!(o.canRestart&&!o.canRestart());ov.hidden=false;if(o.onPause)o.onPause();try{ov.querySelector('button').focus({preventScroll:true})}catch(_){}},
    hide(){if(!m.open)return;m.open=false;ov.hidden=true;if(o.onResume)o.onResume();try{screen.focus({preventScroll:true})}catch(_){}},
    toggle(){m.open?m.hide():m.show()}};
  btn.addEventListener('click',e=>{e.stopPropagation();m.show()});
  ['pointerdown','pointerup','click'].forEach(t=>ov.addEventListener(t,e=>e.stopPropagation()));
  ov.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
    if(a==='resume')m.hide();else if(a==='restart'){m.hide();if(o.onRestart)o.onRestart()}else if(a==='worlds')location.href=WORLDS_URL});
  return m}
