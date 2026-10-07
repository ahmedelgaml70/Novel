const fs=require('fs'),path=require('path'),crypto=require('crypto');
const read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8'));
const state=read('METHOD_STATE.json'),manifest=read('scene_manifest.json'),pkg=read('package.json');
const guide=fs.readFileSync(path.resolve(__dirname,state.canonical_guide),'utf8');
if(!guide.includes(`**Method version:** ${state.version}`))throw Error('Guide and method state versions disagree');
if(!pkg.version.startsWith(state.version+'.'))throw Error('Package and method versions disagree');
if(!state.atomic_item_governance||state.generic_asset_packs_allowed!==false)throw Error('Atomic governance and bespoke-asset policy must remain enabled');
const episode=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../episodes/frankenstein-prototype/scene_manifest.json')));
if(JSON.stringify(episode)!==JSON.stringify(manifest))throw Error('Episode and renderer manifests differ');
const runtime=manifest.shots.reduce((n,s)=>n+Number(s.duration),0);
if(!Number.isFinite(runtime)||Math.abs(runtime-manifest.film.runtime_seconds)>1e-6)throw Error('Manifest runtime mismatch');
if(manifest.film.fps!==24||manifest.film.width!==1280||manifest.film.height!==720)throw Error('Current delivery contract is 1280×720 at 24 fps');
const ids=new Set();for(const sh of manifest.shots){if(ids.has(sh.id)||!Number.isFinite(sh.duration)||sh.duration<=0)throw Error('Invalid or duplicate shot '+sh.id);ids.add(sh.id);const c=sh.cues||{},times=[];for(const q of c.lightning||[])times.push(q.time);for(const key of ['thunder','footsteps','arc_hits'])times.push(...c[key]||[]);for(const q of c.electrical_crackle||[]){if(q[0]>q[1])throw Error('Reversed sound range '+sh.id);times.push(...q)}for(const t of times)if(!Number.isFinite(t)||t<0||t>=sh.duration)throw Error('Cue outside shot '+sh.id)}
const assets=read('asset_manifest.json');for(const a of assets.assets){const p=path.join(__dirname,a.path);if(!fs.existsSync(p))throw Error('Missing asset '+a.path);if(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')!==a.sha256)throw Error('Changed asset '+a.path)}
console.log('RENDERER VALIDATION PASSED',{version:state.version,runtime,shots:manifest.shots.length,assets:assets.assets.length});
