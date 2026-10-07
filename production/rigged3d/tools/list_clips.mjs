import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';

const file=process.argv[2];
if(!file){console.error('Usage: node tools/list_clips.mjs <animated.glb>');process.exit(2)}
const io=new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
const doc=await io.read(file);
const names=doc.getRoot().listAnimations().map(a=>a.getName()).filter(Boolean).sort();
console.log(`${names.length} clips`);
for(const name of names) console.log(name);
