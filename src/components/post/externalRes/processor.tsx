import { parseExternalRes, renderExternalEmbed } from './embeds';

/**
 * html-react-parser 的替换配置：识别 twitter/youtube/bilibili 外链占位符，
 * 具体的嵌入组件统一由 embeds.tsx 提供（与 Blogger 原生渲染管线共用）。
 */
const getProcessorOptions = () => ({
  replace: (domNode: any) => {
    if (!domNode.attribs) return;

    const className = domNode.attribs.class || '';
    const parsed = parseExternalRes(className);
    if (!parsed) return;

    return renderExternalEmbed(parsed.type, parsed.id);
  },
});

export { getProcessorOptions };
