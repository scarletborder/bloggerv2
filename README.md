# Google Blogger + React + Typescript

Blogger could be also elegant

Blogger 也能如此美丽

## How to use?

```bash
# fork this repo

# modify the `template.xml`

# modify base url in `vite.config.js` according to your fork repo url

# call push in the release branch to trigger github actions
# which upload those compiled static files to jsDeliver CDN

# 用 CI 产物 build_report.txt 中的 <script>/<link> 标签
# 替换 template.xml head 中标注的 React 产物占位块

# upload the theme to blogger->theme->customize->restore
# CAUTION: BACKUP your original theme first
```

## 架构：Blogger 原生渲染 + React 岛屿增强

主页与文章详情由 Blogger 原生 Blog 部件（`data:posts` / `data:post.body`）**服务端渲染**，
因此原生评论、访客类原生部件可用，且页面可被 Google 正常索引。
React 依旧负责全部组件，但以「岛屿」形式只做增强：

| 模板挂载点               | React 岛屿          | 作用                                                                      |
| ------------------------ | ------------------- | ------------------------------------------------------------------------- |
| `#react-theme`           | `ThemeToggle`       | 明暗主题切换（所有原生页面）                                              |
| `#react-post-body`       | `PostBodyEnhancer`  | CodeMirror 清理、Prism 高亮、KaTeX、Tweet/YouTube/Bilibili 嵌入、图片灯箱 |
| `#react-toc`             | `TableOfContents`   | 文章目录（桌面常驻 / 移动折叠）                                           |
| `#react-blogroll`        | `Blogroll`          | 主页友站链接                                                              |
| `#root`（仅 error 视图） | SPA（react-router） | `/archives`、`/search`、`/pages` 等纯客户端路由                           |

入口 `src/main.tsx` 按是否存在 `#root` 自动分流 SPA / 岛屿两种模式，
两者代码均拆分为独立 chunk，原生页面不会下载 swiper、tdesign-mobile 等重依赖。

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
