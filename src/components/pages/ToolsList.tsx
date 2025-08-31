import React from 'react';
import type { PostItem } from '../../models/PostItem';
import './styles.css';

interface ToolsListProps {
  list: PostItem[];
  onItemClick: (path: string) => void;
}

const ToolsList: React.FC<ToolsListProps> = ({ list, onItemClick }) => {
  return (
    <div className="tools-list">
      {list.map((item) => (
        <div key={item._id} className="tool-item" onClick={() => onItemClick(item.path)}>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
        </div>
      ))}
    </div>
  );
};

export default ToolsList;
