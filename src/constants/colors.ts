export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryHover: string;
  shadow: string;
}

/**
 * 从 theme.css 中定义的自定义颜色系统获取当前主题颜色
 * theme.css 基于 TDesign 设计系统，并使用自定义颜色变量以保持原有的视觉效果
 */
export const getCurrentTheme = (): ThemeColors =>
  // 使用自定义的 CSS 变量，这些变量在 src/styles/theme.css 中定义
  // 这些变量是为了保持原有的视觉效果并与 TDesign 兼容
  ({
    background: 'var(--bg-color)',
    surface: 'var(--surface-color)',
    text: 'var(--text-color)',
    textSecondary: 'var(--text-secondary-color)',
    border: 'var(--border-color)',
    primary: 'var(--primary-color)',
    primaryHover: 'var(--primary-hover-color)',
    shadow: 'var(--shadow-color)',
  })
;

/**
 * 向后兼容的浅色主题定义
 * 这些值来自 theme.css 中的浅色模式变量
 */
export const lightTheme: ThemeColors = {
  background: '#f3f3f3',
  surface: '#ffffff',
  text: 'rgba(0, 0, 0, 0.9)',
  textSecondary: 'rgba(0, 0, 0, 0.6)',
  border: '#dcdcdc',
  primary: '#81959e',
  primaryHover: '#9db1ba',
  shadow: '0 1px 10px rgba(0, 0, 0, 5%), 0 4px 5px rgba(0, 0, 0, 8%), 0 2px 4px -1px rgba(0, 0, 0, 12%)',
};

/**
 * 向后兼容的深色主题定义
 * 这些值来自 theme.css 中的深色模式变量
 */
export const darkTheme: ThemeColors = {
  background: '#181818',
  surface: '#242424',
  text: 'rgba(255, 255, 255, 0.9)',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  border: '#4b4b4e',
  primary: '#8f8fb0',
  primaryHover: '#747595',
  shadow: '0 4px 6px rgba(0, 0, 0, 0.06), 0 1px 10px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.12)',
};
