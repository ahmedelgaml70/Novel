'use strict';

// Geometric constraints only. This is not an electrical/historical simulation.
const PORTS = Object.freeze({
  pile: Object.freeze({positive: [0, -122], negative: [-27, 62]}),
  jar: Object.freeze({inner: [0, -108], foil: [33, 36]})
});
const at = (origin, scale, local) => [origin[0] + scale * local[0], origin[1] + scale * local[1]];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const smooth = t => {t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t);};

function arm(shoulder, wrist, upper = 180, lower = 190) {
  const d = distance(shoulder, wrist);
  if (d > upper + lower || d < Math.abs(upper - lower) || d === 0) throw Error('Unreachable wrist');
  const direction = Math.atan2(wrist[1] - shoulder[1], wrist[0] - shoulder[0]);
  const bend = Math.acos(Math.max(-1, Math.min(1, (upper * upper + d * d - lower * lower) / (2 * upper * d))));
  const angle = direction - bend;
  return {shoulder, elbow: [shoulder[0] + upper * Math.cos(angle), shoulder[1] + upper * Math.sin(angle)], wrist, upper, lower};
}

function mechanism(view, u = 0) {
  if (!['macro', 'tableau'].includes(view)) throw Error('Unknown apparatus view');
  const macro = view === 'macro';
  const pile = {origin: macro ? [270, 474] : [139, 438], scale: macro ? 1.55 : .82};
  const jar = {origin: macro ? [948, 454] : [598, 433], scale: macro ? 1.26 : .82};
  const hinge = macro ? [568, 504] : [352, 395];
  const fixed = macro ? [722, 494] : [425, 390];
  const closedAngle = Math.atan2(fixed[1] - hinge[1], fixed[0] - hinge[0]);
  const angle = closedAngle - .48 * (1 - (macro ? smooth((u - .15) / .5) : 0));
  const length = distance(hinge, fixed);
  const tip = [hinge[0] + length * Math.cos(angle), hinge[1] + length * Math.sin(angle)];
  const ports = {
    'pile.positive': at(pile.origin, pile.scale, PORTS.pile.positive),
    'pile.negative': at(pile.origin, pile.scale, PORTS.pile.negative),
    'jar.inner': at(jar.origin, jar.scale, PORTS.jar.inner),
    'jar.foil': at(jar.origin, jar.scale, PORTS.jar.foil),
    'switch.hinge': hinge, 'switch.fixed': fixed
  };
  const wires = [
    ['supply', 'pile.positive', 'switch.hinge'],
    ['load', 'switch.fixed', 'jar.inner'],
    ['return', 'jar.foil', 'pile.negative']
  ].map(([id, from, to]) => ({id, from, to, points: [ports[from], ports[to]]}));
  const grip = [hinge[0] + length * .78 * Math.cos(angle), hinge[1] + length * .78 * Math.sin(angle)];
  const wrist = [grip[0] - 18, grip[1] - 74];
  return {pile, jar, ports, wires, hinge, fixed, tip, grip, angle, closed: distance(tip, fixed) < .001,
    // Shoulder lies beyond the macro crop; no isolated shoulder cap in-frame.
    arm: macro ? arm([650, -60], wrist, 260, 260) : null};
}

module.exports = {PORTS, at, distance, arm, mechanism};
