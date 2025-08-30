/**
 * CodeMirror 内容清理器
 * 负责清理和简化 CodeMirror 生成的复杂 HTML 结构，转换为 Prism.js 可识别的格式
 */

/**
 * 清理和简化 CodeMirror 生成的复杂 HTML 结构
 * @param htmlContent 原始 HTML 内容字符串
 * @returns 清理后的 HTML 内容字符串
 */
export const cleanCodeMirrorContent = (htmlContent: string): string => {
  // 创建一个临时的 DOM 元素来解析 HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  // 处理新的 HTML 结构：<pre class="md-fences ..."><pre class="cleaned-codemirror-block"><code class="language-js">
  const mdFencesBlocks = tempDiv.querySelectorAll("pre.md-fences");

  mdFencesBlocks.forEach((outerPre) => {
    // 检查是否包含 cleaned-codemirror-block
    const innerPre = outerPre.querySelector("pre.cleaned-codemirror-block");
    const codeElement = innerPre?.querySelector("code");

    if (innerPre && codeElement) {
      // 获取语言信息，优先从外层 pre 获取 lang 属性，然后从 code 元素的类名中提取
      let langAttr =
        outerPre.getAttribute("lang") ||
        outerPre.getAttribute("data-lang") ||
        codeElement.className.match(/language-(\w+)/)?.[1] ||
        "";

      // 清理代码内容 - 替换 &nbsp; 为普通空格
      let codeContent = codeElement.textContent || "";
      codeContent = codeContent.replace(/\u00A0/g, " "); // 替换 &nbsp; (非断行空格)

      // 创建新的简化代码块
      const newPre = document.createElement("pre");
      const newCode = document.createElement("code");

      // 设置语言类名用于 Prism 高亮
      if (langAttr) {
        newCode.className = `language-${langAttr}`;
        // 同时在 pre 元素上也添加语言信息，以便调试
        newPre.setAttribute("data-lang", langAttr);
      }

      newCode.textContent = codeContent;
      newPre.appendChild(newCode);
      newPre.className = "cleaned-codemirror-block";

      // 替换整个外层 pre
      outerPre.parentNode?.replaceChild(newPre, outerPre);
    }
  });

  // 查找所有 CodeMirror 代码块（处理其他可能的结构）
  const codeMirrorBlocks = tempDiv.querySelectorAll(".CodeMirror");

  codeMirrorBlocks.forEach((block) => {
    // 提取所有代码行的文本内容
    const codeLines = block.querySelectorAll(".CodeMirror-line");
    const codeContent: string[] = [];

    codeLines.forEach((line) => {
      // 获取每行的纯文本内容，忽略所有的样式和结构
      const lineText = line.textContent || "";
      // 过滤掉那些无意义的 "xxxxxxxxxx" 内容
      if (lineText.trim() && !lineText.match(/^x+$/)) {
        codeContent.push(lineText);
      }
    });

    // 如果提取到了有效的代码内容
    if (codeContent.length > 0) {
      // 创建一个简单的 pre 元素来替换复杂的 CodeMirror 结构
      const simpleCodeBlock = document.createElement("pre");
      const codeElement = document.createElement("code");

      // 更全面地获取语言信息
      const parentPre = block.closest("pre.md-fences");
      let langAttr =
        block.getAttribute("lang") ||
        block.getAttribute("data-lang") ||
        parentPre?.getAttribute("lang") ||
        parentPre?.getAttribute("data-lang") ||
        block.className.match(/cm-s-(\w+)/)?.[1] || // CodeMirror 主题可能包含语言信息
        "";

      if (langAttr) {
        codeElement.className = `language-${langAttr}`;
        // 同时在 pre 元素上也添加语言信息，以便调试
        simpleCodeBlock.setAttribute("data-lang", langAttr);
      }

      // 设置代码内容，替换 &nbsp; 为普通空格
      let joinedContent = codeContent.join("\n");
      joinedContent = joinedContent.replace(/\u00A0/g, " ");
      codeElement.textContent = joinedContent;
      simpleCodeBlock.appendChild(codeElement);

      // 添加自定义类名用于样式控制
      simpleCodeBlock.className = "cleaned-codemirror-block";

      // 替换原始的 CodeMirror 块
      block.parentNode?.replaceChild(simpleCodeBlock, block);
    } else {
      // 如果没有有效内容，直接移除这个块
      block.parentNode?.removeChild(block);
    }
  });

  // 同时处理包含 CodeMirror 的 pre 标签（保留原有逻辑作为后备）
  const preTags = tempDiv.querySelectorAll("pre.md-fences");
  preTags.forEach((preTag) => {
    const codeMirrorDiv = preTag.querySelector(".CodeMirror");
    if (codeMirrorDiv) {
      // 提取代码内容
      const codeLines = codeMirrorDiv.querySelectorAll(".CodeMirror-line");
      const codeContent: string[] = [];

      codeLines.forEach((line) => {
        const lineText = line.textContent || "";
        if (lineText.trim() && !lineText.match(/^x+$/)) {
          codeContent.push(lineText);
        }
      });

      if (codeContent.length > 0) {
        // 更全面地获取语言信息
        let langAttr =
          preTag.getAttribute("lang") ||
          preTag.getAttribute("data-lang") ||
          codeMirrorDiv.getAttribute("lang") ||
          codeMirrorDiv.getAttribute("data-lang") ||
          preTag.className.match(/language-(\w+)/)?.[1] ||
          codeMirrorDiv.className.match(/cm-s-(\w+)/)?.[1] ||
          "";

        // 创建简化的代码块
        const simpleCodeBlock = document.createElement("pre");
        const codeElement = document.createElement("code");

        if (langAttr) {
          codeElement.className = `language-${langAttr}`;
          // 同时在 pre 元素上也添加语言信息，以便调试
          simpleCodeBlock.setAttribute("data-lang", langAttr);
        }

        let joinedContent = codeContent.join("\n");
        joinedContent = joinedContent.replace(/\u00A0/g, " ");
        codeElement.textContent = joinedContent;
        simpleCodeBlock.appendChild(codeElement);
        simpleCodeBlock.className = "cleaned-codemirror-block";

        // 替换整个 pre 标签
        preTag.parentNode?.replaceChild(simpleCodeBlock, preTag);
      }
    }
  });

  return tempDiv.innerHTML;
};
