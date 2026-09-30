"use client";

import { useMemo, useState } from "react";

export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [page, setPageRaw] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(initialPageSize);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize]
  );

  function setPageSize(size: number) {
    setPageSizeRaw(size);
    setPageRaw(1);
  }

  function resetPage() {
    setPageRaw(1);
  }

  return {
    page: currentPage,
    pageCount,
    pageSize,
    items: pageItems,
    totalItems: items.length,
    setPage: setPageRaw,
    setPageSize,
    resetPage,
  };
}
