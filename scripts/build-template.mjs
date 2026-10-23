import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { createHash } from 'node:crypto';

const server = await createServer({
  configFile: false,
  server: { middlewareMode: true },
  appType: 'custom',
  esbuild: { jsx: 'automatic' },
});
try {
  const { renderBloggerBody, contentStyles } = await server.ssrLoadModule('/src/blogger/Template.tsx');
  const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
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
  const base = (process.env.CDN_BASEURL || 'https://cdn.jsdelivr.net/gh/scarletborder/bloggerv2@static/').replace(/\/?$/, '/');
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  const assets = [...css].map(file => `<link rel="stylesheet" crossorigin="anonymous" href="${escape(base + file)}"/>`);
  assets.push(`<script type="module" crossorigin="anonymous" src="${escape(base + entry.file)}"></script>`);
  const styles = await Promise.all(['src/styles/theme.css', 'src/styles/global.css', 'src/constants/colors.css', 'src/styles/blogger.css'].map(file => readFile(file, 'utf8')));
  const nativeStyles = [...styles, contentStyles].join('\n');
  const styleHash = createHash('sha256').update(nativeStyles).digest('hex').slice(0, 8);
  const styleFile = `assets/blogger-native-${styleHash}.css`;
  await writeFile(`dist/${styleFile}`, nativeStyles);
  assets.push(`<link rel="stylesheet" crossorigin="anonymous" href="${escape(base + styleFile)}"/>`);
  const template = (await readFile('src/blogger/shell.xml', 'utf8'))
    .replace('/* BLOGGER_STYLES */', 'body { margin: 0; }')
    .replace('<!-- BLOGGER_ASSETS -->', assets.join('\n'))
    .replace('<!-- BLOGGER_BODY -->', renderBloggerBody());
  if (/BLOGGER_(?:INSTRUCTION|HOME|BODY|ASSETS|STYLES)/.test(template)) throw new Error('Unresolved template insertion');
  await writeFile('dist/template.xml', template);
  await writeFile('template.xml', template);
  console.log('Generated template.xml and dist/template.xml');
} finally {
  await server.close();
}
