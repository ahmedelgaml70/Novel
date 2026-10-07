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
camera.position.set(5.2,2.7,7.4);
camera.lookAt(0,1.15,0);

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

function applyAt(actor,clip,time){
  if(!clip) return;
  if(actor.current!==clip){
    actor.mixer.stopAllAction();
    actor.current=clip;
  }
  const action=actor.mixer.clipAction(clip);
  action.enabled=true;
  action.setEffectiveWeight(1);
  action.setEffectiveTimeScale(1);
  action.play();
  action.paused=true;
  action.time=((time%clip.duration)+clip.duration)%clip.duration;
  actor.mixer.update(0);
}

const gltf=await new GLTFLoader().loadAsync('/assets/human_male.glb');
const clips=gltf.animations;
const chosen={
  idle:findClip(clips,'idle','standing idle'),
  walk:findClip(clips,'walk','walking'),
  run:findClip(clips,'run','running'),
  attack:findClip(clips,'attack','punch','strike','hit'),
  jump:findClip(clips,'jump'),
  dance:findClip(clips,'dance')
};
if(!chosen.walk || !chosen.idle) throw new Error('Ready GLB lacks required Walk/Idle clips');

const A=makeActor(gltf.scene,clips,-2.6,-Math.PI/2,null);
const B=makeActor(gltf.scene,clips,1.1,Math.PI/2,0x99978e);

const label=document.createElement('div');
label.id='label';
label.innerHTML='<b>V5.4 READY-RIGGED PROOF</b><br>real skeleton • ready CC0 clips • no custom rig';
document.body.appendChild(label);

function setTime(t){
  const q=((t%9)+9)%9;
  A.root.rotation.y=-Math.PI/2;
  B.root.rotation.y=Math.PI/2;

  if(q<2.7){
    applyAt(A,chosen.walk,q);
    applyAt(B,chosen.idle,q);
    A.root.position.x=THREE.MathUtils.lerp(-2.7,-0.8,q/2.7);
    label.dataset.beat='WALK';
  } else if(q<4.5){
    applyAt(A,chosen.idle,q-2.7);
    applyAt(B,chosen.attack||chosen.jump||chosen.dance||chosen.idle,q-2.7);
    A.root.position.x=-0.8;
    label.dataset.beat='INDEPENDENT ACTION';
  } else if(q<6.8){
    A.root.rotation.y=Math.PI/2;
    applyAt(A,chosen.run||chosen.walk,q-4.5);
    applyAt(B,chosen.idle,q-4.5);
    A.root.position.x=THREE.MathUtils.lerp(-0.8,-2.45,(q-4.5)/2.3);
    label.dataset.beat='RUN / RECOIL';
  } else {
    applyAt(A,chosen.idle,q-6.8);
    applyAt(B,chosen.idle,q-6.8);
    A.root.position.x=-2.45;
    label.dataset.beat='SETTLE';
  }

  const bob=Math.sin(q*0.45)*0.06;
  camera.position.set(5.2+bob,2.7,7.4);
  camera.lookAt(-0.2,1.15,0);
  effect.render(scene,camera);
  return label.dataset.beat;
}

window.__clipInventory=clips.map(c=>({name:c.name,duration:c.duration}));
window.__chosenClips=Object.fromEntries(Object.entries(chosen).map(([k,v])=>[k,v?.name||null]));
window.__setTime=setTime;
setTime(0);
window.__ready=true;
