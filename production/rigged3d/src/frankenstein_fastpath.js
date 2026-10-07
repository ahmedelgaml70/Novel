import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

const W=1280,H=720;
const loader=new GLTFLoader();
const draco=new DRACOLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(draco);

const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(W,H,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;
document.body.appendChild(renderer.domElement);
const effect=new OutlineEffect(renderer,{defaultThickness:0.0035,defaultColor:[0.02,0.018,0.015]});

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x151411,0.012);
const camera=new THREE.PerspectiveCamera(35,W/H,0.05,100);

const hemi=new THREE.HemisphereLight(0xaab8bb,0x24170c,0.68); scene.add(hemi);
const key=new THREE.DirectionalLight(0xffc982,2.5); key.position.set(-2,5,4); key.castShadow=true; scene.add(key);
const cold=new THREE.DirectionalLight(0x8da6b6,0.72); cold.position.set(4,3,-3); scene.add(cold);
const contactLight=new THREE.PointLight(0xd9eaff,0,6,2); scene.add(contactLight);

function toonify(root,color=null,keepMap=false){
  root.traverse(o=>{
    if(!o.isMesh) return;
    o.castShadow=true; o.receiveShadow=true;
    const old=Array.isArray(o.material)?o.material[0]:o.material;
    const c=color?new THREE.Color(color):(old?.color?.clone?.()||new THREE.Color(0xb6a98c));
    o.material=new THREE.MeshToonMaterial({color:c,map:keepMap?(old?.map||null):null});
  });
}
function exact(clips,name){return clips.find(c=>c.name===name)||null;}
function makeActor(source,animations,color){
  const rig=SkeletonUtils.clone(source);
  toonify(rig,color,false);
  const world=new THREE.Group();
  world.add(rig); scene.add(world);
  return {rig,world,mixer:new THREE.AnimationMixer(rig),animations,current:null};
}
function applyAt(actor,clip,time,loop=true){
  if(!clip) return;
  if(actor.current!==clip){actor.mixer.stopAllAction();actor.current=clip;}
  const a=actor.mixer.clipAction(clip);
  a.enabled=true; a.setEffectiveWeight(1); a.setEffectiveTimeScale(1);
  a.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);
  a.clampWhenFinished=!loop; a.play(); a.paused=true;
  a.time=loop?((time%clip.duration)+clip.duration)%clip.duration:Math.min(Math.max(time,0),Math.max(clip.duration-1/120,0));
  actor.mixer.update(0);
  actor.world.updateMatrixWorld(true);
}
function groundActor(actor,y=0){
  actor.world.updateMatrixWorld(true);
  const b=new THREE.Box3().setFromObject(actor.world);
  actor.world.position.y += y-b.min.y;
  actor.world.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(actor.world);
}
function boneLike(root,patterns){
  const bones=[]; root.traverse(o=>{if(o.isBone)bones.push(o)});
  for(const re of patterns){const hit=bones.find(b=>re.test(b.name)); if(hit)return hit;}
  return bones.find(b=>/hand/i.test(b.name))||null;
}
function box(obj){obj.updateMatrixWorld(true);return new THREE.Box3().setFromObject(obj);}
function sizeOf(obj){return box(obj).getSize(new THREE.Vector3());}
function fitHeight(obj,targetHeight){
  const s=sizeOf(obj); const scale=targetHeight/Math.max(s.y,1e-6);
  obj.scale.multiplyScalar(scale); obj.updateMatrixWorld(true); return box(obj);
}
function groundObject(obj,y=0){
  const b=box(obj); obj.position.y+=y-b.min.y; obj.updateMatrixWorld(true); return box(obj);
}
function centerXZ(obj,x,z){
  const b=box(obj),c=b.getCenter(new THREE.Vector3());
  obj.position.x+=x-c.x; obj.position.z+=z-c.z; obj.updateMatrixWorld(true);
}
function pulse(x,c,w){const d=(x-c)/w;return Math.exp(-d*d*4.5);}

// Historical far plate: high information, no need to model the whole lab.
const bg=await new THREE.TextureLoader().loadAsync('/assets/lab_background.jpg');
bg.colorSpace=THREE.SRGBColorSpace;
scene.background=bg;
scene.backgroundIntensity=0.40;

// Ready humanoid + exact runtime clips.
const human=await loader.loadAsync('/assets/human_male.glb');
const clips=human.animations;
const C={
  idle:exact(clips,'Idle_Loop'),
  walk:exact(clips,'Walk_Formal_Loop'),
  interact:exact(clips,'Interact'),
  recoil:exact(clips,'Hit_Knockback'),
  creatureReact:exact(clips,'Hit_Chest')
};
for(const [k,v] of Object.entries(C)) if(!v) throw new Error('Missing exact ready clip '+k);

