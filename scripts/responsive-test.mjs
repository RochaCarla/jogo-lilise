import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  userDataDir: '/tmp/smoke-chrome-profile',
  args: ['--no-first-run', '--disable-gpu'],
  defaultViewport: { width: 1400, height: 900 },
});
const page = await browser.newPage();
await page.goto('http://localhost:4823/');
await new Promise((r) => setTimeout(r, 2500));

async function canvasInfo(label) {
  const info = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const r = c.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), winW: innerWidth, winH: innerHeight };
  });
  console.log(`${label}: janela ${info.winW}x${info.winH} → canvas ${info.w}x${info.h}`);
}

await canvasInfo('desktop grande');
await page.setViewport({ width: 800, height: 500 });
await new Promise((r) => setTimeout(r, 1200));
await canvasInfo('janela pequena ');
await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
await new Promise((r) => setTimeout(r, 1200));
await canvasInfo('celular retrato');
await page.screenshot({ path: '/tmp/resp2-portrait.png' });
await page.setViewport({ width: 915, height: 412, isMobile: true, hasTouch: true });
await new Promise((r) => setTimeout(r, 1200));
await canvasInfo('celular paisagem');
await page.screenshot({ path: '/tmp/resp2-landscape.png' });

await browser.close();
