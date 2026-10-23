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

本地检查：`pnpm build` 后启动 `pnpm preview --host 127.0.0.1 --port 4173`，
另一个终端运行 `pnpm exec playwright install chromium` 和 `pnpm verify:blogger`。
测试会生成 `dist/preview/home.html`、`post.html` 和桌面/手机截图，验证禁用 JS、
阻断 Google 请求、评论超时和回复取消。预览用模拟 Blogger 数据，不能验证 Blogger 服务端表达式。
正式验收需上传测试博客，确认主题保存、评论/回复、评论分页和 Blogger 后台阅读统计，
并通过 Search Console 检查抓取 HTML、canonical 与索引状态；本改造不保证收录或统计精度。

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
