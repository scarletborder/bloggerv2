/**
 * CSS 动态加载工具
 * 负责动态加载外部 CSS 文件，支持主题切换
 */

/**
 * 动态加载 CSS 文件
 * @param href CSS 文件 URL
 * @param id CSS 元素的唯一标识符
 * @returns Promise<void>
 */
export const loadCSS = (href: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 如果已存在相同 id 的样式表，先移除
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.id = id;

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));

    document.head.appendChild(link);
  });
};

/**
 * 根据主题加载相应的样式文件
 * @param theme 当前主题 ('dark' | 'light')
 * @returns Promise<void>
 */
export const loadThemeStyles = async (theme: string): Promise<void> => {
  try {
    // 加载基础 CSS（始终需要）
    await Promise.all([
      loadCSS(
        'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.10.0/katex.min.css',
        'katex-css',
      ),
      loadCSS(
        'https://cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.css',
        'codemirror-base-css',
      ),
    ]);

    // 根据主题加载不同的样式
    if (theme === 'dark') {
      await Promise.all([
        loadCSS(
          'https://cdn.jsdelivr.net/gh/PrismJS/prism-themes@master/themes/prism-atom-dark.css',
          'prism-theme-css',
        ),
        loadCSS(
          'https://cdn.jsdelivr.net/npm/codemirror@5/theme/yonce.css',
          'codemirror-theme-css',
        ),
      ]);
    } else {
      await Promise.all([
        loadCSS(
          'https://cdn.jsdelivr.net/gh/PrismJS/prism-themes@master/themes/prism-one-light.css',
          'prism-theme-css',
        ),
        loadCSS(
          'https://cdn.jsdelivr.net/npm/codemirror@5/theme/duotone-light.css',
          'codemirror-theme-css',
        ),
      ]);
    }
  } catch (error) {
    console.warn('Failed to load some CSS files:', error);
    throw error;
  }
};
