import React, { useRef, useEffect } from 'react';
import { useSpring, animated, useTrail } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { getCurrentTheme } from '../../constants/colors';
import { useUpdateEffect } from 'ahooks';
import { useTheme } from '../../hooks';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
}

// 辅助函数：从CSS变量获取实际的颜色值
const getComputedCSSColor = (cssVar: string): string => {
  if (typeof window === 'undefined') return '#007bff'; // 默认颜色

  // 如果已经是具体的颜色值，直接返回
  if (!cssVar.startsWith('var(')) {
    return cssVar;
  }

  // 从CSS变量中提取变量名
  const varName = cssVar.replace(/var\((--[^)]+)\)/, '$1');

  // 获取计算后的样式值
  const computedValue = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();

  return computedValue || '#007bff'; // 如果获取失败，返回默认颜色
};

const SiteTitle: React.FC = () => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const mousePos = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);

  // 主标题动画
  const [titleSpring, titleApi] = useSpring(() => ({
    from: {
      scale: 0.8,
      opacity: 0,
      rotateY: -20,
      y: 20,
    },
    to: {
      scale: 1,
      opacity: 1,
      rotateY: 0,
      y: 0,
    },
    config: {
      tension: 120,
      friction: 14,
      mass: 1,
    },
  }));

  // 副标题动画
  const [subtitleSpring, subtitleApi] = useSpring(() => ({
    from: {
      opacity: 0,
      x: -30,
      scale: 0.9,
    },
    to: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    delay: 300,
    config: {
      tension: 100,
      friction: 12,
    },
  }));

  // 修复：使用更稳定的光晕动画配置，避免无限循环
  const [glowSpring, glowApi] = useSpring(() => ({
    opacity: 0.3,
    config: { tension: 120, friction: 60 },
  }));

  // 字符逐个显示动画
  const mainTitle = '绯境之外';
  const subTitle = 'Outside of Scarlet';

  const [mainTitleTrail, mainTitleApi] = useTrail(mainTitle.length, () => ({
    from: { opacity: 0, transform: 'translateY(20px) rotateX(90deg)' },
    to: { opacity: 1, transform: 'translateY(0px) rotateX(0deg)' },
    delay: 100,
    config: { tension: 120, friction: 14 },
  }));

  const [subTitleTrail, subTitleApi] = useTrail(subTitle.length, () => ({
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: 800,
    config: { tension: 100, friction: 12 },
  }));

  // 主题变化时清除所有粒子并优雅地重置动画
  useUpdateEffect(() => {
    console.log('theme changed:', theme);
    // 清除粒子
    particlesRef.current = [];

    // 温和地停止所有动画，避免突兀的中断
    titleApi.stop();
    subtitleApi.stop();
    glowApi.stop();
    mainTitleApi.stop();
    subTitleApi.stop();

    // 使用较短的延迟重新启动动画，确保平滑过渡
    setTimeout(() => {
      titleApi.start({
        scale: 1,
        opacity: 1,
        rotateY: 0,
        y: 0,
        config: { tension: 120, friction: 14, mass: 1 },
      });

      subtitleApi.start({
        opacity: 1,
        x: 0,
        scale: 1,
        config: { tension: 100, friction: 12 },
      });

      glowApi.start({
        opacity: 0.3,
        config: { tension: 120, friction: 60 },
      });

      // 重置字符动画
      mainTitleApi.start({
        opacity: 1,
        transform: 'translateY(0px) rotateX(0deg)',
        config: { tension: 120, friction: 14 },
      });

      subTitleApi.start({
        opacity: 1,
        transform: 'translateY(0px)',
        config: { tension: 100, friction: 12 },
      });
    }, 50); // 短暂延迟确保主题变化完成
  }, [theme, titleApi, subtitleApi, glowApi, mainTitleApi, subTitleApi]);

  // 手势处理
  const bind = useGesture({
    onMove: ({ xy: [x, y] }) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mousePos.current = {
          x: x - rect.left,
          y: y - rect.top,
        };
      }
    },
    onHover: ({ hovering }) => {
      isHovering.current = hovering || false;

      if (hovering) {
        titleApi.start({
          scale: 1.05,
          rotateY: 2,
          config: { tension: 300, friction: 20 },
        });
        subtitleApi.start({
          scale: 1.02,
          x: 5,
          config: { tension: 300, friction: 20 },
        });
      } else {
        titleApi.start({
          scale: 1,
          rotateY: 0,
          config: { tension: 200, friction: 15 },
        });
        subtitleApi.start({
          scale: 1,
          x: 0,
          config: { tension: 200, friction: 15 },
        });
      }
    },
  });

  // 修复：创建粒子时获取实际的颜色值，使用缓存避免频繁计算
  const createParticle = (x: number, y: number): Particle => {
    const currentColors = getCurrentTheme();
    // 使用try-catch确保颜色获取不会导致错误
    let primaryColor = '#007bff';
    let primaryHoverColor = '#0056b3';

    try {
      primaryColor = getComputedCSSColor(currentColors.primary);
      primaryHoverColor = getComputedCSSColor(currentColors.primaryHover);
    } catch (error) {
      console.warn('Failed to get computed colors, using fallback', error);
    }

    return {
      id: Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3 - 1,
      life: 0,
      maxLife: 80 + Math.random() * 100,
      size: 2 + Math.random() * 4,
      color: Math.random() > 0.5 ? primaryColor : primaryHoverColor,
      opacity: 0.8,
    };
  };

  // 粒子更新与绘制 - 添加错误处理确保稳定性
  const updateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const livingParticles: Particle[] = [];

      for (const particle of particlesRef.current) {
        particle.life++;

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        const lifeRatio = particle.life / particle.maxLife;
        particle.opacity = 0.8 * Math.pow(1 - lifeRatio, 2);

        if (particle.opacity > 0.01) {
          ctx.save();
          ctx.globalAlpha = particle.opacity;
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = particle.color;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (particle.life < particle.maxLife) {
          livingParticles.push(particle);
        }
      }

      // 只在鼠标悬停且粒子数量不过多时创建新粒子
      if (
        isHovering.current &&
        Math.random() < 0.4 &&
        livingParticles.length < 50
      ) {
        const offsetX = (Math.random() - 0.5) * 120;
        const offsetY = (Math.random() - 0.5) * 80;
        livingParticles.push(
          createParticle(
            mousePos.current.x + offsetX,
            mousePos.current.y + offsetY,
          ),
        );
      }

      particlesRef.current = livingParticles;
    } catch (error) {
      console.warn('Particle rendering error:', error);
      // 清除粒子避免继续出错
      particlesRef.current = [];
    }

    animationFrameRef.current = requestAnimationFrame(updateParticles);
  };

  // 安全的光晕脉动动画 - 使用更稳定的实现
  useEffect(() => {
    let glowTimer: number;
    let isActive = true; // 标记动画是否应该继续

    const startGlowAnimation = () => {
      const animateGlow = () => {
        if (!isActive) return; // 如果组件已卸载，停止动画

        glowApi.start({
          opacity: 0.6,
          config: { duration: 2000 },
          onRest: () => {
            if (!isActive) return;
            glowApi.start({
              opacity: 0.2,
              config: { duration: 2000 },
              onRest: () => {
                if (isActive) {
                  glowTimer = setTimeout(animateGlow, 100);
                }
              },
            });
          },
        });
      };

      if (isActive) {
        glowTimer = setTimeout(animateGlow, 1000);
      }
    };

    startGlowAnimation();

    return () => {
      isActive = false; // 标记为非活跃状态
      if (glowTimer) {
        clearTimeout(glowTimer);
      }
      glowApi.stop();
    };
  }, [glowApi]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (canvas && container) {
      const resizeCanvas = () => {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      updateParticles();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, []);

  // 获取用于显示的颜色（CSS变量）
  const colors = getCurrentTheme();

  // 获取用于Canvas的实际颜色值
  const computedPrimaryColor = getComputedCSSColor(colors.primary);

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    minHeight: '200px',
    maxHeight: '25vh',
    overflow: 'hidden',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const canvasStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
  };

  const titleContainerStyles: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
  };

  return (
    <div ref={containerRef} style={containerStyles} {...bind()}>
      {/* 粒子画布 */}
      <canvas ref={canvasRef} style={canvasStyles} />

      {/* 背景光晕 - 使用实际颜色值 */}
      <animated.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '200px',
          background: `radial-gradient(ellipse, ${computedPrimaryColor}33, transparent)`,
          filter: 'blur(30px)',
          zIndex: 0,
          opacity: glowSpring.opacity,
        }}
      />

      <div style={titleContainerStyles}>
        {/* 主标题 */}
        <animated.div style={titleSpring}>
          <div
            style={{
              fontSize: 'clamp(3rem, 6vw, 4.5rem)',
              fontWeight: '900',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'center',
              gap: '2px',
            }}
          >
            {mainTitleTrail.map((style, index) => (
              <animated.span
                key={index}
                style={{
                  ...style,
                  background: `linear-gradient(45deg, ${colors.primary}, ${colors.primaryHover})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 0 20px ${computedPrimaryColor}66`,
                  display: 'inline-block',
                }}
              >
                {mainTitle[index]}
              </animated.span>
            ))}
          </div>
        </animated.div>

        {/* 副标题 */}
        <animated.div style={subtitleSpring}>
          <div
            style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              fontWeight: '300',
              letterSpacing: '3px',
              display: 'flex',
              justifyContent: 'center',
              gap: '1px',
            }}
          >
            {subTitleTrail.map((style, index) => (
              <animated.span
                key={index}
                style={{
                  ...style,
                  color: colors.textSecondary,
                  display: 'inline-block',
                }}
              >
                {subTitle[index] === ' ' ? '\u00A0' : subTitle[index]}
              </animated.span>
            ))}
          </div>
        </animated.div>
      </div>
    </div>
  );
};

export default SiteTitle;
