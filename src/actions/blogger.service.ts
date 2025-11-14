import { z } from 'zod';
import { BLOG_URL, API_TIMEOUT } from '../constants/feedapi';
import {
  PostListResponseSchema,
  PageListResponseSchema,
  PostContentResponseSchema,
  PageContentResponseSchema,
  type Category,
  type PostListResponse,
} from './blogger.types';

// =================================================================================
// SECTION 1: PRIVATE FETCH ENGINE
// This is the core, reusable function responsible for making and handling
// the actual HTTP request using the modern `fetch` API.
// =================================================================================

/**
 * Performs a fetch request to a given URL with a specified timeout.
 * @param url The full URL to fetch.
 * @returns A Promise that resolves with the parsed JSON response.
 * @throws An error if the network request fails, the response is not ok, or timeout is reached.
 */
async function fetchBloggerApi(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} for URL: ${url}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${API_TIMEOUT}ms for URL: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// =================================================================================
// SECTION 2: THE API METHOD FACTORY (Corrected)
// The generic constraint is corrected to `TParams extends object`.
// =================================================================================

/**
 * A factory that creates a fully-typed and validated function for a specific Blogger Feed API endpoint.
 * @param requestPath The path for the API endpoint (e.g., '/feeds/posts/summary').
 * @param schema The Zod schema to use for validating the API response.
 * @returns An async function that takes a parameters object, performs the API call,
 *          validates the response, and returns the typed data.
 */
function createFeedApiMethod<
  TParams extends object, // <-- BUG FIX: Changed constraint to `object`
  TSchema extends z.ZodTypeAny,
>(requestPath: string, schema: TSchema) {
  /**
   * The generated async function.
   * @param params An object containing the query parameters for the request.
   */
  return async function (params: TParams): Promise<z.infer<TSchema>> {
    const searchParams = new URLSearchParams();
    // This loop robustly handles any object passed in.
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key as keyof TParams];
        searchParams.append(key, String(value));
      }
    }

    const url = `${BLOG_URL}${requestPath}?alt=json&${searchParams.toString()}`;

    const rawJson = await fetchBloggerApi(url);

    const validationResult = schema.safeParse(rawJson);

    if (!validationResult.success) {
      console.error(
        `Zod validation failed for path: ${requestPath}`,
        validationResult.error.issues,
      );
      throw new Error(`API response validation failed for path: ${requestPath}`);
    }

    return validationResult.data;
  };
}

// =================================================================================
// SECTION 3: PUBLIC API METHODS AND THEIR PARAMETER TYPES
// The implementation now works without lint errors.
// =================================================================================

/**
 * Parameter interface for the `getPostList` function.
 * This interface now includes all supported query parameters for fetching post lists.
 * All parameters except 'start-index' and 'max-results' are optional.
 */
export interface GetPostListParams {
  /** The 1-based index of the first result to be retrieved (for paging). */
  'start-index': number;
  /** The maximum number of results to retrieve. */
  'max-results': number;
  /** Full-text query string. */
  q?: string;
  /** Lower bound for the entry publication date, in RFC 3339 format (e.g., "2024-03-16T00:00:00"). */
  'published-min'?: string;
  /** Upper bound for the entry publication date, in RFC 3339 format. */
  'published-max'?: string;
  /** Lower bound for the entry update date. Requires `orderby` to be 'updated'. */
  'updated-min'?: string;
  /** Upper bound for the entry update date. Requires `orderby` to be 'updated'. */
  'updated-max'?: string;
  /** The order of the returned entries. Can be 'lastmodified' (default), 'starttime', or 'updated'. */
  orderby?: 'lastmodified' | 'starttime' | 'updated';
}

/**
 * Fetches a paginated list of post summaries.
 * The response is validated against `PostListResponseSchema`.
 */
export const getPostList = createFeedApiMethod<
GetPostListParams,
  typeof PostListResponseSchema
>('/feeds/posts/summary', PostListResponseSchema);

/**
 * Fetches a list of post summaries filtered by one or more categories (tags).
 * @param categories An array of tag names. The API will return posts that have ALL specified tags.
 * @param options Optional pagination parameters ('start-index', 'max-results').
 * @returns A promise that resolves to the validated post list response.
 */
export async function getPostListByCategories(
  categories: string[],
  options: { 'start-index'?: number; 'max-results'?: number } = {},
): Promise<PostListResponse> {
  if (categories.length === 0) {
    throw new Error('getPostListByCategories requires at least one category.');
  }

  // Blogger API uses slash-separated values in the path for category filtering.
  const categoryPath = categories.map(encodeURIComponent).join('/');
  const requestPath = `/feeds/posts/summary/-/${categoryPath}`;

  // Use the existing factory to create a one-off request function.
  const fetcher = createFeedApiMethod<
    typeof options,
    typeof PostListResponseSchema
  >(requestPath, PostListResponseSchema);

  return fetcher(options);
}

/**
 * Parameter interface for the `getPageList` function.
 */
export interface GetPageListParams {
  'start-index': number;
  'max-results': number;
}

/**
 * Fetches a paginated list of page summaries.
 * The response is validated against `PageListResponseSchema`.
 */
export const getPageList = createFeedApiMethod<
GetPageListParams,
  typeof PageListResponseSchema
>('/feeds/pages/summary', PageListResponseSchema);

/**
 * Parameter interface for content-fetching functions.
 */
export interface GetContentByPathParams {
  path: string;
}

/**
 * Fetches the full content of a single blog post by its URL path.
 * The response is validated against `PostContentResponseSchema`.
 */
export const getPostContent = createFeedApiMethod<
GetContentByPathParams,
  typeof PostContentResponseSchema
>('/feeds/posts/default', PostContentResponseSchema);

/**
 * Fetches the full content of a single page by its URL path.
 * The response is validated against `PageContentResponseSchema`.
 */
export const getPageContent = createFeedApiMethod<
GetContentByPathParams,
  typeof PageContentResponseSchema
>('/feeds/pages/default', PageContentResponseSchema);

/**
 * Fetches all unique tags/labels used in the blog.
 *
 * This function leverages a feature of the Blogger API where any request
 * to the `posts/summary` feed includes a complete list of all blog categories
 * in the `feed.category` field.
 *
 * To be maximally efficient, we make a request for zero posts, minimizing
 * the data transfer, and then extract the category list from that response.
 *
 * @returns A promise that resolves to an array of Category objects.
 */
export async function getAllTags(): Promise<Category[]> {
  // Call `getPostList` asking for 0 results. The primary goal is not the `entry`
  // array, but the `feed.category` data that comes with the response.
  const response = await getPostList({
    'start-index': 1,
    'max-results': 0, // Requesting 0 items is the most efficient way.
  });

  // The Zod schema for PostListResponse now validates `feed.category`,
  // so we can safely access and return it.
  return response.feed.category;
}
