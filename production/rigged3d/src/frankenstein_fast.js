import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

const W=1280,H=720;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(W,H,false); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const effect=new OutlineEffect(renderer,{defaultThickness:0.0045,defaultColor:[0.025,0.018,0.012]});

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0d1010);
scene.fog=new THREE.FogExp2(0x0d1010,0.055);

const camera=new THREE.PerspectiveCamera(40,W/H,0.05,100);
const hemi=new THREE.HemisphereLight(0x9fb0b8,0x1b120b,0.7); scene.add(hemi);
const key=new THREE.PointLight(0xf5c581,6.0,10,2); key.position.set(-0.2,1.55,0.6); scene.add(key);
const cold=new THREE.DirectionalLight(0x8ea9bd,1.0); cold.position.set(-3,4,-4); scene.add(cold);
const flash=new THREE.PointLight(0xbfdcff,0,12,2); flash.position.set(0.5,2.4,0); scene.add(flash);

const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,10),new THREE.MeshToonMaterial({color:0x3d3931}));
floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);

const loader=new GLTFLoader();

function toonify(root,color=null){
  root.traverse(o=>{
    if(!o.isMesh)return;
    o.castShadow=true; o.receiveShadow=true;
    const old=Array.isArray(o.material)?o.material[0]:o.material;
    const c=color?new THREE.Color(color):(old?.color?.clone?.()||new THREE.Color(0xa89a80));
    o.material=new THREE.MeshToonMaterial({color:c,map:old?.map||null});
  });
}
async function readyAsset(url,{width=null,height=null,color=null}={}){
  const gltf=await loader.loadAsync(url);
  const raw=gltf.scene; toonify(raw,color); raw.updateMatrixWorld(true);
  let box=new THREE.Box3().setFromObject(raw),size=box.getSize(new THREE.Vector3());
  const scale=width?width/Math.max(size.x,size.z):height?height/size.y:1;
  raw.scale.multiplyScalar(scale); raw.updateMatrixWorld(true);
  box=new THREE.Box3().setFromObject(raw);
  const center=box.getCenter(new THREE.Vector3());
  raw.position.x-=center.x; raw.position.z-=center.z; raw.position.y-=box.min.y;
  raw.updateMatrixWorld(true);
  const group=new THREE.Group(); group.add(raw);
  const finalBox=new THREE.Box3().setFromObject(group), finalSize=finalBox.getSize(new THREE.Vector3());
  return {group,size:finalSize,gltf};
}
function actor(source,animations,{x=0,y=0,z=0,rot=0,color=0x9c8b70,scale=1}={}){
  const root=SkeletonUtils.clone(source); toonify(root,color); root.position.set(x,y,z); root.rotation.y=rot; root.scale.setScalar(scale); scene.add(root);
  return {root,mixer:new THREE.AnimationMixer(root),animations,current:null};
}
function exact(clips,name){return clips.find(c=>c.name===name)||null;}
function applyAt(a,clip,time,loop=true){
  if(!clip)return;
  if(a.current!==clip){a.mixer.stopAllAction();a.current=clip;}
  const action=a.mixer.clipAction(clip); action.enabled=true; action.setEffectiveWeight(1); action.setEffectiveTimeScale(1);
  action.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1); action.clampWhenFinished=!loop; action.play(); action.paused=true;
  action.time=loop?((time%clip.duration)+clip.duration)%clip.duration:Math.min(Math.max(time,0),Math.max(clip.duration-1/120,0));
  a.mixer.update(0); a.root.updateMatrixWorld(true);
}
function findBone(root,regexes){
  let bones=[]; root.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton) bones.push(...o.skeleton.bones);});
  bones=[...new Map(bones.map(b=>[b.uuid,b])).values()];
  for(const re of regexes){const b=bones.find(x=>re.test(x.name||''));if(b)return b;}
  return null;
}
function worldPos(obj){const v=new THREE.Vector3();obj.getWorldPosition(v);return v;}

const human=await loader.loadAsync('/assets/human_male.glb');
const clips=human.animations;
const C={
  idle:exact(clips,'Idle_Loop'),
  walk:exact(clips,'Walk_Formal_Loop'),
  interact:exact(clips,'Interact'),
  death:exact(clips,'Death01'),
  rise:exact(clips,'LayToIdle'),
  chest:exact(clips,'Hit_Chest'),
  zombie:exact(clips,'Zombie_Idle_Loop'),
  recoil:exact(clips,'Hit_Knockback')
};
for(const [k,v] of Object.entries(C)) if(!v) throw new Error('Missing exact ready clip: '+k);

const victor=actor(human.scene,clips,{x:-2.35,z:0.75,rot:-Math.PI/2,color:0x4b4033,scale:1.0});
const creature=actor(human.scene,clips,{x:0.95,y:0.68,z:-0.3,rot:-Math.PI/2,color:0xb8aa72,scale:1.07});

// Ready environment/props.
const wall1=await readyAsset('/assets/graveyard/brick-wall.glb',{width:3.3,color:0x514b42});
const wall2=await readyAsset('/assets/graveyard/brick-wall.glb',{width:3.3,color:0x514b42});
wall1.group.position.set(-1.7,0,-2.6); wall2.group.position.set(1.6,0,-2.6); scene.add(wall1.group,wall2.group);

const altar=await readyAsset('/assets/graveyard/altar-stone.glb',{width:2.3,color:0x625d55});
altar.group.position.set(0.95,0,-0.3); altar.group.rotation.y=-0.08; scene.add(altar.group);

const table=await readyAsset('/assets/table.glb',{width:2.0,color:0x4c3426});
scene.add(table.group);
const leverAsset=await readyAsset('/assets/lever.glb',{height:0.42,color:0x8a6f3d});
const leverPivot=new THREE.Group(); leverPivot.add(leverAsset.group); scene.add(leverPivot);
const candle=await readyAsset('/assets/graveyard/candle.glb',{height:0.34,color:0xd8caa0}); scene.add(candle.group);

