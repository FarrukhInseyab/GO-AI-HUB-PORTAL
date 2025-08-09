import { useState, useMemo } from 'react';

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: PaginationConfig;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

export function usePagination<T>(
  data: T[],
  initialPageSize: number = 12
): PaginationResult<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, page, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const nextPage = () => {
    if (hasNextPage) {
      setPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage) {
      setPage(prev => prev - 1);
    }
  };

  const handleSetPageSize = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      total: data.length
    },
    hasNextPage,
    hasPrevPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: handleSetPageSize
  };
}