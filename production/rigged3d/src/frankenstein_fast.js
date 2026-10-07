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
const effect=new OutlineEffect(renderer,{defaultThickness:0.003,defaultColor:[0.018,0.016,0.014]});

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0b0c0b);
scene.fog=new THREE.FogExp2(0x15130f,0.018);

const camera=new THREE.PerspectiveCamera(38,W/H,0.05,100);
const hemi=new THREE.HemisphereLight(0xa5afb0,0x211912,0.82);scene.add(hemi);
const key=new THREE.PointLight(0xd8b27a,3.7,10,2);key.position.set(-0.25,1.65,1.1);scene.add(key);
const cold=new THREE.DirectionalLight(0x8aa0ad,0.72);cold.position.set(-3,4,-4);scene.add(cold);
const flash=new THREE.PointLight(0xd7efff,0,6,2);scene.add(flash);

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
function upperBodyAdditive(clip,name){
  const keep=/(spine|clavicle|upperarm|lowerarm|hand|neck|head)/i;
  const tracks=clip.tracks.filter(t=>keep.test(t.name)).map(t=>t.clone());
  const out=new THREE.AnimationClip(name,clip.duration,tracks,THREE.AdditiveAnimationBlendMode);
  const reference=out.clone();
  THREE.AnimationUtils.makeClipAdditive(out,0,reference,30);
  out.blendMode=THREE.AdditiveAnimationBlendMode;
  return out;
}

// Historical high-information far plate. Oversized so no rectangular edge appears in-frame.
const bgTex=await new THREE.TextureLoader().loadAsync('/assets/lab_background.jpg');
bgTex.colorSpace=THREE.SRGBColorSpace;
const bg=new THREE.Mesh(
  new THREE.PlaneGeometry(15.5,9.9),
  new THREE.MeshBasicMaterial({map:bgTex,color:0x6b6358,fog:true})
);
bg.position.set(0,3.4,-4.8);scene.add(bg);

const floor=new THREE.Mesh(
  new THREE.PlaneGeometry(12,9),
  new THREE.MeshToonMaterial({color:0x302d28})
);
floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);

const human=await loader.loadAsync('/assets/human_male.glb');
const clips=human.animations;
const C={
  idle:exact(clips,'Idle_Loop'),
  walk:exact(clips,'Walk_Formal_Loop'),
  contact:exact(clips,'PickUp_Table'),
  death:exact(clips,'Death01'),
  chest:exact(clips,'Hit_Chest'),
  scratch:exact(clips,'Zombie_Scratch'),
  knockback:exact(clips,'Hit_Knockback')
};
for(const [k,v] of Object.entries(C))if(!v)throw new Error('Missing ready clip '+k);

const victor=actor(human.scene,clips,{x:-1.9,z:0.48,rot:-Math.PI/2,color:0x5b5147,scale:0.98});
const creature=actor(human.scene,clips,{x:0,z:0,rot:-Math.PI/2,color:0xa0a38d,scale:1.08});

// Ready slab.
const slabAsset=await readyAsset('/assets/table.glb',{width:3.15,color:0x58402e});
const slab=slabAsset.group;slab.position.set(0.48,0,-0.18);scene.add(slab);
const slabBox=new THREE.Box3().setFromObject(slab);
const slabCenter=slabBox.getCenter(new THREE.Vector3());
const slabTop=slabBox.max.y;

// Prepare Creature lying base from the ready Death01 end pose — no sideways upright idle.
creature.root.position.set(0,0,0);creature.root.rotation.set(0,-Math.PI/2,0);
applyAt(creature,C.death,C.death.duration-1/120,false);
let bodyBox=new THREE.Box3().setFromObject(creature.root);
let bodySize=bodyBox.getSize(new THREE.Vector3());
if(bodySize.z>bodySize.x){
  creature.root.rotation.y+=Math.PI/2;
  creature.root.updateMatrixWorld(true);
  bodyBox=new THREE.Box3().setFromObject(creature.root);
}
const bodyCenter=bodyBox.getCenter(new THREE.Vector3());
const creatureYaw=creature.root.rotation.y;
const creatureBase=new THREE.Vector3(
  slabCenter.x-bodyCenter.x+0.08,
  slabTop-bodyBox.min.y+0.025,
  slabCenter.z-bodyCenter.z
);
creature.root.position.copy(creatureBase);creature.root.updateMatrixWorld(true);

