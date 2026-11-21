// PROTOTYPE harness: runs the conductor over sessions drawn from the local corpus and prints aggregates only
// (no recipe content), so the output can go in the ticket. Needs corpus.local.js (see convert.js).
//
//   node prototype/conductor/batch.js
const C = require('./conductor.js');
const F = require('./fixtures.js');
let CORPUS;
try { CORPUS = require('./corpus.local.js'); } catch { console.error('corpus.local.js missing: run convert.js first'); process.exit(1); }

// deterministic RNG so runs repeat
let seed = 23;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = (a, n) => { const c = a.slice(), o = []; while (o.length < n && c.length) o.push(c.splice(Math.floor(rnd() * c.length), 1)[0]); return o; };
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const r1 = x => Math.round(x * 10) / 10;

// A plausible "true" split of each recipe's hands-on minutes over its untimed steps, by kind of action.
// The conductor never sees it except in the 'oracle' runs; executions add noise and a per-session cook speed.
const WEIGHT = [[/\b(slice|chop|cut|julienne|grate|dice|mince|peel|shred|trim|quarter|halve)/, 3],
  [/\b(form|shape|roll|wrap|stuff|skewer|bread|dredge|dip|press|knead|fold)/, 3],
  [/\b(fry|sauté|brown|sear|cook|simmer|stir|until)/, 4],
  [/\b(mix|combine|whisk|beat|season|toss|serve|plate|top|garnish|sprinkle|pour|add)/, 1]];
const weightOf = text => { const lc = text.toLowerCase(); for (const [re, w] of WEIGHT) if (re.test(lc)) return w; return 2; };
for (const r of [...CORPUS, ...F.RECIPES]) {
  const handsTimer = r.steps.reduce((a, s) => a + (s.timer && s.timer.attention === 'hands' ? s.timer.min : 0), 0);
  const un = r.steps.filter(s => !s.timer);
  const budget = Math.max(un.length, r.handsOnMin - handsTimer), W = un.reduce((a, s) => a + weightOf(s.text), 0);
  un.forEach(s => { s.trueMin = budget * weightOf(s.text) / W; });
}

// Cooked rice in grams is a sub-recipe line: those recipes use the fixture rice recipe.
const RICE = F.RECIPES.find(r => r.id === 'rice');
let riceUsers = 0;
for (const r of CORPUS) {
  const idx = r.ingredients.findIndex(i => i.key === 'rice' && i.unit === 'g');
  if (idx < 0) continue;
  const s = r.steps.find(s => s.ings.includes(idx));
  if (s) { s.uses = ['rice']; r.usesRice = true; riceUsers++; }
}

const KITCHENS = {
  '4 burners, 1 pan': { hob: 4, pan: 1, pot: 1, smallpot: 1, deepfry: 1, microwave: 1, ricecooker: 1 },
  '4 burners, 2 pans': { hob: 4, pan: 2, pot: 1, smallpot: 1, deepfry: 1, microwave: 1, ricecooker: 1 },
  '2 burners, 1 pan': { hob: 2, pan: 1, pot: 1, smallpot: 1, deepfry: 1, microwave: 1, ricecooker: 1 },
  '1 burner, 1 pan (contrast)': { hob: 1, pan: 1, pot: 1, smallpot: 1, deepfry: 1, microwave: 1, ricecooker: 1 },
};

function session(recipes, eatNowAll, mult = 1) {
  const s = recipes.map(r => ({ recipe: r, mult, eatNow: eatNowAll }));
  if (recipes.some(r => r.usesRice)) s.push({ recipe: RICE, mult, eatNow: eatNowAll });
  return s;
}
function sample(n, size, filter, eatNow) {
  const pool = CORPUS.filter(filter), out = [];
  for (let i = 0; i < n; i++) out.push(session(pick(pool, size[0] + Math.floor(rnd() * (size[1] - size[0] + 1))), eatNow));
  return out;
}
const SESSIONS = {
  'batch (3-5 dishes, to the fridge)': sample(300, [3, 5], r => r.batch >= 2, false),
  'meal (2-3 dishes, eaten now)': sample(200, [2, 3], () => true, true),
};

