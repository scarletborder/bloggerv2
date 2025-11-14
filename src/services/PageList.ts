import { BloggerFeed } from '@deox/blogger-feed';
import type { PostItem } from '../models/PostItem';
import { BLOG_BASE } from '../constants/feedapi';

interface GetPageListParams {
  'start-index'?: number;
  'max-results'?: number;
}

interface GetPageListResponse {
  list: PostItem[];
  total: number;
}

export async function GetPageList(
  params: GetPageListParams,
): Promise<GetPageListResponse> {
  const feed = new BloggerFeed(BLOG_BASE, {
    jsonp: true,
  });

  const resp = await feed.pages
    .list({
      startIndex: params['start-index'],
      maxResults: params['max-results'],
      // summary: true, 开了会很拥挤
    })
    .then((resp) => {
      return {
        list: resp.map((item) => {
          let path = '';
          let link = item.links['alternate'];
          if (link && link.length > 0) {
            const urlObject = new URL(link[0].href);
            path = urlObject.pathname.replace(/^\/+|\/+$/g, '');
          }
          return {
            _id: item.id,
            title: item.title,
            summary: item.summary || '',
            published: new Date(item.published).getTime(),
            path: path,
            tags: item.labels || [],
          };
        }),
        total: resp.totalResults || resp.length,
      };
    });

  return resp;
}
