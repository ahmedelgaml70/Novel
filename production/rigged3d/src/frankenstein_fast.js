import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

const W=1280,H=720;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);
renderer.setSize(W,H,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;
document.body.appendChild(renderer.domElement);
const effect=new OutlineEffect(renderer,{defaultThickness:0.0035,defaultColor:[0.02,0.015,0.01]});

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0b0c0b);
scene.fog=new THREE.FogExp2(0x15130f,0.022);

const camera=new THREE.PerspectiveCamera(37,W/H,0.05,100);
const hemi=new THREE.HemisphereLight(0x9eabb0,0x21160d,0.72);scene.add(hemi);
const key=new THREE.PointLight(0xf0be78,5.2,10,2);key.position.set(-0.35,1.55,1.0);scene.add(key);
const cold=new THREE.DirectionalLight(0x8fa8b9,0.85);cold.position.set(-3,4,-4);scene.add(cold);
const flash=new THREE.PointLight(0xd7efff,0,8,2);scene.add(flash);

const draco=new DRACOLoader();
draco.setDecoderPath('/draco/');
const loader=new GLTFLoader();
loader.setDRACOLoader(draco);
loader.setMeshoptDecoder(MeshoptDecoder);

function toonify(root,color=null){
  root.traverse(o=>{
    if(!o.isMesh)return;
    o.castShadow=true;o.receiveShadow=true;
    const old=Array.isArray(o.material)?o.material[0]:o.material;
    const c=color?new THREE.Color(color):(old?.color?.clone?.()||new THREE.Color(0xffffff));
    o.material=new THREE.MeshToonMaterial({
      color:c,
      map:old?.map||null,
      transparent:old?.transparent||false,
      opacity:old?.opacity??1
    });
  });
}
async function readyAsset(url,{width=null,height=null,color=null}={}){
  const gltf=await loader.loadAsync(url);
  const raw=gltf.scene;toonify(raw,color);raw.updateMatrixWorld(true);
  let box=new THREE.Box3().setFromObject(raw),size=box.getSize(new THREE.Vector3());
  const scale=width?width/Math.max(size.x,size.z):height?height/size.y:1;
  raw.scale.multiplyScalar(scale);raw.updateMatrixWorld(true);
  box=new THREE.Box3().setFromObject(raw);
  const center=box.getCenter(new THREE.Vector3());
  raw.position.x-=center.x;raw.position.z-=center.z;raw.position.y-=box.min.y;
  raw.updateMatrixWorld(true);
  const group=new THREE.Group();group.add(raw);
  const finalBox=new THREE.Box3().setFromObject(group);
  return {group,size:finalBox.getSize(new THREE.Vector3()),gltf};
}
function actor(source,animations,{x=0,y=0,z=0,rot=0,color=null,scale=1}={}){
  const root=SkeletonUtils.clone(source);
  toonify(root,color);
  root.position.set(x,y,z);root.rotation.y=rot;root.scale.setScalar(scale);
  scene.add(root);
  return {root,mixer:new THREE.AnimationMixer(root),animations,current:null};
}
function exact(clips,name){return clips.find(c=>c.name===name)||null;}
function applyAt(a,clip,time,loop=true){
  if(!clip)return;
  if(a.current!==clip){a.mixer.stopAllAction();a.current=clip;}
  const action=a.mixer.clipAction(clip);
  action.enabled=true;action.setEffectiveWeight(1);action.setEffectiveTimeScale(1);
  action.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);
  action.clampWhenFinished=!loop;action.play();action.paused=true;
  action.time=loop?((time%clip.duration)+clip.duration)%clip.duration:
    Math.min(Math.max(time,0),Math.max(clip.duration-1/120,0));
  a.mixer.update(0);a.root.updateMatrixWorld(true);
}
function findBone(root,regexes){
  let bones=[];root.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton)bones.push(...o.skeleton.bones);});
  bones=[...new Map(bones.map(b=>[b.uuid,b])).values()];
  for(const re of regexes){const hit=bones.find(b=>re.test(b.name||''));if(hit)return hit;}
  return null;
}
function pos(obj){const v=new THREE.Vector3();obj.getWorldPosition(v);return v;}
function pulse(x,c,w){const d=(x-c)/w;return Math.exp(-d*d*4.5);}

// High-information period plate behind only the real interaction zone.
const bgTex=await new THREE.TextureLoader().loadAsync('/assets/lab_background.jpg');
bgTex.colorSpace=THREE.SRGBColorSpace;
const bg=new THREE.Mesh(
  new THREE.PlaneGeometry(9.4,5.98),
  new THREE.MeshBasicMaterial({map:bgTex,color:0x6e6557,fog:true})
);
bg.position.set(0,2.72,-3.35);scene.add(bg);

