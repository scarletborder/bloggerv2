import {
  getPostList,
  getPostListByCategories,
  type GetPostListParams,
} from '../actions/blogger.service';

type PostListRequest = {
  current: number;
  pageSize: number;
  startIndex?: number; // 已显示的文章数量，用于计算正确的 start-index
};

type PostListByCategoryRequest = {
  categories: string[];
  startIndex?: number; // 用于无限滚动
  pageSize: number;
};

type PostListByDateRequest = {
  year?: number;
  month?: number;
  startIndex?: number; // 用于无限滚动
  pageSize: number;
};

type SinglePost = {
  _id: string;
  // 文章存储路径
  // example `/2024/08/abcd.html`
  path: string;

  // 文章标题
  title: string;

  // 文章tag
  tags: string[];

  // 文章预览文字
  summary: string;

  // // 文章缩略图
  // thumbnail: string;

  // 文章发布时间
  published: number;
};

type PostListResponse = {
  // 总文章数量, 非页数量
  total: number;

  // 本轮请求的列表 (为了兼容 ahooks usePagination)
  list: SinglePost[];
};

export default async function GetPostList(req: PostListRequest): Promise<PostListResponse> {
  // 如果提供了startIndex就使用它，否则根据页码计算
  // Blogger API 的 start-index 是从 1 开始的
  const startIndex =    req.startIndex !== undefined
    ? req.startIndex + 1
    : (req.current - 1) * req.pageSize + 1;

  const params: GetPostListParams = {
    'start-index': startIndex,
    'max-results': req.pageSize,
  };
  const resp = await getPostList(params);
  const entrys = resp.feed.entry || [];

  return {
    list: entrys.map((entry) => {
      const tags = entry.category?.map(cat => cat.term) || [];
      let linkPath =        entry.link.find(link => link.rel === 'alternate')?.href || '';
      linkPath = linkPath.split('//')[1].split('/').slice(1)
        .join('/');
      return {
        _id: entry.id.$t,
        path: linkPath,
        title: entry.title.$t,
        tags,
        summary: entry.summary.$t,
        // thumbnail: entry.media$thumbnail.url,
        published: new Date(entry.published).getTime(),
      };
    }),
    total: resp.feed.openSearch$totalResults,
  };
}

export async function GetPostListByCategories(req: PostListByCategoryRequest): Promise<PostListResponse> {
  const startIndex = req.startIndex !== undefined ? req.startIndex + 1 : 1;

  const options = {
    'start-index': startIndex,
    'max-results': req.pageSize,
  };

  const resp = await getPostListByCategories(req.categories, options);
  const entrys = resp.feed.entry || [];

  return {
    list: entrys.map((entry) => {
      const tags = entry.category?.map(cat => cat.term) || [];
      let linkPath =        entry.link.find(link => link.rel === 'alternate')?.href || '';
      linkPath = linkPath.split('//')[1].split('/').slice(1)
        .join('/');
      return {
        _id: entry.id.$t,
        path: linkPath,
        title: entry.title.$t,
        tags,
        summary: entry.summary.$t,
        // thumbnail: entry.media$thumbnail.url,
        published: new Date(entry.published).getTime(),
      };
    }),
    total: resp.feed.openSearch$totalResults,
  };
}

export async function GetPostListByDate(req: PostListByDateRequest): Promise<PostListResponse> {
  const startIndex = req.startIndex !== undefined ? req.startIndex + 1 : 1;

  const params: GetPostListParams = {
    'start-index': startIndex,
    'max-results': req.pageSize,
  };

  // 添加日期过滤参数
  if (req.year && req.month) {
    // 构造日期范围
    const startDate = new Date(req.year, req.month - 1, 1);
    const endDate = new Date(req.year, req.month, 0, 23, 59, 59);

    params['published-min'] = startDate.toISOString();
    params['published-max'] = endDate.toISOString();
  } else if (req.year) {
    // 只有年份
    const startDate = new Date(req.year, 0, 1);
    const endDate = new Date(req.year, 11, 31, 23, 59, 59);

    params['published-min'] = startDate.toISOString();
    params['published-max'] = endDate.toISOString();
  }

  const resp = await getPostList(params);
  const entrys = resp.feed.entry || [];

  return {
    list: entrys.map((entry) => {
      const tags = entry.category?.map(cat => cat.term) || [];
      let linkPath =        entry.link.find(link => link.rel === 'alternate')?.href || '';
      linkPath = linkPath.split('//')[1].split('/').slice(1)
        .join('/');
      return {
        _id: entry.id.$t,
        path: linkPath,
        title: entry.title.$t,
        tags,
        summary: entry.summary.$t,
        // thumbnail: entry.media$thumbnail.url,
        published: new Date(entry.published).getTime(),
      };
    }),
    total: resp.feed.openSearch$totalResults,
  };
}
