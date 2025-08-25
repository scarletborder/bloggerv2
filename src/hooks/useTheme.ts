import { useEffect, useCallback, useState } from "react";
import { themeManager, type ThemeMode } from "../utils/themeManager";

interface UseThemeOptions {
  localStorageKey?: string; // 保持向后兼容，但实际不使用
}

interface UseThemeReturn {
  theme: ThemeMode;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const useTheme = (_options: UseThemeOptions = {}): UseThemeReturn => {
  // 使用主题管理器的当前主题作为初始状态
  const [theme, setTheme] = useState<ThemeMode>(() => themeManager.getTheme());

  // 订阅主题变化
  useEffect(() => {
    // 定义订阅的回调函数
    const handleThemeChange = (newTheme: ThemeMode) => {
      setTheme(newTheme);
    };

    // 添加订阅
    const unsubscribe = themeManager.subscribe(handleThemeChange);

    return () => {
      unsubscribe();
    };
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    themeManager.setTheme(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    themeManager.toggleTheme();
  }, []);

  return {
    theme,
    themeMode: theme,
    setThemeMode,
    toggleTheme,
  };
};

export default useTheme;
