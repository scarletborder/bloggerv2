import React from 'react';
import { getCurrentTheme } from '../../constants/colors';

interface WelcomeSectionProps {
  isMobile?: boolean;
}

export default function WelcomeSection({ isMobile = false }: WelcomeSectionProps) {
  const colors = getCurrentTheme();

  const containerStyles: React.CSSProperties = {
    padding: isMobile ? '10px 0' : '5px 0', // 进一步减少padding
    marginBottom: isMobile ? '10px' : '3px', // 进一步减少margin
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '24px' : '20px',
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: '10px',
    margin: '0 0 10px 0',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: isMobile ? '16px' : '14px',
    color: colors.textSecondary,
    lineHeight: '1.6',
    margin: '0',
  };

  return (
    <div style={containerStyles}>
      <h1 style={titleStyles}>绯境之外</h1>
      <p style={descriptionStyles}>
        生活分享和记录技术的博客， <br />
        同时也兼作为社团的资料站 <br />
        博客还在完善阶段，目前是无人光临的孤立站点，一如既往的冷清呢~所以饮盏茶再走吧。
      </p>
    </div>
  );
}
