import { usePagination, useTitle } from 'ahooks';
import type { JSX } from 'react/jsx-runtime';
import { useNavigate } from 'react-router-dom';
import { GetPageList } from '../services/PageList';
import ToolsList from '../components/pages/ToolsList';
import Pagination from '../components/pages/ToolsPagination';

function PagesPage(): JSX.Element {
  const navigate = useNavigate();
  useTitle('Pages - 绯境之外');

  const pageSize = window.innerWidth > 768 ? 12 : 6;

  const { data, loading, pagination } = usePagination(
    ({ current, pageSize: ps }) => GetPageList({ 'start-index': (current - 1) * ps + 1, 'max-results': ps }),
    {
      defaultPageSize: pageSize,
    },
  );

  const handleItemClick = (path: string) => {
    navigate(`/${path}`);
  };

  return (
    <div>
      <h1
        style={{
          textAlign: 'center',
          margin: '30px 0 20px 0',
          fontSize: '2.5rem',
          fontWeight: 'bold',
        }}
      >
        静态页面
      </h1>
      {loading ? (
        <p>加载中...</p>
      ) : (
        <ToolsList list={data?.list || []} onItemClick={handleItemClick} />
      )}
      <Pagination
        current={pagination.current}
        total={data?.total || 0}
        pageSize={pagination.pageSize}
        onChange={pagination.onChange}
      />
    </div>
  );
}

export default PagesPage;
