import { isMobile } from "react-device-detect";
import WelcomeSection from "../components/home/WelcomeSection";
import Slider from "../components/home/slider";
import PostListSimple from "../components/home/PostListSimple";
import PostListMobile from "../components/home/PostList-M";
import Blogroll from "../components/home/Blogroll";
import SiteTitle from "../components/home/SiteTitle";
import { useTitle } from "ahooks";

function HomePage() {
  useTitle("Home-绯境之外");
  if (isMobile) {
    // Mobile Layout
    return (
      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
        }}
      >
        <WelcomeSection isMobile={true} />
        <Slider isMobile={true} />
        <PostListMobile />
        <Blogroll isMobile={true} />
      </div>
    );
  }

  // PC Layout
  return (
    <div
      style={{
        display: "flex",
        gap: "63px", // 增加左右内容间距
        maxWidth: "1500px", // 进一步增加最大宽度
        margin: "0 auto",
        padding: "5px", // 减少到最小padding
        minHeight: "100vh",
        paddingTop: "32px",
      }}
    >
      {/* Left Side - 65% */}
      <div
        style={{
          flex: "0 0 65%",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <div style={{ flex: "0 0 auto" }}>
          <SiteTitle />
        </div>

        {/* Post List - 90% height */}
        <div style={{ flex: "1" }}>
          <PostListSimple isMobile={false} />
        </div>
      </div>

      {/* Right Side - 30% */}
      <div
        style={{
          flex: "0 0 30%",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          minWidth: "400px", // 进一步增加最小宽度
        }}
      >
        {/* Slider */}
        <div style={{ flex: "0 0 250px" }}>
          <Slider isMobile={false} />
        </div>

        {/* Welcome Section - 10% height */}
        <div style={{ flex: "0 0 auto" }}>
          <WelcomeSection isMobile={false} />
        </div>

        {/* PC端banner */}
        <div style={{ margin: "12px 0 0 0", textAlign: "left" }}>
          <img
            src="https://s2.loli.net/2025/05/16/ke3yL5RDTOsU4vg.png"
            alt="footer banner"
            style={{
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

        {/* Blogroll - takes remaining space */}
        <div style={{ flex: "1" }}>
          <Blogroll isMobile={false} />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
