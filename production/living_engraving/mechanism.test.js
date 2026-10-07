const {test} = require('node:test');
const assert = require('node:assert/strict');
const {mechanism, distance, PORTS, at, arm} = require('./mechanism');

test('all cable endpoints stay on their named terminals in both compositions', () => {
  for (const view of ['macro', 'tableau']) for (let frame = 0; frame <= 96; frame++) {
    const s = mechanism(view, frame / 96);
    assert.deepEqual(s.ports['pile.positive'], at(s.pile.origin, s.pile.scale, PORTS.pile.positive));
    assert.deepEqual(s.ports['jar.foil'], at(s.jar.origin, s.jar.scale, PORTS.jar.foil));
    for (const wire of s.wires) {
      assert.ok(wire.from in s.ports && wire.to in s.ports);
      assert.equal(distance(wire.points[0], s.ports[wire.from]), 0);
      assert.equal(distance(wire.points[1], s.ports[wire.to]), 0);
      assert.notEqual(wire.from, wire.to);
    }
  }
});

test('lever closes on the actual fixed contact with constant length', () => {
  const start = mechanism('macro', 0), end = mechanism('macro', 1);
  assert.ok(distance(start.tip, start.fixed) > 60);
  assert.equal(start.closed, false);
  assert.equal(end.closed, true);
  for (let f = 0; f <= 96; f++) {
    const s = mechanism('macro', f / 96);
    assert.ok(Math.abs(distance(s.hinge, s.tip) - distance(s.hinge, s.fixed)) < 1e-8);
    assert.ok(Math.abs(distance(s.hinge, s.grip) / distance(s.hinge, s.fixed) - .78) < 1e-8);
  }
});

test('contact motion preserves wrist attachment and both arm lengths', () => {
  const seen = new Set();
  for (let f = 0; f <= 96; f++) {
    const s = mechanism('macro', f / 96), a = s.arm;
    assert.ok(a.shoulder[1] < -29, 'sleeve must enter from the frame boundary');
    assert.ok(Math.abs(distance(a.shoulder, a.elbow) - a.upper) < 1e-8);
    assert.ok(Math.abs(distance(a.elbow, a.wrist) - a.lower) < 1e-8);
    assert.deepEqual(a.wrist, [s.grip[0] - 18, s.grip[1] - 74]);
    seen.add(s.tip[1]);
  }
  assert.ok(seen.size > 20, 'action must change without a camera transform');
  assert.throws(() => arm([0, 0], [999, 0]), /Unreachable/);
});

test('rendered components are active and bound to every recurring shot', () => {
  const {Canvas} = require('skia-canvas');
  const {render, M, W, H} = require('./render_current');
  const {items} = require('../../episodes/frankenstein-prototype/item_inventory.json');
  let start = 0;
  for (const shot of M.shots) {
    for (const phase of [.05, .55, .95]) {
      const {seenItems} = render(new Canvas(W, H).getContext('2d'), start + phase * shot.duration);
      for (const id of seenItems) {
        const item = items.find(i => i.id === id);
        assert.ok(item && item.active !== false, 'unregistered or retired layer: ' + id);
        assert.ok(item.shot_ids.includes(shot.id), id + ' missing recurring-shot binding');
      }
    }
    start += shot.duration;
  }
  const macro = M.shots.find(s => s.id === 'galvanic_contact');
  assert.deepEqual(macro.cues, {}, 'unsupported discharge events must remain removed');
});
