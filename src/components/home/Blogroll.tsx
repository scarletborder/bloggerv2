import React from 'react';
import { List, TooltipLite, Image } from 'tdesign-react';
import { getCurrentTheme } from '../../constants/colors';
import type { BlogRollItem } from '../../constants/blogroll';
import type { JSX } from 'react/jsx-runtime';
import { CDN_URL_PREFIX } from '../../constants/feedapi';
import { UserIcon, ImageErrorIcon } from 'tdesign-icons-react';
import './index.less';

const { ListItem, ListItemMeta } = List;

interface BlogrollProps {
  isMobile?: boolean;
}

export default function Blogroll({ isMobile = false }: BlogrollProps): JSX.Element {
  const colors = getCurrentTheme();
  const [blogroll, setBlogroll] = React.useState<BlogRollItem[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    fetch(`${CDN_URL_PREFIX}/static/blogroll.json`)
      .then(res => res.json())
      .then((data) => {
        if (!isMounted) return;
        setBlogroll((data ?? []) as BlogRollItem[]);
      })
      .catch(() => {
        if (!isMounted) return;
        setBlogroll([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 容器样式
  const containerStyles: React.CSSProperties = {
    width: '100%',
    padding: isMobile ? '0' : '3px',
    marginTop: isMobile ? '20px' : '10px',
    backgroundColor: colors.surface,
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '18px' : '16px',
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: isMobile ? '10px' : '5px',
    textAlign: 'center',
    padding: '10px 0',
  };

  const avatarStyles: React.CSSProperties = {
    width: '40px',
    height: '40px',
    flexShrink: 0,
  };

  const handleItemClick = (url: string, e?: React.MouseEvent) => {
    if (!url) {
      e?.stopPropagation();
      return;
    }
    e?.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 区分渲染类型
  const renderBlogrollItem = (item: BlogRollItem) => {
    const itemType = item.pic?.type ?? 'avatar';
    const tooltip = item.desc || item.alt;
    const isClickable = !!item.url;

    if (itemType === 'banner' && item.pic?.url) {
      // Banner 类型：图片占满整个 ListItem，悬浮可见 alt/desc
      return (
        <ListItem key={item.url || item.alt} style={{ padding: '4px 8px', display: 'block' }}>
          <TooltipLite content={tooltip} placement="bottom">
            <Image
              src={item.pic.url}
              alt={item.alt}
              style={{
                width: '100%',
                height: '80px',
                display: 'block',
                objectFit: 'cover',
                cursor: isClickable ? 'pointer' : 'default',
                borderRadius: '8px', // 新增：为图片添加圆角
                overflow: 'hidden',   // 新增：确保图片内容被裁剪到圆角内
              }}
              lazy
              fit="cover"
              onClick={e => handleItemClick(item.url, e)}
              error={
                <div style={{
                  width: '100%',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.background,
                  color: colors.textSecondary,
                  borderRadius: '8px', // 新增：为错误占位符也添加圆角
                }}>
                  <ImageErrorIcon size="24px" />
                </div>
              }
            />
          </TooltipLite>
        </ListItem>
      );
    }

    // Avatar 类型：显示头像 + 标题
    return (
      <ListItem key={item.url || item.alt}>
        <div
          onClick={(e: React.MouseEvent) => handleItemClick(item.url, e)}
          style={{
            cursor: isClickable ? 'pointer' : 'default',
          }}
        >
          <TooltipLite content={tooltip} placement='bottom'>
            <ListItemMeta
              className='blogroll-list'
              image={
                item.pic?.url ? (
                  <Image
                    src={item.pic.url}
                    alt={item.alt}
                    style={avatarStyles}
                    lazy
                    shape='circle'
                    error={<ImageErrorIcon fillColor="transparent" strokeColor="currentColor" strokeWidth={2} />}
                  />
                ) : (
                  <UserIcon style={{ width: 40, height: 40, color: colors.text, borderRadius: '50%', background: 'transparent' }} />
                )
              }
              title={<span style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>{item.alt}</span>}
              description={
                item.desc ? (
                  <span style={{ color: colors.text, fontSize: '12px', opacity: 0.7 }}>{item.desc}</span>
                ) : undefined
              }
            />
          </TooltipLite>
        </div>
      </ListItem>
    );
  };

  if (isMobile) {
    return (
      <div style={containerStyles}>
        <h3 style={titleStyles}>友站链接</h3>
        <List
          layout='vertical'
          split={true}
          style={{
            height: 'auto',
            backgroundColor: 'transparent',
          }}
        >
          {blogroll.map(item => renderBlogrollItem(item))}
        </List>
      </div>
    );
  }

  // PC 端：启用虚拟滚动
  return (
    <div style={containerStyles}>
      <h3 style={titleStyles}>友站链接</h3>
      <List
        layout='vertical'
        split={true}
        scroll={
          blogroll.length > 3 ? {
            type: 'virtual',
            isFixedRowHeight: true,
            rowHeight: 70, // 根据 ListItem 内容高度调整
            threshold: 20,
          } : undefined
        }
        style={{
          backgroundColor: 'transparent',
          maxHeight: '60vh',
        }}
      >
        {blogroll.map(item => renderBlogrollItem(item))}
      </List>
    </div>
  );
}
