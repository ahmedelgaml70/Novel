const fs=require('fs');
const path=require('path');
const {Canvas,FontLibrary,Image,Path2D}=require('skia-canvas');
const ROOT=__dirname;
const M=JSON.parse(fs.readFileSync(path.join(ROOT,'scene_manifest.json'),'utf8'));
const W=M.film.width,H=M.film.height,FPS=M.film.fps,SR=M.film.audio_sample_rate;
const DUR=M.shots.reduce((a,s)=>a+s.duration,0), FRAMES=Math.round(DUR*FPS);
const FONT=path.join(ROOT,'assets/fonts/EBGaramond.ttf');
if(!fs.existsSync(FONT)) throw Error('Missing bundled EB Garamond font; restore assets/fonts');
FontLibrary.use('EB Garamond',[FONT]);
let activeItem=null;
const seenItems=new Set();
function paint(ctx,id,fn){seenItems.add(id);if(activeItem&&activeItem!==id)return;ctx.save();try{fn()}finally{ctx.restore()}}

const skyline=new Image();skyline.src=fs.readFileSync(path.join(ROOT,'assets/references/ingolstadt-1800.jpg'));
const P={
 paper:'#d8ccb2', paper2:'#b8a78a', ink:'#15120e', ink2:'#2a241c', soot:'#080907',
 wash:'#5e5141', brass:'#9b7445', copper:'#a55d39', glass:'#9eb9b4', cold:'#a7d9d5',
 linen:'#c9bda3', skin:'#c4b79d', skin2:'#958873', bone:'#d0c3a8', blood:'#642c29'
};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
const ease=t=>{t=clamp(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
const pulse=(t,c,w)=>Math.exp(-Math.pow((t-c)/w,2));
const rnd=n=>{const x=Math.sin(n*12.9898+78.233)*43758.5453123;return x-Math.floor(x)};

function line(ctx,x1,y1,x2,y2,w=1,c=P.ink,a=1){ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore()}
function ell(ctx,x,y,rx,ry,fill=null,stroke=null,w=1,a=1,rot=0){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=a;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.stroke()}ctx.restore()}

const fibres=Array.from({length:850},(_,i)=>({x:rnd(i*3)*W,y:rnd(i*7+2)*H,l:12+70*rnd(i*11),a:.012+.03*rnd(i*13),r:(rnd(i*19)-.5)*.25}));
const specks=Array.from({length:1900},(_,i)=>({x:rnd(i*5+1)*W,y:rnd(i*13+4)*H,s:.35+1.5*rnd(i*17),a:.005+.02*rnd(i*23)}));
function _paper(ctx,t,shade=.05){ctx.fillStyle=P.paper;ctx.fillRect(0,0,W,H);ctx.save();ctx.globalCompositeOperation='multiply';ctx.fillStyle=`rgba(62,45,25,${shade})`;ctx.fillRect(0,0,W,H);ctx.strokeStyle=P.ink;for(const f of fibres){ctx.globalAlpha=f.a;ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+f.l,f.y+f.r*f.l);ctx.stroke()}ctx.restore()}
function flash(ctx,a){if(a<=.001)return;ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=clamp(a);ctx.fillStyle='#d7efec';ctx.fillRect(0,0,W,H);ctx.restore()}
function _fog(ctx,t,a=.16){ctx.save();ctx.filter='blur(22px)';for(let i=0;i<8;i++){const x=((i*211+t*(15+i*3))%(W+520))-260;const y=530+55*Math.sin(i*1.3+t*.17);ell(ctx,x,y,190+50*rnd(i),30+10*rnd(i+2),P.paper2,null,1,a*(.18+.28*rnd(i+6)))}ctx.restore()}
function _rain(ctx,t,a=.65){ctx.save();ctx.strokeStyle=P.cold;ctx.lineWidth=.8;for(let i=0;i<150;i++){const x=(rnd(i*9)*W+t*(230+90*rnd(i*7)))%W;const y=(rnd(i*5)*H+t*(600+180*rnd(i*11)))%H;ctx.globalAlpha=a*(.035+.10*rnd(i+14));ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-9,y+27);ctx.stroke()}ctx.restore()}


