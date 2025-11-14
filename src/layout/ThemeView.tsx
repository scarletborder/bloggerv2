import React from 'react';

interface ThemeViewProps {
  children: React.ReactNode;
}

const ThemeView: React.FC<ThemeViewProps> = ({ children }) => {
  const containerStyles: React.CSSProperties = {
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100vw',
    overflowX: 'hidden',
    position: 'relative',
    wordWrap: 'break-word',
  };

  return <div style={containerStyles}>{children}</div>;
};

export default ThemeView;