const victor=makeActor(human.scene,clips,0x44372b);
applyAt(victor,C.idle,0,true);
victor.world.position.set(0,0,0);
let vb=groundActor(victor,0);
const actorH=vb.getSize(new THREE.Vector3()).y;
if(!Number.isFinite(actorH)||actorH<=0) throw new Error('Invalid actor height');

// Contact geometry is sized from actor height, not arbitrary asset units.
const floor=new THREE.Mesh(new THREE.PlaneGeometry(actorH*7,actorH*5),new THREE.MeshToonMaterial({color:0x373129}));
floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);

const tableGltf=await loader.loadAsync('/assets/table.glb');
const table=tableGltf.scene; toonify(table,0x563923,true); scene.add(table);
fitHeight(table,actorH*0.43); groundObject(table,0);
centerXZ(table,actorH*0.42,0);
const tableBox=box(table),tableSize=tableBox.getSize(new THREE.Vector3()),tableCenter=tableBox.getCenter(new THREE.Vector3());
const tableTop=tableBox.max.y;

// Victor world transform sits outside the animated rig, so clips cannot move the actor's world frame.
const victorContactRoot=new THREE.Vector3(tableBox.min.x-actorH*0.42,0,tableCenter.z+actorH*0.16);
victor.world.position.copy(victorContactRoot);
victor.world.rotation.y=-Math.PI/2;
groundActor(victor,0);

const rightHand=boneLike(victor.rig,[
  /RightHand/i,/Hand[_\. -]?R/i,/R[_\. -]?Hand/i,/hand\.r/i,/mixamorig.*right.*hand/i
]);
if(!rightHand) throw new Error('No hand bone found in ready rig');

// Sample grounded Interact poses and select maximum horizontal natural reach.
let best={reach:-1,time:0,pos:new THREE.Vector3()};
for(let i=0;i<=72;i++){
  const t=C.interact.duration*i/72;
  victor.world.position.copy(victorContactRoot); victor.world.position.y=0; victor.world.rotation.y=-Math.PI/2;
  applyAt(victor,C.interact,t,false);
  groundActor(victor,0);
  const hp=new THREE.Vector3(); rightHand.getWorldPosition(hp);
  const wp=new THREE.Vector3(); victor.world.getWorldPosition(wp);
  const reach=Math.hypot(hp.x-wp.x,hp.z-wp.z);
  if(reach>best.reach) best={reach,time:t,pos:hp.clone()};
}

// Ready lever: scale vertically so its top is at the sampled hand contact height.
const leverGltf=await loader.loadAsync('/assets/lever.glb');
const lever=leverGltf.scene; toonify(lever,0x9a7440,true);
const leverPivot=new THREE.Group(); leverPivot.add(lever); scene.add(leverPivot);
const desiredLeverH=THREE.MathUtils.clamp(best.pos.y-tableTop,actorH*0.13,actorH*0.38);
fitHeight(lever,desiredLeverH); groundObject(lever,0);
let lb=box(lever),lc=lb.getCenter(new THREE.Vector3());
lever.position.x-=lc.x; lever.position.z-=lc.z; lever.position.y-=lb.min.y;
leverPivot.position.set(best.pos.x,tableTop,best.pos.z);
leverPivot.rotation.y=-0.25;
contactLight.position.set(best.pos.x,best.pos.y,best.pos.z);

// Creature: same real skeleton, role-specific color/proportions, normalized to the ready table.
const creature=makeActor(human.scene,clips,0xc9c0a2);
applyAt(creature,C.idle,0,true);
const longAxisX=tableSize.x>=tableSize.z;
creature.world.rotation.z=longAxisX?Math.PI/2:0;
creature.world.rotation.x=longAxisX?0:Math.PI/2;
creature.world.scale.set(1,1.08,1);
creature.world.updateMatrixWorld(true);
let cb=box(creature.world),cs=cb.getSize(new THREE.Vector3());
const bodyLong=Math.max(cs.x,cs.z);
const tableLong=Math.max(tableSize.x,tableSize.z);
const fit=THREE.MathUtils.clamp((tableLong*0.86)/Math.max(bodyLong,1e-6),0.55,1.15);
creature.world.scale.multiplyScalar(fit);
creature.world.updateMatrixWorld(true);
cb=box(creature.world); let cc=cb.getCenter(new THREE.Vector3());
creature.world.position.x+=tableCenter.x-cc.x;
creature.world.position.z+=tableCenter.z-cc.z;
creature.world.position.y+=tableTop+actorH*0.018-cb.min.y;
creature.world.updateMatrixWorld(true);
const creatureBaseY=creature.world.position.y;

// Scene framing derived from measured human scale.
const focus=new THREE.Vector3(
  (victorContactRoot.x+tableCenter.x)*0.5,
  actorH*0.62,
  tableCenter.z
);
camera.position.set(focus.x+actorH*2.0,actorH*1.38,focus.z+actorH*2.75);
camera.lookAt(focus);