// Auto-fit the interaction zone to the ready Interact hand path.
victor.root.position.set(-0.65,0,0.55); victor.root.rotation.y=-Math.PI/2;
applyAt(victor,C.interact,C.interact.duration*0.56,false);
const rightHand=findBone(victor.root,[/right.*hand/i,/hand.*right/i,/hand[._-]?r$/i,/r[._-]?hand/i]);
const contact=rightHand?worldPos(rightHand):new THREE.Vector3(0.2,1.05,0.55);
table.group.position.set(contact.x+0.15,0,contact.z);
const tableTop=Math.max(0.72,Math.min(1.05,table.size.y));
leverPivot.position.set(contact.x,tableTop,contact.z);
candle.group.position.set(contact.x+0.58,tableTop,contact.z-0.22);

// Restore start position.
victor.root.position.set(-2.35,0,0.75);
applyAt(victor,C.idle,0,true);

// Small atmospheric particles — not substitutes for motion.
const pts=[];for(let i=0;i<90;i++)pts.push((Math.random()-0.5)*7,Math.random()*3.5,(Math.random()-0.5)*4);
const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
const dust=new THREE.Points(geo,new THREE.PointsMaterial({color:0xb0a68e,size:0.018,transparent:true,opacity:0.35}));scene.add(dust);

const label=document.createElement('div');label.id='label';document.body.appendChild(label);
const flashCss=document.createElement('div');flashCss.id='flash';document.body.appendChild(flashCss);

function leverAmount(q){
  if(q<2.7||q>4.05)return 0;
  const u=Math.min(1,Math.max(0,(q-2.7)/0.75)); return Math.sin(Math.min(1,u)*Math.PI/2);
}
function setCamera(q){
  if(q<4.05){camera.position.set(4.25,2.15,5.5);camera.lookAt(-0.15,1.0,0);}
  else if(q<6.2){camera.position.set(3.0,1.55,3.15);camera.lookAt(0.95,1.02,-0.3);}
  else if(q<7.25){camera.position.set(-3.2,1.75,4.0);camera.lookAt(-0.65,1.1,0.55);}
  else {camera.position.set(4.15,2.0,5.35);camera.lookAt(-0.4,1.0,0);}
}
function setTime(t){
  const q=((t%10)+10)%10;
  flash.intensity=0; flashCss.style.opacity='0';
  creature.root.position.set(0.95,0.68,-0.3); creature.root.rotation.y=-Math.PI/2;

  if(q<2.45){
    victor.root.rotation.y=-Math.PI/2; applyAt(victor,C.walk,q,true); applyAt(creature,C.death,C.death.duration-1/120,false);
    victor.root.position.set(THREE.MathUtils.lerp(-2.35,-0.65,q/2.45),0,0.75);
    label.dataset.beat='VICTOR APPROACHES — ready skeletal walk';
  } else if(q<4.05){
    victor.root.position.set(-0.65,0,0.55); victor.root.rotation.y=-Math.PI/2; applyAt(victor,C.interact,q-2.45,false);
    applyAt(creature,C.death,C.death.duration-1/120,false);
    leverPivot.rotation.z=-0.55*leverAmount(q);
    label.dataset.beat='INTERACT — ready clip fitted to ready lever';
    if(q>3.72){const f=(q-3.72)/0.33;flash.intensity=15*(1-Math.abs(f*2-1));flashCss.style.opacity=String(Math.max(0,0.75*(1-Math.abs(f*2-1))));}
  } else if(q<5.6){
    victor.root.position.set(-0.65,0,0.55); applyAt(victor,C.idle,q-4.05,true);
    applyAt(creature,C.rise,q-4.05,false);
    label.dataset.beat='CREATURE RISES — ready LayToIdle';
  } else if(q<6.2){
    applyAt(creature,C.chest,Math.min(q-5.6,C.chest.duration-1/120),false);
    applyAt(victor,C.idle,q-5.6,true);
    label.dataset.beat='CONVULSIVE BEAT — ready Hit_Chest';
  } else if(q<7.15){
    applyAt(creature,C.zombie,q-6.2,true);
    applyAt(victor,C.recoil,q-6.2,false);
    label.dataset.beat='VICTOR RECOILS — ready Hit_Knockback';
  } else if(q<9.25){
    applyAt(creature,C.zombie,q-7.15,true);
    victor.root.rotation.y=Math.PI/2; applyAt(victor,C.walk,q-7.15,true);
    victor.root.position.set(THREE.MathUtils.lerp(-0.65,-2.25,(q-7.15)/2.1),0,0.55);
    label.dataset.beat='RETREAT — gait remains real';
  } else {
    applyAt(creature,C.zombie,q-9.25,true); victor.root.rotation.y=-Math.PI/2;applyAt(victor,C.idle,q-9.25,true);
    victor.root.position.set(-2.25,0,0.55); label.dataset.beat='AFTERMATH';
  }

  // Practical candle light varies independently of actor movement.
  key.intensity=4.5+0.35*Math.sin(q*11)+0.18*Math.sin(q*23);
  dust.rotation.y=q*0.015;
  setCamera(q); effect.render(scene,camera);
  return label.dataset.beat;
}

window.__clipInventory=clips.map(c=>({name:c.name,duration:c.duration}));
window.__chosenClips=Object.fromEntries(Object.entries(C).map(([k,v])=>[k,v.name]));
window.__contactAudit={rightHandBone:rightHand?.name||null,contact:[contact.x,contact.y,contact.z],tableHeight:table.size.y};
window.__setTime=setTime; setTime(0); window.__ready=true;
