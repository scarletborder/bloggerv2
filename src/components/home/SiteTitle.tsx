import React, { useRef, useEffect, useCallback } from 'react';
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

const getComputedCSSColor = (cssVar: string): string => {
  if (typeof window === 'undefined') return '#007bff';

  if (!cssVar.startsWith('var(')) {
    return cssVar;
  }

  const varName = cssVar.replace(/var\((--[^)]+)\)/, '$1');

  const computedValue = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();

  return computedValue || '#007bff';
};

const SiteTitle: React.FC = () => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);

  const [titleSpring, titleApi] = useSpring(() => ({
    from: { scale: 0.8, opacity: 0, rotateY: -20, y: 20 },
    to: { scale: 1, opacity: 1, rotateY: 0, y: 0 },
    config: { tension: 120, friction: 14, mass: 1 },
  }));

  const [subtitleSpring, subtitleApi] = useSpring(() => ({
    from: { opacity: 0, x: -30, scale: 0.9 },
    to: { opacity: 1, x: 0, scale: 1 },
    delay: 300,
    config: { tension: 100, friction: 12 },
  }));

  const [glowSpring, glowApi] = useSpring(() => ({
    opacity: 0.3,
    config: { tension: 120, friction: 60 },
  }));

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

  useUpdateEffect(() => {
    particlesRef.current = [];
    titleApi.stop();
    subtitleApi.stop();
    glowApi.stop();
    mainTitleApi.stop();
    subTitleApi.stop();

    setTimeout(() => {
      titleApi.start({
        scale: 1, opacity: 1, rotateY: 0, y: 0,
        config: { tension: 120, friction: 14, mass: 1 },
      });
      subtitleApi.start({
        opacity: 1, x: 0, scale: 1,
        config: { tension: 100, friction: 12 },
      });
      glowApi.start({
        opacity: 0.3, config: { tension: 120, friction: 60 },
      });
      mainTitleApi.start({
        opacity: 1, transform: 'translateY(0px) rotateX(0deg)',
        config: { tension: 120, friction: 14 },
      });
      subTitleApi.start({
        opacity: 1, transform: 'translateY(0px)',
        config: { tension: 100, friction: 12 },
      });
    }, 50);
  }, [theme, titleApi, subtitleApi, glowApi, mainTitleApi, subTitleApi]);

  const bind = useGesture({
    onMove: ({ xy: [x, y] }) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mousePos.current = { x: x - rect.left, y: y - rect.top };
      }
    },
    onHover: ({ hovering }) => {
      isHovering.current = hovering || false;
      if (hovering) {
        titleApi.start({ scale: 1.05, rotateY: 2, config: { tension: 300, friction: 20 } });
        subtitleApi.start({ scale: 1.02, x: 5, config: { tension: 300, friction: 20 } });
      } else {
        titleApi.start({ scale: 1, rotateY: 0, config: { tension: 200, friction: 15 } });
        subtitleApi.start({ scale: 1, x: 0, config: { tension: 200, friction: 15 } });
      }
    },
  });

  const createParticle = useCallback((x: number, y: number): Particle => {
    const currentColors = getCurrentTheme();
    let primaryColor = '#007bff';
    let primaryHoverColor = '#0056b3';
    try {
      primaryColor = getComputedCSSColor(currentColors.primary);
      primaryHoverColor = getComputedCSSColor(currentColors.primaryHover);
    } catch (error) {
      console.warn('Failed to get computed colors, using fallback', error);
    }
    return {
      id: Math.random(), x, y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3 - 1,
      life: 0, maxLife: 80 + Math.random() * 100,
      size: 2 + Math.random() * 4,
      color: Math.random() > 0.5 ? primaryColor : primaryHoverColor,
      opacity: 0.8,
    };
  }, []);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const nextParticles: Particle[] = [];
      for (const particle of particlesRef.current) {
        const nextLife = particle.life + 1;
        if (nextLife < particle.maxLife) {
          const lifeRatio = nextLife / particle.maxLife;
          const nextOpacity = 0.8 * (1 - lifeRatio) ** 2;
          if (nextOpacity > 0.01) {
            const newParticle = { ...particle, life: nextLife, x: particle.x + particle.vx, y: particle.y + particle.vy, vx: particle.vx * 0.98, vy: particle.vy * 0.98, opacity: nextOpacity };
            ctx.save();
            ctx.globalAlpha = newParticle.opacity;
            ctx.fillStyle = newParticle.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = newParticle.color;
            ctx.beginPath();
            ctx.arc(newParticle.x, newParticle.y, newParticle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            nextParticles.push(newParticle);
          }
        }
      }
      if (isHovering.current && Math.random() < 0.4 && nextParticles.length < 50) {
        const offsetX = (Math.random() - 0.5) * 120;
        const offsetY = (Math.random() - 0.5) * 80;
        nextParticles.push(createParticle(mousePos.current.x + offsetX, mousePos.current.y + offsetY));
      }
      particlesRef.current = nextParticles;
    } catch (error) {
      console.warn('Particle rendering error:', error);
      particlesRef.current = [];
    }
  }, [createParticle]);

  useEffect(() => {
    let glowTimer: number;
    let isActive = true;
    const animateGlow = () => {
      if (!isActive) return;
      glowApi.start({
        opacity: 0.6, config: { duration: 2000 },
        onRest: () => {
          if (!isActive) return;
          glowApi.start({
            opacity: 0.2, config: { duration: 2000 },
            onRest: () => {
              if (isActive) {
                glowTimer = setTimeout(animateGlow, 100);
              }
            },
          });
        },
      });
    };
    glowTimer = setTimeout(animateGlow, 1000);
    return () => {
      isActive = false;
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

      let animationFrameId: number;
      const animationLoop = () => {
        renderFrame();
        animationFrameId = requestAnimationFrame(animationLoop);
      };
      animationLoop();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [renderFrame]);

  const colors = getCurrentTheme();
  const computedPrimaryColor = getComputedCSSColor(colors.primary);

  const containerStyles: React.CSSProperties = { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: '200px', maxHeight: '25vh', overflow: 'hidden', cursor: 'pointer', userSelect: 'none' };
  const canvasStyles: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 };
  const titleContainerStyles: React.CSSProperties = { position: 'relative', zIndex: 2, textAlign: 'center' };

  return (
    <div ref={containerRef} style={containerStyles} {...bind()}>
      <canvas ref={canvasRef} style={canvasStyles} />
      <animated.div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '200px', background: `radial-gradient(ellipse, ${computedPrimaryColor}33, transparent)`, filter: 'blur(30px)', zIndex: 0, opacity: glowSpring.opacity }} />
      <div style={titleContainerStyles}>
        <animated.div style={titleSpring}>
          <div style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: '900', marginBottom: '8px', display: 'flex', justifyContent: 'center', gap: '2px' }}>
            {mainTitleTrail.map((style, index) => (
              <animated.span key={index} style={{ ...style, background: `linear-gradient(45deg, ${colors.primary}, ${colors.primaryHover})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: `0 0 20px ${computedPrimaryColor}66`, display: 'inline-block' }}>
                {mainTitle[index]}
              </animated.span>
            ))}
          </div>
        </animated.div>
        <animated.div style={subtitleSpring}>
          <div style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: '300', letterSpacing: '3px', display: 'flex', justifyContent: 'center', gap: '1px' }}>
            {subTitleTrail.map((style, index) => (
              <animated.span key={index} style={{ ...style, color: colors.textSecondary, display: 'inline-block' }}>
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
