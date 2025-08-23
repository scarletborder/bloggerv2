import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPostList,
  getPageList,
  getPostContent,
  //   getPageContent, // 假设 getPageContent 与 getPostContent 结构类似，为简洁省略
  getAllTags,
  getPostListByCategories,
} from './blogger.service';
import {
  PostListResponseSchema,
  PostContentResponseSchema,
  PageListResponseSchema,
} from './blogger.types';
import { BLOG_URL } from '../constants/feedapi';

// We still mock the global `fetch` function.
const fetchSpy = vi.spyOn(globalThis, 'fetch');

// Helper function to create a minimal, structurally correct mock response.
const createMockApiResponse = (data: any): Response => {
  // The first argument to the Response constructor is the body.
  // For a JSON response, we must stringify our mock data.
  const body = JSON.stringify(data);

  // The second argument is an init object where we can set status, headers, etc.
  // The `.json()` method on the created Response object will now work correctly.
  return new Response(body, {
    status: 200, // Or whatever status you want to test
    statusText: 'OK',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};


describe('Blogger API Service - Structural Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure isolation.
    vi.resetAllMocks();
  });

  describe('getPostList', () => {
    it('should fetch and return data matching the PostListResponseSchema', async () => {
      // Setup: Create a minimal mock structure that satisfies the schema.
      const mockResponse = {
        feed: {
          'openSearch$totalResults': { $t: '123' },
          entry: [
            {
              id: { $t: 'post-id-1' },
              published: { $t: new Date().toISOString() },
              updated: { $t: new Date().toISOString() },
              title: { $t: 'Test Post' },
              summary: { $t: 'This is a summary.' },
              link: [{ rel: 'alternate', type: 'text/html', href: 'http://example.com/post' }],
              author: [{ name: { $t: 'Test Author' } }],
              category: [{ term: 'Test Tag' }],
            },
          ],
          category: [{ term: 'Global Tag 1' }, { term: 'Global Tag 2' }],
        },
      };
      fetchSpy.mockResolvedValue(createMockApiResponse(mockResponse));

      // Act: Call the function.
      const result = await getPostList({ 'start-index': 1, 'max-results': 1 });

      // Assert: Verify the fetch call and the structure of the result.
      const expectedUrl = `${BLOG_URL}/feeds/posts/summary?alt=json&start-index=1&max-results=1`;
      expect(fetchSpy).toHaveBeenCalledWith(expectedUrl, expect.anything());

      // Use Zod's `safeParse` to verify the structure. `success` should be true.
      expect(PostListResponseSchema.safeParse(mockResponse).success).toBe(true);

      // Assert on the parsed result from our function.
      expect(result.feed).toBeDefined();
      expect(typeof result.feed['openSearch$totalResults']).toBe('number');
      expect(Array.isArray(result.feed.entry)).toBe(true);
      expect(result.feed.entry.length).toBeGreaterThanOrEqual(0);
      expect(result.feed.entry[0]?.title.$t).toBe('Test Post');
      expect(Array.isArray(result.feed.category)).toBe(true);
      expect(result.feed.category.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getPostContent', () => {
    it('should fetch and return data matching the PostContentResponseSchema', async () => {
      // Setup: Create a minimal mock structure.
      const mockResponse = {
        feed: {
          entry: [
            {
              id: { $t: 'post-id-1' },
              published: { $t: new Date().toISOString() },
              updated: { $t: new Date().toISOString() },
              title: { $t: 'Test Post Full Content' },
              content: { $t: '<p>This is the full content.</p>' },
              link: [{ rel: 'alternate', type: 'text/html', href: 'http://example.com/post' }],
              author: [{ name: { $t: 'Test Author' } }],
              category: [{ term: 'Test Tag' }],
            },
          ],
        },
      };
      fetchSpy.mockResolvedValue(createMockApiResponse(mockResponse));

      // Act
      const result = await getPostContent({ path: '/test-post.html' });

      // Assert
      const expectedUrl = `${BLOG_URL}/feeds/posts/default?alt=json&path=%2Ftest-post.html`;
      expect(fetchSpy).toHaveBeenCalledWith(expectedUrl, expect.anything());

      expect(PostContentResponseSchema.safeParse(mockResponse).success).toBe(true);

      expect(result.feed).toBeDefined();
      expect(result.feed.entry).toHaveLength(1);
      expect(result.feed.entry[0].title.$t).toBe('Test Post Full Content');
      expect(result.feed.entry[0].content).toBeDefined();
      expect(typeof result.feed.entry[0].content.$t).toBe('string');
    });
  });

  describe('getPageList', () => {
    it('should fetch and return data matching the PageListResponseSchema', async () => {
      // Setup
      const mockResponse = {
        feed: {
          'openSearch$totalResults': { $t: '5' },
          entry: [
            {
              id: { $t: 'page-id-1' },
              published: { $t: new Date().toISOString() },
              updated: { $t: new Date().toISOString() },
              title: { $t: 'Test Page' },
              summary: { $t: 'This is a page summary.' },
              link: [{ rel: 'alternate', type: 'text/html', href: 'http://example.com/page' }],
              author: [{ name: { $t: 'Test Author' } }],
            },
          ],
          // Pages list does not have a global category list.
        },
      };
      fetchSpy.mockResolvedValue(createMockApiResponse(mockResponse));

      // Act
      const result = await getPageList({ 'start-index': 1, 'max-results': 5 });

      // Assert
      const expectedUrl = `${BLOG_URL}/feeds/pages/summary?alt=json&start-index=1&max-results=5`;
      expect(fetchSpy).toHaveBeenCalledWith(expectedUrl, expect.anything());

      expect(PageListResponseSchema.safeParse(mockResponse).success).toBe(true);

      expect(result.feed).toBeDefined();
      expect(result.feed.entry[0].summary).toBeDefined();
      // Verify that 'content' is not present, as this is a summary.
      expect((result.feed.entry[0] as any).content).toBeUndefined();
    });
  });

  describe('getPostListByCategories', () => {
    it('should call fetch with a correctly formatted category path', async () => {
      // Setup: The response structure is the same as getPostList.
      const mockResponse = { feed: { 'openSearch$totalResults': { $t: '1' }, entry: [], category: [] } };
      fetchSpy.mockResolvedValue(createMockApiResponse(mockResponse));

      // Act
      await getPostListByCategories(['Tag One', 'Tag Two']);

      // Assert
      const expectedPath = encodeURIComponent('Tag One') + '/' + encodeURIComponent('Tag Two');
      const expectedUrl = `${BLOG_URL}/feeds/posts/summary/-/${expectedPath}?alt=json&`;
      expect(fetchSpy).toHaveBeenCalledWith(expectedUrl, expect.anything());
    });
  });

  describe('getAllTags', () => {
    it('should fetch with max-results=0 and return the category array', async () => {
      // Setup
      const mockResponse = {
        feed: {
          'openSearch$totalResults': { $t: '123' },
          entry: [], // The important part: entry is empty.
          category: [{ term: 'Global Tag 1' }, { term: 'Global Tag 2' }],
        },
      };
      fetchSpy.mockResolvedValue(createMockApiResponse(mockResponse));

      // Act
      const result = await getAllTags();

      // Assert
      const expectedUrl = `${BLOG_URL}/feeds/posts/summary?alt=json&start-index=1&max-results=0`;
      expect(fetchSpy).toHaveBeenCalledWith(expectedUrl, expect.anything());

      // The result should be the category array itself, not the whole response.
      expect(result).toHaveLength(2);
      expect(result[0].term).toBe('Global Tag 1');
      expect(result[1].term).toBe('Global Tag 2');
    });
  });
});