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
- [ ] Pages
- [ ] More Docs

## 说明

本项目使用了大量的 google feeds api 而不是 blogger api V3。 这是因为后者需要 api key， 在本场景中由于全明码不好提供。

后续如果 google 废弃了 google feeds api， 请参考本项目进行升级。

https://github.com/uxxSam/react-google-blogger/tree/master/src/actions

https://developers.google.com/blogger/docs/3.0/using

## Effect 效果

![pc example image.png](https://s2.loli.net/2025/08/26/Dcn8UOrLviC2ymQ.png)

![mobile example image.png](https://s2.loli.net/2025/08/26/w6oaFVU8bK74WsH.png)
