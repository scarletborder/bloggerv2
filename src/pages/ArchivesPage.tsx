import React, { useState, useCallback } from 'react';
import { isMobile } from 'react-device-detect';
import { useInfiniteScroll } from 'ahooks';
import { GetPostListByCategories, GetPostListByDate } from '../services/PostList';
import { getCurrentTheme } from '../constants/colors';
import TagsFilter from '../components/archives/TagsFilter';
import DateFilter from '../components/archives/DateFilter';
import ResultsDisplay from '../components/archives/ResultsDisplay';

type SearchMode = 'none' | 'tag' | 'date';

export default function ArchivesPage() {
  const colors = getCurrentTheme();
  const [searchMode, setSearchMode] = useState<SearchMode>('none');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchYear, setSearchYear] = useState<number>(0);
  const [searchMonth, setSearchMonth] = useState<number>(0);

  // 标签搜索的无限滚动
  const {
    data: tagData,
    loading: tagLoading,
    loadMore: tagLoadMore,
    loadingMore: tagLoadingMore,
    noMore: tagNoMore,
    reload: tagReload,
  } = useInfiniteScroll(
    async (d) => {
      if (searchMode !== 'tag' || !selectedTag) return { list: [], nextId: undefined };

      const startIndex = d?.list ? d.list.length : 0;
      const result = await GetPostListByCategories({
        categories: [selectedTag],
        startIndex,
        pageSize: 10,
      });

      return {
        list: [...(d?.list || []), ...result.list],
        nextId: result.list.length > 0 ? 'more' : undefined,
      };
    },
    {
      isNoMore: (d) => d?.nextId === undefined,
      manual: true,
    }
  );

  // 日期搜索的无限滚动
  const {
    data: dateData,
    loading: dateLoading,
    loadMore: dateLoadMore,
    loadingMore: dateLoadingMore,
    noMore: dateNoMore,
    reload: dateReload,
  } = useInfiniteScroll(
    async (d) => {
      if (searchMode !== 'date' || !searchYear || !searchMonth) return { list: [], nextId: undefined };

      const startIndex = d?.list ? d.list.length : 0;
      const result = await GetPostListByDate({
        year: searchYear,
        month: searchMonth,
        startIndex,
        pageSize: 10,
      });

      return {
        list: [...(d?.list || []), ...result.list],
        nextId: result.list.length > 0 ? 'more' : undefined,
      };
    },
    {
      isNoMore: (d) => d?.nextId === undefined,
      manual: true,
    }
  );

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTag(tag);
    setSearchMode('tag');
    tagReload();
  }, [tagReload]);

  const handleDateSearch = useCallback((year: number, month: number) => {
    setSearchYear(year);
    setSearchMonth(month);
    setSearchMode('date');
    dateReload();
  }, [dateReload]);

  // 获取当前显示的数据
  const getCurrentData = () => {
    switch (searchMode) {
      case 'tag':
        return tagData;
      case 'date':
        return dateData;
      default:
        return undefined;
    }
  };

  const getCurrentLoading = () => {
    switch (searchMode) {
      case 'tag':
        return tagLoading;
      case 'date':
        return dateLoading;
      default:
        return false;
    }
  };

  const getCurrentLoadMore = () => {
    switch (searchMode) {
      case 'tag':
        return tagLoadMore;
      case 'date':
        return dateLoadMore;
      default:
        return () => { };
    }
  };

  const getCurrentLoadingMore = () => {
    switch (searchMode) {
      case 'tag':
        return tagLoadingMore;
      case 'date':
        return dateLoadingMore;
      default:
        return false;
    }
  };

  const getCurrentNoMore = () => {
    switch (searchMode) {
      case 'tag':
        return tagNoMore;
      case 'date':
        return dateNoMore;
      default:
        return false;
    }
  };

  const getEmptyMessage = () => {
    switch (searchMode) {
      case 'tag':
        return `标签"${selectedTag}"下暂无文章`;
      case 'date':
        return `${searchYear}年${searchMonth}月暂无文章`;
      default:
        return '请选择标签或日期来搜索文章';
    }
  };

  // 样式定义
  const containerStyles: React.CSSProperties = {
    maxHeight: isMobile ? "unset" : '90vh',
    backgroundColor: colors.background,
    color: colors.text,
    padding: isMobile ? 'unset 8px' : '18px 20px',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '2em' : '28px',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: isMobile ? '24px' : '32px',
    background: `linear-gradient(45deg, ${colors.primary}, ${colors.primaryHover})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  // PC版布局样式
  const pcContentStyles: React.CSSProperties = {
    display: 'flex',
    gap: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    height: 'calc(100vh - 200px)',
  };

  const pcLeftPanelStyles: React.CSSProperties = {
    width: '350px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const pcTagsFilterStyles: React.CSSProperties = {
    flex: '0 0 60%',
  };

  const pcDateFilterStyles: React.CSSProperties = {
    flex: '0 0 auto',
  };

  const pcRightPanelStyles: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  // 移动版布局样式
  const mobileContentStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  if (isMobile) {
    return (
      <div style={containerStyles}>
        <h1 style={titleStyles}>📚 文章归档</h1>

        <div style={mobileContentStyles}>
          <TagsFilter onTagSelect={handleTagSelect} selectedTag={selectedTag} />
          <DateFilter onDateSearch={handleDateSearch} />
          <ResultsDisplay
            data={getCurrentData()}
            loading={getCurrentLoading()}
            loadMore={getCurrentLoadMore()}
            loadingMore={getCurrentLoadingMore()}
            noMore={getCurrentNoMore()}
            emptyMessage={getEmptyMessage()}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <h1 style={titleStyles}>📚 文章归档</h1>

      <div style={pcContentStyles}>
        <div style={pcLeftPanelStyles}>
          <div style={pcTagsFilterStyles}>
            <TagsFilter onTagSelect={handleTagSelect} selectedTag={selectedTag} />
          </div>
          <div style={pcDateFilterStyles}>
            <DateFilter onDateSearch={handleDateSearch} />
          </div>
        </div>

        <div style={pcRightPanelStyles}>
          <ResultsDisplay
            data={getCurrentData()}
            loading={getCurrentLoading()}
            loadMore={getCurrentLoadMore()}
            loadingMore={getCurrentLoadingMore()}
            noMore={getCurrentNoMore()}
            emptyMessage={getEmptyMessage()}
          />
        </div>
      </div>
    </div>
  );
}