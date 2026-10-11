// 给每个页面拍截图，用于设计自查：node tools/shot.mjs [输出目录] [tab...]
// 默认拍全部 tab × 电脑(1440)/手机(390) × 浅色/深色，同时报告横向溢出和页面报错
import { readFileSync, mkdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.argv[2] || 'shots');
const only = process.argv.slice(3);
mkdirSync(out, { recursive: true });

let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch { ({ chromium } = createRequire(join(execSync('npm root -g').toString().trim(), 'x'))('playwright')); }

const types = { '.html': 'text/html', '.json': 'application/json' };
const server = createServer((req, res) => {
  const p = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  let body;
  try { body = readFileSync(p); } catch { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' });
  res.end(body);
}).listen(0);
const url = `http://localhost:${server.address().port}/index.html`;

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH ? '/opt/pw-browsers/chromium' : undefined }).catch(() => chromium.launch());
const issues = [];
for (const [dev, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  for (const scheme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width, height }, colorScheme: scheme, deviceScaleFactor: dev === 'mobile' ? 2 : 1 });
    page.on('pageerror', (e) => issues.push(`[${dev}/${scheme}] 报错：${e.message}`));
    await page.goto(url);
    await page.waitForTimeout(1500);
    const tabs = await page.$$eval('.tab[data-tab]', (b) => b.map((x) => x.dataset.tab));
    for (const tab of tabs.filter((t) => !only.length || only.includes(t))) {
      await page.click(`.tab[data-tab="${tab}"]`);
      await page.waitForTimeout(1200);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 1) issues.push(`[${dev}/${scheme}] ${tab}：横向溢出 ${over}px`);
      const name = `${tab.replace(':', '-')}_${dev}_${scheme}.png`;
      await page.screenshot({ path: join(out, name), fullPage: false });
    }
    await page.close();
  }
}
await browser.close();
server.close();
console.log(`截图已保存到 ${out}`);
if (issues.length) { console.log('问题：'); for (const i of [...new Set(issues)]) console.log('  - ' + i); }
