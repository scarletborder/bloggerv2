import React from "react";
import { isMobile } from "react-device-detect";
import ThemeToggle from "../components/ThemeToggle";
import useTheme from "../hooks/useTheme";
import SearchInput from "../components/search/SearchInput";

interface NavButtonProps {
  title: string;
  to: string;
}

const NavButton: React.FC<NavButtonProps> = ({ title, to }) => {
  const buttonStyles: React.CSSProperties = {
    padding: "8px 16px",
    textDecoration: "none",
    color: "var(--text-color)",
    fontSize: "16px",
    fontWeight: "500",
    borderRadius: "4px",
    transition: "all 0.2s ease",
    cursor: "pointer",
    backgroundColor: "transparent",
    border: "none",
  };

  const buttonHoverStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: "var(--primary-hover-color)",
    color: "var(--bg-color)",
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

// 移动端导航下拉选择器组件
const MobileNavSelect: React.FC<{
  navItems: { title: string; to: string }[];
}> = ({ navItems }) => {
  const handleNavChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUrl = event.target.value;
    if (selectedUrl) {
      window.location.href = selectedUrl;
    }
  };

  const selectStyles: React.CSSProperties = {
    padding: "8px 8px",
    borderRadius: "4px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--surface-color)",
    color: "var(--text-color)",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
    width: "auto",
    minWidth: "100px",
  };

  return (
    <select style={selectStyles} onChange={handleNavChange} defaultValue="">
      <option value="" disabled>
        导航菜单
      </option>
      {navItems.map((item) => (
        <option key={item.title} value={item.to}>
          {item.title}
        </option>
      ))}
    </select>
  );
};

// 移动端主题切换按钮组件
const MobileThemeButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const buttonStyles: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--surface-color)",
    color: "var(--text-color)",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    minWidth: "40px",
    height: "36px",
  };

  return (
    <button style={buttonStyles} onClick={toggleTheme} aria-label="切换主题">
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
};

interface WithNavProps {
  children: React.ReactNode;
}

const WithNav: React.FC<WithNavProps> = ({ children }) => {
  const navStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: isMobile ? "0 16px" : "0 24px",
    height: isMobile ? "56px" : "60px",
    backgroundColor: "var(--surface-color)",
    borderBottom: "1px solid var(--border-color)",
    boxShadow: "0 2px 4px var(--shadow-color)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "100%",
    maxWidth: "100vw",
    boxSizing: "border-box",
    overflowX: "hidden",
  };

  const leftSectionStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "12px" : "24px",
    minWidth: 0, // 防止内容溢出
    flex: isMobile ? "1" : "initial",
  };

  const rightSectionStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "8px" : "16px", // 添加间距
    minWidth: 0, // 防止内容溢出
    flex: isMobile ? "0 0 auto" : "initial",
  };

  const containerStyles: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "inherit", // 继承而不是覆盖
    color: "inherit", // 继承而不是覆盖
    width: "100%",
    maxWidth: "100vw",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
    padding: isMobile ? "16px" : "0",
    boxSizing: "border-box",
  };

  const navItems = [
    { title: "HOME", to: "/" },
    { title: "ARCHIVES", to: "/archives" },
    { title: "TOOLS", to: "/tools" },
  ];

  return (
    <div style={containerStyles}>
      <nav style={navStyles}>
        <div style={leftSectionStyles}>
          {isMobile ? (
            <MobileNavSelect navItems={navItems} />
          ) : (
            navItems.map((item) => (
              <NavButton key={item.title} title={item.title} to={item.to} />
            ))
          )}
        </div>
        <div style={rightSectionStyles}>
          <SearchInput compact />
          {isMobile ? <MobileThemeButton /> : <ThemeToggle />}
        </div>
      </nav>
      <main style={contentStyles}>{children}</main>
    </div>
  );
};

export default WithNav;
