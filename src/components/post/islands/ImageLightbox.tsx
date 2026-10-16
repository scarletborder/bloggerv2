import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getHighResImage, isDirectImageUrl } from '../../../utils/highResImage';

/**
 * 图片灯箱（岛屿组件）
 * 以事件委托的方式为容器内所有正文图片添加点击放大能力，
 * 覆盖层通过 Portal 挂到 body，避免受正文容器 overflow 影响。
 * 同时兼容 Blogger 自动为图片包裹的 <a> 外链（优先取外链原图）。
 */

interface ImageLightboxProps {
  /** 正文容器选择器 */
  containerSelector?: string;
}

const lightboxStyles = `
  .img-lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.92);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    cursor: zoom-out;
    animation: img-lightbox-fadein 0.2s ease;
  }
  .img-lightbox img {
    max-width: 100%;
    max-height: 92vh;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }
  @keyframes img-lightbox-fadein {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  containerSelector = '.post-body',
}) => {
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  /* 事件委托：点击正文图片时打开灯箱 */
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(containerSelector);
    if (!container) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.tagName !== 'IMG') return;

      const img = target as HTMLImageElement;
      const parentLink = img.closest('a');
      const href = parentLink?.getAttribute('href') || '';

      // 外链指向大图时优先使用外链地址，否则尝试高清化当前 src
      const src = href && isDirectImageUrl(href)
        ? href
        : getHighResImage(img.currentSrc || img.src);

      event.preventDefault();
      event.stopPropagation();
      setActiveSrc(src);
    };

    container.addEventListener('click', onClick);
    return () => container.removeEventListener('click', onClick);
  }, [containerSelector]);

  /* Esc 关闭 */
  useEffect(() => {
    if (!activeSrc) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveSrc(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeSrc]);

  if (!activeSrc) return null;

  return createPortal(
    <>
      <style>{lightboxStyles}</style>
      <div
        className='img-lightbox'
        role='dialog'
        aria-modal='true'
        aria-label='图片预览'
        onClick={() => setActiveSrc(null)}
      >
        <img src={activeSrc} alt='图片预览' />
      </div>
    </>,
    document.body,
  );
};

export default ImageLightbox;
