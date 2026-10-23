import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const referenceIndex = process.argv.indexOf('--assets-ref');
const assetsRef = referenceIndex < 0 ? '' : process.argv[referenceIndex + 1];
if (referenceIndex >= 0 && !/^[a-f\d]{40}$/i.test(assetsRef ?? '')) {
  throw new Error('--assets-ref requires a full deployed static commit SHA');
}
const gitRead = args => execFileSync('git', args, { encoding: 'utf8' });
const deployedFiles = assetsRef
  ? new Set(gitRead(['ls-tree', '-r', '--name-only', assetsRef]).trim().split(/\r?\n/))
  : null;

const server = await createServer({
  configFile: false,
  server: { middlewareMode: true },
  appType: 'custom',
  esbuild: { jsx: 'automatic' },
});
try {
  const { renderBloggerBody, contentStyles } = await server.ssrLoadModule('/src/blogger/Template.tsx');
  const manifest = JSON.parse(assetsRef
    ? gitRead(['show', `${assetsRef}:.vite/manifest.json`])
    : await readFile('dist/.vite/manifest.json', 'utf8'));
  const entry = Object.values(manifest).find(chunk => chunk.isEntry && chunk.src === 'index.html');
  if (!entry) throw new Error('Missing Vite index.html entry');
  const css = new Set();
  const visited = new Set();
  function collect(chunk) {
    if (visited.has(chunk)) return;
    visited.add(chunk);
    for (const key of chunk.imports ?? []) collect(manifest[key]);
    for (const file of chunk.css ?? []) css.add(file);
  }
  collect(entry);
  let base = (process.env.CDN_BASEURL || 'https://cdn.jsdelivr.net/gh/scarletborder/bloggerv2@static/').replace(/\/?$/, '/');
  if (assetsRef) {
    if (!base.includes('@static/')) throw new Error('--assets-ref requires a CDN_BASEURL containing @static/');
    base = base.replace('@static/', `@${assetsRef}/`);
    for (const chunk of Object.values(manifest)) {
      for (const file of [chunk.file, ...(chunk.css ?? []), ...(chunk.assets ?? [])]) {
        if (!deployedFiles.has(file)) throw new Error(`Missing deployed asset: ${file}`);
      }
    }
  }
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  const assets = [...css].map(file => `<link rel="stylesheet" crossorigin="anonymous" href="${escape(base + file)}"/>`);
  assets.push(`<script type="module" crossorigin="anonymous" src="${escape(base + entry.file)}"></script>`);
  const styles = await Promise.all(['src/styles/theme.css', 'src/styles/global.css', 'src/constants/colors.css', 'src/styles/blogger.css'].map(file => readFile(file, 'utf8')));
  const nativeStyles = [...styles, contentStyles].join('\n');
  const styleHash = createHash('sha256').update(nativeStyles).digest('hex').slice(0, 8);
  let styleFile = `assets/blogger-native-${styleHash}.css`;
  if (assetsRef) {
    const nativeFiles = [...deployedFiles].filter(file => /^assets\/blogger-native-[^/]+\.css$/.test(file));
    if (nativeFiles.length !== 1) throw new Error('Expected exactly one native stylesheet in deployed commit');
    [styleFile] = nativeFiles;
  } else {
    await writeFile(`dist/${styleFile}`, nativeStyles);
  }
  assets.push(`<link rel="stylesheet" crossorigin="anonymous" href="${escape(base + styleFile)}"/>`);
  const shell = (await readFile('src/blogger/shell.xml', 'utf8'))
    .replace('/* BLOGGER_STYLES */', 'body { margin: 0; }')
    .replace('<!-- BLOGGER_ASSETS -->', assets.join('\n'));
  // Blogger 对只定义 main includable 的 widget 会在保存时自动补全，但自动补全的 widget
  // 服务端静默渲染为空（section 输出 no-items）。显式注入完整 widget 定义规避该问题。
  const widgetSettings = await readFile('src/blogger/widget-settings.xml', 'utf8');
  const widgetDefaults = await readFile('src/blogger/default-includables.xml', 'utf8');
  const injectWidget = template => template
    .replace('<!-- BLOGGER_WIDGET_SETTINGS -->', () => widgetSettings)
    .replace('<!-- BLOGGER_WIDGET_DEFAULTS -->', () => widgetDefaults);
  const template = injectWidget(shell.replace('<!-- BLOGGER_BODY -->', renderBloggerBody()));
  if (/BLOGGER_(?:INSTRUCTION|HOME|BODY|ASSETS|STYLES|WIDGET_SETTINGS|WIDGET_DEFAULTS)/.test(template)) throw new Error('Unresolved template insertion');
  await writeFile('dist/template.xml', template);
  await writeFile('template.xml', template);
  await writeFile('dist/template-diagnostic.xml', injectWidget(shell.replace('<!-- BLOGGER_BODY -->', renderBloggerBody(true))));
  console.log('Generated template.xml and dist/template.xml');
  if (assetsRef) console.log(`Using verified assets from deployed static commit ${assetsRef}`);
} finally {
  await server.close();
}
