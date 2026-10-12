// Ippo 一歩 自检脚本：改完 index.html 或题库后运行  node tools/check.mjs
// 1) 每个内联 <script> 语法正确  2) IppoDrill 卡片数据结构正确  3) kokushi/*.json 能解析
// 4) 有 Chromium 时，真的打开网页，报告页面报错
import { readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const problems = [];

// 1) 脚本语法
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
for (const m of scripts) {
  const line = html.slice(0, m.index).split('\n').length;
  try { new vm.Script(m[1], { filename: `index.html:${line}` }); }
  catch (e) { problems.push(`脚本语法错误（index.html 第 ${line} 行开始的 <script>）：${e.message}`); }
}
console.log(`✓ 检查了 ${scripts.length} 个 <script>`);

// 1b) 页面上的 id 不能重复（$('#x') 只会拿到第一个，重复会让原有功能悄悄坏掉）
const markup = html.replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '');
const seen = new Map();
for (const m of markup.matchAll(/\sid="([^"]+)"/g)) seen.set(m[1], (seen.get(m[1]) || 0) + 1);
for (const [id, n] of seen) if (n > 1) problems.push(`id="${id}" 出现了 ${n} 次`);
console.log(`✓ 检查了 ${seen.size} 个 id`);

// 2) 暗記卡片 IppoDrill
const dm = html.match(/^window\.IppoDrill=(.*?);?$/m);
if (!dm) problems.push('找不到 window.IppoDrill');
else {
  try {
    const d = JSON.parse(dm[1]);
    const ids = new Set();
    for (const k of d.order) if (!d.decks[k]) problems.push(`IppoDrill.order 里有 ${k}，但 decks 里没有`);
    for (const c of d.cards) {
      const [id, deck, sec, q, a] = c;
      if (ids.has(id)) problems.push(`卡片 id 重复：${id}`);
      ids.add(id);
      if (!d.decks[deck]) problems.push(`卡片 ${id} 的 deck「${deck}」不存在`);
      else if (!d.decks[deck].secs[sec]) problems.push(`卡片 ${id} 的章节序号 ${sec} 超出范围`);
      if (!q || !a) problems.push(`卡片 ${id} 缺少题目或答案`);
    }
    console.log(`✓ 暗記：${d.order.length} 个牌组，${d.cards.length} 张卡`);
  } catch (e) { problems.push(`IppoDrill 不是合法 JSON：${e.message}`); }
}

// 3) 国考题库
const kdir = join(root, 'kokushi');
for (const f of readdirSync(kdir).filter((f) => f.endsWith('.json'))) {
  try { JSON.parse(readFileSync(join(kdir, f), 'utf8')); }
  catch (e) { problems.push(`kokushi/${f} 不是合法 JSON：${e.message}`); }
}
console.log('✓ 国考题库 JSON 可解析');

// 4) 浏览器实际打开
let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch {
  try {
    const g = (await import('node:child_process')).execSync('npm root -g').toString().trim();
    ({ chromium } = createRequire(join(g, 'x'))('playwright'));
  } catch { console.log('… 没装 playwright，跳过浏览器检查'); }
}
if (chromium && !problems.length) {
  const types = { '.html': 'text/html', '.json': 'application/json' };
  const server = createServer((req, res) => {
    const p = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
    let body;
    try { body = readFileSync(p); } catch { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' });
    res.end(body);
  }).listen(0);
  const port = server.address().port;
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH ? '/opt/pw-browsers/chromium' : undefined }).catch(() => chromium.launch());
  const page = await browser.newPage();
  page.on('pageerror', (e) => problems.push(`网页运行报错：${e.message}`));
  await page.goto(`http://localhost:${port}/index.html`);
  await page.waitForTimeout(2500);
  console.log(`✓ 浏览器打开成功：${await page.title()}`);
  await browser.close();
  server.close();
}

if (problems.length) {
  console.error(`\n✗ 发现 ${problems.length} 个问题：`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('\n全部通过 ✓');