// one execution: true durations with noise and a cook speed drawn per session
function execute(sess, kitchen, opt, noiseSeed) {
  const P = C.prepare(sess, opt);
  seed = noiseSeed;
  const speed = 0.8 + rnd() * 0.8;
  const actual = new Map();
  for (const t of P.tasks.values()) {
    if (t.kind !== 'hands') { actual.set(t.key, t.est); continue; }
    const m = (sess[t.ri].mult || 1);
    actual.set(t.key, (t.step.trueMin ?? t.est) * (1 + (m - 1) * 0.5) * speed * Math.exp(0.3 * gauss()));
  }
  return C.run(P, C.init(P), kitchen, { policy: opt.policy, durOf: t => actual.get(t.key) });
}

const ROWS = [
  ['greedy (device-ui)', { policy: 'greedy', hold: false }],
  ['evey, even spread', { policy: 'evey' }],
  ['evey, oracle spread', { policy: 'evey', spread: 'oracle' }],
  ['evey, no buzz rule', { policy: 'evey', fit: false }],
  ['evey, latest-start hold', { policy: 'evey', holdMode: 'lst' }],
  ['evey, backward plan', { policy: 'evey', holdMode: 'alap' }],
  ['evey, backward, replan', { policy: 'evey', holdMode: 'alap', replan: true }],
  ['evey, replan + pace', { policy: 'evey', holdMode: 'alap', replan: true, pace: true }],
  ['evey, prep then fire', { policy: 'evey', holdMode: 'fire' }],
  ['evey, no hold', { policy: 'evey', hold: false }],
  ['evey, no prep-first rule', { policy: 'evey', mise: false }],
];

console.log('Conductor prototype over the corpus: aggregates only. Minutes; med = median, p90 = 90th percentile.');
console.log(`corpus: ${CORPUS.length} recipes; ${riceUsers} take cooked rice and pull in a rice sub-recipe`);
{ const fl = SESSIONS['meal (2-3 dishes, eaten now)'].map(s => { const P = C.prepare(s); return C.metrics(P, C.init(P)).coldFloor; });
  console.log(`meal floor (one cook, final hands-on blocks in turn): med ${r1(q(fl, .5))} p90 ${r1(q(fl, .9))}`); }
for (const [sname, list] of Object.entries(SESSIONS)) {
  for (const [kname, kitchen] of Object.entries(KITCHENS)) {
    console.log(`\n## ${sname}, ${kname}  (${list.length} sessions)`);
    console.log('policy                     | over lower bound med/p90 | cook idle med | food waits after buzz p90/max | on-heat gaps p90 | buzz during hands-on timer | hot dish waits med/p90 | over floor med/p90 | stuck');
    for (const [rname, opt] of ROWS) {
      const res = list.map((s, i) => execute(s, kitchen, opt, 1000 + i));
      const ok = res.filter(r => !r.stuck);
      if (process.env.STUCK && res.some(r => r.stuck)) { const r = res.find(r => r.stuck); console.log('STUCK', JSON.stringify(r.stuck).slice(0, 600), JSON.stringify(Object.entries(r.st.status).filter(([k, v]) => v !== 'done'))); }
      const over_cap = res.filter(r => Object.entries(r.peak).some(([k, v]) => v > (kitchen[k] ?? 0))).length;
      if (over_cap) console.log(`!! ${over_cap} sessions exceeded the kitchen`);
      const over = ok.map(r => r.makespan - r.lower);
      const line = [rname.padEnd(26), `${r1(q(over, .5))}/${r1(q(over, .9))}`.padEnd(24), String(r1(q(ok.map(r => r.idle), .5))).padEnd(13),
        `${r1(q(ok.map(r => r.afterBuzzMax), .9))}/${r1(Math.max(...ok.map(r => r.afterBuzzMax)))}`.padEnd(29),
        String(r1(q(ok.map(r => r.onHeatGap), .9))).padEnd(16),
        `${Math.round(100 * ok.filter(r => r.buzzWhileBusy).length / ok.length)}% of sessions`.padEnd(26),
        `${r1(q(ok.map(r => r.coldMax), .5))}/${r1(q(ok.map(r => r.coldMax), .9))}`.padEnd(20),
        `${r1(q(ok.map(r => Math.max(0, r.coldMax - r.coldFloor)), .5))}/${r1(q(ok.map(r => Math.max(0, r.coldMax - r.coldFloor)), .9))}`.padEnd(18), res.length - ok.length];
      console.log(line.join(' | '));
    }
  }
}

