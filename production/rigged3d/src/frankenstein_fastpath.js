import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

const W=1280,H=720;
const loader=new GLTFLoader();
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(W,H,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;
document.body.appendChild(renderer.domElement);
const effect=new OutlineEffect(renderer,{defaultThickness:0.0035,defaultColor:[0.02,0.018,0.015]});

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x151411,0.018);
const camera=new THREE.PerspectiveCamera(35,W/H,0.05,100);
camera.position.set(4.6,2.35,6.2);
camera.lookAt(0,1.05,0);

const hemi=new THREE.HemisphereLight(0xaab8bb,0x24170c,0.65); scene.add(hemi);
const key=new THREE.DirectionalLight(0xffc982,2.4); key.position.set(-2,5,4); key.castShadow=true; scene.add(key);
const cold=new THREE.DirectionalLight(0x8da6b6,0.75); cold.position.set(4,3,-3); scene.add(cold);
const contactLight=new THREE.PointLight(0xd9eaff,0,4,2); scene.add(contactLight);

function toonify(root,color=null){
  root.traverse(o=>{
    if(!o.isMesh) return;
    o.castShadow=true; o.receiveShadow=true;
    const old=Array.isArray(o.material)?o.material[0]:o.material;
    const c=color?new THREE.Color(color):(old?.color?.clone?.()||new THREE.Color(0xb6a98c));
    o.material=new THREE.MeshToonMaterial({color:c,map:old?.map||null});
  });
}
function exact(clips,name){return clips.find(c=>c.name===name)||null;}
function makeActor(source,animations,color){
  const root=SkeletonUtils.clone(source); toonify(root,color);
  scene.add(root);
  return {root,mixer:new THREE.AnimationMixer(root),animations,current:null};
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
}
function boneLike(root,patterns){
  const bones=[]; root.traverse(o=>{if(o.isBone)bones.push(o)});
  for(const re of patterns){const hit=bones.find(b=>re.test(b.name)); if(hit)return hit;}
  return bones.find(b=>/hand/i.test(b.name))||null;
}
function fitHorizontal(obj,target){
  obj.updateMatrixWorld(true);
  let b=new THREE.Box3().setFromObject(obj),s=b.getSize(new THREE.Vector3());
  const scale=target/Math.max(s.x,s.z);
  obj.scale.multiplyScalar(scale); obj.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(obj);
}
function groundAt(obj,y=0){
  obj.updateMatrixWorld(true);
  const b=new THREE.Box3().setFromObject(obj);
  obj.position.y += y-b.min.y; obj.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(obj);
}
function centerXZ(obj,x,z){
  obj.updateMatrixWorld(true);
  const b=new THREE.Box3().setFromObject(obj),c=b.getCenter(new THREE.Vector3());
  obj.position.x+=x-c.x; obj.position.z+=z-c.z; obj.updateMatrixWorld(true);
}
function pulse(x,c,w){const d=(x-c)/w;return Math.exp(-d*d*4.5);}

// Historical background plate.
const bg=await new THREE.TextureLoader().loadAsync('/assets/lab_background.jpg');
bg.colorSpace=THREE.SRGBColorSpace;
scene.background=bg;
scene.backgroundIntensity=0.38;

// Floor is interaction support only.
const floor=new THREE.Mesh(new THREE.PlaneGeometry(14,10),new THREE.MeshToonMaterial({color:0x39342c}));
floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);

// Ready actors.
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

const victor=makeActor(human.scene,clips,0x3d3328);
victor.root.position.set(-2.15,0,0.35); victor.root.rotation.y=-Math.PI/2;

const creature=makeActor(human.scene,clips,0xc4b99a);
creature.root.scale.set(1.04,1.12,1.04);

// Ready table/slab.
const tableGltf=await loader.loadAsync('/assets/table.glb');
const table=tableGltf.scene; toonify(table,0x4f3524); scene.add(table);
fitHorizontal(table,3.35); groundAt(table,0); centerXZ(table,0.65,-0.05);
const tableBox=new THREE.Box3().setFromObject(table);
const tableTop=tableBox.max.y;
const tableCenter=tableBox.getCenter(new THREE.Vector3());

// Creature lies on the real table. Underlying actor remains fully rigged.
creature.root.rotation.z=Math.PI/2;
creature.root.rotation.y=0.12;
creature.root.updateMatrixWorld(true);
let cb=new THREE.Box3().setFromObject(creature.root),cc=cb.getCenter(new THREE.Vector3());
creature.root.position.x+=tableCenter.x-cc.x+0.15;
creature.root.position.z+=tableCenter.z-cc.z;
creature.root.position.y+=tableTop+0.06-cb.min.y;
creature.root.updateMatrixWorld(true);

// Victor's final approach position.
const victorContactRoot=new THREE.Vector3(-1.05,0,0.38);
victor.root.position.copy(victorContactRoot);

// Find actual right hand and sample the ready Interact clip to discover its natural reach.
const rightHand=boneLike(victor.root,[
  /RightHand/i,/Hand[_\. -]?R/i,/R[_\. -]?Hand/i,/hand\.r/i,/mixamorig.*right.*hand/i
]);
if(!rightHand) throw new Error('No hand bone found in ready rig');

