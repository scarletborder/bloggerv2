# Google Blogger + React + Typescript

Blogger could be also elegant

Blogger 也能如此美丽

## Blogger 原生内容与 React 组件

首页最新文章、博客描述、文章正文和已有评论由 Blogger 在响应 HTML 时输出，
不依赖 Feed API、JavaScript 或 Google 评论脚本。保留原来的 `src/styles` 主题，
React 负责组件定义、构建模板，以及主题、轮播、友链、目录和代码高亮等交互。

- `src/blogger/Template.tsx`：使用 TSX 定义原生文章列表、描述、正文、评论和分页。
- `src/blogger/shell.xml`：模板外壳，仅放置 Blogger 头信息、样式和组件插入位置。
- `src/blogger/enhance.tsx`：局部挂载 React，不接管正文和评论 DOM。
- `src/styles/blogger.css`：沿用已有主题变量的响应式布局。

顶部导航按视口切换：桌面为 HOME / ARCHIVES / PAGES 标签 + 搜索框；
≤768px 恢复原来的移动端样式——「导航菜单」下拉选择（HOME / ARCHIVES / PAGES）、
紧凑搜索框（提交到独立搜索页 `/search`）和主题按钮，三者均由模板直接输出，
不依赖 JS 即可使用（下拉通过内联 `onchange` 跳转）。

运行 `pnpm build`，会同时生成 CDN 资源、根目录 `template.xml` 和
`dist/template.xml`。生成器根据 Vite manifest 自动填写入口 JS 和其依赖 CSS，
无需手动粘贴所有 chunk。`CDN_BASEURL` 可指定资源部署地址，默认使用本仓库 static 分支。
修改组件后重新构建；不要直接编辑生成的 `template.xml`。

部署时先上传 `dist/assets` 到配置的 CDN，再将本次生成的 `dist/template.xml`
导入 Blogger 主题。已有 CI 会发布 dist，并提供 `blogger-template` 下载产物。
博客描述来自 Blogger「设置 → 基本 → 说明」，评论开关与审核设置也由 Blogger 控制。
文章保留 `.html` 地址，并通过完整页面请求打开，让 Blogger 处理访问。
归档、工具列表和搜索仍使用现有 React 页面，点击文章会转到 Blogger 原生页面。

评论列表直接使用 `data:post.comments`，包含原生评论分页；即使 Google 不可达也能阅读。
发表评论或回复时才加载 Blogger 原生 iframe。12 秒未完成 iframe 导航会移除表单并提示重试，
已打开的表单也可以随时关闭或转到新窗口。跨域 iframe 的 load 事件无法证明内部登录服务可用，
实际发表评论仍需要连接 Google；关闭新评论后保留历史评论。评论审核和分页结果由 Blogger 决定。

文章日期使用 `data:post.date`（与 `data:post.date.iso8601`），不要使用 `data:post.timestamp`：
后者在 v2 Blog widget 的 `data:posts` 循环中为空，页面只会显示“发布于”。

首页分页由 `src/blogger/NativePagination.tsx` 增强：第一页保持 Blogger 服务端渲染，
翻页时通过同源 JSON Feed（`/feeds/posts/summary`，`max-results` 与首页渲染数量一致）拉取对应页
并替换列表，URL 写入 `?start-index=N`，支持浏览器前进/后退，不会整页重载。
原生 `<nav class="native-pagination">`（上一页/下一页）保留在 DOM 中，仅在 JS 可用且存在多页时隐藏，
供禁用 JS 的访客与爬虫使用；Feed 拉取失败时会恢复原生导航。
页码组件使用 TDesign `Pagination`，`foldedMaxPageBtn` 限制窄屏显示的页码数量。
Blogger HTML 页面不响应 `?max-results` 参数，服务端每页数量由
「设置 → 帖子、评论和分享 → 主页文章数」决定；将其设为 7 可让服务端与客户端分页一致
（默认值同为 7）。

本地检查：`pnpm build` 后启动 `pnpm preview --host 127.0.0.1 --port 4173`，
另一个终端运行 `pnpm exec playwright install chromium` 和 `pnpm verify:blogger`。
测试会生成 `dist/preview/home.html`、`post.html` 和桌面/手机截图，验证禁用 JS、
阻断 Google 请求、评论超时和回复取消。预览用模拟 Blogger 数据，不能验证 Blogger 服务端表达式。
正式验收需上传测试博客，确认主题保存、评论/回复、评论分页和 Blogger 后台阅读统计，
并通过 Search Console 检查抓取 HTML、canonical 与索引状态；本改造不保证收录或统计精度。

`Blog1` 显式声明 `visible='true'`，并附带完整的 `b:widget-settings` 与全部 61 个默认
`b:includable`（`src/blogger/default-includables.xml`、`src/blogger/widget-settings.xml`，
由 `build-template.mjs` 注入）。不要只写一个自定义 `main` includable：Blogger 保存时虽然会
自动补全缺失的定义，但自动补全的 widget 服务端会静默渲染为空 section。
如果正文区域只剩 `<div class='no-items section' id='main'></div>`，先在 Blogger
「主题 → 编辑 HTML」确认 `Blog1` 仍存在且启用。CDN 资源发布不会自动更新 Blogger 后台的 XML。
以下任一声明都只说明配置存在，不能据此认定问题已修复：

