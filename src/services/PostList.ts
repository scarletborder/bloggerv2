import { getPostList, type GetPostListParams } from "../actions/blogger.service";

type PostListRequest = {
  current: number;
  pageSize: number;
  startIndex?: number; // 已显示的文章数量，用于计算正确的 start-index
}

type SinglePost = {
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
}

type PostListResponse = {
  // 总文章数量
  total: number;

  // 本轮请求的列表 (为了兼容 ahooks usePagination)
  list: SinglePost[];
}

export default async function GetPostList(req: PostListRequest): Promise<PostListResponse> {
  // 如果提供了startIndex就使用它，否则根据页码计算
  // Blogger API 的 start-index 是从 1 开始的
  const startIndex = req.startIndex !== undefined
    ? req.startIndex + 1
    : (req.current - 1) * req.pageSize + 1;

  const params: GetPostListParams = {
    'start-index': startIndex,
    'max-results': req.pageSize,
  };
  const resp = await getPostList(params);
  const entrys = resp.feed.entry;

  return {
    list: entrys.map((entry) => {
      const tags = entry.category?.map(cat => cat.term) || [];
      let linkPath = entry.link.find(link => link.rel === 'alternate')?.href || '';
      linkPath = linkPath.split("//")[1].split("/").slice(1).join("/");
      return {
        path: linkPath,
        title: entry.title.$t,
        tags: tags,
        summary: entry.summary.$t,
        // thumbnail: entry.media$thumbnail.url,
        published: new Date(entry.published).getTime(),
      }
    }),
    total: resp.feed.openSearch$totalResults,
  };
}