let best={dist:-1,time:0,pos:new THREE.Vector3()};
const rootWorld=new THREE.Vector3();
for(let i=0;i<=60;i++){
  const t=C.interact.duration*i/60;
  applyAt(victor,C.interact,t,false);
  victor.root.updateMatrixWorld(true);
  const hp=new THREE.Vector3(); rightHand.getWorldPosition(hp);
  victor.root.getWorldPosition(rootWorld);
  const d=hp.distanceTo(rootWorld);
  if(d>best.dist){best={dist:d,time:t,pos:hp.clone()};}
}

// Ready lever fitted to the real hand path rather than hand-keyframing.
const leverGltf=await loader.loadAsync('/assets/lever.glb');
const lever=leverGltf.scene; toonify(lever,0x8b6b38);
const leverPivot=new THREE.Group(); scene.add(leverPivot); leverPivot.add(lever);
fitHorizontal(lever,0.52);
groundAt(lever,0);
lever.updateMatrixWorld(true);
let lb=new THREE.Box3().setFromObject(lever),ls=lb.getSize(new THREE.Vector3()),lc=lb.getCenter(new THREE.Vector3());
lever.position.x-=lc.x; lever.position.z-=lc.z; lever.position.y-=lb.min.y;
leverPivot.position.set(best.pos.x,tableTop,best.pos.z);
leverPivot.rotation.y=-0.25;
contactLight.position.set(best.pos.x,best.pos.y,best.pos.z);

// Reset actors before render timeline.
victor.mixer.stopAllAction(); victor.current=null;
creature.mixer.stopAllAction(); creature.current=null;

const INTERACT_START=2.35, INTERACT_END=4.75;
const CONTACT=INTERACT_START+(best.time/C.interact.duration)*(INTERACT_END-INTERACT_START);
const CREATURE_REACT_START=CONTACT+0.06;
const VICTOR_RECOIL_START=Math.max(CONTACT+0.32,4.3);
const RETREAT_START=6.25;

function setTime(t){
  const q=Math.max(0,Math.min(10.999,t));

  // Victor.
  if(q<INTERACT_START){
    applyAt(victor,C.walk,q,true);
    victor.root.rotation.y=-Math.PI/2;
    victor.root.position.copy(victorContactRoot).add(new THREE.Vector3(THREE.MathUtils.lerp(-1.4,0,q/INTERACT_START),0,0));
  } else if(q<VICTOR_RECOIL_START){
    const u=(q-INTERACT_START)/(INTERACT_END-INTERACT_START);
    applyAt(victor,C.interact,THREE.MathUtils.clamp(u,0,1)*C.interact.duration,false);
    victor.root.rotation.y=-Math.PI/2; victor.root.position.copy(victorContactRoot);
  } else if(q<RETREAT_START){
    applyAt(victor,C.recoil,(q-VICTOR_RECOIL_START),false);
    victor.root.position.copy(victorContactRoot);
  } else if(q<9.3){
    applyAt(victor,C.walk,q-RETREAT_START,true);
    victor.root.rotation.y=Math.PI/2;
    victor.root.position.copy(victorContactRoot).add(new THREE.Vector3(THREE.MathUtils.lerp(0,-1.55,(q-RETREAT_START)/(9.3-RETREAT_START)),0,0));
  } else {
    applyAt(victor,C.idle,q-9.3,true);
    victor.root.rotation.y=-Math.PI/2;
    victor.root.position.copy(victorContactRoot).add(new THREE.Vector3(-1.55,0,0));
  }

  // Creature.
  if(q<CREATURE_REACT_START){
    applyAt(creature,C.idle,q,true);
  } else if(q<CREATURE_REACT_START+1.0){
    applyAt(creature,C.creatureReact,q-CREATURE_REACT_START,false);
  } else {
    applyAt(creature,C.idle,q-CREATURE_REACT_START-1.0,true);
  }

  // Lever/lighting response is synchronized to discovered hand-contact time.
  const press=THREE.MathUtils.smoothstep(q,CONTACT-0.12,CONTACT+0.18);
  leverPivot.rotation.z=-0.42*press;
  const flash=pulse(q,CONTACT+0.04,0.17);
  contactLight.intensity=14*flash;
  key.intensity=2.25+4.5*flash;
  hemi.intensity=0.62+1.2*flash;

  // Camera is restrained; action must read without it.
  camera.position.set(4.55+0.05*Math.sin(q*.5),2.32,6.15);
  camera.lookAt(-0.05,1.02,0);
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
  right_hand_bone:rightHand.name,
  interact_duration:C.interact.duration,
  sampled_contact_time_in_clip:best.time,
  contact_global_seconds:CONTACT,
  contact_world:[best.pos.x,best.pos.y,best.pos.z],
  table_top_y:tableTop,
  method:'ready clip + automatic prop-to-hand-path fitting; no custom keyframed hand animation'
};
window.__setTime=setTime;
setTime(0);
window.__ready=true;
