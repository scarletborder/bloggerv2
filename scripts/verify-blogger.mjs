import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { Script } from 'node:vm';

const origin = process.env.PREVIEW_URL || 'http://localhost:4173';
const template = await readFile('dist/template.xml', 'utf8');
const browser = await chromium.launch();
try {
  const fixturePage = await browser.newPage();
  // Blogger may preserve XML CDATA delimiters in text/html script elements.
  // Parse as HTML, exactly as a browser does, rather than losing them in XML parsing.
  const rawScripts = await fixturePage.evaluate((html) => {
    const document = new DOMParser().parseFromString(html, 'text/html');
    return [...document.querySelectorAll('script:not([src])')]
      .filter(script => !script.type || script.type === 'text/javascript')
      .map(script => script.textContent);
  }, template);
  for (const script of rawScripts) new Script(script);
  // This fixture substitutes Blogger data for local browser checks. Blogger's
  // server-side template evaluator still needs a real theme upload to validate.
  const fixtures = await fixturePage.evaluate(({ template, origin }) => {
    const bNamespace = 'http://www.google.com/2005/gml/b';
    const dataNamespace = 'http://www.google.com/2005/gml/data';
    const exprNamespace = 'http://www.google.com/2005/gml/expr';
    const source = new DOMParser().parseFromString(template, 'application/xml');
    if (source.querySelector('parsererror')) throw new Error(source.querySelector('parsererror').textContent);
    const root = source.documentElement;
    if (root.getAttributeNS(bNamespace, 'templateUrl') !== 'indie.xml'
      || root.getAttributeNS(bNamespace, 'templateVersion') !== '1.3.0') {
      throw new Error('Missing base template declaration used by example.xml (indie.xml 1.3.0)');
    }
    const widgets = [...source.getElementsByTagNameNS(bNamespace, 'widget')];
    const blog = widgets.find(widget => widget.getAttribute('id') === 'Blog1');
    if (!blog || blog.getAttribute('type') !== 'Blog') throw new Error('Missing Blog1 Blog widget');
    if (blog.getAttribute('visible') !== 'true') throw new Error('Blog1 must explicitly declare visible="true"');
    if (blog.parentElement?.localName !== 'section') throw new Error('Blog1 must be a direct child of b:section');
    const settings = blog.getElementsByTagNameNS(bNamespace, 'widget-settings')[0];
    if (!settings?.getElementsByTagNameNS(bNamespace, 'widget-setting').length) {
      throw new Error('Blog1 must declare widget-settings instead of relying on Blogger auto-completion');
    }
    const includables = [...blog.getElementsByTagNameNS(bNamespace, 'includable')];
    if (includables.length < 60) {
      throw new Error(`Blog1 must declare the full default includable set, found ${includables.length}`);
    }
    if (blog.getAttribute('pageType') && blog.getAttribute('pageType') !== 'all') throw new Error('Blog1 must not restrict pageType');
    const post = {
      id: '123', title: '原生正文与评论测试', url: '/2026/10/native-post.html',
      body: '<h2>正文标题</h2><p>无需 JavaScript 即可阅读的正文。</p><pre><code class="language-js">const native = true;</code></pre><p>' + '正文内容。'.repeat(180) + '</p>',
      timestamp: '2026/10/23', timestampISO8601: '2026-10-23T08:00:00Z', labels: [{ name: '技术', url: '/search/label/test' }],
      numberOfComments: 2, allowComments: true, allowNewComments: true,
      commentFormIframeSrc: 'https://www.blogger.com/comment/frame/456?po=123',
      addCommentUrl: 'https://www.blogger.com/comment.g?blogID=456&postID=123',
      commentPagingRequired: true, hasOlderLinks: true, hasNewerLinks: true,
      oldestLinkUrl: '?commentPage=1', olderLinkUrl: '?commentPage=1', newerLinkUrl: '?commentPage=3', newestLinkUrl: '?commentPage=3', commentRangeText: '1–2',
      comments: [
        { id: '1', author: '访客甲', authorUrl: 'https://example.com', timestamp: '2026/10/23', url: '#c1', body: '<p>已有评论，即使 Google 无法访问仍然可见。</p>' },
        { id: '2', author: '访客乙', authorUrl: '', timestamp: '2026/10/23', url: '#c2', body: '<p>第二条评论</p>' },
      ],
    };
    function fixture(single, closed = false, empty = false) {
      const output = document.implementation.createHTMLDocument('');
      const context = {
        blog: { title: '绯境之外', description: '生活分享和记录技术的博客', pageTitle: single ? post.title : '绯境之外' },
        view: { isSingleItem: single }, posts: empty ? [] : [{ ...post, allowNewComments: !closed, noNewCommentsText: '评论已关闭' }],
        newerPageUrl: '', olderPageUrl: single ? '' : '/search?updated-max=2026-10-01',
      };
      function lookup(expression, data) {
        if (expression === 'data:post.allowComments or data:post.numberOfComments > 0') return data.post.allowComments || data.post.numberOfComments > 0;
        if (expression === 'data:posts.empty') return data.posts.length === 0;
        if (expression.startsWith('"')) {
          const [literal, path] = expression.split(' + ');
          return JSON.parse(literal) + lookup(path, data);
        }
        if (!expression.startsWith('data:')) throw new Error(`Unsupported fixture expression: ${expression}`);
        return expression.slice(5).split('.').reduce((value, key) => value?.[key], data) ?? '';
      }
      function children(node, parent, data) {
        for (const child of node.childNodes) visit(child, parent, data);
      }
      function visit(node, parent, data) {
        if (node.nodeType === Node.COMMENT_NODE) return;
        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE) { parent.append(output.createTextNode(node.textContent)); return; }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.namespaceURI === bNamespace) {
          if (node.localName === 'skin') { const style = output.createElement('style'); style.textContent = node.textContent; parent.append(style); return; }
          if (node.localName === 'include') return;
          if (node.localName === 'loop') {
            for (const item of lookup(node.getAttribute('values'), data)) children(node, parent, { ...data, [node.getAttribute('var')]: item });
            return;
          }
          if (node.localName === 'if') {
            let active = Boolean(lookup(node.getAttribute('cond'), data));
            for (const child of node.childNodes) {
              if (child.localName === 'else') active = !active;
              else if (active) visit(child, parent, data);
            }
            return;
          }
          if (node.localName === 'eval') { parent.append(output.createTextNode('文章摘要，无需等待前端请求。')); return; }
          if (node.localName === 'widget') {
            // Blogger server-side rendering only evaluates the widget's main includable;
            // widget-settings and the other default includables stay dormant.
            const main = [...node.children].find(child => child.localName === 'includable' && child.getAttribute('id') === 'main');
            if (main) children(main, parent, data);
            return;
          }
          if (['section', 'includable'].includes(node.localName)) { children(node, parent, data); return; }
          throw new Error(`Unsupported fixture instruction: ${node.localName}`);
        }
        if (node.namespaceURI === dataNamespace) {
          const value = lookup(`data:${node.localName}`, data);
          if (['post.body', 'comment.body'].includes(node.localName)) {
            const fragment = output.createElement('template'); fragment.innerHTML = String(value); parent.append(fragment.content);
          } else parent.append(output.createTextNode(String(value)));
          return;
        }
        const element = output.createElement(node.localName);
        for (const attr of node.attributes) {
          if (attr.namespaceURI === exprNamespace) element.setAttribute(attr.localName, String(lookup(attr.value, data)));
          else if (!attr.namespaceURI) element.setAttribute(attr.name, attr.value);
        }
        children(node, element, data);
        parent.append(element);
      }
      const container = output.createDocumentFragment();
      visit(source.documentElement, container, context);
      return '<!doctype html>' + container.firstChild.outerHTML.replaceAll('https://cdn.jsdelivr.net/gh/scarletborder/bloggerv2@static/', origin + '/');
    }
    return { home: fixture(false), post: fixture(true), closed: fixture(true, true), empty: fixture(false, false, true) };
  }, { template, origin });
  await fixturePage.close();
  await mkdir('dist/preview', { recursive: true });
  for (const [name, html] of Object.entries(fixtures)) await writeFile(`dist/preview/${name}.html`, html);

  const errors = [];
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    let googleRequests = 0;
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname.endsWith('blogger.com') || url.hostname.endsWith('google.com')) {
        googleRequests++;
        // Leave the Google editor pending until the UI removes it on timeout.
        return;
      }
      if (url.origin !== origin && route.request().resourceType() !== 'image') return route.abort();
      return route.continue();
    });
    // 分页岛屿通过同源 JSON Feed 取数；本地预览用模拟响应验证翻页不重载页面
    const feedEntry = index => ({
      id: { $t: `tag:blogger.com,1999:blog-456.post-${index}` },
      published: { $t: '2026-10-15T20:00:00+08:00' },
      updated: { $t: '2026-10-15T20:00:00+08:00' },
      title: { $t: `第 ${index} 页文章` },
      link: [{ rel: 'alternate', type: 'text/html', href: `https://blog.scarletborder.cn/2026/10/page-${index}.html` }],
      author: [{ name: { $t: 'scarletborder' } }],
      summary: { $t: `第 ${index} 页摘要，翻页无需整页重载。` },
    });
    await page.route('**/feeds/posts/summary*', async route => {
      const startIndex = Number(new URL(route.request().url()).searchParams.get('start-index') ?? '1');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          feed: { entry: [feedEntry(startIndex)], openSearch$totalResults: { $t: '9' }, category: [] },
        }),
      });
    });
    for (const name of ['home', 'post', 'closed', 'empty']) {
      await page.goto(`${origin}/preview/${name}.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(700);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${name}: horizontal overflow`);
      assert.equal(await page.locator('iframe').count(), 0, `${name}: eager iframe`);
      if (name === 'home') {
        assert.equal(await page.locator('.native-post-link').getAttribute('href'), '/2026/10/native-post.html');
        assert.match(await page.locator('.native-welcome').innerText(), /生活分享/);
        // 分页岛屿替换原生导航，翻页只更新列表不重载页面
        await page.waitForSelector('.native-pagination-island .t-pagination', { timeout: 10_000 });
        assert.equal(await page.locator('nav.native-pagination').isVisible(), false, 'native pagination must yield to the island');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'home: pagination overflow');
        await page.locator('.t-pagination__btn-next').click();
        await page.waitForFunction(() => document.querySelector('.native-post-card h3')?.textContent?.includes('第 2 页文章') ?? false);
        assert.match(page.url(), /start-index=2/, 'client-side paging must update the URL');
        assert.match(await page.locator('.native-post-card .native-date').innerText(), /发布于 2026\/10\/15/, 'fetched cards keep the native date format');
        await page.locator('.native-pagination-island').scrollIntoViewIfNeeded();
        await page.locator('.t-pagination__btn-prev').click();
        await page.waitForFunction(() => document.querySelector('.native-post-link')?.getAttribute('href') === '/2026/10/native-post.html');
      }
      if (name === 'post') {
        assert.equal(await page.locator('#c1').count(), 1);
        assert.equal(await page.locator('.blog-content h2').innerText(), '正文标题');
        assert.equal(googleRequests, 0, 'Google contacted before explicit interaction');
        await page.screenshot({ path: `dist/preview/post-${viewport.width}.png`, fullPage: true });
        await page.getByRole('button', { name: '发表评论', exact: true }).click();
        await page.waitForTimeout(12_500);
        assert.equal(await page.locator('iframe').count(), 0, 'stalled editor not removed');
        assert.match(await page.getByRole('status').innerText(), /超时/);
        assert.match(await page.locator('#c1').innerText(), /Google 无法访问/);
        await page.locator('#c2 .native-reply').click();
        assert.match(await page.locator('iframe').getAttribute('src'), /parentID=2/);
        await page.getByRole('button', { name: '取消回复', exact: true }).click();
        assert.equal(await page.locator('iframe').count(), 0);
      }
      if (name === 'closed') assert.equal(await page.locator('[data-blogger-island="comment-form"]').count(), 0);
      if (name === 'empty') assert.match(await page.locator('.native-post-list').innerText(), /暂无文章/);
      if (name === 'home') await page.screenshot({ path: `dist/preview/home-${viewport.width}.png`, fullPage: true });
    }
    await context.close();
    const noJS = await browser.newContext({ javaScriptEnabled: false, viewport });
    const plain = await noJS.newPage();
    await plain.goto(`${origin}/preview/post.html`, { waitUntil: 'domcontentloaded' });
    assert.match(await plain.locator('.blog-content').innerText(), /无需 JavaScript/);
    assert.match(await plain.locator('#comments').innerText(), /已有评论/);
    await noJS.close();
  }
  assert.deepEqual(errors, [], 'browser runtime errors');
  console.log('Blogger fixture checks passed: XML, desktop/mobile, no-JS content, closed/empty states, opt-in editor, timeout, reply cancellation.');
} finally {
  await browser.close();
}
