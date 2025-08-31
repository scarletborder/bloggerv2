import {
  getPostList,
  type GetPostListParams,
} from "../actions/blogger.service";
import type { PostItem } from "../models/PostItem";

type SearchRequest = {
  query: string;
  startIndex?: number; // 当前已加载数量
  pageSize: number;
};

type SearchResponse = {
  list: PostItem[];
  total: number;
};

/**
 * 模拟根据关键词搜索文章的 API
 * @param req 搜索请求参数
 * @returns Promise<SearchResponse>
 */
export const SearchPostsByQuery = async (
  req: SearchRequest
): Promise<SearchResponse> => {
  const { query } = req;

  if (!query) {
    return { list: [], total: 0 };
  }

  const params: GetPostListParams = {
    "start-index": 1,
    "max-results": 1000,
    q: req.query,
  };

  const resp = await getPostList(params);
  const entrys = resp.feed.entry || [];

  return {
    list: entrys.map((entry) => {
      const tags = entry.category?.map((cat) => cat.term) || [];
      let linkPath =
        entry.link.find((link) => link.rel === "alternate")?.href || "";
      linkPath = linkPath.split("//")[1].split("/").slice(1).join("/");
      return {
        _id: entry.id.$t,
        path: linkPath,
        title: entry.title.$t,
        tags: tags,
        summary: entry.summary.$t,
        // thumbnail: entry.media$thumbnail.url,
        published: new Date(entry.published).getTime(),
      };
    }),
    total: resp.feed.openSearch$totalResults,
  };
};
