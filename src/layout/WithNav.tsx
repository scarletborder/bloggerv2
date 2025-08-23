import React from 'react';
import ThemeToggle from '../components/ThemeToggle';

interface NavButtonProps {
  title: string;
  to: string;
}

const NavButton: React.FC<NavButtonProps> = ({ title, to }) => {
  const buttonStyles: React.CSSProperties = {
    padding: '8px 16px',
    textDecoration: 'none',
    color: 'var(--text-color)',
    fontSize: '16px',
    fontWeight: '500',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
  };

  const buttonHoverStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: 'var(--primary-hover-color)',
    color: 'var(--bg-color)',
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <a
      href={to}
      style={isHovered ? buttonHoverStyles : buttonStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {title}
    </a>
  );
};

interface SearchInputProps {
}

const SearchInput: React.FC<SearchInputProps> = () => {
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyles: React.CSSProperties = {
    padding: '8px 40px 8px 12px',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--surface-color)',
    color: 'var(--text-color)',
    fontSize: '14px',
    outline: 'none',
    width: '200px',
    transition: 'all 0.2s ease',
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    color: 'var(--text-secondary-color)',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyles}>
      <input
        type="text"
        placeholder="Search..."
        style={inputStyles}
      />
      <span style={iconStyles}>
        {/* Font Awesome SVG 放大镜图标 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width="16"
          height="16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M500.3 443.7l-99.7-99.7C429.6 305.5 448 261.6 448 213.3 448 95.5 352.5 0 234.7 0S21.3 95.5 21.3 213.3 116.8 426.7 234.7 426.7c48.3 0 92.2-18.4 130.7-47.4l99.7 99.7c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3zM234.7 384c-94.1 0-170.7-76.6-170.7-170.7S140.6 42.7 234.7 42.7 405.3 119.3 405.3 213.3 328.8 384 234.7 384z" />
        </svg>
      </span>
    </div>
  );
};

interface WithNavProps {
  children: React.ReactNode;
}

const WithNav: React.FC<WithNavProps> = ({ children }) => {
  const navStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    height: '60px',
    backgroundColor: 'var(--surface-color)',
    borderBottom: '1px solid var(--border-color)',
    boxShadow: '0 2px 4px var(--shadow-color)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    width: '100%',
    boxSizing: 'border-box',
  };

  const leftSectionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    minWidth: 0, // 防止内容溢出
  };

  const rightSectionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px', // 添加间距
    minWidth: 0, // 防止内容溢出
  };

  const containerStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: 'inherit', // 继承而不是覆盖
    color: 'inherit', // 继承而不是覆盖
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    width: '100%',
  };

  const navItems = [
    { title: 'HOME', to: '/' },
    { title: 'ABOUT', to: '/about' },
    { title: 'TOOLS', to: '/tools' },
  ];

  return (
    <div style={containerStyles}>
      <nav style={navStyles}>
        <div style={leftSectionStyles}>
          {navItems.map((item) => (
            <NavButton
              key={item.title}
              title={item.title}
              to={item.to}
            />
          ))}
        </div>
        <div style={rightSectionStyles}>
          <SearchInput />
          <ThemeToggle />
        </div>
      </nav>
      <main style={contentStyles}>
        {children}
      </main>
    </div>
  );
};

export default WithNav;