// Upper-body-only additive reactions over the frozen lying pose.
const addChest=upperBodyAdditive(C.chest,'Creature_Chest_Additive');
const addScratch=upperBodyAdditive(C.scratch,'Creature_Scratch_Additive');
const deathAction=creature.mixer.clipAction(C.death);
const chestAction=creature.mixer.clipAction(addChest);
const scratchAction=creature.mixer.clipAction(addScratch);
for(const a of [deathAction,chestAction,scratchAction]){a.enabled=true;a.play();a.paused=true;}
deathAction.setLoop(THREE.LoopOnce,1);deathAction.clampWhenFinished=true;deathAction.setEffectiveWeight(1);
chestAction.setLoop(THREE.LoopOnce,1);chestAction.clampWhenFinished=true;
scratchAction.setLoop(THREE.LoopOnce,1);scratchAction.clampWhenFinished=true;

function applyCreature(q,contactTime){
  creature.root.rotation.set(0,creatureYaw,0);
  creature.root.position.copy(creatureBase);
  deathAction.time=C.death.duration-1/120;deathAction.setEffectiveWeight(1);

  const hitStart=contactTime+0.10;
  const hitU=(q-hitStart)/C.chest.duration;
  chestAction.time=THREE.MathUtils.clamp(q-hitStart,0,C.chest.duration-1/120);
  chestAction.setEffectiveWeight(hitU>=0&&hitU<=1 ? Math.sin(Math.PI*hitU) : 0);

  const scratchStart=hitStart+C.chest.duration+0.18;
  const scratchWindow=0.55;
  const scratchU=(q-scratchStart)/scratchWindow;
  scratchAction.time=THREE.MathUtils.clamp(scratchU,0,1)*Math.min(C.scratch.duration*0.45,C.scratch.duration-1/120);
  scratchAction.setEffectiveWeight(scratchU>=0&&scratchU<=1 ? 0.45*Math.sin(Math.PI*scratchU) : 0);

  creature.mixer.update(0);
  creature.root.updateMatrixWorld(true);
}

// Contact fit: solve hand path AND support height.
const victorContactRoot=new THREE.Vector3(-0.78,0,0.46);
victor.root.position.copy(victorContactRoot);victor.root.rotation.y=-Math.PI/2;
const hand=findBone(victor.root,[/right.*hand/i,/hand.*right/i,/hand[._-]?r$/i,/r[._-]?hand/i]);
if(!hand)throw new Error('Ready rig has no right-hand bone');

let best={score:-Infinity,time:0,pos:new THREE.Vector3()};
for(let i=0;i<=60;i++){
  const t=C.contact.duration*i/60;
  applyAt(victor,C.contact,t,false);
  const hp=pos(hand);
  const phase=t/C.contact.duration;
  const reach=hp.x-victor.root.position.x;
  const score=reach*0.35 + hp.y - Math.abs(phase-0.56)*0.28;
  if(score>best.score)best={score,time:t,pos:hp.clone()};
}

// Ready control table scaled to the expected ready-interaction height.
const workAsset=await readyAsset('/assets/table.glb',{height:0.90,color:0x4a3528});
const work=workAsset.group;scene.add(work);
work.position.set(best.pos.x+0.14,0,best.pos.z+0.04);
const workBox=new THREE.Box3().setFromObject(work);
const workTop=workBox.max.y;

// Small lever: its handle crosses the sampled hand height.
const leverAsset=await readyAsset('/assets/lever.glb',{height:0.18,color:0x8f7043});
const leverPivot=new THREE.Group();leverPivot.add(leverAsset.group);scene.add(leverPivot);
leverPivot.position.set(best.pos.x,workTop,best.pos.z);

const candle=await readyAsset('/assets/graveyard/candle.glb',{height:0.25,color:0xd7c79e});
scene.add(candle.group);
candle.group.position.set(best.pos.x+0.34,workTop,best.pos.z-0.20);

flash.position.set(best.pos.x,best.pos.y,best.pos.z);

victor.root.position.set(-1.9,0,0.48);victor.root.rotation.y=-Math.PI/2;
applyAt(victor,C.idle,0,true);

// Compact story timing.
const APPROACH_END=1.45;
const CONTACT_START=1.45;
const CONTACT_END=2.70;
const CONTACT=CONTACT_START+(best.time/C.contact.duration)*(CONTACT_END-CONTACT_START);
const CREATURE_END=3.55;
const RECOIL_START=3.62;
const RETREAT_START=4.02;
const RETREAT_END=6.45;
const END=7.5;

const label=document.createElement('div');label.id='label';document.body.appendChild(label);
const flashCss=document.createElement('div');flashCss.id='flash';document.body.appendChild(flashCss);

