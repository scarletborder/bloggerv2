import React from 'react';
import { Link } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { getCurrentTheme } from '../../constants/colors';

interface PostListItemProps {
  path: string;
  title: string;
  tags: string[];
  summary: string;
  published: number;
}

const PostListItem: React.FC<PostListItemProps> = ({
  path,
  title,
  tags,
  summary,
  published
}) => {
  const colors = getCurrentTheme();

  // 将时间戳转换为 2006/01/02 格式
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const itemStyles: React.CSSProperties = {
    padding: isMobile ? '16px 12px' : '20px',
    marginBottom: '16px',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    boxShadow: colors.shadow,
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    color: colors.text,
    display: 'block',
  };

  const itemHoverStyles: React.CSSProperties = {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${colors.shadow}`,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '600',
    marginBottom: '8px',
    color: colors.text,
  };

  const tagsContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '8px',
  };

  const tagStyles: React.CSSProperties = {
    padding: '2px 8px',
    backgroundColor: colors.primary,
    color: colors.surface,
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  };

  const summaryStyles: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '12px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const dateStyles: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: '12px',
    fontWeight: '500',
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Link
      to={`/${path}`}
      style={{
        ...itemStyles,
        ...(isHovered ? itemHoverStyles : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 style={titleStyles}>{title}</h3>

      {tags.length > 0 && (
        <div style={tagsContainerStyles}>
          {tags.map((tag, index) => (
            <span key={index} style={tagStyles}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <p style={summaryStyles}>{summary}</p>

      <div style={dateStyles}>
        发布于 {formatDate(published)}
      </div>
    </Link>
  );
};

export default PostListItem;
