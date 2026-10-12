@@L1@@
@@L2@@
@@L3@@
@@L4@@
@@L5@@
@@L6@@
@@L7@@
@@ST@@
  /* 図(anatomy):張力テスト台。形は tools/anatomy/theraband/build.mjs が生成(下の TB)。数値はすべて上の kgOf() から */
  @@TB@@
  const C=TB.C,P=TB.P,KEYS=Object.keys(BD);
  const fig=K.div("tbf","",stage);
  fig.innerHTML=`<style>${TB.css}</style><div class="tbf-plate"><div class="tbf-row"><span class="tbf-fig">Fig 1</span><span class="tbf-title">張力テスト台 · 张力测试台</span></div>`
    +`<div class="tbf-stage" tabindex="0" role="slider" aria-label="伸ばす長さ(←→キーで1cm、Shift+←→で5cm)" aria-valuemin="0" aria-valuemax="60"><div class="tbf-art">${TB.svg}<div class="tbf-ov" aria-hidden="true">${TB.lab.map(l=>`<span${l[1]?` data-u="${l[1]}"`:""}>${l[0]}</span>`).join("")}</div></div></div>`
    +`<div class="tbf-row"><span class="tbf-hint">◎をドラッグ · ←→キー</span><span class="tbf-read"><b>0.0</b><span class="tbf-u">kg</span><i></i></span></div></div>`
    +`<div class="tbf-legend"><span class="tbf-key"><i data-k="red"></i>赤=手にかかる抵抗(針・矢印)<small>红=手上的阻力</small></span><span class="tbf-key"><i data-k="blue"></i>◎=ハンドル<small>把手</small></span><span class="tbf-key"><i data-k="band"></i>印の間隔が開く=伸び<small>刻印间距变大=拉长</small></span></div>`;
  const svg=fig.querySelector("svg"),scr=fig.querySelector(".tbf-stage"),q=s=>svg.querySelector(s);
  const shell=g=>({fill:g.querySelector(".iso-fill"),sh:[0,1,2,3].map(i=>g.querySelector(`.iso-shade[data-shade="${i}"]`)),top:g.querySelector(".iso-top"),crease:g.querySelector(".iso-crease"),edge:g.querySelector(".iso-edge")});
  const put=(h,s)=>{h.fill.setAttribute("d",s.fill);s.shades.forEach((d,i)=>h.sh[i].setAttribute("d",d));h.top.setAttribute("d",s.top);h.crease.setAttribute("d",s.crease);h.edge.setAttribute("d",s.outline);};
  const bandG=q('[data-part="band"]'),bandS=shell(bandG),marks=q('[data-part="marks"]'),arrowG=q('[data-part="arrow"]'),arrowS=shell(arrowG);
  const needle=q('[data-part="needle"]'),car=q('[data-part="carriage"]'),tiles=[...svg.querySelectorAll("[data-tile]")];
  const rdK=fig.querySelector(".tbf-read b"),rdT=fig.querySelector(".tbf-read i"),lift=TB.axisVector(P,[0,0,3.4]);
  const still=matchMedia("(prefers-reduced-motion: reduce)");
  // 紙と線の色はサイトの変数から。濃淡の向きだけ、実際の文字色の明るさで判定する(暗い画面=dark)
  const tone=()=>{const m=(getComputedStyle(fig).color.match(/[\d.]+/g)||[0,0,0]).map(Number);fig.dataset.tone=(0.2126*m[0]+0.7152*m[1]+0.0722*m[2])/255>0.5?"dark":"light";};
  const mq=matchMedia("(prefers-color-scheme: dark)"),mo=new MutationObserver(tone);
  tone();mq.addEventListener("change",tone);mo.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme","class","style"]});
  // 幅に合わせる:スマホ幅(≤640px)は枠を詰めた viewBox。--tbf-s=画面px/SVG単位(硬い影を常に同じpxに)。目盛りの数字はHTMLで重ねる
  const art=fig.querySelector(".tbf-art"),labs=[...fig.querySelectorAll(".tbf-ov span")];let vbNow="";
  const fit=()=>{const w=art.clientWidth;if(!w)return;const m=innerWidth<=640||w<520,vb=m?TB.vbm:TB.vb,s=vb.join(" ");
    if(s!==vbNow){vbNow=s;svg.setAttribute("viewBox",s);if(m)fig.dataset.m="";else delete fig.dataset.m;
      labs.forEach((e,i)=>{const l=TB.lab[i];e.style.left=((l[2]-vb[0])/vb[2]*100).toFixed(2)+"%";e.style.top=((l[3]-vb[1])/vb[3]*100).toFixed(2)+"%";});}
    fig.style.setProperty("--tbf-s",(w/vb[2]).toFixed(4));};
  const ro=typeof ResizeObserver==="function"?new ResizeObserver(fit):null;if(ro)ro.observe(art);fit();
