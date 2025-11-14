import { describe, it, expect, afterAll } from 'vitest';
import {
  getPostList,
  getPageList,
  getPostContent,
  getAllTags,
  getPostListByCategories,
} from './blogger.service';

const E2E_TEST_TIMEOUT = 15000; // 15 seconds

// A simple separator for cleaner console output between tests
const logSeparator = () => console.log(`\n${'='.repeat(50)}\n`);

describe('Blogger API Service - E2E Live Tests with Output', () => {
  // This hook will run once after all tests in this file have completed.
  afterAll(() => {
    logSeparator();
    console.log('E2E tests for blogger.service.ts completed.');
  });

  describe('getPostList', () => {
    it(
      'should fetch a real list of posts and print the result',
      { timeout: E2E_TEST_TIMEOUT },
      async () => {
        logSeparator();
        console.log('🚀 Testing: getPostList({ \'start-index\': 1, \'max-results\': 2 })');

        const params = { 'start-index': 1, 'max-results': 2 };
        const result = await getPostList(params);

        // Print the Zod-parsed result to the console
        console.log('✅ Response received and parsed successfully:');
        console.log(JSON.stringify(result, null, 2));

        // Assertions to ensure the test is still valid
        expect(result.feed).toBeDefined();
        expect(typeof result.feed.openSearch$totalResults).toBe('number');
        expect(result.feed.entry).toBeInstanceOf(Array);
        expect(result.feed.entry.length).toBeLessThanOrEqual(params['max-results']);
      },
    );

    it(
      'should fetch posts within a date range and print the result',
      { timeout: E2E_TEST_TIMEOUT },
      async () => {
        logSeparator();
        const params = {
          'start-index': 1,
          'max-results': 3,
          'published-min': '2024-03-16T00:00:00',
          'published-max': '2024-09-24T23:59:59',
        };
        console.log('🚀 Testing: getPostList with date range', params);

        const result = await getPostList(params);

        console.log('✅ Response received and parsed successfully:');
        console.log(JSON.stringify(result, null, 2));

        expect(result.feed.entry.length).toBeGreaterThan(0);
        result.feed.entry.forEach((post) => {
          expect(post.published.getTime()).toBeGreaterThanOrEqual(new Date(params['published-min']).getTime());
          expect(post.published.getTime()).toBeLessThanOrEqual(new Date(params['published-max']).getTime());
        });
      },
    );
  });

  describe('getPostContent', () => {
    it(
      'should fetch the real content for a specific post and print the result',
      { timeout: E2E_TEST_TIMEOUT },
      async () => {
        const path = '/2025/06/stackedit.html';
        logSeparator();
        console.log(`🚀 Testing: getPostContent({ path: "${path}" })`);

        const result = await getPostContent({ path });

        console.log('✅ Response received and parsed successfully:');
        console.log(JSON.stringify(result, null, 2));

        expect(result.feed.entry).toHaveLength(1);
        const post = result.feed.entry[0];
        expect(post.title.$t).toContain('StackEdit');
      },
    );
  });

  describe('getPageList', () => {
    it(
      'should fetch a real list of pages and print the result',
      { timeout: E2E_TEST_TIMEOUT },
      async () => {
        const params = { 'start-index': 1, 'max-results': 2 };
        logSeparator();
        console.log(`🚀 Testing: getPageList(${JSON.stringify(params)})`);

        const result = await getPageList(params);

        console.log('✅ Response received and parsed successfully:');
        console.log(JSON.stringify(result, null, 2));

        expect(result.feed).toBeDefined();
        expect(result.feed.entry.length).toBeLessThanOrEqual(params['max-results']);
      },
    );
  });

  describe('getPostListByCategories', () => {
    it(
      'should fetch posts by category and print the result',
      { timeout: E2E_TEST_TIMEOUT },
      async () => {
        const category = '学习笔记-rust';
        logSeparator();
        console.log(`🚀 Testing: getPostListByCategories(["${category}"])`);

        const result = await getPostListByCategories([category]);

        console.log('✅ Response received and parsed successfully:');
        console.log(JSON.stringify(result, null, 2));

        expect(result.feed.entry.length).toBeGreaterThan(0);
        const hasCategory = result.feed.entry.some(post => post.category?.some(cat => cat.term === category));
        expect(hasCategory).toBe(true);
      },
    );
  });

  describe('getAllTags', () => {
    it(
      'should efficiently fetch all blog tags and print the result',
      { timeout: E2E_TEST_TIMEOUT },
      async () => {
        logSeparator();
        console.log('🚀 Testing: getAllTags()');

        const result = await getAllTags();

        console.log('✅ Response received and parsed successfully (tags array):');
        console.log(JSON.stringify(result, null, 2));

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThan(10);
        const terms = result.map(cat => cat.term);
        expect(terms).toContain('杂谈');
      },
    );
  });
});
