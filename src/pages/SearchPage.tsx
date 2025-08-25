// src/pages/SearchPage.tsx
import React, { useRef, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import {
  useInfiniteScroll,
  useLatest,
  useMemoizedFn,
  useUpdateEffect,
  useFocusWithin,
} from "ahooks";
import useUrlState from "@ahooksjs/use-url-state";
import { getCurrentTheme } from "../constants/colors";
// 1. 导入新的服务函数
import { SearchPostsByQuery } from "../services/SearchService";
import SearchInput from "../components/search/SearchInput";
import SearchList from "../components/search/SearchList";

export default function SearchPage() {
  const colors = getCurrentTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageSearchInputRef = useRef<HTMLDivElement>(null);

  const [urlState, setUrlState] = useUrlState({ q: "" });
  const [searchQuery, setSearchQuery] = useState(urlState.q);
  const latestQuery = useLatest(searchQuery);

  // 检测页面搜索输入框区域是否有焦点
  const isPageSearchFocused = useFocusWithin(pageSearchInputRef);

  // 2. --- 核心修改：重构 useInfiniteScroll ---
  const { data, loading, loadingMore, noMore, reload, mutate } =
    useInfiniteScroll(
      async (d) => {
        const query = latestQuery.current;
        if (!query) {
          // 如果没有查询词，返回一个符合 ahooks 结构并且表示“没有更多”的空状态
          return { list: [], total: 0 };
        }

        // `startIndex` 现在是当前已加载的条目数
        const startIndex = d ? d.list.length : 0;

        // 调用新的服务函数
        const res = await SearchPostsByQuery({
          query,
          startIndex,
          pageSize: 10,
        });

        // 返回从 API 获取的完整结构，ahooks 会自动处理 list 的合并
        return {
          list: res.list,
          total: res.total,
        };
      },
      {
        target: scrollContainerRef,
        // 核心改动：isNoMore 现在基于总数进行判断
        // 当已加载的列表长度大于或等于总数时，认为没有更多数据了
        isNoMore: (d) => {
          if (!d) return false;
          return d.list.length >= d.total;
        },
        manual: true, // 手动触发
        threshold: 200,
      }
    );

  // 页面加载时，如果URL中有'q'参数，则自动触发搜索
  useEffect(() => {
    if (urlState.q) {
      reload();
    }
  }, []); // 仅在初始加载时执行

  // 搜索词变化时，重新加载数据
  useUpdateEffect(() => {
    reload();
  }, [searchQuery]);

  // 处理搜索事件
  const handleSearch = useMemoizedFn((query: string) => {
    let finalQuery = query;

    // 如果页面搜索框没有焦点，说明用户可能在使用nav搜索框
    // 尝试获取nav搜索框的值
    if (!isPageSearchFocused) {
      const navSearchInput = document.querySelector(
        'nav input[type="text"]'
      ) as HTMLInputElement;
      if (navSearchInput && navSearchInput.value.trim()) {
        finalQuery = navSearchInput.value.trim();
      }
    }

    // 如果是新的搜索查询，先清空现有数据
    if (finalQuery !== searchQuery) {
      mutate(undefined);
    }
    setSearchQuery(finalQuery);
    setUrlState({ q: finalQuery }); // 更新URL
  });

  const hasSearched = loading || !!data;

  // --- 样式定义 ---
  const pageStyles = (isInitial: boolean): React.CSSProperties => ({
    backgroundColor: colors.background,
    color: colors.text,
    minHeight: isMobile ? "10vh" : "50vh",
    padding: isMobile ? "calc(5vh - 12px) 4px 20px" : "32px 24px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: isMobile ? "30px" : "40px",
    justifyContent: isInitial ? "center" : "flex-start",
    overflow: isMobile ? "auto" : "hidden",
    transition: "justify-content 0.5s ease",
  });

  const searchInputContainerStyles = (
    isInitial: boolean
  ): React.CSSProperties => ({
    width: "100%",
    maxWidth: "800px",
    marginTop: isInitial ? "0" : isMobile ? "0" : "calc(8vh - 60px)",
    transition: "margin-top 0.5s ease",
  });

  const resultsContainerStyles: React.CSSProperties = {
    width: "100%",
    maxWidth: "800px",
    flex: isMobile ? "unset" : 1,
    minHeight: isMobile ? "unset" : 0,
  };

  const messageStyles: React.CSSProperties = {
    textAlign: "center",
    padding: "60px 20px",
    color: colors.textSecondary,
    fontSize: "16px",
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={pageStyles(!hasSearched)}>
        <div
          ref={pageSearchInputRef}
          style={searchInputContainerStyles(!hasSearched)}
        >
          <SearchInput
            onSearch={handleSearch}
            initialQuery={searchQuery}
            loading={loading && !data} // 仅在初次加载时显示loading
            disableNavigation={true} // 在搜索页面本身禁用导航
          />
        </div>

        {hasSearched && (
          <div style={resultsContainerStyles}>
            {loading && !data ? (
              <div style={messageStyles}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      border: "3px solid transparent",
                      borderTop: "3px solid var(--primary-color)",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  正在努力搜索中...
                </div>
              </div>
            ) : loading && data ? (
              // 新搜索开始时显示loading动画，保持当前结果
              <>
                <div
                  style={{
                    ...messageStyles,
                    padding: "20px",
                    marginBottom: "16px",
                    backgroundColor: "var(--surface-color)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        border: "2px solid transparent",
                        borderTop: "2px solid var(--primary-color)",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    搜索中...
                  </div>
                </div>
                <SearchList
                  data={data}
                  loadingMore={loadingMore}
                  noMore={noMore}
                  scrollContainerRef={
                    scrollContainerRef as React.RefObject<HTMLDivElement>
                  }
                />
              </>
            ) : !data || data.list.length === 0 ? (
              <div style={messageStyles}>
                未找到与 "{searchQuery}" 相关的文章
              </div>
            ) : (
              <SearchList
                data={data}
                loadingMore={loadingMore}
                noMore={noMore}
                scrollContainerRef={
                  scrollContainerRef as React.RefObject<HTMLDivElement>
                }
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
