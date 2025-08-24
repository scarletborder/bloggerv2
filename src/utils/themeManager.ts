/**
 * 主题管理器 - 提供更可靠的主题管理功能
 */

export type ThemeMode = 'light' | 'dark';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeMode = 'light';
  private listeners: Set<(theme: ThemeMode) => void> = new Set();
  
  private constructor() {
    this.initializeTheme();
  }
  
  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }
  
  private initializeTheme(): void {
    if (typeof window === 'undefined') return;
    
    // 1. 从HTML属性获取（优先级最高）
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    if (htmlTheme === 'light' || htmlTheme === 'dark') {
      this.currentTheme = htmlTheme;
      return;
    }
    
    // 2. 从localStorage获取
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        this.currentTheme = storedTheme;
        this.applyTheme(storedTheme);
        return;
      }
    } catch (e) {
      console.warn('无法访问localStorage:', e);
    }
    
    // 3. 从系统偏好获取
    const systemTheme = this.getSystemTheme();
    this.currentTheme = systemTheme;
    this.applyTheme(systemTheme);
  }
  
  private getSystemTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  private applyTheme(theme: ThemeMode): void {
    if (typeof window === 'undefined') return;
    
    // 设置HTML属性
    document.documentElement.setAttribute('data-theme', theme);
    
    // 保存到localStorage
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('无法保存主题到localStorage:', e);
    }
    
    // 移除阻塞样式（如果存在）
    const blockingStyles = document.getElementById('theme-blocking-styles');
    if (blockingStyles) {
      // 延迟移除，确保主题已应用
      setTimeout(() => {
        blockingStyles.remove();
      }, 100);
    }
  }
  
  public getTheme(): ThemeMode {
    return this.currentTheme;
  }
  
  public setTheme(theme: ThemeMode): void {
    if (this.currentTheme === theme) return;
    
    this.currentTheme = theme;
    this.applyTheme(theme);
    
    // 通知所有监听器
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (e) {
        console.error('主题监听器错误:', e);
      }
    });
  }
  
  public toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  public subscribe(listener: (theme: ThemeMode) => void): () => void {
    this.listeners.add(listener);
    
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  public ensureThemeConsistency(): void {
    // 确保DOM状态与内部状态一致
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    if (htmlTheme !== this.currentTheme) {
      this.applyTheme(this.currentTheme);
    }
  }
}

// 导出单例实例
export const themeManager = ThemeManager.getInstance();

// 确保在模块加载时立即初始化
if (typeof window !== 'undefined') {
  // 在页面加载完成后确保主题一致性
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      themeManager.ensureThemeConsistency();
    });
  } else {
    themeManager.ensureThemeConsistency();
  }
}
