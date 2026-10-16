import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { getCurrentTheme } from '../../constants/colors';
import { useTheme } from '../../hooks';
import { Image, TooltipLite } from 'tdesign-react';
import { ImageErrorIcon } from 'tdesign-icons-react';
import sliders from '../../constants/sliders';
import type { JSX } from 'react/jsx-runtime';

interface SliderProps {
  isMobile?: boolean;
}

export default function Slider({ isMobile = false }: SliderProps): JSX.Element {
  const colors = getCurrentTheme();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const swiperRef = useRef<any>(null);

  const handleSlideClick = (link: string) => {
    navigate(link);
  };

  // 字幕条主题变量：统一使用深色半透明玻璃，避免亮色模式白底盖住图片
  const captionBg = 'var(--slider-caption-bg)';

  const captionStyles: React.CSSProperties = {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    width: 'auto',
    maxWidth: isMobile ? 'calc(100% - 92px)' : 'calc(100% - 116px)', // 右侧留出分页圆点位置
    minHeight: isMobile ? 38 : 44,
    padding: isMobile ? '8px 14px' : '10px 18px',
    borderRadius: 12,
    background: captionBg,
    border: '1px solid var(--slider-caption-border)',
    backdropFilter: 'blur(10px) saturate(120%)',
    WebkitBackdropFilter: 'blur(10px) saturate(120%)',
    color: 'var(--slider-caption-text)',
  };

  const captionTitleStyles: React.CSSProperties = {
    width: '100%',
    fontSize: isMobile ? 13 : 15,
    fontWeight: 600,
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'var(--slider-caption-text)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
  };

  const containerStyles: React.CSSProperties = {
    width: '100%',
    height: isMobile ? '200px' : '250px', // 调整高度适应图片比例
    marginBottom: isMobile ? '20px' : '0',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: colors.shadow,
  };

  const slideStyles: React.CSSProperties = {
    position: 'relative',
    cursor: 'pointer',
    height: '100%',
    background: colors.surface,
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // 改为 contain 以显示完整图片
    objectPosition: 'center',
  };

  return (
    <div style={containerStyles} data-theme={theme}>
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={!isMobile}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        style={{ height: '100%' }}
        onSlideChange={() => {
          // 重置定时器逻辑已由 disableOnInteraction: false 处理
        }}
      >
        {sliders.map((slide, index) => (
          <SwiperSlide key={index}>

            <div
              style={slideStyles}
              onClick={() => handleSlideClick(slide.link)}
            >

              <Image
                src={slide.img}
                alt={slide.title}
                style={imageStyles}
                error={
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageErrorIcon fillColor="transparent" strokeColor="currentColor" strokeWidth={2} style={{ width: '60%', height: '60%' }} />
                  </div>
                }
              />
              <TooltipLite content={slide.desp} placement="mouse">
                <div style={captionStyles}>
                  <span style={captionTitleStyles}>{slide.title}</span>
                </div>
              </TooltipLite>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        :root {
          --slider-caption-bg: rgba(0, 0, 0, 0.42);
          --slider-caption-border: rgba(255, 255, 255, 0.16);
          --slider-caption-text: rgba(255, 255, 255, 0.95);
          --slider-nav-bg: rgba(0, 0, 0, 0.28);
          --slider-nav-color: rgba(255, 255, 255, 0.9);
          --slider-bullet: rgba(255, 255, 255, 0.5);
          --slider-bullet-active: #fff;
        }

        :root[theme-mode="dark"] {
          --slider-caption-bg: rgba(0, 0, 0, 0.6);
          --slider-caption-border: rgba(255, 255, 255, 0.14);
          --slider-caption-text: rgba(255, 255, 255, 0.92);
          --slider-nav-bg: rgba(0, 0, 0, 0.5);
          --slider-nav-color: rgba(255, 255, 255, 0.92);
          --slider-bullet: rgba(255, 255, 255, 0.55);
          --slider-bullet-active: #fff;
        }

        .swiper-button-next,
        .swiper-button-prev {
          color: var(--slider-nav-color) !important;
          background: var(--slider-nav-bg) !important;
          backdrop-filter: blur(8px);
          border-radius: 50% !important;
          width: 40px !important;
          height: 40px !important;
        }

        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 18px !important;
        }

        .swiper-pagination {
          bottom: 28px !important;
          left: auto !important;
          right: 16px !important;
          width: auto !important;
        }

        .swiper-pagination-bullet {
          background: var(--slider-bullet) !important;
          opacity: 1 !important;
        }

        .swiper-pagination-bullet-active {
          background: var(--slider-bullet-active) !important;
        }
      `}</style>
    </div>
  );
}
