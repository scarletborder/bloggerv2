/**
 * Prism.js 动态语言加载器 (v2 - Data-Driven)
 * ============================================
 *
 * 使用官方 components.json 数据动态加载语言包，避免 Vite 模块解析问题。
 *
 * 特性:
 * - 数据驱动：基于 Prism.js 官方的语言元数据。
 * - 别名解析：自动将 "js" 解析为 "javascript" 等。
 * - 递归依赖：正确加载完整的依赖链 (e.g., tsx -> jsx -> javascript -> clike)。
 * - 健壮性：通过缓存和 Promise 管理避免重复加载。
 */

// @ts-ignore - prismjs doesn't have built-in types
import Prism from 'prismjs';
import components from './prism-components.json'; // 假设您将提供的 JSON 保存为此文件

// -----------------------------------------------------------------------------
//  Data Processing: Generate Dependency and Alias Maps from Official JSON
// -----------------------------------------------------------------------------

type LanguageData = {
  require?: string | string[];
  modify?: string | string[];
  alias?: string | string[];
  [key: string]: any;
};

// 语言包依赖关系映射 (language -> its dependencies)
const languageDependencies = new Map<string, string[]>();

// 语言别名映射 (alias -> canonical language name)
const languageAliases = new Map<string, string>();

/**
 * 从 Prism 的 components.json 中解析并填充依赖和别名映射
 */
const processLanguageData = () => {
  const languages = components.languages as Record<string, LanguageData>;

  for (const langId in languages) {
    if (langId === 'meta') {
      continue;
    }
    const langInfo = languages[langId];

    // 1. 建立别名映射 (包括语言本身)
    languageAliases.set(langId, langId); // Canonical name maps to itself
    if (langInfo.alias) {
      const aliases = Array.isArray(langInfo.alias)
        ? langInfo.alias
        : [langInfo.alias];
      for (const alias of aliases) {
        languageAliases.set(alias, langId);
      }
    }

    // 2. 建立依赖映射 (合并 'require' 和 'modify')
    const deps = new Set<string>();
    const toArray = (val?: string | string[]) =>
      val ? (Array.isArray(val) ? val : [val]) : [];

    toArray(langInfo.require).forEach((dep) => deps.add(dep));
    toArray(langInfo.modify).forEach((dep) => deps.add(dep));

    if (deps.size > 0) {
      languageDependencies.set(langId, Array.from(deps));
    }
  }
};

// 在模块加载时立即处理数据
processLanguageData();

// -----------------------------------------------------------------------------
//  Core Loading Logic
// -----------------------------------------------------------------------------

// 已加载的语言包缓存
const loadedLanguages = new Set<string>();

// 正在加载的语言包Promise缓存，避免重复加载
const loadingPromises = new Map<string, Promise<void>>();

// Prism.js CDN 基础 URL (保持版本同步)
const PRISM_CDN_BASE = 'https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components';

/**
 * 通过 CDN 动态加载单个语言包
 * @param language 语言的规范名称 (canonical name)
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
    // 检查 Prism.languages 是否已存在该语言 (可能由其他包依赖带入)
    if (Prism.languages[language]) {
      loadedLanguages.add(language);
      return;
    }

    try {
      const script = document.createElement('script');
      const scriptSrc = `${PRISM_CDN_BASE}/prism-${language}.min.js`;
      script.src = scriptSrc;

      console.log(`📡 Loading ${language} from CDN: ${scriptSrc}`);

      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          console.log(`✅ Successfully loaded ${language}`);
          loadedLanguages.add(language);
          resolve();
        };
        script.onerror = (event) => {
          console.error(`❌ Failed to load script for ${language}:`, event);
          reject(new Error(`Failed to load script for language: ${language}`));
        };
        document.head.appendChild(script);
      });
    } catch (error) {
      console.warn(`⚠️ Failed to load Prism language: ${language}`, error);
      // 即使加载失败也标记为已尝试，避免重复加载，并向上抛出异常
      loadedLanguages.add(language);
      throw error;
    }
  })();

  loadingPromises.set(language, loadPromise);

  try {
    await loadPromise;
  } finally {
    // 无论成功或失败，都从正在加载的队列中移除
    loadingPromises.delete(language);
  }
};

/**
 * 加载语言包及其所有依赖 (递归)
 * @param language 语言标识符或其别名
 * @returns Promise<void>
 */
