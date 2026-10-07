import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

const W=1280,H=720;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);
renderer.setSize(W,H,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;
document.body.appendChild(renderer.domElement);
const effect=new OutlineEffect(renderer,{defaultThickness:0.004,defaultColor:[0.025,0.02,0.015]});

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x111312);
scene.fog=new THREE.FogExp2(0x111312,0.028);

const camera=new THREE.PerspectiveCamera(36,W/H,0.05,100);
camera.position.set(3.9,2.15,5.6);
camera.lookAt(-0.15,1.15,0);

scene.add(new THREE.HemisphereLight(0xcfd5d4,0x24190e,1.55));
const key=new THREE.DirectionalLight(0xffd6a0,4.0); key.position.set(-1.5,5.5,4); key.castShadow=true; scene.add(key);
const rim=new THREE.DirectionalLight(0x9eb8c5,1.35); rim.position.set(4,3,-4); scene.add(rim);

const floor=new THREE.Mesh(new THREE.PlaneGeometry(18,12),new THREE.MeshToonMaterial({color:0x4c4638}));
floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
const back=new THREE.Mesh(new THREE.PlaneGeometry(18,7),new THREE.MeshToonMaterial({color:0x292825}));
back.position.set(0,3.2,-3.5); scene.add(back);

function toonify(root,tint=null){
  root.traverse(o=>{
    if(!o.isMesh) return;
    o.castShadow=true; o.receiveShadow=true;
    const old=Array.isArray(o.material)?o.material[0]:o.material;
    const base=tint?new THREE.Color(tint):(old?.color?.clone?.()||new THREE.Color(0xb7aa8e));
    o.material=new THREE.MeshToonMaterial({color:base,map:old?.map||null});
  });
}

function findClip(clips,...names){
  const pairs=clips.map(c=>[c,c.name.toLowerCase()]);
  for(const name of names){
    const n=name.toLowerCase();
    let hit=pairs.find(([,s])=>s===n); if(hit) return hit[0];
    hit=pairs.find(([,s])=>s.includes(n)); if(hit) return hit[0];
  }
  return null;
}

function makeActor(source,animations,x,rot,tint){
  const root=SkeletonUtils.clone(source);
  toonify(root,tint);
  root.position.set(x,0,0);
  root.rotation.y=rot;
  scene.add(root);
  return {root,mixer:new THREE.AnimationMixer(root),animations,current:null};
}

function applyAt(actor,clip,time,loop=true){
  if(!clip) return;
  if(actor.current!==clip){
    actor.mixer.stopAllAction();
    actor.current=clip;
  }
  const action=actor.mixer.clipAction(clip);
  action.enabled=true;
  action.setEffectiveWeight(1);
  action.setEffectiveTimeScale(1);
  action.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);
  action.clampWhenFinished=!loop;
  action.play();
  action.paused=true;
  action.time=loop
    ? ((time%clip.duration)+clip.duration)%clip.duration
    : Math.min(Math.max(time,0),Math.max(clip.duration-1/120,0));
  actor.mixer.update(0);
}

const gltf=await new GLTFLoader().loadAsync('/assets/human_male.glb');
const clips=gltf.animations;
function exactClip(name){ return clips.find(c=>c.name===name)||null; }
const chosen={
  idle:exactClip('Idle_Loop'),
  walk:exactClip('Walk_Formal_Loop')||exactClip('Walk_Loop'),
  interact:exactClip('Interact'),
  reaction:exactClip('Hit_Knockback')||exactClip('Hit_Chest'),
  jog:exactClip('Jog_Fwd_Loop')||exactClip('Sprint_Loop')
};
if(!chosen.walk || !chosen.idle || !chosen.interact || !chosen.reaction){
  throw new Error('Ready GLB is missing one of the exact proof clips');
}

const A=makeActor(gltf.scene,clips,-2.2,-Math.PI/2,null);
const B=makeActor(gltf.scene,clips,0.9,Math.PI/2,0x99978e);

const label=document.createElement('div');
label.id='label';
label.innerHTML='<b>V5.4 READY-RIGGED PROOF</b><br>real skeleton • ready CC0 clips • no custom rig';
document.body.appendChild(label);

function setTime(t){
  const q=((t%9)+9)%9;
  A.root.rotation.y=-Math.PI/2;
  B.root.rotation.y=Math.PI/2;

  if(q<2.5){
    applyAt(A,chosen.walk,q,true);
    applyAt(B,chosen.idle,q,true);
    A.root.position.x=THREE.MathUtils.lerp(-2.2,-0.55,q/2.5);
    label.dataset.beat='WALK — real lower-body gait';
  } else if(q<4.5){
    applyAt(A,chosen.interact,q-2.5,false);
    applyAt(B,chosen.idle,q-2.5,true);
    A.root.position.x=-0.55;
    label.dataset.beat='INTERACT — arm/spine action';
  } else if(q<5.45){
    applyAt(A,chosen.idle,q-4.5,true);
    applyAt(B,chosen.reaction,q-4.5,false);
    A.root.position.x=-0.55;
    label.dataset.beat='ACTOR B REACTS INDEPENDENTLY';
  } else if(q<6.4){
    applyAt(A,chosen.reaction,q-5.45,false);
    applyAt(B,chosen.idle,q-5.45,true);
    A.root.position.x=-0.55;
    label.dataset.beat='ACTOR A RECOILS — joint-level reaction';
  } else if(q<8.35){
    A.root.rotation.y=Math.PI/2;
    applyAt(A,chosen.walk,q-6.4,true);
    applyAt(B,chosen.idle,q-6.4,true);
    A.root.position.x=THREE.MathUtils.lerp(-0.55,-1.75,(q-6.4)/1.95);
    label.dataset.beat='RETREAT — gait + world travel';
  } else {
    A.root.rotation.y=-Math.PI/2;
    applyAt(A,chosen.idle,q-8.35,true);
    applyAt(B,chosen.idle,q-8.35,true);
    A.root.position.x=-1.75;
    label.dataset.beat='SETTLE';
  }

  const bob=Math.sin(q*0.45)*0.035;
  camera.position.set(3.9+bob,2.15,5.6);
  camera.lookAt(-0.15,1.15,0);
  effect.render(scene,camera);
  return label.dataset.beat;
}

window.__clipInventory=clips.map(c=>({name:c.name,duration:c.duration}));
window.__chosenClips=Object.fromEntries(Object.entries(chosen).map(([k,v])=>[k,v?.name||null]));
window.__setTime=setTime;
setTime(0);
window.__ready=true;
