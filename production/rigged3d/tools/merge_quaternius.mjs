import fs from 'node:fs/promises';
import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';

const io=new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);

function cloneAccessor(doc,src){
  const out=doc.createAccessor().setType(src.getType()).setNormalized(src.getNormalized());
  const arr=src.getArray();
  if(arr) out.setArray(arr.slice());
  return out;
}

async function merge(characterPath,animationPaths,outputPath){
  const character=await io.read(characterPath);
  const targetRoot=character.getRoot();
  const targetNodes=new Map(targetRoot.listNodes().filter(n=>n.getName()).map(n=>[n.getName(),n]));
  let merged=0;

  for(const path of animationPaths){
    const source=await io.read(path);
    const sourceRoot=source.getRoot();
    const nodeMap=new Map();
    for(const n of sourceRoot.listNodes()){
      const target=targetNodes.get(n.getName());
      if(target) nodeMap.set(n,target);
    }

    for(const clip of sourceRoot.listAnimations()){
      const outClip=character.createAnimation(clip.getName());
      for(const channel of clip.listChannels()){
        const target=nodeMap.get(channel.getTargetNode());
        const sampler=channel.getSampler();
        if(!target || !sampler?.getInput() || !sampler?.getOutput()) continue;
        const outSampler=character.createAnimationSampler()
          .setInput(cloneAccessor(character,sampler.getInput()))
          .setOutput(cloneAccessor(character,sampler.getOutput()))
          .setInterpolation(sampler.getInterpolation());
        const outChannel=character.createAnimationChannel()
          .setTargetNode(target)
          .setTargetPath(channel.getTargetPath())
          .setSampler(outSampler);
        outClip.addSampler(outSampler).addChannel(outChannel);
      }
      merged++;
    }
  }

  const bytes=await io.writeBinary(character);
  await fs.writeFile(outputPath,bytes);
  console.log(`Wrote ${outputPath}: ${merged} ready animation clips, ${(bytes.byteLength/1048576).toFixed(2)} MB`);
}

const args=process.argv.slice(2);
if(args.length<4){
  console.error('Usage: node tools/merge_quaternius.mjs <character.gltf> <output.glb> <UAL1_Standard.glb> <UAL2_Standard.glb>');
  process.exit(2);
}
const [characterPath,outputPath,...animationPaths]=args;
merge(characterPath,animationPaths,outputPath).catch(e=>{console.error(e);process.exit(1);});
