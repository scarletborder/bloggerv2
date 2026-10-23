import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium, request } from '@playwright/test';

const target = process.argv[2] || 'https://blog.scarletborder.cn/';
const client = await request.newContext({ ignoreHTTPSErrors: true, timeout: 30_000 });
const browser = await chromium.launch();
const context = await browser.newContext({ javaScriptEnabled: false });
try {
  const response = target.startsWith('https://') ? await client.get(target) : null;
  if (response) assert.ok(response.ok(), `HTTP ${response.status()}: ${target}`);
  const html = response ? await response.text() : await readFile(target, 'utf8');
  const page = await context.newPage();
  await page.route('**/*', route => route.abort());
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('#blogger-native').count(), 1, 'Missing native main element');
  assert.equal(await page.locator('#blogger-native .no-items').count(), 0,
    'Blogger returned an empty section (no-items): Blog1 did not render');
  assert.equal(await page.locator('#blogger-native #Blog1').count(), 1,
    'Missing rendered Blog1 widget wrapper');
  const posts = await page.locator('#Blog1 .native-post-card, #Blog1 .native-post .blog-content').count();
  assert.ok(posts > 0, 'Blog1 rendered no article list or article body');
  console.log(`PASS: ${target}: Blog1 and ${posts} native article(s), JavaScript disabled`);
} finally {
  await context.close();
  await browser.close();
  await client.dispose();
}
