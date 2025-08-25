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

// 从 CSS 变量读取颜色值的函数
// @ts-ignore
const getCSSVariable = (variable: string): string => {
  if (typeof document !== "undefined") {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
  }
  return "";
};

// 创建主题对象，从 CSS 变量中获取值
export const createThemeFromCSS = (): {
  light: ThemeColors;
  dark: ThemeColors;
} => {
  // 亮色模式主题（直接从 CSS 变量读取）
  const lightTheme: ThemeColors = {
    background: "var(--light-background)",
    surface: "var(--light-surface)",
    text: "var(--light-text)",
    textSecondary: "var(--light-text-secondary)",
    border: "var(--light-border)",
    primary: "var(--light-primary)",
    primaryHover: "var(--light-primary-hover)",
    shadow: "var(--light-shadow)",
  };

  // 暗色模式主题（直接从 CSS 变量读取）
  const darkTheme: ThemeColors = {
    background: "var(--dark-background)",
    surface: "var(--dark-surface)",
    text: "var(--dark-text)",
    textSecondary: "var(--dark-text-secondary)",
    border: "var(--dark-border)",
    primary: "var(--dark-primary)",
    primaryHover: "var(--dark-primary-hover)",
    shadow: "var(--dark-shadow)",
  };

  return { light: lightTheme, dark: darkTheme };
};

// 获取当前激活的主题（从当前 CSS 变量值）
export const getCurrentTheme = (): ThemeColors => ({
  background: "var(--bg-color)",
  surface: "var(--surface-color)",
  text: "var(--text-color)",
  textSecondary: "var(--text-secondary-color)",
  border: "var(--border-color)",
  primary: "var(--primary-color)",
  primaryHover: "var(--primary-hover-color)",
  shadow: "var(--shadow-color)",
});

// 向后兼容的静态主题定义（用于需要具体颜色值的场景）
export const lightTheme: ThemeColors = {
  background: "#ffffff",
  surface: "#f8f9fa",
  text: "#212529",
  textSecondary: "#6c757d",
  border: "#dee2e6",
  primary: "#007bff",
  primaryHover: "#0056b3",
  shadow: "rgba(0, 0, 0, 0.1)",
};

export const darkTheme: ThemeColors = {
  background: "#121212",
  surface: "#1e1e1e",
  text: "#ffffff",
  textSecondary: "#b0b0b0",
  border: "#333333",
  primary: "#4fc3f7",
  primaryHover: "#29b6f6",
  shadow: "rgba(0, 0, 0, 0.3)",
};
