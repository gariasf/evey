// Plays a full weekend session in each variant with only the primary control, fast-forwarding timers.
// Screenshots: idle, early cook, a ringing timer, mid cook, done.
module.exports = async ({ ev, nav, shot, errors, base }) => {
  const plans = { A: { start: ['k4'], pri: 'k4' }, B: { start: ['cw', 'cw', 'push'], pri: 'push' }, C: { start: ['rec'], pri: 'rec' } };
  const res = {};
  for (const v of ['A', 'B', 'C']) {
    await nav(`${base}?variant=${v}&fx=0`);
    await shot(`mock-${v}-1-idle`);
    for (const k of plans[v].start) await ev(`input('${k}')`);
    const log = []; let n = 0, rang = false;
    while (n++ < 400) {
      const st = await ev(`(() => { if (S.mode !== 'cook') return { mode: S.mode }; const ss = S.session; const f = conductor(ss${v === 'C' ? ', ss.lanes.filter(d => d != null)' : ''}); return { mode: S.mode, d: f.d, si: f.si, kind: f.kind, running: Object.keys(ss.timers).filter(k => ss.st[k] === 'run').length }; })()`);
      if (st.mode !== 'cook') { log.push('END:' + st.mode); break; }
      log.push(`${st.d}.${st.si + 1}${st.kind[0]}`);
      if (st.kind === 'ring' && !rang) { rang = true; await shot(`mock-${v}-3-ring`); }
      if (n === 4) await shot(`mock-${v}-2-cook`);
      if (n === 22) await shot(`mock-${v}-4-cook`);
      if ((st.kind === 'wait' || (st.kind === 'busy' && n % 2)) && st.running) {
        await ev(`(() => { const ss = S.session; const ends = Object.keys(ss.timers).filter(k => ss.st[k] === 'run').map(k => ss.timers[k].end); simBase += Math.max(0, Math.min(...ends) - now()) + 1000; tick(); })()`);
      } else await ev(`input('${plans[v].pri}')`);
    }
    res[v] = { presses: n, mode: await ev('S.mode'), log: log.join(' ') };
    await shot(`mock-${v}-5-done`);
    await ev(`input('${plans[v].pri}')`);
    res[v].after = await ev('S.mode + " · fridge " + S.leftovers.map(l => l.name + " " + l.left).join(", ")');
  }
  console.log(JSON.stringify(res, null, 1));
  console.log('ERRORS', JSON.stringify(errors, null, 1));
};
