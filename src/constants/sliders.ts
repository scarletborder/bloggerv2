type SlideItem = {
  title: string;
  desp: string;
  link: string;
  img: string;
};

export default [
  {
    title: 'NTQQ liteloader插件教程',
    desp: '新手向, 通过学习一些最佳实践得出编写liteloaderQQNT插件的经验心得',
    link: '/2025/04/ntqq-liteloader-noobs-liteloader-explore.html',
    img: 'https://i.postimg.cc/59L5ksmK/1.png'
  },
  {
    title: 'simpleTex WebAPI',
    desp: '一个借用SimpleTex解决在线Tex文档识别的方案',
    link: '/2024/03/simpletex-webapi.html',
    img: 'https://i.postimg.cc/xTNQ2SB3/image.png'
  },
  {
    title: '标题三',
    desp: '这是第三张幻灯片的描述',
    link: '#',
    img: 'https://i.postimg.cc/qqs83FdM/image.png'
  }
] as SlideItem[];