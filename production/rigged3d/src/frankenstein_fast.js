import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

const W=1280,H=720;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(W,H,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;document.body.appendChild(renderer.domElement);
const effect=new OutlineEffect(renderer,{defaultThickness:0.004,defaultColor:[0.02,0.015,0.01]});

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0b0e0f);
scene.fog=new THREE.FogExp2(0x0b0e0f,0.048);

const camera=new THREE.PerspectiveCamera(39,W/H,0.05,100);
const hemi=new THREE.HemisphereLight(0xa6b7bd,0x1b120c,0.62);scene.add(hemi);
const key=new THREE.PointLight(0xf2c37e,5.8,11,2);key.position.set(-0.3,1.45,0.7);scene.add(key);
const cold=new THREE.DirectionalLight(0x9fb8c6,1.15);cold.position.set(-3,4,-4);scene.add(cold);
const flash=new THREE.PointLight(0xc9e7ff,0,13,2);flash.position.set(0.45,2.4,0);scene.add(flash);

const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,10),new THREE.MeshToonMaterial({color:0x39362f}));
floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);

const draco=new DRACOLoader();draco.setDecoderPath('/draco/');
const loader=new GLTFLoader();loader.setDRACOLoader(draco);loader.setMeshoptDecoder(MeshoptDecoder);

function toonify(root,color=null){
  root.traverse(o=>{
    if(!o.isMesh)return;
    o.castShadow=true;o.receiveShadow=true;
    const old=Array.isArray(o.material)?o.material[0]:o.material;
    const c=color?new THREE.Color(color):(old?.color?.clone?.()||new THREE.Color(0xffffff));
    o.material=new THREE.MeshToonMaterial({color:c,map:old?.map||null,transparent:old?.transparent||false,opacity:old?.opacity??1});
  });
}
async function readyAsset(url,{width=null,height=null,color=null}={}){
  const gltf=await loader.loadAsync(url);const raw=gltf.scene;toonify(raw,color);raw.updateMatrixWorld(true);
  let box=new THREE.Box3().setFromObject(raw),size=box.getSize(new THREE.Vector3());
  const scale=width?width/Math.max(size.x,size.z):height?height/size.y:1;
  raw.scale.multiplyScalar(scale);raw.updateMatrixWorld(true);
  box=new THREE.Box3().setFromObject(raw);const center=box.getCenter(new THREE.Vector3());
  raw.position.x-=center.x;raw.position.z-=center.z;raw.position.y-=box.min.y;raw.updateMatrixWorld(true);
  const group=new THREE.Group();group.add(raw);
  const finalBox=new THREE.Box3().setFromObject(group),finalSize=finalBox.getSize(new THREE.Vector3());
  return {group,size:finalSize,gltf};
}
function actor(source,animations,{x=0,y=0,z=0,rot=0,color=null,scale=1}={}){
  const root=SkeletonUtils.clone(source);toonify(root,color);root.position.set(x,y,z);root.rotation.y=rot;root.scale.setScalar(scale);scene.add(root);
  return {root,mixer:new THREE.AnimationMixer(root),animations,current:null};
}
function exact(clips,name){return clips.find(c=>c.name===name)||null;}
function applyAt(a,clip,time,loop=true){
  if(!clip)return;
  if(a.current!==clip){a.mixer.stopAllAction();a.current=clip;}
  const action=a.mixer.clipAction(clip);action.enabled=true;action.setEffectiveWeight(1);action.setEffectiveTimeScale(1);
  action.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);action.clampWhenFinished=!loop;action.play();action.paused=true;
  action.time=loop?((time%clip.duration)+clip.duration)%clip.duration:Math.min(Math.max(time,0),Math.max(clip.duration-1/120,0));
  a.mixer.update(0);a.root.updateMatrixWorld(true);
}
function findBone(root,regexes){
  let bones=[];root.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton)bones.push(...o.skeleton.bones);});
  bones=[...new Map(bones.map(b=>[b.uuid,b])).values()];
  for(const re of regexes){const hit=bones.find(b=>re.test(b.name||''));if(hit)return hit;}return null;
}
function pos(obj){const v=new THREE.Vector3();obj.getWorldPosition(v);return v;}