// Spread of hands-on minutes: how far the even spread is from the weighted "true" split, per step
const errs = [];
for (const r of CORPUS) {
  const P = C.prepare([{ recipe: r, mult: 1 }]);
  for (const t of P.tasks.values()) if (t.kind === 'hands') errs.push(Math.abs(t.est - t.step.trueMin));
}
const short = CORPUS.filter(r => { const P = C.prepare([{ recipe: r, mult: 1 }]); return [...P.tasks.values()].some(t => t.budgetShort); });
console.log(`\nspread: |even - weighted| per untimed step med ${r1(q(errs, .5))} p90 ${r1(q(errs, .9))} min; ` +
  `${short.length} recipes have hands-on minutes below 1 min per untimed step once hands-on timers are taken out`);

// Scaling: hands-on pan or deep-fry timers whose food at x3 exceeds one round (assumed 500 g pan, 300 g fryer)
const subtreeGrams = (r, s) => {
  const g = s.ings.reduce((a, i) => a + (r.ingredients[i].unit === 'g' ? r.ingredients[i].qty || 0 : 0), 0);
  return g + s.inputs.reduce((a, id) => a + subtreeGrams(r, r.steps.find(x => x.id === id)), 0);
};
let over3 = 0, handsHeat = 0;
for (const r of CORPUS) {
  const hs = r.steps.filter(s => s.timer && s.timer.attention === 'hands' && (s.equipment.includes('pan') || s.equipment.includes('deepfry')));
  if (!hs.length) continue;
  handsHeat++;
  if (hs.some(s => subtreeGrams(r, s) * 3 > (s.equipment.includes('deepfry') ? 300 : 500))) over3++;
}
console.log(`scaling: ${handsHeat} recipes have a hands-on pan or fryer timer; at x3, ${over3} of them put more than one round's worth in (assumed 500 g pan, 300 g fryer)`);

// The cost of rounds: x3 batch sessions with and without repeating hands-on fry steps in rounds
const chains = CORPUS.flatMap(r => r.steps.filter(s => s.equipment.length && r.steps.some(p => p.inputs.includes(s.id) && p.equipment[0] === s.equipment[0])));
console.log(`chains: ${chains.length} steps hand their vessel on to the next step (held equipment)`);

// Rounds at x3: give each hands-on pan/fryer timer a per-round capacity from its food weight (same caps),
// then run x3 batch sessions with and without repeating the timer per round.
for (const r of CORPUS) for (const s of r.steps) {
  if (!(s.timer && s.timer.attention === 'hands' && (s.equipment.includes('pan') || s.equipment.includes('deepfry')))) continue;
  const g = subtreeGrams(r, s); if (!g) continue;
  s.perRound = Math.max(1, Math.floor((s.equipment.includes('deepfry') ? 300 : 500) / g));
}
const K0 = KITCHENS['4 burners, 1 pan'];
const x3 = SESSIONS['batch (3-5 dishes, to the fridge)'].map(s => s.map(e => ({ ...e, mult: 3 })));
const add = [], fryMin = [];
x3.forEach((s, i) => {
  const a = execute(s, K0, { policy: 'evey', rounds: false }, 5000 + i), b = execute(s, K0, { policy: 'evey', rounds: true }, 5000 + i);
  add.push(b.makespan - a.makespan);
});
console.log(`rounds: x3 batch sessions take med ${r1(q(add, .5))} p90 ${r1(q(add, .9))} min longer when fry steps repeat per round (${add.filter(x => x > 0.5).length} of ${add.length} sessions affected)`);
