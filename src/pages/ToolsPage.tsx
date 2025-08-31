import { useTitle } from "ahooks";

function ToolsPage() {
  useTitle("Tools - 绯境之外");
  return (
    <div>
      <h1>工具页面</h1>
      <p>这里是一些实用工具的链接和介绍。</p>
    </div>
  );
}

export default ToolsPage;