const human=await loader.loadAsync('/assets/human_male.glb');
const peasant=await loader.loadAsync('/assets/victor_peasant.glb');
const clips=human.animations;
const C={
  idle:exact(clips,'Idle_Loop'),
  walk:exact(clips,'Walk_Formal_Loop'),
  contact:exact(clips,'PickUp_Table'),
  death:exact(clips,'Death01'),
  rise:exact(clips,'LayToIdle'),
  chest:exact(clips,'Hit_Chest'),
  zombie:exact(clips,'Zombie_Idle_Loop'),
  recoil:exact(clips,'Hit_Knockback')
};
for(const [k,v] of Object.entries(C))if(!v)throw new Error('Missing ready clip '+k);

const victor=actor(peasant.scene,clips,{x:-2.3,z:0.72,rot:-Math.PI/2,color:null,scale:1});
const creature=actor(human.scene,clips,{x:0,y:0,z:0,rot:-Math.PI/2,color:0xb4a66f,scale:1.07});

// Ready set: walls + two copies of the ready table + candle + lever.
const wallA=await readyAsset('/assets/graveyard/brick-wall.glb',{width:3.45,color:0x514a41});
const wallB=await readyAsset('/assets/graveyard/brick-wall.glb',{width:3.45,color:0x514a41});
wallA.group.position.set(-1.72,0,-2.7);wallB.group.position.set(1.72,0,-2.7);scene.add(wallA.group,wallB.group);

const workTable=await readyAsset('/assets/table.glb',{width:1.9,color:0x5b4030});scene.add(workTable.group);
const slab=workTable.group.clone(true);scene.add(slab);
slab.position.set(0.95,0,-0.45);slab.rotation.y=0.04;

const leverAsset=await readyAsset('/assets/lever.glb',{height:0.4,color:0x947343});
const leverPivot=new THREE.Group();leverPivot.add(leverAsset.group);scene.add(leverPivot);
const candle=await readyAsset('/assets/graveyard/candle.glb',{height:0.32,color:0xe1d0a1});scene.add(candle.group);

// Fit the Creature's ready death pose onto the ready slab automatically.
creature.root.position.set(0,0,0);creature.root.rotation.y=-Math.PI/2;applyAt(creature,C.death,C.death.duration-1/120,false);
let bodyBox=new THREE.Box3().setFromObject(creature.root),bodyCenter=bodyBox.getCenter(new THREE.Vector3());
const slabTop=workTable.size.y;
const creatureBase=new THREE.Vector3(
  slab.position.x-bodyCenter.x,
  slabTop-bodyBox.min.y+0.025,
  slab.position.z-bodyCenter.z
);
creature.root.position.copy(creatureBase);creature.root.updateMatrixWorld(true);

// Fit the lever to the right-hand path of the ready PickUp_Table clip.
victor.root.position.set(-0.62,0,0.55);victor.root.rotation.y=-Math.PI/2;
applyAt(victor,C.contact,C.contact.duration*0.54,false);
const hand=findBone(victor.root,[/right.*hand/i,/hand.*right/i,/hand[._-]?r$/i,/r[._-]?hand/i]);
const contact=hand?pos(hand):new THREE.Vector3(-0.35,0.95,0.4);
workTable.group.position.set(contact.x+0.12,0,contact.z);
const tableTop=workTable.size.y;
leverPivot.position.set(contact.x,tableTop,contact.z);
candle.group.position.set(contact.x+0.48,tableTop,contact.z-0.25);

victor.root.position.set(-2.3,0,0.72);applyAt(victor,C.idle,0,true);

// deterministic dust
let seed=14731;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const pts=[];for(let i=0;i<75;i++)pts.push((rand()-0.5)*7,rand()*3.2,(rand()-0.5)*4);
const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xb3a68c,size:0.017,transparent:true,opacity:0.28}));scene.add(dust);

const label=document.createElement('div');label.id='label';document.body.appendChild(label);
const flashCss=document.createElement('div');flashCss.id='flash';document.body.appendChild(flashCss);

