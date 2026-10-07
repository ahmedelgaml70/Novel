import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SkeletonUtils } from 'three/addons/utils/SkeletonUtils.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

const loader = new GLTFLoader();
const clock = new THREE.Clock();

function normalizeName(s='') { return s.toLowerCase().replace(/[^a-z0-9]+/g,' '); }

export function resolveClip(clips, keywords) {
  const scored = clips.map(clip => {
    const n = normalizeName(clip.name);
    let score = 0;
    for (let i=0;i<keywords.length;i++) {
      const k=normalizeName(keywords[i]).trim();
      if (!k) continue;
      if (n === k) score += 100 - i;
      else if (n.includes(k)) score += 20 - i;
    }
    return {clip,score};
  }).sort((a,b)=>b.score-a.score);
  return scored[0]?.score > 0 ? scored[0].clip : null;
}

function toonify(root) {
  root.traverse(o => {
    if (!o.isMesh) return;
    const old = Array.isArray(o.material) ? o.material[0] : o.material;
    o.material = new THREE.MeshToonMaterial({
      color: old?.color?.clone?.() ?? new THREE.Color(0xb8aa8d),
      map: old?.map ?? null,
      skinning: !!o.isSkinnedMesh
    });
  });
}

async function loadActor(url) {
  const gltf=await loader.loadAsync(url);
  const root=gltf.scene;
  toonify(root);
  const mixer=new THREE.AnimationMixer(root);
  return {root,mixer,clips:gltf.animations,active:null};
}

function playSemantic(actor, keywords, fade=0.18) {
  const clip=resolveClip(actor.clips,keywords);
  if (!clip) throw new Error(`No ready clip matched: ${keywords.join(', ')}`);
  const next=actor.mixer.clipAction(clip);
  if (actor.active && actor.active !== next) actor.active.fadeOut(fade);
  next.reset().fadeIn(fade).play();
  actor.active=next;
  return clip.name;
}

async function main(){
  const config=await (await fetch('./shot_manifest.json')).json();
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(1280,720);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);
  const effect=new OutlineEffect(renderer,{defaultThickness:0.006,defaultColor:[0.05,0.04,0.03]});

  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x171817);
  scene.fog=new THREE.FogExp2(0x171817,0.035);
  const camera=new THREE.PerspectiveCamera(38,1280/720,0.05,100);
  camera.position.set(4.2,2.0,6.0);
  camera.lookAt(0,1.1,0);

  scene.add(new THREE.HemisphereLight(0xc9d2d6,0x1f1811,1.3));
  const key=new THREE.DirectionalLight(0xffd39a,3.2); key.position.set(2,5,4); scene.add(key);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshToonMaterial({color:0x4b463b}));
  floor.rotation.x=-Math.PI/2; scene.add(floor);

  const a=await loadActor(config.assets.actor_a);
  const b=await loadActor(config.assets.actor_b);
  a.root.position.set(-2,0,0.7);
  b.root.position.set(0.8,0,-0.2);
  b.root.rotation.y=-0.7;
  scene.add(a.root,b.root);

  try {
    const env=await loader.loadAsync(config.assets.environment);
    toonify(env.scene); scene.add(env.scene);
  } catch { console.warn('Ready environment not installed yet; motion proof continues on neutral floor.'); }

  const actors={a,b};
  let lastBeat='';
  window.__novel = {scene,camera,actors,config,playSemantic};

  function frame(){
    requestAnimationFrame(frame);
    const dt=Math.min(clock.getDelta(),0.05);
    const t=(performance.now()/1000)%config.runtime_seconds;
    for(const actor of Object.values(actors)) actor.mixer.update(dt);

    const beat=config.beats.find(x=>t>=x.start && t<x.end);
    if(beat && beat.id!==lastBeat){
      lastBeat=beat.id;
      try { console.log('clip',beat.id,playSemantic(actors[beat.actor],beat.clip_keywords)); }
      catch(e){ console.error(e); }
    }

    // World travel is allowed only to support a ready skeletal locomotion clip.
    if(t<2.7) a.root.position.x=THREE.MathUtils.lerp(-2,0.2,t/2.7);
    camera.position.x=4.2-0.12*Math.sin(t*0.7);
    camera.lookAt(0,1.1,0);
    effect.render(scene,camera);
  }
  frame();
}

main().catch(e=>{console.error(e);document.body.textContent=e.stack||String(e);});
