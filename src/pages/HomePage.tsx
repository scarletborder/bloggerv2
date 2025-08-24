import { isMobile } from 'react-device-detect';
import PostList from '../components/home/PostList';
import PostListMobile from '../components/home/PostList-M';

function HomePage() {
  return (
    <div>
      <h1>首页</h1>
      <p>欢迎来到我的博客！这里是一些最新的文章和动态。</p>
      {isMobile ? <PostListMobile /> : <PostList />}
    </div>
  );
}

export default HomePage;