const floor=new THREE.Mesh(
  new THREE.PlaneGeometry(11,8),
  new THREE.MeshToonMaterial({color:0x332e27})
);
floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);

// Same ready universal human/clip file for both roles.
const human=await loader.loadAsync('/assets/human_male.glb');
const clips=human.animations;
const C={
  idle:exact(clips,'Idle_Loop'),
  walk:exact(clips,'Walk_Formal_Loop'),
  contact:exact(clips,'PickUp_Table'),
  chest:exact(clips,'Hit_Chest'),
  scratch:exact(clips,'Zombie_Scratch'),
  recoil:exact(clips,'Hit_Knockback')
};
for(const [k,v] of Object.entries(C))if(!v)throw new Error('Missing ready clip '+k);

const victor=actor(human.scene,clips,{x:-2.0,z:0.52,rot:-Math.PI/2,color:0x5a4938,scale:0.98});
const creature=actor(human.scene,clips,{x:0,z:0,rot:0,color:0xb6a878,scale:1.10});

// Ready slab/table and interaction props.
const slabAsset=await readyAsset('/assets/table.glb',{width:3.25,color:0x5b4030});
const slab=slabAsset.group;slab.position.set(0.45,0,-0.20);scene.add(slab);
const slabTop=slabAsset.size.y;

const workAsset=await readyAsset('/assets/table.glb',{width:1.35,color:0x4a3427});
const work=workAsset.group;scene.add(work);

const leverAsset=await readyAsset('/assets/lever.glb',{height:0.38,color:0x927143});
const leverPivot=new THREE.Group();leverPivot.add(leverAsset.group);scene.add(leverPivot);

const candle=await readyAsset('/assets/graveyard/candle.glb',{height:0.28,color:0xdac99f});
scene.add(candle.group);

// Creature is genuinely rigged but remains physically horizontal for every clip.
function orientCreature(){
  creature.root.rotation.set(0,-0.12,-Math.PI/2);
}
orientCreature();
applyAt(creature,C.idle,0,true);
creature.root.updateMatrixWorld(true);
let cb=new THREE.Box3().setFromObject(creature.root);
let cc=cb.getCenter(new THREE.Vector3());
const slabBox=new THREE.Box3().setFromObject(slab),slabCenter=slabBox.getCenter(new THREE.Vector3());
const creatureBase=new THREE.Vector3(
  slabCenter.x-cc.x+0.10,
  slabTop-cb.min.y+0.035,
  slabCenter.z-cc.z
);
creature.root.position.copy(creatureBase);creature.root.updateMatrixWorld(true);

// Victor contact pose first; fit the prop to his ready hand rather than animating the hand.
const victorContactRoot=new THREE.Vector3(-0.82,0,0.52);
victor.root.position.copy(victorContactRoot);victor.root.rotation.y=-Math.PI/2;
const hand=findBone(victor.root,[/right.*hand/i,/hand.*right/i,/hand[._-]?r$/i,/r[._-]?hand/i]);
if(!hand)throw new Error('Ready rig has no right-hand bone');

let best={score:-Infinity,time:0,pos:new THREE.Vector3()};
for(let i=0;i<=50;i++){
  const t=C.contact.duration*i/50;
  applyAt(victor,C.contact,t,false);
  const hp=pos(hand);
  // Prefer natural outward reach near table height, not the clip's terminal reset.
  const score=(hp.x-victor.root.position.x)*0.35 + hp.y - Math.abs(t/C.contact.duration-0.58)*0.25;
  if(score>best.score)best={score,time:t,pos:hp.clone()};
}
const workTop=workAsset.size.y;
work.position.set(best.pos.x+0.10,0,best.pos.z+0.03);
leverPivot.position.set(best.pos.x,workTop,best.pos.z);
candle.group.position.set(best.pos.x+0.36,workTop,best.pos.z-0.20);
flash.position.copy(best.pos);

victor.root.position.set(-2.0,0,0.52);applyAt(victor,C.idle,0,true);

// Timeline: short, causal, no full standing Creature rise.
const APPROACH_END=1.75;
const CONTACT_END=3.05;
const CONTACT=1.95+(best.time/C.contact.duration)*(CONTACT_END-1.95);
const SPASM_START=CONTACT+0.12;
const RECOIL_START=4.10;
const RETREAT_START=4.85;
const END=8.0;

const label=document.createElement('div');label.id='label';document.body.appendChild(label);
const flashCss=document.createElement('div');flashCss.id='flash';document.body.appendChild(flashCss);

