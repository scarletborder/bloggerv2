import React, { useRef, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useInfiniteScroll, useLatest, useMemoizedFn, useTitle } from 'ahooks';
import useUrlState from '@ahooksjs/use-url-state';
import {
  GetPostListByCategories,
  GetPostListByDate,
} from '../services/PostList';
import { getCurrentTheme } from '../constants/colors';
import TagsFilter from '../components/archives/TagsFilter';
import DateFilter, {
  type DateFilterRef,
} from '../components/archives/DateFilter';
import PostCacheManager, { SaveCacheForDate } from '../utils/postCache';
import ResultsDisplay from '../components/archives/ResultsDisplay';
import type { JSX } from 'react/jsx-runtime';

type SearchMode = 'none' | 'tag' | 'date';

export default function ArchivesPage(): JSX.Element {
  const colors = getCurrentTheme();

  // 使用 useUrlState 管理 URL 查询参数
  const [urlState, setUrlState] = useUrlState({
    tag: '',
    year: '',
    month: '',
  });

  const selectedTag = urlState.tag || '';
  const searchYear = urlState.year ? parseInt(urlState.year, 10) : 0;
  const searchMonth = urlState.month ? parseInt(urlState.month, 10) : 0;

  let searchMode: SearchMode = 'none';
  if (selectedTag) {
    searchMode = 'tag';
  } else if (searchYear && searchMonth) {
    searchMode = 'date';
  }

  // 用于自动滚动加载的 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dateFilterRef = useRef<DateFilterRef>(null);

  // 使用useLatest确保在异步回调中获取最新值
  const latestSearchMode = useLatest(searchMode);
  const latestSelectedTag = useLatest(selectedTag);
  const latestSearchYear = useLatest(searchYear);
  const latestSearchMonth = useLatest(searchMonth);

  useTitle('Archives-绯境之外');

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
      isNoMore: d => d?.noMore === true,
      manual: true,
      threshold: 100, // 距离底部100px时开始加载
    },
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
      if (
        latestSearchMode.current !== 'date'
        || !latestSearchYear.current
        || !latestSearchMonth.current
      ) return { list: [] };

      const startIndex = d?.list ? d.list.length : 0;
      const currentYear = latestSearchYear.current;
      const currentMonth = latestSearchMonth.current;

      // 如果是第一次加载，先检查缓存
      if (startIndex === 0) {
        const cachedPosts = await PostCacheManager.getCache(
          currentYear,
          currentMonth,
        );
        if (cachedPosts !== null) {
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
          await SaveCacheForDate(currentYear, currentMonth, result.list);
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
      isNoMore: d => d?.noMore === true,
      manual: true,
      threshold: 100, // 距离底部100px时开始加载
    },
  );

  useEffect(() => {
    if (searchMode === 'tag' && selectedTag) {
      tagReload();
    } else if (searchMode === 'date' && searchYear && searchMonth) {
      dateReload();
    }
  }, [selectedTag, searchYear, searchMonth, searchMode, tagReload, dateReload]); // 依赖项现在是派生值

  const handleTagSelect = useMemoizedFn((tag: string) => {
    // onTagSelect 仅更新URL，让UI从URL派生
    setUrlState({
      tag,
      year: undefined,
      month: undefined,
    });
  });

  const handleTagSearch = useMemoizedFn((tag: string) => {
    setUrlState({
      tag,
      year: undefined,
      month: undefined,
    });
  });

  const handleDateSearch = useMemoizedFn((year: number, month: number) => {
    setUrlState({
      tag: undefined,
      year: year.toString(),
      month: month.toString(),
    });
  });

  const handleRefreshRequest = useMemoizedFn(() => {
    dateReload(); // 直接调用 reload
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
    maxHeight: isMobile ? 'unset' : '100vh',
    backgroundColor: colors.background,
    color: colors.text,
    padding: isMobile ? 'unset 8px' : '18px 20px 0px',
    overflow: isMobile ? 'unset' : 'hidden', // PC版本不允许滚动
  };

  const titleStyles: React.CSSProperties = {
    // 减少PC设备上的上下空隙
    padding: isMobile ? 'unset' : '8px 0',
    margin: isMobile ? '0 0 44px 0' : '0 0 16px 0',
    fontSize: isMobile ? '2em' : '28px',
    fontWeight: '800',
    textAlign: 'center',
    background: `linear-gradient(45deg, ${colors.primary}, ${colors.primaryHover})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    // 为小屏幕PC设备限制标题高度占用
    maxHeight: isMobile ? 'unset' : '5vh',
    lineHeight: isMobile ? 'unset' : '1.2',
    overflow: 'hidden',
  };

  // PC版布局样式
  const pcContentStyles: React.CSSProperties = {
    display: 'flex',
    gap: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    height: 'calc(100vh - 150px)',
    overflow: 'hidden', // 防止整体页面滚动
  };

  const pcLeftPanelStyles: React.CSSProperties = {
    width: '350px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    height: '100%', // 占满父容器高度
  };

  const pcTagsFilterStyles: React.CSSProperties = {
    flex: 1, // 占据剩余高度
    minHeight: 0, // 允许收缩
    overflow: 'auto', // 允许滚动
  };

  const pcDateFilterStyles: React.CSSProperties = {
    flex: '0 0 auto', // 不参与flex布局的伸缩
    // 与contentContainer底部平行，不使用固定高度
  };

  const pcRightPanelStyles: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    height: '100%', // 占满父容器高度
    display: 'flex',
    flexDirection: 'column',
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
        <h1>📚 文章归档</h1>

        <div style={mobileContentStyles}>
          <TagsFilter
            onTagSelect={handleTagSelect}
            onTagSearch={handleTagSearch}
            selectedTag={selectedTag}
            initialTag={urlState.tag || ''}
          />
          <DateFilter
            ref={dateFilterRef}
            onDateSearch={handleDateSearch}
            onRefreshRequest={handleRefreshRequest}
            showRefreshButton={searchMode === 'date'}
            initialYear={
              urlState.year ? parseInt(urlState.year, 10) : undefined
            }
            initialMonth={
              urlState.month ? parseInt(urlState.month, 10) : undefined
            }
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
              initialTag={urlState.tag || ''}
            />
          </div>
          <div style={pcDateFilterStyles}>
            <DateFilter
              ref={dateFilterRef}
              onDateSearch={handleDateSearch}
              onRefreshRequest={handleRefreshRequest}
              showRefreshButton={searchMode === 'date'}
              initialYear={
                urlState.year ? parseInt(urlState.year, 10) : undefined
              }
              initialMonth={
                urlState.month ? parseInt(urlState.month, 10) : undefined
              }
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