function cameraFor(q){
  if(q<3.75){camera.position.set(4.05,2.05,5.25);camera.lookAt(-0.1,1.0,0);}
  else if(q<6.45){camera.position.set(2.85,1.58,3.0);camera.lookAt(slab.position.x,1.0,slab.position.z);}
  else if(q<7.05){camera.position.set(-3.0,1.72,3.85);camera.lookAt(-0.62,1.05,0.55);}
  else {camera.position.set(4.0,1.95,5.15);camera.lookAt(-0.35,1.0,0);}
}
function setTime(t){
  const q=((t%10)+10)%10;flash.intensity=0;flashCss.style.opacity='0';
  creature.root.position.copy(creatureBase);creature.root.rotation.y=-Math.PI/2;
  leverPivot.rotation.z=0;

  if(q<2.3){
    victor.root.rotation.y=-Math.PI/2;applyAt(victor,C.walk,q,true);applyAt(creature,C.death,C.death.duration-1/120,false);
    victor.root.position.set(THREE.MathUtils.lerp(-2.3,-0.62,q/2.3),0,0.72);
    label.dataset.beat='VICTOR APPROACHES — clothed ready character + real gait';
  }else if(q<3.55){
    victor.root.position.set(-0.62,0,0.55);victor.root.rotation.y=-Math.PI/2;
    // Use only the contact-rich portion of a ready table interaction clip.
    const u=Math.min(C.contact.duration-1/120,(q-2.3)*0.72);
    applyAt(victor,C.contact,u,false);applyAt(creature,C.death,C.death.duration-1/120,false);
    const p=Math.min(1,Math.max(0,(q-2.55)/0.65));leverPivot.rotation.z=-0.58*Math.sin(p*Math.PI/2);
    label.dataset.beat='CONTACT — ready PickUp_Table fitted to ready lever';
  }else if(q<3.9){
    applyAt(victor,C.idle,q-3.55,true);applyAt(creature,C.death,C.death.duration-1/120,false);
    const f=(q-3.55)/0.35;flash.intensity=18*Math.sin(f*Math.PI);flashCss.style.opacity=String(0.7*Math.sin(f*Math.PI));
    label.dataset.beat='ELECTRICAL CUT';
  }else if(q<6.1){
    applyAt(victor,C.idle,q-3.9,true);
    const riseT=Math.min(C.rise.duration-1/120,(q-3.9)*(C.rise.duration/2.2));
    applyAt(creature,C.rise,riseT,false);
    label.dataset.beat='CREATURE AWAKENS — slowed ready LayToIdle';
  }else if(q<6.45){
    applyAt(creature,C.chest,Math.min(C.chest.duration-1/120,q-6.1),false);applyAt(victor,C.idle,q-6.1,true);
    label.dataset.beat='CONVULSIVE BEAT — ready Hit_Chest';
  }else if(q<6.98){
    applyAt(creature,C.zombie,q-6.45,true);
    // Clip surgery: use only the initial recoil of Hit_Knockback; never reach the floor-fall portion.
    const recoilT=Math.min(0.27,(q-6.45)*0.52);
    applyAt(victor,C.recoil,recoilT,false);victor.root.position.set(-0.62,0,0.55);
    label.dataset.beat='VICTOR STARTLES — partial ready knockback';
  }else if(q<9.2){
    applyAt(creature,C.zombie,q-6.98,true);victor.root.rotation.y=Math.PI/2;applyAt(victor,C.walk,q-6.98,true);
    victor.root.position.set(THREE.MathUtils.lerp(-0.62,-2.25,(q-6.98)/2.22),0,0.55);
    label.dataset.beat='VICTOR FLEES — real gait';
  }else{
    applyAt(creature,C.zombie,q-9.2,true);victor.root.rotation.y=-Math.PI/2;applyAt(victor,C.idle,q-9.2,true);
    victor.root.position.set(-2.25,0,0.55);label.dataset.beat='AFTERMATH';
  }

  key.intensity=4.2+0.3*Math.sin(q*11)+0.14*Math.sin(q*23);dust.rotation.y=q*0.012;
  cameraFor(q);effect.render(scene,camera);return label.dataset.beat;
}

window.__clipInventory=clips.map(c=>({name:c.name,duration:c.duration}));
window.__chosenClips=Object.fromEntries(Object.entries(C).map(([k,v])=>[k,v.name]));
window.__contactAudit={
  version:'5.4.3',
  victorSource:'Quaternius Male_Peasant prepared GLB',
  rightHandBone:hand?.name||null,
  contact:[contact.x,contact.y,contact.z],
  workTableHeight:workTable.size.y,
  creatureBase:[creatureBase.x,creatureBase.y,creatureBase.z],
  recoilMaxClipTime:0.27
};
window.__setTime=setTime;setTime(0);window.__ready=true;
