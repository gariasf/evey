// PROTOTYPE harness: drives the prototype in headless Chrome over the DevTools protocol. No deps (Node 22+ global WebSocket).
// usage: node harness/cdp.js harness/<test>.js     (CHROME=<path to chrome> to override the browser)
// Screenshots go to ../renders/, which is git-ignored: they show real recipes from the private corpus (ADR 0001).
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
const OUT = path.join(__dirname, '..', 'renders');
const BASE = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${path.join(os.tmpdir(), 'evey-prototype-chrome')}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--window-size=1700,1050', 'about:blank'], { stdio: 'ignore' });
  let targets = [];
  for (let i = 0; i < 60; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); if (targets.some(t => t.type === 'page')) break; } catch (e) {}
    await sleep(250);
  }
  const page = targets.find(t => t.type === 'page');
  if (!page) { chrome.kill(); throw new Error('no page target'); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map(), listeners = [], errors = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    else listeners.forEach(f => f(m));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  listeners.push(m => {
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; errors.push('exception: ' + (d.exception && d.exception.description || d.text)); }
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) errors.push('console.' + m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' '));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push('log: ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
  });
  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1700, height: 1050, deviceScaleFactor: 1, mobile: false });

  const ev = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(expr.slice(0, 120) + ' -> ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text));
    return r.result.value;
  };
  const nav = async url => {
    const loaded = new Promise(r => { const f = m => { if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(f), 1); r(); } }; listeners.push(f); });
    await send('Page.navigate', { url }); await loaded;
    await ev('document.fonts.ready.then(() => [...document.fonts].filter(f => f.status === "loaded").length)');
    await sleep(250);
  };
  const shot = async (name, sel = '#dev') => {
    const rect = await ev(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })()`);
    const r = await send('Page.captureScreenshot', { format: 'png', clip: { ...rect, scale: 1 } });
    const f = path.join(OUT, name + '.png'); fs.writeFileSync(f, Buffer.from(r.data, 'base64')); return f;
  };
  const test = require(path.resolve(process.argv[2]));
  try { await test({ ev, nav, shot, send, sleep, errors, base: BASE }); }
  finally { try { ws.close(); } catch (e) {} chrome.kill(); }
}
main().catch(e => { console.error(e); process.exit(1); });