function cameraFor(q){
  if(q<CONTACT_START){
    camera.position.set(3.25,1.70,4.35);camera.lookAt(-0.10,0.95,0);
  }else if(q<CONTACT_END+0.12){
    camera.position.set(best.pos.x+1.45,best.pos.y+0.62,best.pos.z+1.65);
    camera.lookAt(best.pos.x,best.pos.y,best.pos.z);
  }else if(q<CREATURE_END){
    camera.position.set(2.25,1.45,2.85);camera.lookAt(slabCenter.x,slabTop+0.28,slabCenter.z);
  }else if(q<RETREAT_START+0.30){
    camera.position.set(-2.15,1.55,3.15);camera.lookAt(victorContactRoot.x,1.02,victorContactRoot.z);
  }else{
    camera.position.set(3.15,1.72,4.35);camera.lookAt(-0.10,0.95,0);
  }
}

function setTime(t){
  const q=Math.max(0,Math.min(END-1/240,t));
  flash.intensity=0;flashCss.style.opacity='0';
  leverPivot.rotation.z=0;

  if(q<APPROACH_END){
    applyAt(victor,C.walk,q,true);
    victor.root.rotation.y=-Math.PI/2;
    victor.root.position.set(THREE.MathUtils.lerp(-1.9,victorContactRoot.x,q/APPROACH_END),0,0.48);
    label.dataset.beat='VICTOR APPROACHES — READY GAIT';
  }else if(q<RECOIL_START){
    const u=THREE.MathUtils.clamp((q-CONTACT_START)/(CONTACT_END-CONTACT_START),0,1);
    applyAt(victor,C.contact,u*C.contact.duration,false);
    victor.root.position.copy(victorContactRoot);victor.root.rotation.y=-Math.PI/2;
    label.dataset.beat='CONTACT — PROP FIT TO REAL HAND PATH';
  }else if(q<RETREAT_START){
    const rt=Math.min(0.18,(q-RECOIL_START)*0.48);
    applyAt(victor,C.knockback,rt,false);
    victor.root.position.copy(victorContactRoot);victor.root.rotation.y=-Math.PI/2;
    label.dataset.beat='VICTOR STARTLES';
  }else if(q<RETREAT_END){
    applyAt(victor,C.walk,q-RETREAT_START,true);
    victor.root.rotation.y=Math.PI/2;
    victor.root.position.set(
      THREE.MathUtils.lerp(victorContactRoot.x,-1.95,(q-RETREAT_START)/(RETREAT_END-RETREAT_START)),
      0,0.46
    );
    label.dataset.beat='VICTOR RETREATS — READY GAIT';
  }else{
    applyAt(victor,C.idle,q-RETREAT_END,true);
    victor.root.rotation.y=-Math.PI/2;victor.root.position.set(-1.95,0,0.46);
    label.dataset.beat='AFTERMATH';
  }

  applyCreature(q,CONTACT);
  if(q>=CONTACT+0.08&&q<CREATURE_END) label.dataset.beat='CREATURE CONVULSES — ADDITIVE READY MOTION';

  const press=THREE.MathUtils.smoothstep(q,CONTACT-0.10,CONTACT+0.12);
  leverPivot.rotation.z=-0.46*press;
  const f=pulse(q,CONTACT+0.035,0.12);
  flash.intensity=12*f;flashCss.style.opacity=String(0.50*f);
  key.intensity=3.7+2.6*f+0.10*Math.sin(q*13);
  hemi.intensity=0.82+0.55*f;

  cameraFor(q);
  effect.render(scene,camera);
  return label.dataset.beat;
}

window.__clipInventory=clips.map(c=>({name:c.name,duration:c.duration}));
window.__chosenClips={
  victorWalk:C.walk.name,
  victorContact:C.contact.name,
  victorStartle:C.knockback.name,
  creatureBase:C.death.name,
  creatureAdditiveChest:C.chest.name,
  creatureAdditiveScratch:C.scratch.name
};
window.__contactAudit={
  version:'5.4.5',
  method:'ready clip + automatic 3D contact fit + additive upper-body clip surgery; no IK; no custom keyframed character animation',
  rightHandBone:hand.name,
  sampledClipTime:best.time,
  sampledHand:[best.pos.x,best.pos.y,best.pos.z],
  workTableTop:workTop,
  verticalHandMinusTable:best.pos.y-workTop,
  leverHeight:leverAsset.size.y,
  contactGlobalSeconds:CONTACT,
  creatureBaseClip:C.death.name,
  creatureRootPolicy:'natural Death01 lying pose; no sideways upright-idle rotation',
  additiveTrackCounts:{chest:addChest.tracks.length,scratch:addScratch.tracks.length},
  background:'William Lewis laboratory engraving, 1763–1766, public domain'
};
window.__setTime=setTime;
setTime(0);
window.__ready=true;
