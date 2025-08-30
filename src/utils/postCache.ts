import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { PostItem } from '../models/PostItem';

// 缓存条目接口
interface CacheEntry {
  key: string; // 格式: "年份/月份"
  posts: PostItem[];
  timestamp: number; // milliseconds 
  expire: number; // 过期时间戳
}

// 扩展 Dexie 数据库类
class PostCacheDB extends Dexie {
  cacheEntries!: Table<CacheEntry>;

  constructor() {
    super('BlogPostCache');
    this.version(1).stores({
      cacheEntries: 'key, timestamp, expire'
    });
  }
}

// 创建数据库实例
const db = new PostCacheDB();

// 缓存管理类
export class PostCacheManager {
  // 生成缓存key
  private static generateKey(year: number, month: number): string {
    return `${year}/${month.toString().padStart(2, '0')}`;
  }

  // 计算过期时间
  private static calculateExpireTime(year: number, month: number): number {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 如果是当前年月，缓存30分钟
    if (year === currentYear && month === currentMonth) {
      return Date.now() + (30 * 60 * 1000); // 30分钟
    } else {
      // 其他情况缓存7天
      return Date.now() + (7 * 24 * 60 * 60 * 1000); // 7天
    }
  }

  // 保存缓存
  static async saveCache(year: number, month: number, posts: PostItem[]): Promise<void> {
    try {
      const key = this.generateKey(year, month);
      const expire = this.calculateExpireTime(year, month);

      const cacheEntry: CacheEntry = {
        key,
        posts,
        timestamp: Date.now(),
        expire
      };

      await db.cacheEntries.put(cacheEntry);
      console.log(`缓存已保存: ${key}, 过期时间: ${new Date(expire).toLocaleString()}`);
    } catch (error) {
      console.error('保存缓存失败:', error);
    }
  }

  // 获取缓存
  static async getCache(year: number, month: number): Promise<PostItem[] | null> {
    try {
      const key = this.generateKey(year, month);
      const cacheEntry = await db.cacheEntries.get(key);

      if (!cacheEntry) {
        return null;
      }

      // 检查是否过期
      if (Date.now() > cacheEntry.expire) {
        // 删除过期缓存
        await db.cacheEntries.delete(key);
        console.log(`缓存已过期并删除: ${key}`);
        return null;
      }

      console.log(`从缓存加载数据: ${key}`);
      return cacheEntry.posts;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return null;
    }
  }

  // 检查是否有缓存（用于在UI中显示数字）
  static async hasCachedData(year: number, month: number): Promise<number> {
    try {
      const key = this.generateKey(year, month);
      const cacheEntry = await db.cacheEntries.get(key);

      if (!cacheEntry) {
        return 0;
      }

      // 检查是否过期
      if (Date.now() > cacheEntry.expire) {
        // 删除过期缓存
        await db.cacheEntries.delete(key);
        return 0;
      }

      return cacheEntry.posts.length;
    } catch (error) {
      console.error('检查缓存失败:', error);
      return 0;
    }
  }

  // 清除指定缓存
  static async clearCache(year: number, month: number): Promise<void> {
    try {
      const key = this.generateKey(year, month);
      await db.cacheEntries.delete(key);
      console.log(`缓存已清除: ${key}`);
    } catch (error) {
      console.error('清除缓存失败:', error);
    }
  }

  // 清除所有过期缓存
  static async clearExpiredCache(): Promise<void> {
    try {
      const now = Date.now();
      const allEntries = await db.cacheEntries.toArray();
      const expiredKeys = allEntries
        .filter((entry: CacheEntry) => entry.expire < now)
        .map((entry: CacheEntry) => entry.key);

      if (expiredKeys.length > 0) {
        await db.cacheEntries.bulkDelete(expiredKeys);
        console.log(`清除过期缓存 ${expiredKeys.length} 条:`, expiredKeys);
      }
    } catch (error) {
      console.error('清除过期缓存失败:', error);
    }
  }

  // 获取所有缓存的年月统计
  static async getCachedDateCounts(): Promise<Record<string, Record<string, number>>> {
    try {
      const allEntries = await db.cacheEntries.toArray();
      const now = Date.now();
      const result: Record<string, Record<string, number>> = {};

      for (const entry of allEntries) {
        // 跳过过期的缓存
        if (entry.expire < now) {
          continue;
        }

        const [year, month] = entry.key.split('/');
        if (!result[year]) {
          result[year] = {};
        }
        result[year][month] = entry.posts.length;
      }

      return result;
    } catch (error) {
      console.error('获取缓存统计失败:', error);
      return {};
    }
  }

  // 初始化时清理过期缓存
  static async init(): Promise<void> {
    try {
      await this.clearExpiredCache();
    } catch (error) {
      console.error('初始化缓存管理器失败:', error);
    }
  }
}

// 默认导出
export default PostCacheManager;
