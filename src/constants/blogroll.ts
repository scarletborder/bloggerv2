export type BlogRollItem = {
  alt: string;
  desc?: string;
  url: string; // blog超链接
  pic?: {
    url: string; // 头像图片链接
    type: 'avatar' | 'banner';
  };
  type?: 'avatar' | 'banner'; // 项目显示类型: avatar 显示头像+标题, banner 只显示横幅
};

export default [
  {
    alt: 'vast_joy',
    url: 'https://www.cnblogs.com/vastjoy',
  },
] as BlogRollItem[];
