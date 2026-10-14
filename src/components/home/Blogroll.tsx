import React from 'react';
import { Avatar, Empty, Image, Skeleton, Tag, Tooltip } from 'tdesign-react';
import {
  ChevronRightIcon,
  ImageErrorIcon,
  LinkIcon,
  UserCircleIcon,
} from 'tdesign-icons-react';
import { CDN_URL_PREFIX } from '../../constants/feedapi';
import type { BlogRollItem } from '../../constants/blogroll';
import type { JSX } from 'react/jsx-runtime';
import './index.less';

interface BlogrollProps {
  isMobile?: boolean;
}

const SKELETON_PLACEHOLDER_COUNT = 3;

/** 取站点名首字符作为头像兜底文案 */
const getInitial = (name?: string): string => (name?.trim()?.[0] ?? '?').toUpperCase();

/** 判定展示形态：banner 为横幅卡片，avatar 为头像卡片 */
const getItemType = (item: BlogRollItem): 'avatar' | 'banner' => {
  const declared = item.pic?.type ?? item.type ?? 'avatar';
  if (declared === 'banner' && item.pic?.url) return 'banner';
  return 'avatar';
};

export default function Blogroll({ isMobile = false }: BlogrollProps): JSX.Element {
  const [blogroll, setBlogroll] = React.useState<BlogRollItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

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
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const openLink = (url?: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (url?: string) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    openLink(url);
  };

  const bannerItems = blogroll.filter(item => getItemType(item) === 'banner');
  const avatarItems = blogroll.filter(item => getItemType(item) === 'avatar');

  const renderSkeleton = () => {
    const placeholders = Array.from({ length: SKELETON_PLACEHOLDER_COUNT });
    return placeholders.map((_, index) => (
      <div className="blogroll-card blogroll-card--skeleton" key={index}>
        <Skeleton loading animation="gradient" rowCol={[{ type: 'circle', size: '44px' }]} />
        <div className="blogroll-card__main">
          <Skeleton
            loading
            animation="gradient"
            rowCol={[
              { width: '58%', height: '14px' },
              { width: '36%', height: '11px', margin: '8px 0 0' },
            ]}
          />
        </div>
      </div>
    ));
  };

  const renderBody = () => {
    if (loading) return <div className="blogroll__grid">{renderSkeleton()}</div>;
    if (blogroll.length === 0) return <Empty size="small" description="暂无友站链接" />;
    return (
      <>
        {bannerItems.length > 0 ? (
          <div className="blogroll__banners">{bannerItems.map(renderBanner)}</div>
        ) : null}
        {avatarItems.length > 0 ? (
          <div className="blogroll__grid">{avatarItems.map(renderCard)}</div>
        ) : null}
      </>
    );
  };

  const renderBanner = (item: BlogRollItem, index: number) => {
    const content = (
      <div
        className="blogroll-banner"
        role="link"
        tabIndex={item.url ? 0 : -1}
        onClick={() => openLink(item.url)}
        onKeyDown={handleKeyDown(item.url)}
      >
        <Image
          src={item.pic?.url as string}
          alt={item.alt}
          fit="cover"
          lazy
          className="blogroll-banner__cover"
          error={
            <div className="blogroll-banner__error">
              <ImageErrorIcon size="22px" />
            </div>
          }
        />
        <div className="blogroll-banner__mask">
          <span className="blogroll-banner__title">{item.alt}</span>
          {item.desc ? <span className="blogroll-banner__desc">{item.desc}</span> : null}
        </div>
      </div>
    );

    return (
      <Tooltip
        key={`${item.url || item.alt}-${index}`}
        content={item.desc ? `${item.alt} · ${item.desc}` : item.alt}
        placement="top"
        showArrow={false}
      >
        {content}
      </Tooltip>
    );
  };

  const renderCard = (item: BlogRollItem, index: number) => {
    const clickable = !!item.url;
    const content = (
      <div
        className={`blogroll-card${clickable ? '' : ' blogroll-card--disabled'}`}
        role="link"
        tabIndex={clickable ? 0 : -1}
        onClick={() => openLink(item.url)}
        onKeyDown={handleKeyDown(item.url)}
      >
        <Avatar
          className="blogroll-card__avatar"
          size="44px"
          shape="round"
          image={item.pic?.url}
          alt={getInitial(item.alt)}
          icon={item.pic?.url ? undefined : <UserCircleIcon />}
        />
        <div className="blogroll-card__main">
          <div className="blogroll-card__title">{item.alt}</div>
          {item.desc ? <div className="blogroll-card__desc">{item.desc}</div> : null}
        </div>
        <ChevronRightIcon className="blogroll-card__arrow" size="16px" />
      </div>
    );

    return (
      <Tooltip
        key={`${item.url || item.alt}-${index}`}
        content={item.desc ? `${item.alt} · ${item.desc}` : item.alt}
        placement="top"
        showArrow={false}
      >
        {content}
      </Tooltip>
    );
  };

  return (
    <section className={`blogroll${isMobile ? ' blogroll--mobile' : ''}`}>
      <header className="blogroll__header">
        <span className="blogroll__badge">
          <LinkIcon size="16px" />
        </span>
        <h3 className="blogroll__title">友站链接</h3>
        {loading ? null : (
          <Tag size="small" theme="primary" variant="light" shape="round">
            {`${blogroll.length}`}
          </Tag>
        )}
        <span className="blogroll__divider" />
      </header>

      <div className="blogroll__body">{renderBody()}</div>
    </section>
  );
}
