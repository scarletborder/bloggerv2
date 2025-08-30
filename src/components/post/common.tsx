import { getCurrentTheme } from "../../constants/colors";
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBlogger, faDisqus } from '@fortawesome/free-brands-svg-icons';
import type { CommentItem } from '../../models/CommentItem';

// 分界线
export function Seperator() {
  const colors = getCurrentTheme();
  const separatorStyles: React.CSSProperties = {
    width: '95%',
    height: '1px',
    backgroundColor: colors.border,
    opacity: 0.5,
    margin: '0 auto',
    marginBottom: '16px',
  };
  return <div style={separatorStyles} />;
}



// 定义组件接收的 props 类型
interface SourceIconProps {
  source: CommentItem['source'];
}

/**
 * 根据来源显示对应的品牌图标，并适配主题颜色。
 */
export function SourceIcon({ source }: SourceIconProps) {
  const colors = getCurrentTheme();
  // 获取当前主题颜色，以便为图标应用正确的颜色

  // 定义统一的图标基础样式
  const iconBaseStyles: React.CSSProperties = {
    fontSize: '16px',        // 使图标大小与作者名文字大小一致
    verticalAlign: 'middle', // 优化图标与文字的垂直对齐
    transition: 'color 0.2s ease', // 添加颜色过渡动画
  };

  // 使用 switch 语句根据 source 渲染不同的图标
  switch (source) {
    case 'blogger':
      return (
        <FontAwesomeIcon
          icon={faBlogger}
          style={{
            ...iconBaseStyles,
            color: colors.primary, // Blogger 图标使用主题的主色
          }}
          title="来自 Blogger" // 添加 title 属性，鼠标悬停时会显示文字提示
        />
      );

    case 'disqus':
      return (
        <FontAwesomeIcon
          icon={faDisqus}
          style={{
            ...iconBaseStyles,
            color: '#2e9fff', // Disqus 使用其品牌蓝色
          }}
          title="来自 Disqus"
        />
      );

    // 如果 source 不是 'blogger' 或 'disqus'，则不渲染任何内容
    default:
      return null;
  }
}