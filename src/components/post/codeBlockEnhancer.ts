/**
 * 代码块增强器 (已移除样式注入)
 * 为代码块添加语言标签显示和复制按钮功能
 */

/**
 * 语言映射表，将 Prism.js 语言标识符映射为更友好的显示名称
 */
const LANGUAGE_DISPLAY_MAP: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  jsx: "React JSX",
  tsx: "React TSX",
  python: "Python",
  java: "Java",
  csharp: "C#",
  cpp: "C++",
  c: "C",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  kotlin: "Kotlin",
  scala: "Scala",
  swift: "Swift",
  bash: "Bash",
  shell: "Shell",
  powershell: "PowerShell",
  sql: "SQL",
  json: "JSON",
  yaml: "YAML",
  toml: "TOML",
  xml: "XML",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sass: "Sass",
  less: "Less",
  markdown: "Markdown",
  latex: "LaTeX",
  docker: "Dockerfile",
  nginx: "Nginx",
  apache: "Apache",
  git: "Git",
  diff: "Diff",
  vim: "Vim",
  makefile: "Makefile",
  ini: "INI",
  properties: "Properties",
  graphql: "GraphQL",
  regex: "RegEx",
  http: "HTTP",
  uri: "URI",
  wasm: "WebAssembly",
  handlebars: "Handlebars",
  twig: "Twig",
  haskell: "Haskell",
  lisp: "Lisp",
  scheme: "Scheme",
  r: "R",
  matlab: "MATLAB",
  lua: "Lua",
  perl: "Perl",
};

/**
 * 获取语言的显示名称
 * @param language 语言标识符
 * @returns 友好的显示名称
 */
const getLanguageDisplayName = (language: string): string => {
  return LANGUAGE_DISPLAY_MAP[language.toLowerCase()] || language.toUpperCase();
};

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 复制是否成功
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.warn("Failed to copy to clipboard:", error);
    return false;
  }
};

/**
 * 创建语言标签元素
 * @param language 语言标识符
 * @returns HTMLElement 语言标签元素
 */
const createLanguageLabel = (language: string): HTMLElement => {
  const label = document.createElement("span");
  label.className = "code-language-label";
  label.textContent = getLanguageDisplayName(language);
  label.setAttribute("data-language", language);
  return label;
};

/**
 * 创建复制按钮元素
 * @param codeText 代码文本内容
 * @returns HTMLElement 复制按钮元素
 */
const createCopyButton = (codeText: string): HTMLElement => {
  const button = document.createElement("button");
  button.className = "code-copy-button";
  button.innerHTML = `
    <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
    <span class="copy-text">Copy</span>
  `;
  button.setAttribute("title", "Copy code");
  button.setAttribute("aria-label", "Copy code to clipboard");

  button.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await copyToClipboard(codeText);
    const textSpan = button.querySelector(".copy-text");
    if (textSpan) {
      if (success) {
        textSpan.textContent = "Copied!";
        button.classList.add("copied");
        setTimeout(() => {
          textSpan.textContent = "Copy";
          button.classList.remove("copied");
        }, 2000);
      } else {
        textSpan.textContent = "Failed";
        button.classList.add("error");
        setTimeout(() => {
          textSpan.textContent = "Copy";
          button.classList.remove("error");
        }, 2000);
      }
    }
  });

  return button;
};

/**
 * 创建代码块工具栏
 * @param language 语言标识符
 * @param codeText 代码文本内容
 * @returns HTMLElement 工具栏元素
 */
const createCodeToolbar = (language: string, codeText: string): HTMLElement => {
  const toolbar = document.createElement("div");
  toolbar.className = "code-toolbar";

  // 注意：你的 CSS 中 .code-header 使用了 justify-content: space-between
  // 这里我们将语言和复制按钮都放在同一个工具栏里，会一起显示在右侧
  const languageLabel = createLanguageLabel(language);
  const copyButton = createCopyButton(codeText);

  toolbar.appendChild(languageLabel);
  toolbar.appendChild(copyButton);

  return toolbar;
};

/**
 * 增强单个代码块
 * @param codeBlock pre 元素
 */
const enhanceSingleCodeBlock = (codeBlock: HTMLElement): void => {
  if (codeBlock.closest(".enhanced-code-block")) {
    return;
  }
  const codeElement = codeBlock.querySelector('code[class*="language-"]');
  if (!codeElement) return;

  const languageClass = codeElement.className.match(/language-(\w+)/);
  const language = languageClass ? languageClass[1] : "text";
  const codeText = codeElement.textContent || "";
  if (!codeText.trim()) return;
  
  const parent = codeBlock.parentNode;
  if (!parent) return;

  // 1. 创建总包装器，对应 .enhanced-code-block 样式
  const wrapper = document.createElement("div");
  wrapper.className = "enhanced-code-block";

  // 2. 创建头部容器，对应 .code-header 样式
  const header = document.createElement("div");
  header.className = "code-header";

  // 3. 创建工具栏并放入头部
  const toolbar = createCodeToolbar(language, codeText);
  header.appendChild(toolbar);

  // 4. 将包装器插入到原代码块位置
  parent.insertBefore(wrapper, codeBlock);

  // 5. 将头部和原代码块依次移入包装器
  wrapper.appendChild(header);
  wrapper.appendChild(codeBlock);

  // 6. 为原代码块添加 .code-content 类，以匹配样式
  codeBlock.classList.add("code-content");
};

/**
 * 检查是否应该增强这个代码块
 * @param preElement pre 元素
 * @returns boolean 是否应该增强
 */
const shouldEnhanceCodeBlock = (preElement: HTMLElement): boolean => {
  if (preElement.closest(".enhanced-code-block")) {
    return false;
  }
  return !!preElement.querySelector('code[class*="language-"]');
};

/**
 * 增强页面中的所有代码块
 */
export const enhanceCodeBlocks = (): void => {
  const codeBlocks = document.querySelectorAll(
    'pre:has(code[class*="language-"])'
  );
  codeBlocks.forEach((block) => {
    if (shouldEnhanceCodeBlock(block as HTMLElement)) {
      enhanceSingleCodeBlock(block as HTMLElement);
    }
  });

  if (codeBlocks.length === 0) {
    const allPreBlocks = document.querySelectorAll("pre");
    allPreBlocks.forEach((block) => {
      const codeElement = block.querySelector('code[class*="language-"]');
      if (codeElement && shouldEnhanceCodeBlock(block as HTMLElement)) {
        enhanceSingleCodeBlock(block as HTMLElement);
      }
    });
  }
};

/**
 * 移除所有代码块增强
 */
export const removeCodeBlockEnhancements = (): void => {
  const enhancedBlocks = document.querySelectorAll(".enhanced-code-block");
  enhancedBlocks.forEach((wrapper) => {
    const codeBlock = wrapper.querySelector("pre.code-content");
    if (codeBlock && wrapper.parentNode) {
      codeBlock.classList.remove("code-content");
      wrapper.parentNode.insertBefore(codeBlock, wrapper);
      wrapper.remove();
    }
  });
};

/**
 * 观察 DOM 变化并自动增强新的代码块
 * @returns MutationObserver 实例
 */
export const createCodeBlockObserver = (): MutationObserver => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          if (element.matches("pre") && shouldEnhanceCodeBlock(element)) {
            enhanceSingleCodeBlock(element);
          } else {
            element.querySelectorAll("pre").forEach((block) => {
              if (shouldEnhanceCodeBlock(block)) {
                enhanceSingleCodeBlock(block);
              }
            });
          }
        }
      });
    });
  });
  return observer;
};