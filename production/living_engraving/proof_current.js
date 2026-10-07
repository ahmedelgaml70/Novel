const fs = require('fs'), path = require('path');
const {Canvas} = require('skia-canvas');
const {render, M, W, H, FPS} = require('./render_current');
async function main(){
  const out = path.resolve(process.argv[2] || path.join(__dirname,'review-output','mechanics-proof'));
  fs.mkdirSync(path.join(out,'frames'),{recursive:true});
  let start=0;
  for(const shot of M.shots){if(shot.id==='galvanic_contact')break;start+=shot.duration;}
  const frames = Math.round(4*FPS);
  for(let f=0;f<frames;f++){
    const canvas=new Canvas(W,H);render(canvas.getContext('2d'),start+f/FPS);
    await canvas.toFile(path.join(out,'frames',String(f).padStart(5,'0')+'.png'));
    if([0,36,72].includes(f))await canvas.toFile(path.join(out,`frame-${f}.png`));
  }
  console.log('Rendered 96 diagnostic frames. No human visual approval implied.');
}
main().catch(e=>{console.error(e);process.exit(1)});