// Reset actions after setup sampling.
victor.mixer.stopAllAction(); victor.current=null;
creature.mixer.stopAllAction(); creature.current=null;

const INTERACT_START=2.25, INTERACT_END=4.65;
const CONTACT=INTERACT_START+(best.time/C.interact.duration)*(INTERACT_END-INTERACT_START);
const CREATURE_REACT_START=CONTACT+0.06;
const VICTOR_RECOIL_START=Math.max(CONTACT+0.33,4.25);
const RETREAT_START=6.10;
const victorStartX=victorContactRoot.x-actorH*0.95;
const victorRetreatX=victorContactRoot.x-actorH*0.92;

function placeVictorWorld(x,rotY){
  victor.world.position.set(x,0,victorContactRoot.z);
  victor.world.rotation.set(0,rotY,0);
  groundActor(victor,0);
}
function lockCreatureToTable(){
  // Preserve deliberate lying orientation/scale; only correct vertical penetration caused by the ready clip.
  creature.world.position.y=creatureBaseY;
  creature.world.updateMatrixWorld(true);
  const b=box(creature.world);
  creature.world.position.y+=tableTop+actorH*0.018-b.min.y;
  creature.world.updateMatrixWorld(true);
}

function setTime(t){
  const q=Math.max(0,Math.min(10.999,t));

  if(q<INTERACT_START){
    applyAt(victor,C.walk,q,true);
    placeVictorWorld(THREE.MathUtils.lerp(victorStartX,victorContactRoot.x,q/INTERACT_START),-Math.PI/2);
  } else if(q<VICTOR_RECOIL_START){
    const u=(q-INTERACT_START)/(INTERACT_END-INTERACT_START);
    applyAt(victor,C.interact,THREE.MathUtils.clamp(u,0,1)*C.interact.duration,false);
    placeVictorWorld(victorContactRoot.x,-Math.PI/2);
  } else if(q<RETREAT_START){
    applyAt(victor,C.recoil,q-VICTOR_RECOIL_START,false);
    placeVictorWorld(victorContactRoot.x,-Math.PI/2);
  } else if(q<9.25){
    applyAt(victor,C.walk,q-RETREAT_START,true);
    placeVictorWorld(THREE.MathUtils.lerp(victorContactRoot.x,victorRetreatX,(q-RETREAT_START)/(9.25-RETREAT_START)),Math.PI/2);
  } else {
    applyAt(victor,C.idle,q-9.25,true);
    placeVictorWorld(victorRetreatX,-Math.PI/2);
  }

  if(q<CREATURE_REACT_START){
    applyAt(creature,C.idle,q,true);
  } else if(q<CREATURE_REACT_START+C.creatureReact.duration){
    applyAt(creature,C.creatureReact,q-CREATURE_REACT_START,false);
  } else {
    applyAt(creature,C.idle,q-CREATURE_REACT_START-C.creatureReact.duration,true);
  }
  lockCreatureToTable();

  const press=THREE.MathUtils.smoothstep(q,CONTACT-0.10,CONTACT+0.20);
  leverPivot.rotation.z=-0.42*press;
  const flash=pulse(q,CONTACT+0.04,0.17);
  contactLight.intensity=12*flash;
  key.intensity=2.4+3.8*flash;
  hemi.intensity=0.66+0.9*flash;

  camera.position.x=focus.x+actorH*2.0+actorH*0.025*Math.sin(q*.45);
  camera.lookAt(focus);
  effect.render(scene,camera);
}

window.__clipInventory=clips.map(c=>({name:c.name,duration:c.duration}));
window.__chosenClips={
  victor_walk:C.walk.name,
  victor_interact:C.interact.name,
  victor_recoil:C.recoil.name,
  creature_reaction:C.creatureReact.name,
  idle:C.idle.name
};
window.__storyMeta={
  experiment:'E-VID-007',
  actor_height:actorH,
  right_hand_bone:rightHand.name,
  interact_duration:C.interact.duration,
  sampled_contact_time_in_clip:best.time,
  contact_global_seconds:CONTACT,
  contact_world:[best.pos.x,best.pos.y,best.pos.z],
  max_horizontal_hand_reach:best.reach,
  table_size:[tableSize.x,tableSize.y,tableSize.z],
  table_top_y:tableTop,
  lever_height:desiredLeverH,
  world_transform_policy:'animated rig inside unanimated actor wrapper',
  grounding_policy:'Victor ground-lock after each ready pose; Creature table-surface lock',
  method:'ready clips + automatic prop-to-hand-path fitting; no custom-keyframed hand animation'
};
window.__contactAudit=window.__storyMeta;
window.__setTime=setTime;
setTime(0);
window.__ready=true;
