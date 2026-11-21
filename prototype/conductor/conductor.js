// PROTOTYPE: throwaway, on branch prototype/conductor, never merged.
// Answers "The conductor within equipment limits" (gariasf/evey#23).
// Pure module: no DOM. index.html loads it as window.Conductor; batch.js requires it.
//
// Model read from each recipe (ADR 0006 shape, only what the conductor needs):
//   { id, name, handsOnMin, batch, steps: [{ id, text, inputs: [stepId], uses: [recipeId],
//     equipment: [kind], timer: { min, max, attention: 'walk' | 'hands' }, estMin, perRound }] }
// A session is [{ recipe, mult, eatNow }]. A kitchen is { kind: count }.
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m; else root.Conductor = m;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Vessels that sit on a burner: holding one also holds a hob burner.
  const ON_HOB = new Set(['pan', 'pot', 'smallpot', 'deepfry']);
  const START_MIN = 1;      // cook minutes to start a walk-away step (lid on, timer set)
  const FRIDGE_MIN = 30;    // a final walk-away step this long with no equipment runs in the fridge, after the session
  const HOLD_SLACK = 2;     // an eat-now dish may finish this many minutes before the session ends
  const STICK_MIN = 4;      // stay with the dish in hand unless another is this much more urgent

  const K = (ri, sid) => ri + ':' + sid;

  // ---------- preparation: one task per step, with chains and the critical-path tail ----------
  function prepare(session, opt = {}) {
    const prepScale = opt.prepScale ?? 0.5;           // each extra batch adds this share of the untimed minutes
    const spreadMode = opt.spread || 'even';          // 'even' | 'oracle' (uses step.trueMin when present)
    const useRounds = opt.rounds ?? true;
    const tasks = new Map();
    const rootOf = new Map();
    const recipeIndex = new Map(session.map((e, i) => [e.recipe.id, i]));
    session.forEach((e, ri) => {
      const r = e.recipe, m = e.mult || 1;
      const handsTimer = r.steps.reduce((a, s) => a + (s.timer && s.timer.attention === 'hands' ? s.timer.min : 0), 0);
      const fixed = r.steps.reduce((a, s) => a + (!s.timer && s.estMin != null ? s.estMin : 0), 0);
      const untimed = r.steps.filter(s => !s.timer && s.estMin == null);
      const budget = (r.handsOnMin || 0) - handsTimer - fixed;
      const spread = untimed.length ? Math.max(1, budget / untimed.length) : 0;
      const consumed = new Set(r.steps.flatMap(s => s.inputs || []));
      const rootStep = r.steps.find(s => !consumed.has(s.id));
      rootOf.set(ri, K(ri, rootStep.id));
      for (const s of r.steps) {
        const rounds = useRounds && s.perRound ? Math.ceil(m / s.perRound) : 1;
        let kind, est;
        if (!s.timer) {
          kind = 'hands';
          const base = spreadMode === 'oracle' && s.trueMin != null ? s.trueMin : (s.estMin ?? spread);
          est = base * (1 + (m - 1) * prepScale);
        } else if (s.timer.attention === 'hands') { kind = 'handsTimer'; est = s.timer.min * rounds; }
        else { kind = 'walk'; est = s.timer.min * rounds; }
        const isRoot = s === rootStep;
        const fridge = isRoot && kind === 'walk' && !(s.equipment || []).length && s.timer.min >= FRIDGE_MIN;
        tasks.set(K(ri, s.id), {
          key: K(ri, s.id), ri, sid: s.id, step: s, recipe: r, kind, est: fridge ? 0 : est, fridge, rounds,
          budgetShort: budget < untimed.length, eatNow: !!e.eatNow,
          kinds: s.equipment || [], inputs: (s.inputs || []).map(id => K(ri, id)), usesRecipes: s.uses || [],
          parent: null, children: [], chainPrev: {}, chainNext: {},
        });
      }
    });
    // sub-recipes: a step that uses another session recipe waits for that recipe's finished dish
    for (const t of tasks.values()) {
      for (const rid of t.usesRecipes) if (recipeIndex.has(rid)) t.inputs.push(rootOf.get(recipeIndex.get(rid)));
      for (const i of t.inputs) { const c = tasks.get(i); c.parent = t.key; t.children.push(i); }
    }
    // chains: a kind named by consecutive steps is held from the first step's start to the last step's end
    for (const t of tasks.values()) for (const k of t.kinds) {
      const prev = t.children.map(c => tasks.get(c)).find(c => c.ri === t.ri && c.kinds.includes(k) && !c.chainNext[k]);
      if (prev) { t.chainPrev[k] = prev.key; prev.chainNext[k] = t.key; }
    }
    // the day before: a walk-away step this long (soak, marinate overnight) and everything feeding it
    const dayBefore = opt.dayBefore ?? 120;
    const markBefore = key => { const t = tasks.get(key); if (t.before) return; t.before = true; t.est = 0; t.children.forEach(markBefore); };
    for (const t of tasks.values()) if (t.kind === 'walk' && !t.fridge && t.step.timer.min >= dayBefore) markBefore(t.key);
    // tail: longest estimated path from the start of this step to the end of the last dish it feeds
    const tail = new Map();
    const tailOf = key => {
      if (tail.has(key)) return tail.get(key);
      const t = tasks.get(key), v = t.est + (t.parent ? tailOf(t.parent) : 0);
      tail.set(key, v); return v;
    };
    for (const k of tasks.keys()) tasks.get(k).tail = tailOf(k);
    // anchor: when every dish is eaten now, the one with the longest path sets the end the others aim at
    let anchor = -1;
    if (session.length > 1 && session.every(e => e.eatNow)) {
      const crit = session.map((e, ri) => Math.max(...[...tasks.values()].filter(t => t.ri === ri).map(t => t.tail)));
      anchor = crit.indexOf(Math.max(...crit));
    }
    // the hot finish of an eat-now dish: a heated step at serving (the root, or a heated step feeding it) and its chain
    const hotSet = new Set();
    session.forEach((e, ri) => { if (!e.eatNow) return; const r = tasks.get(rootOf.get(ri));
      [r, ...r.children.map(c => tasks.get(c))].filter(t => t.ri === ri && t.kinds.length && !t.before).forEach(t => {
        hotSet.add(t.key); for (const k of t.kinds) { let c = t; while (c.chainPrev[k]) { c = tasks.get(c.chainPrev[k]); hotSet.add(c.key); } } }); });
    // steps that wait on a hot finish (plating after it)
    const afterHot = new Set();
    for (const k of hotSet) { let t = tasks.get(k); while (t.parent) { t = tasks.get(t.parent); if (!hotSet.has(t.key)) afterHot.add(t.key); } }
    return { session, tasks, rootOf, opt, anchor, hotSet, afterHot };
  }


  // ---------- backward plan: schedule from the meal's end so the dishes finish together ----------
  // List-schedules the reversed tree (root first) with the same cook and equipment limits, then flips it:
  // each step gets a target start. Prep can still be done early; heated steps of eat-now dishes wait for it.
  function backward(P, kitchen, st0) {
    const T = [...P.tasks.values()].filter(t => !t.before && (!st0 || st0.status[t.key] === 'todo'));
    const inT = new Set(T.map(t => t.key));
    // the cook's pace so far: real minutes over estimated minutes on finished hands-on steps (each Next press times one)
    let pace = 1;
    if (st0 && P.opt.pace) { let a = 0, b = 0; for (const t of P.tasks.values()) if (t.kind === 'hands' && st0.status[t.key] === 'done' && !t.before) { a += st0.end[t.key] - st0.start[t.key]; b += t.est; } if (b > 5) pace = a / b; }
    const est = t => t.kind === 'hands' ? t.est * pace : t.est;
    const head = new Map();
    const headOf = t => { if (head.has(t.key)) return head.get(t.key); const v = est(t) + Math.max(0, ...t.children.filter(c => inT.has(c)).map(c => headOf(P.tasks.get(c)))); head.set(t.key, v); return v; };
    T.forEach(headOf);
    // served hot: the root, or a heated step that feeds the root directly; these go nearest the end
    const hot = new Set();
    P.session.forEach((en, ri) => { if (!en.eatNow) return; const r = P.tasks.get(P.rootOf.get(ri));
      [r, ...r.children.map(c => P.tasks.get(c))].filter(t => t.kinds.length && !t.before).forEach(t => {
        hot.add(t.key); for (const k of t.kinds) { let c = t; while (c.chainPrev[k]) { c = P.tasks.get(c.chainPrev[k]); hot.add(c.key); } } }); });
    const prio = t => (hot.has(t.key) ? 1e5 : 0) + head.get(t.key);
    const status = {}, s = {}, e = {}, inUse = {};
    T.forEach(t => status[t.key] = 'todo');
    let now = 0, cookUntil = 0, guard = 0;
    const take = k => { inUse[k] = (inUse[k] || 0) + 1; if (ON_HOB.has(k)) inUse.hob = (inUse.hob || 0) + 1; };
    const give = k => { inUse[k]--; if (ON_HOB.has(k)) inUse.hob--; };
    const has = (k, n) => (inUse[k] || 0) + n <= (k === 'hob' ? (kitchen.hob ?? 0) : (kitchen[k] ?? 0));
    while (T.some(t => status[t.key] !== 'done') && guard++ < 5000) {
      for (const t of T) if (status[t.key] === 'run' && e[t.key] <= now) {
        status[t.key] = 'done';
        for (const k of t.kinds) if (!t.chainPrev[k] || !inT.has(t.chainPrev[k])) give(k);   // reversed: the chain ends at its forward head
      }
      if (cookUntil <= now) {
        const ready = T.filter(t => status[t.key] === 'todo' && (!t.parent || !inT.has(t.parent) || status[t.parent] === 'done'))
          .filter(t => t.kinds.every(k => t.chainNext[k] || (has(k, 1) && (!ON_HOB.has(k) || has('hob', 1)))))
          .sort((a, b) => prio(b) - prio(a));
        if (ready.length) {
          const t = ready[0];
          status[t.key] = 'run'; s[t.key] = now; e[t.key] = now + est(t);
          for (const k of t.kinds) if (!t.chainNext[k]) take(k);
          cookUntil = now + (t.kind === 'walk' ? Math.min(START_MIN, t.est) : est(t));
          continue;
        }
      }
      const ends = T.filter(t => status[t.key] === 'run').map(t => e[t.key]).filter(x => x > now);
      if (cookUntil > now) ends.push(cookUntil);
      if (!ends.length) break;
      now = Math.min(...ends);
    }
    const H = Math.max(0, ...T.map(t => e[t.key] ?? 0));
    const t0 = st0 ? st0.t : 0;
    const target = new Map(T.map(t => [t.key, t0 + H - (e[t.key] ?? H)]));
    return { target, H };
  }

  const isHead = (t, k) => !t.chainPrev[k];
  const isTail = (t, k) => !t.chainNext[k];
  const chainOf = (P, t, k) => { const out = [t]; let c = t; while (c.chainNext[k]) { c = P.tasks.get(c.chainNext[k]); out.push(c); } return out; };

  // ---------- state ----------
  function init(P) {
    const st = { t: 0, status: {}, start: {}, end: {}, cookUntil: 0, cookTask: null, inUse: {}, log: [], buzzes: [], stuck: null };
    for (const [k, t] of P.tasks) if (t.before) { st.status[k] = 'done'; st.start[k] = st.end[k] = 0; } else st.status[k] = 'todo';
    return st;
  }
  const clone = st => JSON.parse(JSON.stringify(st));

  // Complete everything that ends at or before t, in time order, releasing chain equipment at each chain's last step.
  function advance(P, st, t) {
    for (;;) {
      let next = null;
      for (const k in st.status) if (st.status[k] === 'run' && st.end[k] <= t && (!next || st.end[k] < st.end[next])) next = k;
      if (!next) break;
      st.status[next] = 'done';
      const task = P.tasks.get(next);
      for (const k of task.kinds) if (isTail(task, k)) release(st, k);
      if (task.kind === 'walk' && !task.fridge) st.buzzes.push({ key: next, at: st.end[next], cookBusy: st.cookUntil > st.end[next] ? st.cookTask : null });
    }
    st.t = Math.max(st.t, t);
    if (st.cookUntil <= st.t) st.cookTask = null;
  }
  const acquire = (st, k) => {
    st.inUse[k] = (st.inUse[k] || 0) + 1; if (ON_HOB.has(k)) st.inUse.hob = (st.inUse.hob || 0) + 1;
    st.peak = st.peak || {}; for (const x of [k, 'hob']) st.peak[x] = Math.max(st.peak[x] || 0, st.inUse[x] || 0);
  };
  const release = (st, k) => { st.inUse[k]--; if (ON_HOB.has(k)) st.inUse.hob--; };

  // ---------- which steps the cook may start now, and why the others may not ----------
  function candidates(P, st, kitchen, ctx = {}) {
    const legal = [], blocked = [];
    for (const [key, t] of P.tasks) {
      if (st.status[key] !== 'todo') continue;
      if (!t.inputs.every(i => st.status[i] === 'done')) continue;
      const why = blockReason(P, st, kitchen, t, ctx);
      if (why) blocked.push({ key, why }); else legal.push(key);
    }
    return { legal, blocked };
  }
  function blockReason(P, st, kitchen, t, ctx) {
    const need = {};
    for (const k of t.kinds) if (isHead(t, k)) { need[k] = (need[k] || 0) + 1; if (ON_HOB.has(k)) need.hob = (need.hob || 0) + 1; }
    for (const k in need) {
      const have = k === 'hob' ? (kitchen.hob ?? 0) : (kitchen[k] ?? 0);
      if (!have) return `this kitchen has no ${k}`;
      if ((st.inUse[k] || 0) + need[k] > have) return `${k === 'hob' ? 'every burner' : 'the ' + k} is in use`;
    }
    if (P.opt.mise !== false) {
      // Heat waits for prep: before food goes on the hob, every side input of the chain up to its
      // first walk-away step must be ready (the rest can be prepped while that step runs).
      for (const k of t.kinds) if (ON_HOB.has(k) && isHead(t, k)) {
        for (const c of chainOf(P, t, k)) {
          const side = c.inputs.filter(i => !(c.chainPrev[k] === i));
          const missing = side.filter(i => i !== t.key && st.status[i] !== 'done' && !(c === t));
          if (missing.length) return `prep first: ${missing.map(i => P.tasks.get(i).step.text).join('; ')}`;
          if (c.kind === 'walk') break;
        }
      }
    }
    if (ctx.fire && P.hotSet.has(t.key) && t.kinds.some(k => isHead(t, k))) {
      // prep left: cook minutes still to do outside the hot finishes, at the pace the cook has shown so far
      let a = 0, b = 0, left = 0, any = false;
      for (const [k, x] of P.tasks) {
        if (x.kind === 'hands' && st.status[k] === 'done' && !x.before) { a += st.end[k] - st.start[k]; b += x.est; }
        if (P.hotSet.has(k) || P.afterHot.has(k) || st.status[k] === 'done') continue;
        if (st.status[k] === 'run') { if (x.kind !== 'walk') { any = true; left += Math.max(0, st.end[k] - st.t); } continue; }
        any = true; left += x.kind === 'walk' ? Math.min(START_MIN, x.est) : x.est * (b > 5 ? a / b : 1);
      }
      if (any && left > t.tail && !ctx.noRelief) return 'held: the hot finishes start once the prep is done';
      // fire: every hot chain aims at one end, the longest starting now
      if (P.fireH == null) P.fireH = st.t + Math.max(...[...P.hotSet].filter(k => st.status[k] === 'todo').map(k => P.tasks.get(k).tail));
      const until = P.fireH - t.tail - HOLD_SLACK;
      if (st.t < until) { ctx.until = Math.min(ctx.until ?? Infinity, until); return `held until ${fmt(until)} so it is hot at the end`; }
    } else if (ctx.alap && t.eatNow && t.kinds.some(k => isHead(t, k))) {
      const until = ctx.target.get(t.key) - HOLD_SLACK;
      if (st.t < until) { ctx.until = Math.min(ctx.until ?? Infinity, until); return `held until ${fmt(until)} so it is hot at the end`; }
    } else if (ctx.lst && t.eatNow && t.kinds.some(k => isHead(t, k))) {
      const until = ctx.horizon - t.tail - HOLD_SLACK;
      if (st.t < until) { ctx.until = Math.min(ctx.until ?? Infinity, until); return `held until ${fmt(until)} so it is hot at the end`; }
    } else if (ctx.hold && !ctx.lst && t.eatNow && t.ri !== P.anchor && t.kinds.some(k => ON_HOB.has(k) && isHead(t, k))) {
      const until = ctx.release;
      if (st.t < until) { ctx.until = Math.min(ctx.until ?? Infinity, until); return `held until ${fmt(until)} so it is hot at the end`; }
    }
    return null;
  }
  const fmt = m => { m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };

  // ---------- policies: which legal step the cook does next ----------
  const POLICIES = {
    // evey: food already in held equipment first, then whatever unblocks a held chain, then the longest
    // remaining path (starts long walk-away waits early), staying with the dish in hand when close.
    evey(P, st, legal) {
      const held = new Set();
      for (const [key, t] of P.tasks) if (st.status[key] === 'done' || st.status[key] === 'run')
        for (const k of t.kinds) if (t.chainNext[k] && st.status[t.chainNext[k]] === 'todo') held.add(t.chainNext[k]);
      const unblocks = new Set();
      const addSub = k => { if (unblocks.has(k)) return; unblocks.add(k); if (P.opt.deep !== false) P.tasks.get(k).inputs.forEach(addSub); };
      for (const h of held) for (const i of P.tasks.get(h).inputs) addSub(i);
      const last = st.log.length ? P.tasks.get(st.log[st.log.length - 1].key).ri : -1;
      const score = key => {
        const t = P.tasks.get(key);
        return (held.has(key) ? 1e6 - (P.opt.spt === false ? 0 : 1e3 * t.est) : 0) + (unblocks.has(key) ? 1e5 : 0) + t.tail + (t.ri === last ? STICK_MIN : 0);   // two pans waiting: the shorter step first
      };
      const ranked = legal.slice().sort((a, b) => score(b) - score(a));
      if (P.opt.fit === false || held.has(ranked[0])) return ranked[0];
      // One thing at a time: when food on the hob will buzz soon and need the cook, prefer a task that
      // ends before that buzz (plus the timer's range), so the cook is free when it sounds.
      let due = Infinity;
      for (const [key, t] of P.tasks) if (st.status[key] === 'run' && t.kind === 'walk' && t.kinds.some(k => ON_HOB.has(k) && t.chainNext[k]))
        due = Math.min(due, st.end[key] + (t.step.timer.max - t.step.timer.min));
      if (due === Infinity) return ranked[0];
      const cookMin = k => { const t = P.tasks.get(k); return t.kind === 'walk' ? Math.min(START_MIN, t.est) : t.est; };
      return ranked.find(k => st.t + cookMin(k) <= due) || (due - st.t <= 3 ? null : ranked[0]);
    },
    // device-ui prototype's greedy conductor: start the longest walk-away timer first, then stay with the dish in hand.
    greedy(P, st, legal) {
      const last = st.log.length ? P.tasks.get(st.log[st.log.length - 1].key).ri : -1;
      const walk = legal.filter(k => P.tasks.get(k).kind === 'walk').sort((a, b) => P.tasks.get(b).est - P.tasks.get(a).est);
      if (walk.length) return walk[0];
      return legal.find(k => P.tasks.get(k).ri === last) || legal[0];
    },
  };

  // Start a step now. dur is how long it really takes (the planner passes its estimate).
  function start(P, st, key, dur) {
    const t = P.tasks.get(key);
    st.status[key] = 'run'; st.start[key] = st.t; st.end[key] = st.t + (t.fridge ? 0 : dur);
    for (const k of t.kinds) if (isHead(t, k)) acquire(st, k);
    const cook = t.kind === 'walk' ? Math.min(START_MIN, dur) : dur;
    st.cookUntil = st.t + cook; st.cookTask = key;
    st.log.push({ key, at: st.t, cook });
  }

  // The step the conductor shows now, or null when the cook should wait for a timer.
  function decide(P, st, kitchen, policy = 'evey') {
    let ctx = {};
    if (policy === 'evey' && P.opt.holdMode === 'fire') ctx = { fire: true }; else
    if (policy === 'evey' && P.opt.holdMode === 'alap' && P.opt.hold !== false && [...P.tasks.values()].some(t => t.eatNow)) {
      if (!P.plan || P.opt.replan) P.plan = backward(P, kitchen, P.opt.replan ? st : null);
      ctx = { alap: true, target: P.plan.target };
    } else
    if (policy === 'evey' && P.opt.hold !== false && P.opt.holdMode === 'lst' && [...P.tasks.values()].some(t => t.eatNow)) {
      // Latest start: the session's end is fixed by the first forecast (a session running late simply
      // releases what is held), and each heated chain of an eat-now dish waits until that end minus its remaining path.
      if (P.horizon == null) P.horizon = run(P, clone(st), kitchen, { policy, hold: false }).makespan;
      ctx = { hold: true, lst: true, horizon: P.horizon };
    } else if (policy === 'evey' && P.opt.hold !== false && [...P.tasks.values()].some(t => t.eatNow && t.ri !== P.anchor)) {
      // Aim eat-now dishes at the forecast end of the dishes that are not eaten now.
      const others = P.session.map((e, ri) => ri).filter(ri => (!P.session[ri].eatNow || ri === P.anchor) && st.status[P.rootOf.get(ri)] !== 'done');
      if (others.length) {
        const f = run(P, clone(st), kitchen, { policy, hold: false });
        const horizon = Math.max(...others.map(ri => f.st.end[P.rootOf.get(ri)]));
        // How long the eat-now dishes take on their own from here, cook and equipment shared between them.
        const g = clone(st); g.inUse = {}; g.cookUntil = st.t; g.cookTask = null; g.log = []; g.buzzes = [];
        for (const [k, t] of P.tasks) if (!t.eatNow || t.ri === P.anchor) g.status[k] = 'done';
        const gs = run(P, g, kitchen, { policy, hold: false }).st;
        const group = Math.max(st.t, ...[...P.tasks.values()].filter(t => t.eatNow && t.ri !== P.anchor).map(t => gs.end[t.key] ?? 0)) - st.t;
        ctx = { hold: true, horizon, release: horizon - group - HOLD_SLACK };
      }
    }
    const c = candidates(P, st, kitchen, ctx);
    return { pick: c.legal.length ? POLICIES[policy](P, st, c.legal) : null, until: ctx.until, ...c };
  }

  // Run to the end of the session. durOf(task) gives the real duration; default is the estimate.
  function run(P, st, kitchen, o = {}) {
    const policy = o.policy || 'evey', durOf = o.durOf || (t => t.est);
    let guard = 0, d = null;
    while (Object.values(st.status).some(s => s !== 'done') && guard++ < 5000) {
      advance(P, st, st.t);
      d = null;
      if (st.cookUntil <= st.t) {
        d = o.hold === false ? (() => { const c = candidates(P, st, kitchen); return { pick: c.legal.length ? POLICIES[policy](P, st, c.legal) : null, ...c }; })() : decide(P, st, kitchen, policy);
        if (d.pick) { start(P, st, d.pick, durOf(P.tasks.get(d.pick))); continue; }
      }
      const ends = Object.keys(st.status).filter(k => st.status[k] === 'run').map(k => st.end[k]).filter(e => e > st.t);
      if (st.cookUntil > st.t) ends.push(st.cookUntil);
      if (d && d.until > st.t) ends.push(d.until);
      if (!ends.length) {
        if (Object.values(st.status).every(x => x === 'done')) break;
        const c = candidates(P, st, kitchen);
        st.stuck = c.blocked.length ? c.blocked : [{ key: '-', why: 'nothing ready' }];
        break;
      }
      advance(P, st, Math.min(...ends));
    }
    return { st, ...metrics(P, st) };
  }

  // ---------- what a finished session says ----------
  function metrics(P, st) {
    const T = [...P.tasks.values()];
    const makespan = Math.max(0, ...T.map(t => st.end[t.key] ?? 0));
    const cookBusy = st.log.reduce((a, l) => a + l.cook, 0);
    const critical = Math.max(0, ...T.filter(t => !t.children.length).map(t => t.tail));
    const lower = Math.max(cookBusy, critical);
    let switches = 0;
    for (let i = 1; i < st.log.length; i++) if (P.tasks.get(st.log[i].key).ri !== P.tasks.get(st.log[i - 1].key).ri) switches++;
    // food left in a hot vessel: after a walk-away step buzzes, or between hands-on steps of a chain
    let afterBuzz = 0, afterBuzzMax = 0, onHeatGap = 0;
    for (const t of T) for (const k of t.kinds) if (ON_HOB.has(k) && t.chainNext[k]) {
      const n = st.start[t.chainNext[k]]; if (n == null) continue;
      const gap = Math.max(0, n - st.end[t.key]);
      if (t.kind === 'walk') { const over = Math.max(0, gap - (t.step.timer.max - t.step.timer.min)); afterBuzz += over; afterBuzzMax = Math.max(afterBuzzMax, over); } else onHeatGap += gap;
    }
    const buzzWhileBusy = st.buzzes.filter(b => b.cookBusy && P.tasks.get(b.cookBusy).kind === 'handsTimer').length;
    // a hot dish eaten now: minutes from the end of its last heated step to the end of the session
    const eatNow = P.session.map((e, ri) => {
      if (!e.eatNow) return null;
      // served hot = the last step is heated, or plates straight from a heated step (the model has no field for it)
      const root = P.tasks.get(P.rootOf.get(ri));
      const hot = [root, ...root.children.map(c => P.tasks.get(c))].filter(t => t.ri === ri && t.kinds.length && !t.before);
      return hot.length ? makespan - Math.max(...hot.map(t => st.end[t.key])) : null;
    }).filter(x => x != null);
    // floor on the wait: one cook does each hot dish's final hands-on block in turn, so the dish served first
    // waits at least for everyone else's block (sum of blocks minus the largest)
    const blocks = P.session.map((e, ri) => {
      if (!e.eatNow) return null;
      let cur = P.tasks.get(P.rootOf.get(ri)), sum = 0;
      for (;;) {
        const busy = cur.kind !== 'walk';
        if (cur.kinds.length && !busy) break;                   // heated walk-away: the cook was free, block ends
        if (busy) sum += cur.est;
        const next = cur.children.map(c => P.tasks.get(c)).filter(c => c.ri === ri && c.kinds.length && !c.before)
          .find(c => cur.kinds.length ? cur.kinds.some(k => cur.chainPrev[k] === c.key) : true);
        if (!next) { if (!cur.kinds.length) return null; break; }
        cur = next;
      }
      return sum;
    }).filter(x => x != null);
    const coldFloor = blocks.length > 1 ? blocks.reduce((a, b) => a + b, 0) - Math.max(...blocks) : 0;
    return { coldFloor, makespan, cookBusy, critical, lower, idle: makespan - cookBusy, switches, afterBuzz, afterBuzzMax, onHeatGap, buzzWhileBusy,
      coldMax: eatNow.length ? Math.max(...eatNow) : 0, peak: st.peak || {}, stuck: st.stuck, presses: T.length + 2 };
  }

  return { backward, prepare, init, advance, candidates, decide, start, run, metrics, clone, fmt, ON_HOB, START_MIN, POLICIES };
});
