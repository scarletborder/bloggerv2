import React from 'react';
import './styles.css';

interface ToolsPaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
}

const Pagination: React.FC<ToolsPaginationProps> = ({ current, total, pageSize, onChange }) => {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="tools-pagination">
      <button onClick={() => onChange(current - 1, pageSize)} disabled={current === 1}>
        上一页
      </button>
      <span>{current} / {totalPages}</span>
      <button onClick={() => onChange(current + 1, pageSize)} disabled={current >= totalPages}>
        下一页
      </button>
    </div>
  );
};

export default Pagination;
