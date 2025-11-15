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

  // 根据主题确定文字和背景颜色
  const isDarkMode = theme === 'dark';

  const overlayBackground = isDarkMode
    ? 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7))'
    : 'linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.7))';

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
    <div style={containerStyles}>
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
                <div
                  style={{
                    width: '100%',
                    height: '56px',
                    padding: '0 16px',
                    lineHeight: '56px',
                    position: 'absolute',
                    bottom: '0',
                    color: 'var(--td-text-color-anti)',
                    backgroundImage: overlayBackground,
                    boxSizing: 'border-box',
                    zIndex: 1,
                  }}
                >
                  <span>{slide.title}</span>
                </div>
              </TooltipLite>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
          background: rgba(0,0,0,0.5) !important;
          border-radius: 50% !important;
          width: 40px !important;
          height: 40px !important;
        }
        
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 18px !important;
        }
        
        .swiper-pagination-bullet {
          background: rgba(255,255,255,0.7) !important;
        }
        
        .swiper-pagination-bullet-active {
          background: white !important;
        }
        
        .swiper-pagination {
          bottom: 10px !important;
        }
      `}</style>
    </div>
  );
}