export const loadPrismLanguage = async (language: string): Promise<void> => {
  // 1. 将别名解析为规范名称
  const canonicalLanguage = languageAliases.get(language);

  if (!canonicalLanguage) {
    console.warn(`⚠️ Unknown Prism language or alias: ${language}`);
    return;
  }

  // 2. 如果语言已在 Prism 中注册，直接返回
  if (Prism.languages[canonicalLanguage]) {
    return;
  }

  console.log(`🚀 Loading Prism language: ${canonicalLanguage}`);

  // 3. 递归加载所有依赖
  const dependencies = languageDependencies.get(canonicalLanguage) || [];

  if (dependencies.length > 0) {
    const dependencyPromises = dependencies.map((dep) =>
      loadPrismLanguage(dep),
    );
    await Promise.all(dependencyPromises);
  }

  // 4. 加载目标语言
  await loadSingleLanguage(canonicalLanguage);
};

// -----------------------------------------------------------------------------
//  Utility Functions (与之前版本基本保持一致)
// -----------------------------------------------------------------------------

/**
 * 从HTML内容中提取所需的语言包
 * @param htmlContent HTML内容字符串
 * @returns 语言包数组
 */
export const extractLanguagesFromHTML = (htmlContent: string): string[] => {
  const languages = new Set<string>();
  const languageRegex = /class="[^"]*\blanguage-(\w+)/g;
  let match;

  while ((match = languageRegex.exec(htmlContent)) !== null) {
    const lang = match[1];
    if (lang && lang !== 'none') {
      languages.add(lang);
    }
  }

  const result = Array.from(languages);
  if (result.length > 0) {
    console.log('📋 Prism: Found languages to load:', result);
  }
  return result;
};

/**
 * 批量加载多个语言包
 * @param languages 语言包数组
 */
export const loadMultiplePrismLanguages = async (
  languages: string[],
): Promise<void> => {
  const loadPromises = languages.map((lang) => loadPrismLanguage(lang));
  await Promise.allSettled(loadPromises);
};

/**
 * 预加载常用语言包
 */
export const preloadCommonLanguages = async (): Promise<void> => {
  const commonLanguages = [
    'javascript', // or "js"
    'typescript', // or "ts"
    'python', // or "py"
    'go',
    'java',
    'css',
    'json',
    'bash', // or "shell"
    'sql',
    'markup', // or "html"
  ];
  await loadMultiplePrismLanguages(commonLanguages);
};

// -----------------------------------------------------------------------------
//  Initialization
// -----------------------------------------------------------------------------
(async () => {
  try {
    // 预加载基础核心语言，几乎所有语言都依赖它们
    await loadPrismLanguage('markup'); // 包括 clike
    await loadPrismLanguage('css');
    await loadPrismLanguage('javascript');
  } catch (error) {
    console.warn('Failed to preload base languages:', error);
  }
})();

// -----------------------------------------------------------------------------
//  Debug Tools
// -----------------------------------------------------------------------------
// 调试工具：在浏览器控制台中暴露测试函数
if (typeof window !== 'undefined') {
  (window as any).debugPrismLanguageLoader = {
    extractLanguagesFromHTML,
    loadPrismLanguage,
    testExtraction: (html: string) => {
      console.log('🧪 Testing language extraction:');
      console.log('Input HTML:', html);
      const languages = extractLanguagesFromHTML(html);
      console.log('Extracted languages:', languages);
      return languages;
    },
    testPythonHTML: () => {
      const testHTML = `<pre><code class="language-python">def hello():
    print("Hello, world!")
</code></pre>`;
      return (window as any).debugPrismLanguageLoader.testExtraction(testHTML);
    },
    testSQLHTML: () => {
      const testHTML = `<pre><code class="language-sql">SELECT * FROM users WHERE id = 1;</code></pre>`;
      return (window as any).debugPrismLanguageLoader.testExtraction(testHTML);
    },
    checkAliases: () => {
      console.log('🔍 Language aliases map:');
      console.log('python ->', languageAliases.get('python'));
      console.log('py ->', languageAliases.get('py'));
      console.log('sql ->', languageAliases.get('sql'));
      console.log('javascript ->', languageAliases.get('javascript'));
      console.log('js ->', languageAliases.get('js'));
    },
    checkDependencies: () => {
      console.log('📦 Language dependencies map:');
      console.log('python deps:', languageDependencies.get('python'));
      console.log('sql deps:', languageDependencies.get('sql'));
      console.log('javascript deps:', languageDependencies.get('javascript'));
      console.log('go deps:', languageDependencies.get('go'));
    },
  };
}
