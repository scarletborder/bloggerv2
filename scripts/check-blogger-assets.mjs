import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import { chromium, request } from '@playwright/test';

const file = process.argv[2] || 'template.xml';
const html = await readFile(file, 'utf8');
const browser = await chromium.launch();
const client = await request.newContext({ timeout: 30_000 });
try {
  const page = await browser.newPage();
  const { scripts, assets } = await page.evaluate((html) => {
    const document = new DOMParser().parseFromString(html, 'text/html');
    return {
      scripts: [...document.querySelectorAll('script:not([src])')]
        .filter(script => !script.type || script.type === 'text/javascript').map(script => script.textContent),
      assets: [...document.querySelectorAll('script[src], link[rel="stylesheet"]')]
        .map(element => ({ url: element.getAttribute('src') || element.getAttribute('href'), css: element.localName === 'link' })),
    };
  }, html);
  for (const script of scripts) new Script(script);
  assert.ok(assets.length, 'No external scripts or stylesheets found');
  const results = await Promise.allSettled(assets.map(async ({ url, css }) => {
    const response = await client.get(url);
    assert.equal(response.status(), 200, `${url}: HTTP ${response.status()}`);
    const contentType = response.headers()['content-type'] ?? '';
    assert.match(contentType, css ? /^text\/css\b/i : /^(text|application)\/(javascript|ecmascript)\b/i,
      `${url}: invalid MIME type ${contentType}`);
    console.log(`PASS ${response.status()} ${contentType}: ${url}`);
  }));
  const failures = results.filter(result => result.status === 'rejected');
  for (const failure of failures) console.error(failure.reason.message);
  assert.equal(failures.length, 0, `${failures.length} asset(s) failed`);
  console.log(`Inline JavaScript and ${assets.length} CDN assets passed: ${file}`);
} finally {
  await browser.close();
  await client.dispose();
}
