// Native-resolution, 1-bit renders of one cooking moment on each candidate panel.
module.exports = async ({ ev, nav, shot, send, errors, base }) => {
  const cfgs = [
    ['A', '9.7', 1200, 825, 'k4,k4,k4,k4'],
    ['B', '7.5', 800, 480, 'cw,cw,push,push,push,push'],
    ['B', '4.7', 960, 540, 'cw,cw,push,push,push,push'],
    ['C', '10.3', 1872, 1404, 'rec,rec,rec,rec'],
  ];
  for (const [v, size, w, h, go] of cfgs) {
    await send('Emulation.setDeviceMetricsOverride', { width: w + 40, height: h + 40, deviceScaleFactor: 1, mobile: false });
    await nav(`${base}?panel=1&fx=0&variant=${v}&size=${size}&go=${go}`);
    const dims = await ev(`(() => { const r = document.getElementById('eink').getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); })()`);
    console.log(v, size, 'screen', dims, '->', await shot(`panel-${v}-${size}`, '#eink'));
  }
  console.log('ERRORS', JSON.stringify(errors));
};