```xml
<b:widget id='Blog1' type='Blog' locked='true' version='2' title='Blog Posts' visible='true' mobile='yes'>
```

部署后运行 `pnpm verify:blogger:live` 检查本站首页，或
`pnpm verify:blogger:live https://你的域名/2026/10/文章.html` 检查文章。
该命令验证服务器返回的原始 HTML 中有 `Blog1` 和原生文章内容，禁用 JavaScript，
并将空 section 判为失败。它与 `verify:blogger` 的模拟预览互补，后者不能代替线上验收。

构建还会生成 `dist/template-diagnostic.xml`，仅供排查空 section。
外壳沿用 `example.xml` 的 `b:templateUrl='indie.xml' b:templateVersion='1.3.0'` 声明，
保留参照主题的基础模板配置。固定入口标记也不输出时，优先比较外壳和 widget 入口，
而不是继续调整正文条件。声明检查仅验证产物配置，不模拟 Blogger 的模板继承引擎。
它将 widget 入口替换为固定标记 `Blogger main entry reached`、博客标题和文章标题循环。
在 Blogger 主题预览中检查标记及文章标题是否出现，用于区分入口未执行与完整模板内部故障；
它不是正式主题，预览完应恢复正式模板。本地模拟测试无法验证这个服务端结果。

此前的独立 v1 对照被 Blogger 拒绝更新，已撤下。它同时改变布局外壳和 widget 版本，
不能用于判定 v2 渲染故障的原因。若 Blogger 只提示 `Update failed`，需要查看保存请求的
HTTP 状态及响应正文，先区分模板校验、版本转换限制或请求失败，再修改模板。

线上空 section 的已确认根因是模板不完整：`b:widget` 只声明了自定义 `main` includable，
缺少 widget-settings 与其余默认 includable。Blogger 保存时的自动补全不会进入服务端渲染，
widget 整体被跳过，section 输出 `no-items`，而 `_SetDataContext` 仍包含 Blog1 与文章数据。
修复方式是把完整 widget 定义写进模板，结构与线上验证可用的参照主题一致：
`<b:section id='main' showaddelement='yes'>` + `<b:widget id='Blog1' locked='true'
title='博文' type='Blog' version='2' visible='true'>`（不带 `mobile` 属性）。

本地生成的哈希文件名不一定与 CI 相同。不要将本地新构建的 XML 与旧 static 分支资源混用。
本次改动包含应用代码（分页岛屿、日期字段），旧 CDN 资源中没有对应逻辑，
必须先让 CI 发布新资源，再导入该次运行产生的 `blogger-template` 产物；
或部署完成后用新的 static 分支 SHA 运行：

```sh
pnpm build:template --assets-ref cecaaa95bc40ac384be91ac537b692b9e75c9a1c
```

生成器读取该提交的 manifest 和原生 CSS 文件名，验证资源存在，并将 CDN URL 固定到该提交。
此模式沿用已发布的 JS/CSS，不会发布本地交互或样式变更。一般发布仍使用同一次 CI 的模板产物。
可运行 `pnpm verify:blogger:assets` 检查生成模板的内联脚本语法，以及 CDN 资源的 HTTP 状态和 MIME 类型。
脚本中的 CDATA 分隔符须写在 JS 行注释中（`//<![CDATA[` / `//]]>`），
避免 Blogger 将分隔符原样输出到 HTML 时触发 JavaScript 语法错误。

## How to use?

```bash
# fork this repo

# modify the `template.xml`

# modify base url in `vite.config.js` according to your fork repo url

# call push in the release branch to trigger github actions
# which upload those compiled static files to jsDeliver CDN

# upload the theme to blogger->theme->customize->restore
# CAUTION: BACKUP your original theme first
```

## Features

- [x] PostList
- [x] Archives
  - [x] Date Filter
  - [x] Tag Filter
- [x] Search
- [x] Discuss(Comments)
- [x] Pages
- [ ] More Docs
- [ ] Extra component
  - [x] Twitter
  - [x] Youtube

## 说明

本项目使用了大量的 google feeds api 而不是 blogger api V3。 这是因为后者需要 api key， 在本场景中由于全明码不好提供。

后续如果 google 废弃了 google feeds api， 请参考本项目进行升级。

https://github.com/uxxSam/react-google-blogger/tree/master/src/actions

https://developers.google.com/blogger/docs/3.0/using

## Effect 效果

![pc example image.png](https://s2.loli.net/2025/08/26/Dcn8UOrLviC2ymQ.png)

![mobile example image.png](https://s2.loli.net/2025/08/26/w6oaFVU8bK74WsH.png)
