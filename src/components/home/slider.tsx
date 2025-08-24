import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { getCurrentTheme } from '../../constants/colors';
import { useTheme } from '../../hooks';
import sliders from '../../constants/sliders';

interface SliderProps {
  isMobile?: boolean;
}

export default function Slider({ isMobile = false }: SliderProps) {
  const colors = getCurrentTheme();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const swiperRef = useRef<any>(null);

  const handleSlideClick = (link: string) => {
    navigate(link);
  };

  // 根据主题确定文字和背景颜色
  const isDarkMode = theme === 'dark';
  const overlayTextColor = isDarkMode ? '#ffffff' : '#000000';

  const overlayBackground = isDarkMode
    ? 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7))'
    : 'linear-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.7))';

  const textShadow = isDarkMode
    ? '1px 1px 3px rgba(0,0,0,0.7)'
    : '1px 1px 3px rgba(0,0,0,0.3)';

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

  const overlayStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: overlayBackground,
    color: overlayTextColor,
    padding: isMobile ? '15px' : '20px',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '16px' : '20px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textShadow: textShadow,
  };

  const descStyles: React.CSSProperties = {
    fontSize: isMobile ? '12px' : '14px',
    opacity: 0.9,
    textShadow: textShadow,
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: isMobile ? 2 : 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
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
              <img
                src={slide.img}
                alt={slide.title}
                style={imageStyles}
                onError={(e) => {
                  // 图片加载失败时的处理
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div style={overlayStyles}>
                <h3 style={titleStyles}>{slide.title}</h3>
                <p style={descStyles}>{slide.desp}</p>
              </div>
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
