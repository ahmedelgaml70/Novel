const fs=require('fs');
const path=require('path');
const root=__dirname;
const state=JSON.parse(fs.readFileSync(path.join(root,'METHOD_STATE.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'scene_manifest.json'),'utf8'));
const renderer=fs.readFileSync(path.join(root,'render_current.js'),'utf8');

if(state.version!=='5.2') throw new Error('METHOD_STATE version must be 5.2');
if(state.generic_asset_packs_allowed!==false) throw new Error('generic visible asset packs must remain disabled');
if(!state.atomic_item_governance) throw new Error('atomic item governance must be enabled');

const runtime=manifest.shots.reduce((n,s)=>n+Number(s.duration),0);
if(Math.abs(runtime-Number(manifest.film.runtime_seconds))>1e-6) throw new Error('manifest runtime mismatch');
if(manifest.film.fps!==24) throw new Error('current renderer assumes 24 fps');

for(const shot of manifest.shots){
  const c=shot.cues||{}, times=[];
  for(const q of c.lightning||[]) times.push(q.time);
  for(const q of c.thunder||[]) times.push(q);
  for(const q of c.footsteps||[]) times.push(q);
  for(const q of c.arc_hits||[]) times.push(q);
  for(const q of c.electrical_crackle||[]) times.push(q[0],q[1]);
  for(const t of times) if(t<0||t>shot.duration) throw new Error(`cue outside shot ${shot.id}: ${t}`);
}

for(const bad of ['fontawesome','open peeps','openpeeps','lottie']){
  if(renderer.toLowerCase().includes(bad)) throw new Error('forbidden generic visible-asset source token in renderer: '+bad);
}

console.log('RENDERER VALIDATION PASSED',{version:state.version,runtime,shots:manifest.shots.length});
