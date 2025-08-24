import React, { useState, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { useInfiniteScroll, useLatest, useMemoizedFn } from 'ahooks';
import { GetPostListByCategories, GetPostListByDate } from '../services/PostList';
import { getCurrentTheme } from '../constants/colors';
import TagsFilter from '../components/archives/TagsFilter';
import DateFilter, { saveCacheForDate, type DateFilterRef } from '../components/archives/DateFilter';
import PostCacheManager from '../utils/postCache';
import ResultsDisplay from '../components/archives/ResultsDisplay';



type SearchMode = 'none' | 'tag' | 'date';

export default function ArchivesPage() {
  const colors = getCurrentTheme();
  const [searchMode, setSearchMode] = useState<SearchMode>('none');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchYear, setSearchYear] = useState<number>(0);
  const [searchMonth, setSearchMonth] = useState<number>(0);



  // 用于自动滚动加载的 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dateFilterRef = useRef<DateFilterRef>(null);

  // 使用useLatest确保在异步回调中获取最新值
  const latestSearchMode = useLatest(searchMode);
  const latestSelectedTag = useLatest(selectedTag);
  const latestSearchYear = useLatest(searchYear);
  const latestSearchMonth = useLatest(searchMonth);

  // 标签搜索的无限滚动
  const {
    data: tagData,
    loading: tagLoading,
    loadMore: _tagLoadMore,
    loadingMore: tagLoadingMore,
    noMore: tagNoMore,
    reload: tagReload,
  } = useInfiniteScroll(
    async (d) => {
      if (latestSearchMode.current !== 'tag' || !latestSelectedTag.current) return { list: [] };

      const startIndex = d?.list ? d.list.length : 0;
      const result = await GetPostListByCategories({
        categories: [latestSelectedTag.current],
        startIndex,
        pageSize: 10,
      });

      // 只返回新获取的数据，useInfiniteScroll 会自动累积
      return {
        list: result.list,
        noMore: result.list.length < 10, // 当返回的数据少于 pageSize 时，表示没有更多数据
      };
    },
    {
      target: scrollContainerRef,
      isNoMore: (d) => d?.noMore === true,
      manual: true,
      threshold: 100, // 距离底部100px时开始加载
    }
  );

  // 日期搜索的无限滚动
  const {
    data: dateData,
    loading: dateLoading,
    loadMore: _dateLoadMore,
    loadingMore: dateLoadingMore,
    noMore: dateNoMore,
    reload: dateReload,
  } = useInfiniteScroll(
    async (d) => {
      if (latestSearchMode.current !== 'date' || !latestSearchYear.current || !latestSearchMonth.current) return { list: [] };

      const startIndex = d?.list ? d.list.length : 0;
      const currentYear = latestSearchYear.current;
      const currentMonth = latestSearchMonth.current;
      
      console.log('useInfiniteScroll: Loading data for', currentYear, currentMonth, 'startIndex:', startIndex);

      // 如果是第一次加载，先检查缓存
      if (startIndex === 0) {
        const cachedPosts = await PostCacheManager.getCache(currentYear, currentMonth);
        if (cachedPosts !== null) {
          console.log('useInfiniteScroll: Using cached data:', cachedPosts.length, 'posts');
          return {
            list: cachedPosts,
            noMore: true, // 缓存数据是完整的，不需要分页
          };
        }
      }

      // 没有缓存或不是第一次加载，发起网络请求
      const result = await GetPostListByDate({
        year: currentYear,
        month: currentMonth,
        startIndex,
        pageSize: 10,
      });

      // 如果是第一次加载，保存到缓存
      if (startIndex === 0) {
        try {
          console.log('useInfiniteScroll: Saving cache for:', currentYear, currentMonth, 'Posts:', result.list.length);
          await saveCacheForDate(currentYear, currentMonth, result.list);
          // 更新缓存显示
          dateFilterRef.current?.updateCacheDisplay();
        } catch (error) {
          console.error('Failed to save cache:', error);
        }
      }

      // 返回网络请求的数据
      return {
        list: result.list,
        noMore: result.list.length < 10, // 当返回的数据少于 pageSize 时，表示没有更多数据
      };
    },
    {
      target: scrollContainerRef,
      isNoMore: (d) => d?.noMore === true,
      manual: true,
      threshold: 100, // 距离底部100px时开始加载
    }
  );

  const handleTagSelect = useMemoizedFn((tag: string) => {
    console.log('Selected tag:', tag); // 添加调试信息
    setSelectedTag(tag);
    setSearchMode('tag');
  });

  const handleTagSearch = useMemoizedFn((tag: string) => {
    console.log('Search tag:', tag); // 添加调试信息
    setSelectedTag(tag);
    setSearchMode('tag');
    // 使用setTimeout确保状态更新后再触发重新加载
    setTimeout(() => {
      tagReload();
    }, 0);
  });

  const handleDateSearch = useMemoizedFn((year: number, month: number) => {
    console.log('Selected date:', year, month); // 添加调试信息
    setSearchYear(year);
    setSearchMonth(month);
    setSearchMode('date');
    // 使用setTimeout确保状态更新后再触发重新加载
    setTimeout(() => {
      dateReload();
    }, 0);
  });

  // 处理刷新请求
  const handleRefreshRequest = useMemoizedFn(() => {
    console.log('Refresh requested for:', searchYear, searchMonth);
    // 重新加载数据
    setTimeout(() => {
      dateReload();
    }, 0);
  });

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
          <TagsFilter
            onTagSelect={handleTagSelect}
            onTagSearch={handleTagSearch}
            selectedTag={selectedTag}
          />
          <DateFilter 
            ref={dateFilterRef}
            onDateSearch={handleDateSearch} 
            onRefreshRequest={handleRefreshRequest}
            showRefreshButton={searchMode === 'date'}
          />
          <ResultsDisplay
            data={getCurrentData()}
            loading={getCurrentLoading()}

            loadingMore={getCurrentLoadingMore()}
            noMore={getCurrentNoMore()}
            emptyMessage={getEmptyMessage()}
            scrollContainerRef={scrollContainerRef}
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
            <TagsFilter
              onTagSelect={handleTagSelect}
              onTagSearch={handleTagSearch}
              selectedTag={selectedTag}
            />
          </div>
          <div style={pcDateFilterStyles}>
            <DateFilter 
            ref={dateFilterRef}
            onDateSearch={handleDateSearch} 
            onRefreshRequest={handleRefreshRequest}
            showRefreshButton={searchMode === 'date'}
          />
          </div>
        </div>

        <div style={pcRightPanelStyles}>
          <ResultsDisplay
            data={getCurrentData()}
            loading={getCurrentLoading()}

            loadingMore={getCurrentLoadingMore()}
            noMore={getCurrentNoMore()}
            emptyMessage={getEmptyMessage()}
            scrollContainerRef={scrollContainerRef}
          />
        </div>
      </div>
    </div>
  );
}