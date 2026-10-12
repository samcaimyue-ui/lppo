ANIMS.push({id:"band",grp:"筋力増強訓練",tag:"セラバンド",title:"セラバンド:色と伸ばす長さで抵抗を作る",zh:"弹力带 · 用颜色和拉长长度调整阻力",
 lead:"色を選び、<b>ハンドル(◎)をドラッグ</b>してバンドを伸ばす。同じ色でも長く伸ばすほど抵抗が増え、色が濃いほど強い。ミッションの目的に合う色と長さで「この強さで決定」。<b>3つでクリア</b>。数値は資料の写真から読み取った概算。",
 links:[{lnote:"tool",si:2,label:"使用する道具"},{lnote:"tool",si:4,label:"等張性収縮を用いた訓練"},{lmap:"t_band",hint:"tool",label:"セラバンド"}],
 build(stage,K){
  const BD={tan:["タン",-2,"#d7b98e",[0.7,1.0,1.1]],yellow:["イエロー",-1,"#f2d53c",[0.9,1.3,1.6]],red:["レッド",0,"#d8352f",[1.0,1.4,1.7]],green:["グリーン",1,"#3a9a4a",[1.3,1.8,2.2]],blue:["ブルー",2,"#2f5fc2",[1.7,2.5,3.0]],black:["ブラック",3,"#2a2a2a",[2.0,2.9,3.6]],silver:["シルバー",4,"#a8adb3",[2.9,4.3,5.2]],gold:["ゴールド",5,"#c9a227",[3.8,5.7,7.0]]};
  const kgOf=(c,x)=>{const v=BD[c][3];x=K.clamp(x,0,60);return x<=20?v[0]*x/20:x<=40?v[0]+(v[1]-v[0])*(x-20)/20:v[1]+(v[2]-v[1])*(x-40)/20;};
  const TASK=kgShuffle([{t:"回旋筋腱板(側臥位で外旋)を 約1.0kg で",lv:[-2,0],kg:[0.85,1.15]},{t:"大腿四頭筋(座位で膝伸展)を 約4kg で",lv:[1,5],kg:[3.6,4.4]},{t:"介護予防(手や腕)を 約0.8kg で",lv:[-2,0],kg:[0.65,0.95]},{t:"大胸筋・背筋を 約5.5kg で",lv:[1,5],kg:[5,6]},{t:"前腕・手首を 約1.4kg で",lv:[-2,1],kg:[1.2,1.6]}]);
  const st={c:"red",x:0,ti:0,drag:false};const A=[110,200],N0=200,PX=4;// 60cmのバンド=200px、1cm=4px
  const svg=K.svg(stage,900,380,"セラバンド");K.el("rect",{x:60,y:110,width:40,height:180,rx:8,fill:"#c8b28a",stroke:"#8a744c"},svg);K.el("text",{x:80,y:310,"text-anchor":"middle",class:"alzh"},svg).textContent="固定";
  for(let c=0;c<=60;c+=10){const x=A[0]+N0+c*PX;K.el("line",{x1:x,y1:285,x2:x,y2:295,stroke:"#7d8b99"},svg);K.el("text",{x,y:312,"text-anchor":"middle",class:"axlab"},svg).textContent=c?`+${c}cm`:"自然長";}
  const band=K.el("path",{stroke:"#0003","stroke-width":1},svg);const arrow=K.el("line",{stroke:"#d8352f","stroke-width":5,"marker-end":""},svg);const ah=K.el("path",{fill:"#d8352f"},svg);
  const hd=K.el("g",{},svg);K.el("rect",{x:-14,y:-34,width:28,height:68,rx:12,fill:"#5a6b7d"},hd);K.el("circle",{r:40,fill:"none",stroke:"#4f7fb0","stroke-dasharray":"4 4"},hd);
  const big=K.el("text",{x:620,y:70,"text-anchor":"middle",class:"bigsv",style:"font-size:40px"},svg),sub=K.el("text",{x:620,y:100,"text-anchor":"middle",class:"axlab big"},svg);
  const lvl=K.el("g",{transform:"translate(470,330)"},svg);const lv=Object.keys(BD).map((k,i)=>{const r=K.el("rect",{x:i*50,y:0,width:44,height:22,rx:5,fill:BD[k][2],stroke:"#0003"},lvl);K.el("text",{x:i*50+22,y:38,"text-anchor":"middle",class:"alzh"},lvl).textContent=(BD[k][1]>0?"+":"")+BD[k][1];return r;});
  const game=kgGame(stage,K,{title:"ミッション",goal:3,label:"セラバンドミッション",hint:""});
  const B=kgBtns(stage,K,Object.keys(BD).map(k=>[k,`${BD[k][0]}<small>${BD[k][1]>0?"+":""}${BD[k][1]}</small>`,BD[k][2]]),"kband");
  const bar=K.bar(stage);const rg=K.range(bar,"伸ばす長さ",0,60,1,()=>Math.round(st.x),v=>{st.x=v;},v=>"+"+v+"cm",{wide:true});
  const bar2=K.bar(stage);const go=document.createElement("button");go.type="button";go.className="aplay";go.textContent="✓ この強さで決定";bar2.appendChild(go);
  const info=K.info(stage);
  B.on(v=>{st.c=v;B.mark(v);});B.mark(st.c);
  function task(){const T=TASK[st.ti%TASK.length];game.say(`ミッション:${T.t}(目的に合う色の範囲で)`,"");}
  go.addEventListener("click",()=>{const T=TASK[st.ti%TASK.length],L=BD[st.c][1],kg=kgOf(st.c,st.x);const okL=L>=T.lv[0]&&L<=T.lv[1],okK=kg>=T.kg[0]&&kg<=T.kg[1];
    if(okL&&okK){game.right(`OK!${BD[st.c][0]}を+${Math.round(st.x)}cm=${kg.toFixed(1)}kg`);st.ti++;setTimeout(task,2400);}
    else game.wrong(!okL?`色の強さが目的に合わない(目安レベル ${T.lv[0]}〜${T.lv[1]>0?"+":""}${T.lv[1]})`:kg<T.kg[0]?`${kg.toFixed(1)}kgは弱い:もっと伸ばすか強い色に`:`${kg.toFixed(1)}kgは強すぎ:伸ばす長さを減らすか弱い色に`);});
  kgDrag(svg,hd,{start(){st.drag=true;},move(p){st.x=K.clamp((p.x-A[0]-N0)/PX,0,60);rg.update();},end(){st.drag=false;}});
  function draw(){const c=BD[st.c],x=st.x,kg=kgOf(st.c,x);const hx=A[0]+N0+x*PX,w=26*Math.sqrt(N0/(N0+x*PX));
    band.setAttribute("d",`M${A[0]-10},${A[1]-w/2} L${hx},${A[1]-w/2*0.92} L${hx},${A[1]+w/2*0.92} L${A[0]-10},${A[1]+w/2} Z`);band.style.fill=(c[2]);
    hd.setAttribute("transform",`translate(${hx+14},${A[1]})`);const al=12+kg*22;arrow.setAttribute("x1",hx+40);arrow.setAttribute("x2",hx+40+al);arrow.setAttribute("y1",A[1]+60);arrow.setAttribute("y2",A[1]+60);
    ah.setAttribute("d",`M${hx+30},${A[1]+60} l14,-8 l0,16 Z`);big.textContent=`${kg.toFixed(1)} kg`;sub.textContent=`${c[0]}(レベル${c[1]>0?"+":""}${c[1]})を +${Math.round(x)}cm`;
    lv.forEach((r,i)=>r.setAttribute("stroke-width",Object.keys(BD)[i]===st.c?3:1));
    info.set(`${c[0]} · +${Math.round(x)}cm → ${kg.toFixed(1)}kg`,`<p>セラバンドは<b>色ごとに抵抗が決まっていて</b>(レッド=レベル0、ゴールド=+5)、<b>伸ばす長さが増えるほど抵抗も増す</b>。赤い矢印=手にかかる抵抗。</p><p class="aisub">目的と強度の目安:回旋筋腱板は弱め(−2〜0)、大胸筋・三角筋・背筋・大腿部は強め(+1〜+5)、リハビリ・介護予防は−2〜0が中心。中殿筋(側臥位で外転)・大腿四頭筋(座位で膝伸展)などに使う。</p>`);}
  task();draw();
  return {tick(){draw();}};
 }});
