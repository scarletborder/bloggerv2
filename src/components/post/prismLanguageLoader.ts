/**
 * Prism.js 动态语言加载器
 * 使用 CDN 动态加载语言包，避免 Vite 模块解析问题
 */

// @ts-ignore - prismjs doesn't have built-in types
import Prism from "prismjs";

// 语言包依赖关系映射
const LANGUAGE_DEPENDENCIES: Record<string, string[]> = {
  cpp: ["clike", "c"],
  csharp: ["clike"],
  java: ["clike"],
  kotlin: ["clike"],
  scala: ["clike", "java"],
  swift: ["clike"],
  go: ["clike"],
  typescript: ["javascript"],
  tsx: ["jsx", "typescript"],
  jsx: ["markup", "javascript"],
  php: ["markup-templating"],
  handlebars: ["markup-templating"],
  twig: ["markup"],
  "shell-session": ["bash"],
  batch: [],
  powershell: [],
  html: ["markup"],
  xml: ["markup"],
};

// 已加载的语言包缓存
const loadedLanguages = new Set<string>();

// 正在加载的语言包Promise缓存，避免重复加载
const loadingPromises = new Map<string, Promise<void>>();

// Prism.js CDN 基础 URL
const PRISM_CDN_BASE = "https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components";

/**
 * 通过 CDN 动态加载单个语言包
 * @param language 语言标识符
 * @returns Promise<void>
 */
const loadSingleLanguage = async (language: string): Promise<void> => {
  if (loadedLanguages.has(language)) {
    return;
  }

  if (loadingPromises.has(language)) {
    return loadingPromises.get(language)!;
  }

  const loadPromise = (async () => {
    try {
      // 通过 CDN 加载语言包
      const script = document.createElement("script");
      script.src = `${PRISM_CDN_BASE}/prism-${language}.min.js`;

      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          loadedLanguages.add(language);
          resolve();
        };

        script.onerror = () => {
          console.warn(`⚠️ Failed to load Prism language: ${language}`);
          // 即使加载失败也标记为已尝试，避免重复加载
          loadedLanguages.add(language);
          reject(new Error(`Failed to load ${language}`));
        };

        document.head.appendChild(script);
      });
    } catch (error) {
      console.warn(`⚠️ Failed to load Prism language: ${language}`, error);
      // 即使加载失败也标记为已尝试，避免重复加载
      loadedLanguages.add(language);
    }
  })();

  loadingPromises.set(language, loadPromise);
  await loadPromise;
  loadingPromises.delete(language);
};

/**
 * 加载语言包及其依赖
 * @param language 语言标识符
 * @returns Promise<void>
 */
export const loadPrismLanguage = async (language: string): Promise<void> => {
  // 如果语言已经在 Prism 中注册，直接返回
  if (Prism.languages[language]) {
    return;
  }

  try {
    // 先加载依赖
    const dependencies = LANGUAGE_DEPENDENCIES[language] || [];
    for (const dep of dependencies) {
      await loadSingleLanguage(dep);
    }

    // 再加载目标语言
    await loadSingleLanguage(language);
  } catch (error) {
    console.error(
      `Failed to load language and dependencies: ${language}`,
      error
    );
  }
};

/**
 * 从HTML内容中提取所需的语言包
 * @param htmlContent HTML内容字符串
 * @returns 语言包数组
 */
export const extractLanguagesFromHTML = (htmlContent: string): string[] => {
  const languages = new Set<string>();

  // 匹配 class="language-xxx" 或 class="prism language-xxx"
  const languageRegex = /class="[^"]*\blanguage-(\w+)/g;
  let match;

  while ((match = languageRegex.exec(htmlContent)) !== null) {
    const lang = match[1];
    if (lang && lang !== "none") {
      languages.add(lang);
    }
  }

  return Array.from(languages);
};

/**
 * 批量加载多个语言包
 * @param languages 语言包数组
 * @returns Promise<void>
 */
export const loadMultiplePrismLanguages = async (
  languages: string[]
): Promise<void> => {
  const loadPromises = languages.map((lang) => loadPrismLanguage(lang));
  await Promise.allSettled(loadPromises);
};

/**
 * 预加载常用语言包
 * @returns Promise<void>
 */
export const preloadCommonLanguages = async (): Promise<void> => {
  const commonLanguages = [
    "javascript",
    "typescript",
    "python",
    "go",
    "java",
    "css",
    "json",
    "bash",
    "sql",
  ];

  await loadMultiplePrismLanguages(commonLanguages);
};

// 初始化时预加载基础语言包
(async () => {
  try {
    // 加载最基础的语言包
    await loadSingleLanguage("clike");
    await loadSingleLanguage("markup");
    await loadSingleLanguage("css");
    await loadSingleLanguage("javascript");
  } catch (error) {
    console.warn("Failed to preload base languages:", error);
  }
})();
