/**
 * 代码块增强器
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
      // 降级方案：使用 execCommand
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
    <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="m5 15-4-4 4-4"></path>
      <path d="M11 6h1a2 2 0 0 1 2 2v1"></path>
    </svg>
    <span class="copy-text">Copy</span>
  `;
  button.setAttribute("title", "Copy code");
  button.setAttribute("aria-label", "Copy code to clipboard");

  // 添加复制功能
  button.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const success = await copyToClipboard(codeText);

    // 显示复制状态反馈
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
  // 检查是否已经增强过
  if (codeBlock.querySelector(".code-toolbar")) {
    return;
  }

  // 查找代码元素，可能在嵌套结构中
  let codeElement = codeBlock.querySelector('code[class*="language-"]');

  // 如果直接找不到，尝试在嵌套的 pre 元素中查找
  if (!codeElement) {
    const nestedPre = codeBlock.querySelector("pre");
    if (nestedPre) {
      codeElement = nestedPre.querySelector('code[class*="language-"]');
    }
  }

  if (!codeElement) {
    return;
  }

  // 提取语言信息
  const languageClass = codeElement.className.match(/language-(\w+)/);
  const language = languageClass ? languageClass[1] : "text";

  // 获取代码文本内容
  const codeText = codeElement.textContent || "";

  if (!codeText.trim()) {
    return;
  }

  // 创建工具栏
  const toolbar = createCodeToolbar(language, codeText);

  // 为代码块添加相对定位，以便工具栏绝对定位
  codeBlock.style.position = "relative";

  // 将工具栏插入到代码块中
  codeBlock.appendChild(toolbar);

  // 添加增强标记
  codeBlock.classList.add("enhanced-code-block");
};

/**
 * 检查是否应该增强这个代码块
 * @param preElement pre 元素
 * @returns boolean 是否应该增强
 */
const shouldEnhanceCodeBlock = (preElement: HTMLElement): boolean => {
  // 如果已经增强过，跳过
  if (preElement.querySelector(".code-toolbar")) {
    return false;
  }

  // 检查是否包含有效的代码元素
  const codeElement = preElement.querySelector('code[class*="language-"]');
  if (!codeElement) {
    return false;
  }

  // 优先选择最外层的 md-fences 容器
  // 如果这个元素有 md-fences 类，则应该被增强（它是最外层容器）
  if (preElement.classList.contains("md-fences")) {
    return true;
  }

  // 如果不是 md-fences，检查是否有父级 md-fences 容器
  // 如果有父级 md-fences，则跳过内层元素
  const parentMdFences = preElement.closest(".md-fences");
  if (parentMdFences && parentMdFences !== preElement) {
    return false; // 有父级 md-fences 容器，跳过内层
  }

  // 如果没有 md-fences 容器，但是是嵌套结构的内层，也跳过
  const nestedPre = preElement.querySelector("pre");
  if (nestedPre && nestedPre !== preElement) {
    return false;
  }

  return true;
};

/**
 * 增强页面中的所有代码块
 */
export const enhanceCodeBlocks = (): void => {
  // 查找所有代码块
  const codeBlocks = document.querySelectorAll(
    'pre:has(code[class*="language-"])'
  );

  codeBlocks.forEach((block) => {
    if (shouldEnhanceCodeBlock(block as HTMLElement)) {
      enhanceSingleCodeBlock(block as HTMLElement);
    }
  });

  // 如果浏览器不支持 :has 选择器，使用备用方案
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
  enhancedBlocks.forEach((block) => {
    const toolbar = block.querySelector(".code-toolbar");
    if (toolbar) {
      toolbar.remove();
    }
    block.classList.remove("enhanced-code-block");
    (block as HTMLElement).style.position = "";
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
          const element = node as Element;

          // 检查新添加的元素是否是代码块
          if (
            element.tagName === "PRE" &&
            element.querySelector('code[class*="language-"]') &&
            shouldEnhanceCodeBlock(element as HTMLElement)
          ) {
            enhanceSingleCodeBlock(element as HTMLElement);
          }

          // 检查新添加的元素内部是否包含代码块
          const codeBlocks = element.querySelectorAll(
            'pre:has(code[class*="language-"])'
          );
          codeBlocks.forEach((block) => {
            if (shouldEnhanceCodeBlock(block as HTMLElement)) {
              enhanceSingleCodeBlock(block as HTMLElement);
            }
          });

          // 备用方案
          if (codeBlocks.length === 0) {
            const allPreBlocks = element.querySelectorAll("pre");
            allPreBlocks.forEach((block) => {
              const codeElement = block.querySelector(
                'code[class*="language-"]'
              );
              if (codeElement && shouldEnhanceCodeBlock(block as HTMLElement)) {
                enhanceSingleCodeBlock(block as HTMLElement);
              }
            });
          }
        }
      });
    });
  });

  return observer;
};