function cameraFor(q){
  if(q<3.15){
    camera.position.set(3.2,1.62,4.25);camera.lookAt(-0.10,0.92,0);
  }else if(q<4.05){
    camera.position.set(2.15,1.30,2.85);camera.lookAt(slabCenter.x,0.88,slabCenter.z);
  }else if(q<5.0){
    camera.position.set(-2.45,1.48,3.05);camera.lookAt(-0.72,1.02,0.5);
  }else{
    camera.position.set(3.15,1.65,4.28);camera.lookAt(-0.15,0.95,0);
  }
}

function setTime(t){
  const q=Math.max(0,Math.min(END-1/240,t));
  flash.intensity=0;flashCss.style.opacity='0';
  leverPivot.rotation.z=0;

  // Victor: real locomotion -> ready contact -> real recoil -> real locomotion.
  if(q<APPROACH_END){
    applyAt(victor,C.walk,q,true);
    victor.root.rotation.y=-Math.PI/2;
    victor.root.position.set(THREE.MathUtils.lerp(-2.0,victorContactRoot.x,q/APPROACH_END),0,0.52);
    label.dataset.beat='VICTOR APPROACHES — READY SKELETAL GAIT';
  }else if(q<RECOIL_START){
    const u=THREE.MathUtils.clamp((q-APPROACH_END)/(CONTACT_END-APPROACH_END),0,1);
    applyAt(victor,C.contact,u*C.contact.duration,false);
    victor.root.position.copy(victorContactRoot);victor.root.rotation.y=-Math.PI/2;
    label.dataset.beat='VICTOR OPERATES THE CONTACT — PROP FIT TO HAND PATH';
  }else if(q<RETREAT_START){
    applyAt(victor,C.recoil,Math.min(0.43,q-RECOIL_START),false);
    victor.root.position.copy(victorContactRoot);victor.root.rotation.y=-Math.PI/2;
    label.dataset.beat='VICTOR RECOILS';
  }else if(q<7.15){
    applyAt(victor,C.walk,q-RETREAT_START,true);
    victor.root.rotation.y=Math.PI/2;
    victor.root.position.set(THREE.MathUtils.lerp(victorContactRoot.x,-2.05,(q-RETREAT_START)/(7.15-RETREAT_START)),0,0.52);
    label.dataset.beat='VICTOR RETREATS — REAL GAIT';
  }else{
    applyAt(victor,C.idle,q-7.15,true);
    victor.root.rotation.y=-Math.PI/2;victor.root.position.set(-2.05,0,0.52);
    label.dataset.beat='AFTERMATH';
  }

  // Creature never stands. Only articulated motion is changed.
  orientCreature();
  creature.root.position.copy(creatureBase);
  if(q<SPASM_START){
    applyAt(creature,C.idle,q,true);
  }else if(q<SPASM_START+C.chest.duration){
    applyAt(creature,C.chest,q-SPASM_START,false);
    label.dataset.beat='CREATURE CONVULSES ON THE SLAB';
  }else if(q<4.15){
    // Short secondary movement, still horizontal.
    applyAt(creature,C.scratch,Math.min(C.scratch.duration*0.42,q-(SPASM_START+C.chest.duration)),false);
  }else{
    applyAt(creature,C.idle,q-4.15,true);
  }
  orientCreature();creature.root.position.copy(creatureBase);creature.root.updateMatrixWorld(true);

  const press=THREE.MathUtils.smoothstep(q,CONTACT-0.10,CONTACT+0.13);
  leverPivot.rotation.z=-0.52*press;
  const f=pulse(q,CONTACT+0.04,0.13);
  flash.intensity=14*f;flashCss.style.opacity=String(0.58*f);
  key.intensity=4.6+3.1*f+0.18*Math.sin(q*14);
  hemi.intensity=0.68+0.7*f;

  cameraFor(q);effect.render(scene,camera);return label.dataset.beat;
}

window.__clipInventory=clips.map(c=>({name:c.name,duration:c.duration}));
window.__chosenClips=Object.fromEntries(Object.entries(C).map(([k,v])=>[k,v.name]));
window.__contactAudit={
  version:'5.4.4',
  method:'ready contact clip + automatic prop-to-hand-path fitting; no IK; no custom character animation',
  victorSource:'Quaternius Universal Base Character',
  rightHandBone:hand.name,
  sampledClipTime:best.time,
  contactGlobalSeconds:CONTACT,
  contact:[best.pos.x,best.pos.y,best.pos.z],
  creaturePolicy:'horizontal root throughout; Hit_Chest + partial Zombie_Scratch only',
  background:'William Lewis laboratory engraving, 1763–1766, public domain'
};
window.__setTime=setTime;setTime(0);window.__ready=true;