@@L15@@
@@L16@@
@@L17@@
@@L18@@
@@L19@@
@@L20@@
@@L21@@
@@L22@@
@@L23@@
@@L24@@
  // ハンドルのドラッグ:画面上の動きを「レールに沿った cm」に直す(1cm = C.U 単位、その画面ベクトル)
  const ax=TB.axisVector(P,[C.U,0,0]),aa=ax[0]*ax[0]+ax[1]*ax[1];let d0=null;
  kgDrag(svg,car,{start(p){st.drag=true;d0={p,x:st.x};},move(p){if(!d0)return;st.x=K.clamp(d0.x+((p.x-d0.p.x)*ax[0]+(p.y-d0.p.y)*ax[1])/aa,0,60);rg.update();},end(){st.drag=false;d0=null;}});
  // 見本の色タイルを押しても色を選べる(下の色ボタンと同じ動き)
  tiles.forEach(t=>t.addEventListener("click",()=>{st.c=t.dataset.tile;B.mark(st.c);}));
  scr.addEventListener("keydown",e=>{const s=e.shiftKey?5:1,r=Math.round(st.x);let v=null;
    if(e.key==="ArrowRight"||e.key==="ArrowUp")v=r+s;else if(e.key==="ArrowLeft"||e.key==="ArrowDown")v=r-s;else if(e.key==="PageUp")v=r+10;else if(e.key==="PageDown")v=r-10;else if(e.key==="Home")v=0;else if(e.key==="End")v=60;
    if(v===null)return;e.preventDefault();st.x=K.clamp(v,0,60);rg.update();});
  // 表示中の状態:台車の位置 vx(cm)はなめらかに追従、針はばねで追従(実際の目盛り計と同じ)
  let vx=st.x,nk=0,nv=0,shown={x:null,c:null,n:null,t:"",say:""};
  function draw(){const c=BD[st.c],x=st.x,kg=kgOf(st.c,x);
    const key=st.c+"|"+Math.round(x)+"|"+kg.toFixed(1);if(shown.say!==key){shown.say=key;
    @@INFO@@
    scr.setAttribute("aria-valuenow",String(Math.round(x)));scr.setAttribute("aria-valuetext",`${c[0]} +${Math.round(x)}cm ${kg.toFixed(1)}kg`);}
    if(shown.x!==vx||shown.c!==st.c){const kv=kgOf(st.c,vx);
      if(shown.c!==st.c){bandG.style.setProperty("--tb-c",c[2]);fig.style.setProperty("--tb-c",c[2]);tiles.forEach(t=>{t.style.transform=t.dataset.tile===st.c?`translate(0px,${lift[1].toFixed(2)}px)`:"";});}
      put(bandS,TB.bandSolid(C,P,vx));marks.setAttribute("d",TB.bandMarks(C,P,vx));car.setAttribute("transform",TB.translateAlong(P,[C.XC0+vx*C.U,0,0]));
      if(kv<0.05)arrowG.style.display="none";else{arrowG.style.display="";put(arrowS,TB.arrowSolid(C,P,vx,kv));}
      const t=`${kv.toFixed(1)}|${c[0]}(レベル${c[1]>0?"+":""}${c[1]})を +${Math.round(vx)}cm`;if(shown.t!==t){shown.t=t;const [a,b]=t.split("|");rdK.textContent=a;rdT.textContent=b;}
      shown.x=vx;shown.c=st.c;}
    if(shown.n!==nk){needle.setAttribute("d",TB.needleD(C,P,nk));shown.n=nk;}}
  function step(dt){const calm=still.matches;
    vx=calm?st.x:vx+(st.x-vx)*(1-Math.exp(-dt/0.14));if(Math.abs(st.x-vx)<0.004)vx=st.x;
    const want=kgOf(st.c,vx);
    if(calm){nk=want;nv=0;}else{const h=dt/4;for(let i=0;i<4;i++){nv+=((want-nk)*260-nv*24)*h;nk+=nv*h;}if(Math.abs(want-nk)<0.0005&&Math.abs(nv)<0.0005){nk=want;nv=0;}}
    draw();}
  task();nk=kgOf(st.c,vx);draw();
  return {tick(dt){step(dt||0);},destroy(){mq.removeEventListener("change",tone);mo.disconnect();if(ro)ro.disconnect();}};
 }});