function paper(ctx,...args){paint(ctx,'paper_field',()=>_paper(ctx,...args))}
function post(ctx,t,v=.56){paint(ctx,'ink_speck_grain',()=>{ctx.globalCompositeOperation='multiply';ctx.fillStyle=P.ink;for(const s of specks){ctx.globalAlpha=s.a;ctx.fillRect((s.x+(Math.floor(t*12)%3)*.4)%W,s.y,s.s,s.s)}});paint(ctx,'vignette_value_structure',()=>{const g=ctx.createRadialGradient(W*.50,H*.48,H*.18,W*.50,H*.48,W*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.65,'rgba(15,12,8,.045)');g.addColorStop(1,`rgba(5,6,4,${v})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)})}

function fog(ctx,...args){paint(ctx,'laboratory_fog',()=>_fog(ctx,...args))}
function rain(ctx,...args){paint(ctx,'rain_field',()=>_rain(ctx,...args))}
// Bezier engraving strokes follow local form rather than laying one net over every surface.
function strokePath(ctx,d,c=P.ink,w=1,a=1){ctx.save();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.globalAlpha=a;ctx.lineCap='round';ctx.stroke(new Path2D(d));ctx.restore()}
function shape(ctx,d,fill,stroke=P.ink,w=1,a=1){ctx.save();ctx.globalAlpha=a;const q=new Path2D(d);if(fill){ctx.fillStyle=fill;ctx.fill(q)}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.stroke(q)}ctx.restore()}
function transform(ctx,x,y,s,rot,fn){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.rotate(rot);try{fn()}finally{ctx.restore()}}
function surface(ctx,d,bbox,fill,density=5){shape(ctx,d,fill,P.ink,.8);ctx.save();ctx.clip(new Path2D(d));for(let i=0;i<bbox[3]/density;i++){const y=bbox[1]+i*density;for(let j=0;j<3;j++){const x=bbox[0]+rnd(i*17+j*71)*bbox[2];strokePath(ctx,`M ${x} ${y} q ${7+rnd(i+j)*13} -3 ${16+rnd(i*9+j)*15} 2`,P.ink,.35,.10+.10*rnd(i))}}ctx.restore()}

function electricArc(ctx,x1,y1,x2,y2,a=1,seed=1){if(a<=.01)return;const pts=[[x1,y1]];for(let i=1;i<10;i++){const q=i/10;pts.push([lerp(x1,x2,q)+(rnd(seed+i*7)-.5)*32,lerp(y1,y2,q)+(rnd(seed+i*13)-.5)*27])}pts.push([x2,y2]);ctx.save();ctx.globalCompositeOperation='screen';ctx.shadowColor=P.cold;ctx.shadowBlur=13;ctx.strokeStyle=P.cold;ctx.lineWidth=2.2;ctx.globalAlpha=.75*a;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts.slice(1))ctx.lineTo(...p);ctx.stroke();ctx.lineWidth=.7;ctx.globalAlpha=a;ctx.stroke();ctx.restore()}

function drawWindow(ctx,x,y,w,h){transform(ctx,x,y,1,0,()=>{
 paint(ctx,'gothic_laboratory_window',()=>{shape(ctx,`M0 ${h} L0 ${w*.48} Q0 0 ${w/2} 0 Q${w} 0 ${w} ${w*.48} L${w} ${h} Z`,'#171d1d','#181411',8);for(let i=1;i<4;i++)line(ctx,w*i/4,30,w*i/4,h,3,'#544a3a');for(let y=85;y<h;y+=68)line(ctx,0,y,w,y,3,'#544a3a');strokePath(ctx,`M8 ${h} L8 ${w*.48} Q8 8 ${w/2} 8 Q${w-8} 8 ${w-8} ${w*.48} L${w-8} ${h}`,P.paper2,1,.2)})
 })}
function candle(ctx,x,y,s,t){transform(ctx,x,y,s,0,()=>{
 paint(ctx,'candle_stub',()=>{ell(ctx,0,9,25,6,P.brass,P.ink,1);shape(ctx,'M-7 0 L-7 -27 Q-2 -30 6 -27 L7 0 Z','#b5a486');line(ctx,0,-29,0,-36,1,'#16110b');strokePath(ctx,'M-5 -22 Q-1 -19 -4 -13',P.paper,.8,.6)});
 paint(ctx,'candle_flame',()=>{const f=Math.sin(t*7)*2;shape(ctx,`M0 -34 Q${-8+f} -44 1 -59 Q${9+f} -39 0 -34`,'#d6b878',null);shape(ctx,'M0 -36 Q-3 -41 1 -48 Q4 -40 0 -36','#efe0af',null)})
 })}
function room(ctx,t){
 paint(ctx,'creation_chamber_architecture',()=>{ctx.fillStyle='#413b30';ctx.fillRect(0,0,W,490);const wash=ctx.createLinearGradient(0,0,1000,450);wash.addColorStop(0,'#575044');wash.addColorStop(1,'#1e1c18');ctx.fillStyle=wash;ctx.fillRect(0,0,W,490);for(let i=0;i<65;i++)strokePath(ctx,`M${rnd(i)*W} ${rnd(i+200)*450} q ${50+rnd(i+4)*80} -5 ${80+rnd(i+7)*80} 2`,P.ink,.5,.12)});
 paint(ctx,'timber_wall_beams',()=>{for(const x of [65,890]){shape(ctx,`M${x} 0 L${x+20} 0 L${x+17} 490 L${x-4} 490 Z`,'#201d16');for(let i=0;i<4;i++)line(ctx,x+i*4,0,x+i*4-4,490,.6,'#6c5e46',.2)}line(ctx,0,40,W,40,13,'#272118')});
 paint(ctx,'laboratory_floor',()=>{ctx.fillStyle='#201d17';ctx.fillRect(0,490,W,230);for(let y=510;y<H;y+=40)line(ctx,0,y,W,y-40,.8,'#615442',.25);for(let x=-200;x<W+300;x+=140)line(ctx,540,490,x,H,.9,'#594b39',.3)});
 drawWindow(ctx,180,64,280,373);
 paint(ctx,'laboratory_door',()=>{ctx.fillStyle='#090b09';ctx.fillRect(996,86,228,405);shape(ctx,'M1080 92 L1220 105 L1220 477 L1080 494 Z','#29251e','#0b0c09',5);for(let y=147;y<480;y+=108)strokePath(ctx,`M1094 ${y} L1204 ${y+8} L1204 ${y+76} L1094 ${y+88} Z`,'#75624a',.8,.23);line(ctx,984,80,984,500,9,'#191710');line(ctx,986,82,986,496,1,'#ac9470',.25)});
 paint(ctx,'laboratory_shelves_papers',()=>{ctx.fillStyle='#211a14';ctx.fillRect(560,105,290,11);for(let i=0;i<8;i++){const h=29+rnd(i+80)*22;transform(ctx,580+i*29,102,1,(rnd(i)-.5)*.11,()=>{shape(ctx,`M0 0 L0 ${-h} L17 ${-h} L17 0 Z`,['#6f5841','#403b2f','#514837'][i%3]);line(ctx,2,-h+5,15,-h+5,.6,P.paper2,.3)})}});
 paint(ctx,'anatomy_pages',()=>{transform(ctx,726,203,.82,-.025,()=>{shape(ctx,'M-104 -62 L104 -62 L104 62 L-104 62 Z','#aa9777');line(ctx,0,-62,0,62,.8,P.ink,.6);strokePath(ctx,'M-52 -38 C-82 -23 -82 13 -59 30 C-24 39 -20 -24 -52 -38 M-64 -23 Q-44 -21 -39 -6 M-68 -13 Q-45 -14 -35 0 M-70 0 Q-48 -8 -39 12 M-67 10 Q-46 3 -44 23',P.ink,.8,.7);for(let y=-40;y<45;y+=8)line(ctx,17,y,86,y,.4,P.ink,.2)})});
 candle(ctx,834,363,1.4,t)
}
function pile(ctx,x,y,s=1){transform(ctx,x,y,s,0,()=>paint(ctx,'voltaic_pile',()=>{
 ell(ctx,0,77,42,9,'#6a5335',P.ink,1.4);for(const x of [-35,35]){line(ctx,x,74,x,-108,3,'#3a2f21');line(ctx,x+1,72,x+1,-108,.7,'#b09a6c',.55)}
 for(let i=0;i<15;i++){const y=62-i*10;shape(ctx,`M-27 ${y-4} Q0 ${y+3} 27 ${y-4} L27 ${y+1} Q0 ${y+8} -27 ${y+1} Z`,i%2?'#765e3e':'#8e6541');ell(ctx,0,y-4,27,4,i%2?'#b2a587':'#a8784a',P.ink,.6);strokePath(ctx,`M-23 ${y} Q0 ${y+5} 21 ${y}`,P.paper,.45,.25);if(i<14)ell(ctx,0,y-7,25,3,'#6e6d54',P.ink,.5)}
 ell(ctx,0,-92,42,8,'#80734e',P.ink,1);line(ctx,0,-97,0,-119,2,P.brass);ell(ctx,0,-122,4,4,'#aa8754',P.ink,.5)
 }))}
function jar(ctx,x,y,s,id){transform(ctx,x,y,s,0,()=>paint(ctx,id,()=>{shape(ctx,'M-23 -63 Q-32 -57 -33 -45 L-34 58 Q0 75 34 58 L33 -45 Q32 -57 23 -63 Z','rgba(143,158,144,.08)',P.ink,1.7);shape(ctx,'M-32 4 Q0 12 32 4 L33 57 Q0 73 -33 57 Z','#777361',P.ink,.9);for(let i=0;i<11;i++)strokePath(ctx,`M${-30+i*6} 10 L${-30+i*6} 56`,P.ink,.6,.3);ell(ctx,0,-63,25,5,'#8c7654',P.ink,1);line(ctx,0,-65,0,-104,2,'#a28b5e');ell(ctx,0,-108,6,6,'#9b8154',P.ink,.8);strokePath(ctx,'M-26 -39 L-26 0','#d5d2b2',1,.35)}))}
function hand(ctx,x,y,s,rot,creature=false){transform(ctx,x,y,s,rot,()=>paint(ctx,creature?'creature_hand':'victor_hand',()=>{
 // One thumb and four distinct fingers; flexed pose, rather than a mitten with three rays.
 const d='M-11 25 C-16 18 -18 7 -15 -4 L-13 -22 C-13 -28 -8 -29 -6 -23 L-7 -7 L-3 -34 C-2 -40 3 -39 4 -34 L3 -9 L9 -34 C10 -40 16 -38 15 -31 L10 -5 L17 -24 C20 -29 25 -26 23 -20 L16 2 L25 -5 C31 -8 34 -3 29 2 L14 16 L12 28 Z';
 surface(ctx,d,[-18,-40,52,70],creature?'#afa178':'#bba982',4);strokePath(ctx,'M-6 8 Q0 2 10 5 M-8 15 Q1 7 13 10 M-6 -7 L-2 0 M4 -9 L3 -1 M11 -5 L8 1 M13 18 L9 24',P.ink,.7,.48)
 }))}
function head(ctx,x,y,s,rot,creature=false,op=0){transform(ctx,x,y,s,rot,()=>{
 const iid=creature?'creature_head_shape':'victor_head_profile';
 paint(ctx,iid,()=>{
 // Brow, bridge, nostril, upper lip, lower lip, chin and jaw have separate planes.
 const face='M-20 -37 C-12 -55 15 -54 25 -38 C29 -31 28 -23 25 -16 L32 -4 Q38 0 31 3 L26 3 Q25 7 29 9 L27 13 L29 17 Q25 21 21 24 Q17 32 8 33 L2 46 L-17 44 L-18 25 Q-33 10 -30 -12 Z';
 surface(ctx,face,[-33,-56,72,104],creature?'#a79668':'#b3a183',1.6);
 shape(ctx,'M-24 -30 Q-11 -16 -10 -2 L-16 17 L2 26 L-2 44 L-18 42 L-20 24 Q-33 3 -24 -30 Z','#4c4636',null,1,.75);
 strokePath(ctx,'M9 -19 Q18 -25 24 -19 M11 -15 Q17 -12 23 -15 M23 -12 Q20 -3 25 1 M26 4 L30 3 M23 12 L28 12 M17 21 Q12 24 7 23 M2 3 Q10 4 16 10 M-5 13 Q1 21 10 22',P.ink,.55,.7);
 for(let i=0;i<10;i++)strokePath(ctx,`M${-17+i*2.5} ${-32+i*.5} Q${-10+i*2} ${-16+i} ${-12+i*2.6} ${-1+i*.4}`,P.ink,.4,.18);
 if(!creature){line(ctx,18,-16,20,-16,1.8,P.ink);strokePath(ctx,'M-14 25 Q-1 31 9 30',P.ink,.7,.5)}
 });
 paint(ctx,creature?'creature_hair':'victor_hair',()=>{
 shape(ctx,'M-28 10 C-42 -9 -35 -47 -15 -56 C2 -65 25 -53 30 -35 Q26 -27 20 -26 L20 -39 Q12 -27 -1 -24 L-10 -10 L-20 8 L-23 23 Z','#090b09',P.ink,.9);
 for(let i=0;i<24;i++){const q=i/24;strokePath(ctx,`M${-22+q*40} ${-42-12*Math.sin(q*3)} C${-37+q*50} ${-28} ${-34+q*47} ${-15} ${-30+q*42} ${creature?47+16*Math.sin(q*4):3+11*Math.sin(q*4)}`,['#998969','#706550','#beb095'][i%3],.24,.25)}
 if(creature){shape(ctx,'M-25 -10 Q-28 24 -37 53 L-17 51 Q-8 23 -8 -12 Z','#0a0c0a',null);for(let i=0;i<7;i++)strokePath(ctx,`M${-26+i*2} -12 Q${-14+i} 12 ${-32+i*2} 48`,'#aaa07b',.45,.35)}
 });
 if(creature)paint(ctx,'creature_eye',()=>{transform(ctx,18,-16,1,0,()=>{
 const open=clamp(op);shape(ctx,`M-9 0 Q0 ${-5.8*open} 9 0 Q0 ${4*open} -9 0`,'#827b55',P.ink,.7);
 if(open>.04){ctx.save();ctx.beginPath();ctx.ellipse(0,0,7.8,4.5*open,0,0,Math.PI*2);ctx.clip();ell(ctx,1,0,3.5,3.5,'#a29652');ell(ctx,1,0,1.2,2.2,'#272619');ell(ctx,2,-1,.7,.45,'#ccbf88',null,1,.75);ctx.restore()}
 strokePath(ctx,`M-10 -2 Q0 ${-3-6*open} 10 -1 M-10 3 Q0 ${6+3*open} 9 2`,P.ink,.6,.6)
 })});
 })}
function victor(ctx,x,y,s,ret=0){transform(ctx,x,y,s,-.05-ret*.10,()=>{
 paint(ctx,'victor_coat',()=>{surface(ctx,'M-26 -28 Q-45 -22 -48 12 L-40 87 L-59 206 L-17 199 L-4 112 L12 199 L48 205 L29 86 L32 15 Q29 -19 17 -27 Z',[-59,-28,107,240],'#24251f',5);shape(ctx,'M-26 -26 L-8 35 L-24 51 L-32 19 Z','#35382b');shape(ctx,'M18 -26 L-8 35 L9 48 L28 15 Z','#36372b');for(let i=0;i<5;i++)ell(ctx,-5,40+i*13,1.4,1.6,'#837553');strokePath(ctx,'M-32 92 Q-37 130 -47 189 M18 98 Q25 133 36 188 M-16 108 Q-24 126 -29 150',P.paper2,.7,.28)});
 paint(ctx,'victor_silhouette',()=>{shape(ctx,'M-24 186 L-7 186 L-11 267 L-35 270 L-39 265 L-25 254 Z','#151914');shape(ctx,'M13 186 L29 186 L38 255 L49 267 L25 270 L15 258 Z','#181a14');line(ctx,-29,217,-23,253,.6,P.paper2,.2);line(ctx,23,217,29,252,.6,P.paper2,.2)});
 paint(ctx,'victor_recoil_pose',()=>{surface(ctx,'M-39 -14 Q-53 -6 -60 32 L-45 65 L-5 39 L-12 23 L-38 40 L-40 20 Z',[-63,-16,63,86],'#24281f',5);surface(ctx,'M27 -10 Q40 -5 41 12 L60 52 L37 70 L17 39 L24 28 L39 45 L29 13 Z',[17,-10,47,81],'#292a22',5)});
 paint(ctx,'victor_collar_cravat',()=>{shape(ctx,'M-18 -31 L-5 -18 L15 -34 L10 -6 L-7 4 L-17 -14 Z','#c1b499');shape(ctx,'M-6 -17 L6 -13 L-1 -5 L-12 -10 Z','#80735a');strokePath(ctx,'M-17 -29 L-7 -18 M11 -28 L2 -17',P.ink,.6,.7)});
 head(ctx,-2,-70,1,-.02,false);hand(ctx,-7,27,.52,-1.08);hand(ctx,45,56,.53,.7)
 })}
function creature(ctx,x,y,s,rise){transform(ctx,x,y,s,-.03,()=>{
 const r=smooth(rise);
 paint(ctx,'creature_body_proportions',()=>{surface(ctx,'M-91 -7 Q-65 -32 -35 -22 L102 10 Q148 15 193 33 L232 36 Q246 42 235 50 L201 49 Q151 47 112 35 L-39 28 Z',[-99,-35,346,91],'#a49871',4);strokePath(ctx,'M102 22 Q142 28 188 37 M190 38 L213 43 M222 40 L226 46',P.ink,.8,.4);surface(ctx,'M-83 5 Q-112 11 -129 42 L-145 67 L-134 77 Q-118 57 -107 47 L-61 26 Z',[-150,0,95,86],'#a4966b',4)});
 hand(ctx,-143,74,.5,-.6,true);
 paint(ctx,'creature_drapery',()=>{surface(ctx,`M-78 ${-13-r*6} Q-49 ${-42-r*12} -8 -22 Q43 -18 104 16 L128 42 Q93 57 37 54 L-52 46 L-108 23 Z`,[-110,-54,245,119],'#b1a385',4.8);for(let i=0;i<12;i++)strokePath(ctx,`M${-62+i*13} ${-14+12*Math.sin(i*.5)} Q${-63+i*12} 19 ${-90+i*18} ${35+13*Math.sin(i*.7)}`,i%3?'#5f5541':'#d6c8a7',.8,.62);shape(ctx,'M-39 8 Q2 26 54 28 L91 47 Q36 33 -24 35 Z','#71664e',null,1,.35)});
 head(ctx,-106,-22-r*23,1,-.38+r*.24,true,r);
 })}
function folioSkull(ctx){
 paint(ctx,'open_folio',()=>transform(ctx,317,631,.85,-.09,()=>{shape(ctx,'M-97 0 Q-55 -20 -2 -6 L0 58 Q-51 39 -97 49 Z','#ae9b76');shape(ctx,'M-2 -6 Q44 -24 101 -10 L100 45 Q43 35 0 58 Z','#b9a782');for(let i=0;i<9;i++){strokePath(ctx,`M-87 ${4+i*4} Q-45 ${-7+i*4} -12 ${4+i*4}`,P.ink,.45,.5);strokePath(ctx,`M12 ${1+i*4} Q50 ${-7+i*4} 90 ${i*4}`,P.ink,.45,.5)}line(ctx,-2,-6,0,58,1,P.ink)}));
 paint(ctx,'skull_foreground',()=>transform(ctx,463,632,.78,.16,()=>{surface(ctx,'M-24 0 C-30 -21 -21 -37 1 -37 C24 -37 32 -24 30 -7 L24 8 L13 15 L16 27 Q4 34 -12 27 L-15 14 L-25 7 Z',[-30,-40,63,77],'#ad9c77',3);shape(ctx,'M-19 -12 Q-7 -17 -6 -6 Q-7 4 -16 0 Z','#2e2b20');shape(ctx,'M5 -13 Q20 -15 22 -5 Q15 4 6 -1 Z','#2e2b20');shape(ctx,'M-1 1 L-6 10 L4 11 Z','#2e2b20');for(let i=0;i<7;i++)line(ctx,-10+i*3,19,-10+i*3,27,.5,P.ink,.7)}));
}
function apparatus(ctx){pile(ctx,139,438,.82);jar(ctx,598,433,.82,'leyden_jar_primary');jar(ctx,675,440,.65,'leyden_jar_secondary');paint(ctx,'copper_wire_network',()=>{strokePath(ctx,'M139 338 C160 344 183 366 220 365 C391 355 423 326 598 344',P.copper,1.6,.65);strokePath(ctx,'M139 492 C197 517 293 515 302 424',P.copper,1.5,.6)})}
function tableau(ctx,t,u,rise=0,ret=0){paper(ctx,t,.08);const drift=lerp(8,-12,ease(u));ctx.save();ctx.translate(drift,0);room(ctx,t);apparatus(ctx);
 paint(ctx,'creation_bed_slab',()=>{shape(ctx,'M104 483 L670 452 L791 567 L162 614 Z','#312b20',P.ink,2);line(ctx,145,509,150,619,7,'#1b1912');line(ctx,720,499,757,590,7,'#1b1912');for(let i=0;i<7;i++)strokePath(ctx,`M${165+i*84} 521 L${178+i*84} 581`,'#6e5c42',.6,.3)});
 creature(ctx,386,477,1.34,rise);victor(ctx,1107+ret*24,291,.9,ret);folioSkull(ctx);
 paint(ctx,'foreground_copper_cable',()=>strokePath(ctx,'M-30 698 C210 603 367 684 599 656 C820 624 978 689 1320 646','#6d5035',2,.7));ctx.restore();fog(ctx,t,.07);
 paint(ctx,'candle_light_pool',()=>{ctx.globalCompositeOperation='multiply';const g=ctx.createRadialGradient(828,318,40,828,318,960);g.addColorStop(0,'rgba(25,18,8,0)');g.addColorStop(.5,'rgba(9,12,9,.24)');g.addColorStop(1,'rgba(3,6,5,.79)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)});post(ctx,t,.55)
}
function shotStormExterior(ctx,t,u,S){paper(ctx,t,.08);
 paint(ctx,'storm_sky',()=>{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#242d2b');g.addColorStop(1,'#1b2520');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);for(let i=0;i<40;i++)strokePath(ctx,`M${rnd(i)*W-250} ${40+rnd(i+21)*230} q 130 -17 420 3`,'#131e1d',2,.15)});
 ctx.save();const z=1+.035*ease(u);ctx.translate(W*.5*(1-z),H*.7*(1-z));ctx.scale(z,z);
 paint(ctx,'ingolstadt_roofline',()=>{
 // Traced source-pixel skyline mask excludes the plate banner, captions, heraldry and garden.
 const edge=[[30, 345], [53, 319], [75, 320], [111, 286], [138, 310], [168, 307], [168, 248], [182, 233], [183, 204], [182, 188], [196, 164], [198, 145], [201, 164], [214, 188], [210, 204], [211, 230], [225, 249], [258, 259], [278, 249], [293, 299], [306, 298], [309, 250], [322, 238], [331, 215], [339, 247], [350, 261], [350, 302], [379, 340], [416, 338], [435, 302], [451, 241], [463, 302], [464, 327], [513, 324], [534, 284], [536, 263], [549, 296], [562, 322], [584, 301], [585, 216], [598, 187], [604, 155], [611, 185], [624, 210], [625, 255], [641, 255], [644, 215], [655, 193], [664, 215], [665, 255], [690, 256], [711, 313], [741, 269], [758, 272], [779, 259], [800, 238], [810, 281], [826, 260], [834, 248], [882, 262], [900, 298], [912, 222], [925, 298], [961, 328], [983, 279], [995, 220], [1008, 288], [1041, 330], [1060, 282], [1080, 288], [1114, 304], [1138, 297], [1145, 246], [1158, 300], [1188, 320], [1212, 270], [1229, 282], [1265, 296], [1282, 325], [1297, 256], [1312, 327], [1336, 309], [1355, 263], [1387, 269], [1399, 281], [1416, 321], [1440, 299], [1467, 268], [1487, 250], [1501, 283], [1518, 298], [1529, 259], [1543, 239], [1559, 277], [1566, 283], [1583, 276], [1607, 329], [1610, 470], [30, 470]];
 ctx.save();ctx.translate(0,178);ctx.scale(1280/1580,284/350);ctx.translate(-30,-120);ctx.beginPath();edge.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();ctx.drawImage(skyline,0,0);ctx.globalCompositeOperation='multiply';const g=ctx.createLinearGradient(0,145,0,470);g.addColorStop(0,'#606c5b');g.addColorStop(1,'#374b3c');ctx.fillStyle=g;ctx.fillRect(30,120,1580,350);ctx.globalCompositeOperation='source-over';const fade=ctx.createLinearGradient(0,390,0,470);fade.addColorStop(0,'rgba(27,37,32,0)');fade.addColorStop(1,'#1b2520');ctx.fillStyle=fade;ctx.fillRect(30,390,1580,80);ctx.restore()
 });
 // Historical windows are integrated into the reference plate; review them as a crop, not a fabricated independent sprite.
 paint(ctx,'laboratory_exterior_building',()=>{shape(ctx,'M925 720 L932 386 L1047 315 L1280 403 L1280 720 Z','#141e1a');for(let y=448;y<H;y+=36)line(ctx,936,y,1279,y+29,.7,'#83907a',.12);line(ctx,932,386,1048,315,2,'#9c9c7b',.28)});
 paint(ctx,'gothic_laboratory_window',()=>{shape(ctx,'M1093 488 L1093 445 Q1093 424 1108 423 Q1123 424 1123 445 L1123 491 Z','#a48b4f','#171a13',3);line(ctx,1108,424,1108,491,2,'#353722');line(ctx,1093,458,1123,460,2,'#353722')});ctx.restore();rain(ctx,t,.9);
 paint(ctx,'exterior_lightning',()=>{let f=0;for(const q of S.cues.lightning||[])f+=q.strength*pulse(S.local,q.time,.045);if(f>.002)flash(ctx,f*.25)});post(ctx,t,.59)
}
function shotCreationChamber(ctx,t,u,S){tableau(ctx,t,u)}
function shotVictorAtDoor(ctx,t,u,S){paper(ctx,t,.10);paint(ctx,'laboratory_door',()=>{ctx.fillStyle='#151b16';ctx.fillRect(0,0,W,H);ctx.fillStyle='#2d2e22';ctx.fillRect(279,0,57,H);for(let i=0;i<9;i++)strokePath(ctx,`M${285+i*5} 0 Q${294+i*4} 350 ${286+i*5} 720`,P.paper2,.7,.17)});
 head(ctx,739+3*Math.sin(t*.9),387,5.0,-.08,false);
 paint(ctx,'victor_collar_cravat',()=>{shape(ctx,'M639 605 L730 555 L797 611 L758 720 L612 720 Z','#92866c');strokePath(ctx,'M663 611 Q720 642 755 647 M651 628 Q704 668 744 673',P.ink,1,.55)});
 hand(ctx,348,496,1.1,.12);
 paint(ctx,'victor_door_shadow',()=>{ctx.globalCompositeOperation='multiply';const sh=ctx.createLinearGradient(370,0,1020,0);sh.addColorStop(0,'rgba(2,5,3,.82)');sh.addColorStop(.55,'rgba(2,5,3,.05)');sh.addColorStop(1,'rgba(2,5,3,.15)');ctx.fillStyle=sh;ctx.fillRect(0,0,W,H)});post(ctx,t,.61)
}
function shotGalvanicContact(ctx,t,u,S){paper(ctx,t,.10);paint(ctx,'creation_bed_slab',()=>{ctx.fillStyle='#22261e';ctx.fillRect(0,0,W,H);shape(ctx,'M0 528 L1280 425 L1280 720 L0 720 Z','#3d3628');for(let i=0;i<13;i++)strokePath(ctx,`M0 ${550+i*15} Q500 ${490+i*18} 1280 ${451+i*15}`,'#726045',.7,.28)});
 pile(ctx,270,474,1.55);jar(ctx,948,454,1.26,'leyden_jar_primary');jar(ctx,1110,478,.88,'leyden_jar_secondary');
 paint(ctx,'brass_contact',()=>{shape(ctx,'M504 511 L754 498 L774 530 L522 546 Z','#312919');ell(ctx,568,504,9,6,'#977a46',P.ink,1);ell(ctx,722,494,9,6,'#977a46',P.ink,1);line(ctx,568,504,693,466,6,'#927345');line(ctx,568,501,693,463,1,'#cab483',.5);ell(ctx,693,466,5,5,'#b99b64',P.ink,1)});
 paint(ctx,'copper_wire_network',()=>{strokePath(ctx,'M270 285 C310 348 409 462 568 504','#936540',2);strokePath(ctx,'M722 494 C763 475 864 280 948 318','#936540',2);strokePath(ctx,'M948 535 C842 587 449 587 270 580','#785133',1.7)});
 paint(ctx,'victor_coat',()=>{surface(ctx,'M556 -20 L650 -20 L750 290 L709 389 L647 362 L627 248 Z',[546,-30,213,447],'#22281f',7);shape(ctx,'M646 351 L704 370 L715 390 L649 377 Z','#b0a185')});
 hand(ctx,704,400+42*ease(u),.96,3.25);
 // A brief narrative spark is deliberately not a physically certified pile discharge.
 paint(ctx,'electric_arc',()=>{let a=0;for(const q of S.cues.arc_hits||[])a+=pulse(S.local,q,.025);if(a>.015){electricArc(ctx,693,467,715,492,a*.55,90+Math.floor(t*24))}});candle(ctx,1175,569,1.1,t);post(ctx,t,.55)
}
function shotFirstEye(ctx,t,u,S){paper(ctx,t,.10);paint(ctx,'first_eye_shadow_mask',()=>{ctx.fillStyle='#080d09';ctx.fillRect(0,0,W,H)});const op=smooth((u-.20)/.42);
 ctx.save();const z=1+.035*ease(u);ctx.translate(20*(1-z),20*(1-z));ctx.scale(z,z);head(ctx,755,405,7.1,-.12,true,op);ctx.restore();
 paint(ctx,'linen_closeup_edge',()=>{surface(ctx,'M0 664 Q345 627 573 663 Q856 648 1280 611 L1280 720 L0 720 Z',[0,610,1280,110],'#84785c',5);for(let i=0;i<8;i++)strokePath(ctx,`M${120+i*143} 669 Q${200+i*130} 683 ${300+i*130} 699`,P.ink,.9,.3)});
 paint(ctx,'first_eye_shadow_mask',()=>{ctx.globalCompositeOperation='multiply';const g=ctx.createLinearGradient(430,0,970,0);g.addColorStop(0,'rgba(3,6,3,.96)');g.addColorStop(.7,'rgba(3,6,3,.15)');g.addColorStop(1,'rgba(3,6,3,.10)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)});post(ctx,t,.63)
}
function shotRecoilTableau(ctx,t,u,S){tableau(ctx,t,u,smooth((u-.08)/.60)*.6,smooth((u-.17)/.58));if(u>.62){
 paint(ctx,'title_frankenstein',()=>{ctx.globalAlpha=smooth((u-.62)/.23);const g=ctx.createLinearGradient(0,530,0,H);g.addColorStop(0,'rgba(5,9,6,0)');g.addColorStop(.4,'rgba(5,9,6,.9)');g.addColorStop(1,'rgba(5,9,6,.98)');ctx.fillStyle=g;ctx.fillRect(0,530,W,190);ctx.textAlign='center';ctx.fillStyle='#c2b697';ctx.font='46px "EB Garamond"';ctx.fillText('FRANKENSTEIN',640,633)});
 paint(ctx,'subtitle_modern_prometheus',()=>{ctx.globalAlpha=smooth((u-.68)/.22);ctx.textAlign='center';ctx.fillStyle='#9f9479';ctx.font='17px "EB Garamond"';ctx.fillText('OR, THE MODERN PROMETHEUS',640,665)})
 }}
function transition(ctx,type,p){p=clamp(p);if(type==='none'||type==='hard_cut')return;
 const id={lightning_cut:'lightning_cut',shadow_cut:'shadow_cut',arc_match_cut:'arc_match_cut'}[type];paint(ctx,id,()=>{if(type==='lightning_cut')flash(ctx,smooth(p)*.25);if(type==='shadow_cut'){ctx.globalAlpha=smooth(p)*.7;const g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(2,5,3,0)');g.addColorStop(1,'rgba(2,5,3,.95)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}if(type==='arc_match_cut')flash(ctx,smooth(p)*.08)})}
function locate(t){let st=0;for(let i=0;i<M.shots.length;i++){const s=M.shots[i];if(t<st+s.duration||i===M.shots.length-1)return {shot:s,index:i,start:st,local:t-st,u:clamp((t-st)/s.duration)};st+=s.duration}}
const renderers={stormExterior:shotStormExterior,creationChamber:shotCreationChamber,victorAtDoor:shotVictorAtDoor,galvanicContact:shotGalvanicContact,firstEye:shotFirstEye,recoilTableau:shotRecoilTableau};
function render(ctx,t,itemId=null){activeItem=itemId;seenItems.clear();ctx.clearRect(0,0,W,H);const q=locate(t),fn=renderers[q.shot.renderer];if(!fn)throw Error('unknown renderer '+q.shot.renderer);fn(ctx,t,q.u,{...q,cues:q.shot.cues||{}});const tr=q.shot.transition_out||'hard_cut';const td=tr==='lightning_cut'?.15:tr==='arc_match_cut'?.18:tr==='shadow_cut'?.22:0;if(td&&q.local>q.shot.duration-td)transition(ctx,tr,(q.local-(q.shot.duration-td))/td);activeItem=null;return {seenItems:[...seenItems],shotId:q.shot.id}}

function makeWav(file,solo=null){const n=Math.round(SR*DUR),ch=2,b=Buffer.alloc(44+n*ch*2);let o=0;const ws=s=>{b.write(s,o);o+=s.length},u32=v=>{b.writeUInt32LE(v,o);o+=4},u16=v=>{b.writeUInt16LE(v,o);o+=2};ws('RIFF');u32(36+n*ch*2);ws('WAVE');ws('fmt ');u32(16);u16(1);u16(ch);u32(SR);u32(SR*ch*2);u16(ch*2);u16(16);ws('data');u32(n*ch*2);let starts=[],acc=0;for(const s of M.shots){starts.push(acc);acc+=s.duration}const E={thunder:[],steps:[],arc:[],crackle:[],heartbeat:[],breath:[],rain:[]};M.shots.forEach((s,i)=>{const c=s.cues||{},st=starts[i];for(const q of c.thunder||[])E.thunder.push(st+q);for(const q of c.footsteps||[])E.steps.push(st+q);for(const q of c.arc_hits||[])E.arc.push(st+q);for(const q of c.electrical_crackle||[])E.crackle.push([st+q[0],st+q[1]]);if(c.rain)E.rain.push([st,st+s.duration]);if(c.heartbeat)E.heartbeat.push([st,st+s.duration]);if(c.breath)E.breath.push([st,st+s.duration])});if(solo){const keep={thunder_cues:'thunder',footstep_cues:'steps',electrical_crackle_audio:'crackle',arc_hit_audio:'arc',creature_heartbeat:'heartbeat',victor_breath:'breath',rain_patter_audio:'rain'}[solo];for(const k of Object.keys(E))if(k!==keep)E[k]=[]}let seed=194;const R=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};let lpL=0,lpR=0;for(let i=0;i<n;i++){const t=i/SR;let L=.040*Math.sin(2*Math.PI*38*t)+.022*Math.sin(2*Math.PI*57*t),Rr=.038*Math.sin(2*Math.PI*38*t)+.024*Math.sin(2*Math.PI*61*t);if(solo&&solo!=='audio_low_drone'){L=0;Rr=0}lpL=lpL*.974+(R()*2-1)*.016*.026;lpR=lpR*.971+(R()*2-1)*.016*.029;if(!solo||solo==='audio_noise_roomtone'){L+=lpL;Rr+=lpR}for(const [a,z] of E.rain){if(t>=a&&t<=z){const v=(R()*2-1)*.014;L+=v;Rr+=v*.88}}for(const c of E.thunder){const d=t-c;if(d>=0&&d<1.65){const en=Math.exp(-d*2.2),nn=(R()*2-1)*.22*en,bb=.12*Math.sin(2*Math.PI*29*d)*en;L+=nn+bb;Rr+=nn*.9+bb*1.05}}for(const c of E.steps){const d=t-c;if(d>=0&&d<.12){const v=.10*Math.sin(2*Math.PI*72*d)*Math.exp(-d*32);L+=v;Rr+=v*.76}}for(const [a,z] of E.crackle){if(t>=a&&t<=z){const e=.015+(R()>.989?.18:0);L+=(R()*2-1)*e;Rr+=(R()*2-1)*e}}for(const c of E.arc){const d=t-c;if(d>=0&&d<.065){const v=(R()*2-1)*.31*Math.exp(-d*42);L+=v;Rr+=v*.93}}for(const [a,z] of E.heartbeat){if(t>=a&&t<=z){const ph=(t-a)%1.03;if(ph<.055){const v=.17*Math.sin(Math.PI*ph/.055);L+=v;Rr+=v*.82}if(ph>.13&&ph<.175){const v=.09*Math.sin(Math.PI*(ph-.13)/.045);L+=v*.78;Rr+=v}}}for(const [a,z] of E.breath){if(t>=a&&t<=z){const en=Math.pow(Math.max(0,Math.sin(2*Math.PI*(t-a)*.48)),2),v=(R()*2-1)*.016*en;L+=v;Rr+=v*.91}}const fade=Math.min(1,t/.35,(DUR-t)/.45);L=Math.tanh(L*1.3)*.76*fade;Rr=Math.tanh(Rr*1.3)*.76*fade;b.writeInt16LE(Math.round(clamp(L,-1,1)*32767),44+(i*2)*2);b.writeInt16LE(Math.round(clamp(Rr,-1,1)*32767),44+(i*2+1)*2)}fs.writeFileSync(file,b)}


async function main(){const frames=path.join(ROOT,'frames');fs.mkdirSync(frames,{recursive:true});makeWav(path.join(ROOT,'soundscape.wav'));const start=Number(process.env.START_FRAME||0),end=Math.min(FRAMES,Number(process.env.END_FRAME||FRAMES));for(let f=start;f<end;f++){const c=new Canvas(W,H);render(c.getContext('2d'),f/FPS);await c.toFile(path.join(frames,String(f).padStart(5,'0')+'.png'));if(f%96===0)console.log(`frame ${f}/${FRAMES}`)}console.log(`done ${end-start} frames`)}
if(require.main===module)main().catch(e=>{console.error(e);process.exit(1)});
module.exports={render,locate,makeWav,M,W,H,FPS,FRAMES};
