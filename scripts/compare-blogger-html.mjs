import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const files = process.argv.slice(2);
if (files.length !== 2) throw new Error('Usage: node scripts/compare-blogger-html.mjs normal.html broken.html');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const result = await page.evaluate((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const section = doc.getElementById('main');
      const widget = doc.getElementById('Blog1');
      const scripts = [...doc.scripts].map(script => script.textContent).join('\n');
      return {
        title: doc.title,
        sectionClass: section?.className ?? null,
        widgetExists: Boolean(widget),
        widgetVersion: widget?.getAttribute('data-version') ?? null,
        widgetChildren: widget?.children.length ?? 0,
        articleBodies: doc.querySelectorAll('.post-body, .blog-content').length,
        widgetRegistered: /_RegisterWidget\('_BlogView', new _WidgetInfo\('Blog1'/.test(scripts),
        themeButtonMounted: Boolean(doc.querySelector('[data-blogger-island="theme"] [role="button"]')),
      };
    }, html);
    console.log(file);
    console.log(JSON.stringify(result, null, 2));
  }
} finally {
  await browser.close();
}
