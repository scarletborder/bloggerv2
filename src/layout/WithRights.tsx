import React from "react";
import { isMobile } from "react-device-detect";

// 全局footer信息对象数组
const FOOTER_SECTIONS = [
  {
    title: "",
    items: [
      "绯境之外",
      `© 2022 - ${new Date().getFullYear()} Copyright 绯境之外`,
      `Theme by scarletborder`,
      `Powered by Blogger and React`,
    ],
  },
  {
    title: "联系方式",
    items: ["邮箱: baishuibeef@gmail.com", "scarletborder / 黯界绯"],
  },
];

interface WithRightsProps {
  children: React.ReactNode;
}

const WithRights: React.FC<WithRightsProps> = ({ children }) => {
  const containerStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "inherit", // 继承而不是覆盖
    color: "inherit", // 继承而不是覆盖
  };

  const mainContentStyles: React.CSSProperties = {
    flex: 1,
    width: "100%",
  };

  const footerStyles: React.CSSProperties = {
    backgroundColor: "var(--surface-color)",
    borderTop: "1px solid var(--border-color)",
    padding: isMobile ? "20px 16px" : "24px 48px",
    marginTop: "auto",
    color: "var(--text-secondary-color)",
  };

  const footerContentStyles: React.CSSProperties = {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "center" : "flex-start",
    gap: isMobile ? "16px" : "32px",
    flexDirection: "row", // 手机端也横向排布
    flexWrap: isMobile ? "wrap" : "nowrap",
  };

  const sectionStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: 0,
    flex: 1,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text-color)",
    marginBottom: "8px",
  };

  const copyrightStyles: React.CSSProperties = {
    fontSize: "14px",
    color: "var(--text-secondary-color)",
    lineHeight: "1.4",
  };

  const companyStyles: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--text-color)",
    marginBottom: "4px",
  };

  return (
    <div style={containerStyles}>
      <main style={mainContentStyles}>{children}</main>
      <footer style={footerStyles}>
        <div style={footerContentStyles}>
          {FOOTER_SECTIONS.map((section, idx) => (
            <div style={sectionStyles} key={idx}>
              {section.title && <div style={titleStyles}>{section.title}</div>}
              {section.items.map((item, i) => (
                <div
                  style={
                    idx === 0
                      ? i === 0
                        ? companyStyles
                        : copyrightStyles
                      : copyrightStyles
                  }
                  key={i}
                >
                  {item}
                </div>
              ))}
              {/* PC端footer banner已移至HomePage.tsx */}
            </div>
          ))}
        </div>
        {/* 手机视图下，footerContent下方独立显示banner */}
        {isMobile && (
          <div
            style={{
              margin: "16px auto 0 auto",
              width: "100%",
              maxWidth: "320px",
              textAlign: "left",
            }}
          >
            <img
              src="https://s2.loli.net/2025/05/16/ke3yL5RDTOsU4vg.png"
              alt="footer banner"
              style={{
                maxWidth: "320px",
                width: "100%",
                height: "auto",
                maxHeight: "96px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        )}
      </footer>
    </div>
  );
};

export default WithRights;
