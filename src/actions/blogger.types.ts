import { z } from 'zod';

// =================================================================================
// 1. HELPER SCHEMAS (Reusable building blocks)
// =================================================================================

/**
 * A reusable Zod schema for the common `{$t: "..."}` pattern found in the Blogger API response.
 * It validates that the object has a `$t` property which is a string.
 */
const TValueSchema = z.object({
  $t: z.string(),
});

/**
 * A reusable Zod schema for link objects within the `link` array.
 * It extracts the relation, type, and URL.
 */
const LinkSchema = z.object({
  rel: z.string(),
  type: z.string(),
  href: z.string().url(),
});

/**
 * A reusable Zod schema for author objects.
 * For simplicity, we are only extracting the author's name.
 */
const AuthorSchema = z.object({
  name: TValueSchema,
});

/**
 * A reusable Zod schema for category/tag objects.
 * It validates that the object has a `term` property which is the tag name.
 */
const CategorySchema = z.object({
  term: z.string(),
});

// =================================================================================
// 2. ENTRY SCHEMAS (Schemas for individual posts or pages)
// =================================================================================

/**
 * A base Zod schema containing fields common to all entries (both posts and pages).
 * It transforms date strings into JavaScript `Date` objects for easier manipulation.
 */
const BaseEntrySchema = z.object({
  id: TValueSchema,
  published: TValueSchema.transform(val => new Date(val.$t)),
  updated: TValueSchema.transform(val => new Date(val.$t)),
  title: TValueSchema,
  link: z.array(LinkSchema),
  author: z.array(AuthorSchema),
});

/**
 * A Zod schema for a post entry as it appears in a list/summary feed.
 * It extends the base entry with a `summary` and an optional `category` array (tags).
 */
export const PostSummaryEntrySchema = BaseEntrySchema.extend({
  summary: TValueSchema,
  category: z.array(CategorySchema).optional(),
});

/**
 * A Zod schema for a page entry as it appears in a list/summary feed.
 * It extends the base entry with a `summary`. Pages do not have categories.
 */
export const PageSummaryEntrySchema = BaseEntrySchema.extend({
  summary: TValueSchema,
});

/**
 * A Zod schema for a full post entry, including its complete content.
 * It extends the base entry with the full HTML `content`.
 */
export const PostContentEntrySchema = BaseEntrySchema.extend({
  content: TValueSchema,
  category: z.array(CategorySchema).optional(),
});

/**
 * A Zod schema for a full page entry, including its complete content.
 * It extends the base entry with the full HTML `content`.
 */
export const PageContentEntrySchema = BaseEntrySchema.extend({
  content: TValueSchema,
});

// =================================================================================
// 3. TOP-LEVEL RESPONSE SCHEMAS (Schemas for the entire API response object)
// =================================================================================

/**
 * A generic factory function to create a Zod schema for list-based API responses (e.g., post list, page list).
 * It expects a `feed` object containing an array of entries and total result count.
 * @param entrySchema The Zod schema for the individual entries in the list.
 */
const createListFeedSchema = <T extends z.ZodTypeAny>(entrySchema: T) => z.object({
  feed: z.object({
    entry: z.array(entrySchema).optional()
      .default([]), // Use .default([]) to handle cases with 0 entries gracefully
    openSearch$totalResults: TValueSchema.transform(val => parseInt(val.$t, 10)),
  }),
});

/**
 * A generic factory function to create a Zod schema for detail-based API responses (e.g., single post/page content).
 * It expects the `entry` array to contain exactly one item.
 * @param entrySchema The Zod schema for the single entry.
 */
const createDetailFeedSchema = <T extends z.ZodTypeAny>(entrySchema: T) => z.object({
  feed: z.object({
    entry: z
      .array(entrySchema)
      .length(1, { message: 'Expected exactly one entry in the feed.' }),
  }),
});

/**
 * Zod schema for the response of the "get post list" API endpoint.
 * This is now defined specifically to include the top-level `category` array,
 * which contains all tags for the entire blog.
 */
export const PostListResponseSchema = z.object({
  feed: z.object({
    entry: z.array(PostSummaryEntrySchema).optional()
      .default([]),
    openSearch$totalResults: TValueSchema.transform(val => parseInt(val.$t, 10)),
    // Add the blog-wide category list here
    category: z.array(CategorySchema).optional()
      .default([]),
  }),
});

/**
 * Zod schema for the response of the "get page list" API endpoint.
 */
export const PageListResponseSchema = createListFeedSchema(PageSummaryEntrySchema);

/**
 * Zod schema for the response of the "get post content" API endpoint.
 */
export const PostContentResponseSchema = createDetailFeedSchema(PostContentEntrySchema);

/**
 * Zod schema for the response of the "get page content" API endpoint.
 */
export const PageContentResponseSchema = createDetailFeedSchema(PageContentEntrySchema);

/**
 * Zod schema for the response of the "get all tags" API endpoint.
 * This endpoint has a unique structure, directly providing a `category` array.
 */
export const AllTagsResponseSchema = z.object({
  feed: z.object({
    category: z.array(CategorySchema).optional()
      .default([]),
  }),
});

// =================================================================================
// 4. INFERRED TYPESCRIPT TYPES
// These types are automatically generated from the Zod schemas above, ensuring
// perfect synchronization between validation and static types.
// =================================================================================

// --- Utility Types ---
export type Link = z.infer<typeof LinkSchema>;
export type Category = z.infer<typeof CategorySchema>;

// --- Entry Types ---
export type PostSummaryEntry = z.infer<typeof PostSummaryEntrySchema>;
export type PageSummaryEntry = z.infer<typeof PageSummaryEntrySchema>;
export type PostContentEntry = z.infer<typeof PostContentEntrySchema>;
export type PageContentEntry = z.infer<typeof PageContentEntrySchema>;

// --- Full Response Types ---
export type PostListResponse = z.infer<typeof PostListResponseSchema>;
export type PageListResponse = z.infer<typeof PageListResponseSchema>;
export type PostContentResponse = z.infer<typeof PostContentResponseSchema>;
export type PageContentResponse = z.infer<typeof PageContentResponseSchema>;

/**
 * This type now represents the full response from which we extract tags.
 * The actual result of our `getAllTags` function will be `Category[]`.
 */
export type AllTagsResponse = z.infer<typeof AllTagsResponseSchema>;
