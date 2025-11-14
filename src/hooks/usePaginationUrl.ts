import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface UsePaginationUrlParams {
  defaultStartIndex?: number;
  defaultPageSize?: number;
}

interface PaginationUrlResult {
  startIndex: number;
  pageSize: number;
  updateUrl: (startIndex: number, pageSize: number) => void;
}

export function usePaginationUrl({
  defaultStartIndex = 0,
  defaultPageSize = 10,
}: UsePaginationUrlParams = {}): PaginationUrlResult {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 从URL参数中读取分页信息
  const startIndex =    parseInt(searchParams.get('startIndex') || String(defaultStartIndex))
    || defaultStartIndex;
  const pageSize =    parseInt(searchParams.get('pageSize') || String(defaultPageSize))
    || defaultPageSize;

  // 更新URL参数
  const updateUrl = useCallback(
    (newStartIndex: number, newPageSize: number) => {
      const params = new URLSearchParams(searchParams);

      // 如果是默认值，则移除参数以保持URL简洁
      if (newStartIndex === defaultStartIndex) {
        params.delete('startIndex');
      } else {
        params.set('startIndex', String(newStartIndex));
      }

      if (newPageSize === defaultPageSize) {
        params.delete('pageSize');
      } else {
        params.set('pageSize', String(newPageSize));
      }

      // 更新URL，使用 replace 而不是 push 避免创建过多历史记录
      const search = params.toString();
      navigate(search ? `?${search}` : '', { replace: true });
    },
    [searchParams, navigate, defaultStartIndex, defaultPageSize],
  );

  return {
    startIndex,
    pageSize,
    updateUrl,
  };
}
