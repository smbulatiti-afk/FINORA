"use client";

import { useEffect, useState } from "react";

const pageSizes = [5, 10, 20, 50] as const;

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  offset: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export function usePagination(total: number, resetKey?: string): PaginationState {
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState<number>(10);
  const totalPages = Math.ceil(total / limit);
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);

  useEffect(() => {
    setPageState(1);
  }, [resetKey]);

  useEffect(() => {
    if (page !== currentPage) setPageState(currentPage);
  }, [currentPage, page]);

  function setPage(nextPage: number) {
    setPageState(Math.max(1, Math.min(nextPage, Math.max(totalPages, 1))));
  }

  function setLimit(nextLimit: number) {
    if (!pageSizes.some((size) => size === nextLimit)) return;
    setLimitState(nextLimit);
    setPageState(1);
  }

  return {
    page: currentPage,
    limit,
    total,
    totalPages,
    offset: (currentPage - 1) * limit,
    setPage,
    setLimit,
  };
}

function pageNumbers(page: number, totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page]);
  if (page > 2) pages.add(page - 1);
  if (page < totalPages - 1) pages.add(page + 1);
  if (page <= 3) [2, 3, 4].forEach((value) => pages.add(value));
  if (page >= totalPages - 2) {
    [totalPages - 3, totalPages - 2, totalPages - 1].forEach((value) => pages.add(value));
  }

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  return sortedPages.flatMap((value, index) => {
    const previous = sortedPages[index - 1];
    if (index === 0) return [value];
    return [ ...(value - previous > 1 ? ["..." as const] : []), value ];
  });
}

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  setPage,
  setLimit,
}: PaginationState) {
  if (total === 0) return null;

  const firstRecord = (page - 1) * limit + 1;
  const lastRecord = Math.min(page * limit, total);

  return (
    <div className="pagination-footer">
      <div className="pagination-summary" aria-live="polite">
        Showing {firstRecord}–{lastRecord} of {total} records
      </div>
      <div className="pagination-options">
        <label className="pagination-limit">
          <span>Rows per page</span>
          <select
            className="pagination-select"
            aria-label="Records per page"
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
          >
            {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        {totalPages > 1 ? (
          <nav className="pagination-controls" aria-label="Pagination">
            <button
              className="pagination-button"
              type="button"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            {pageNumbers(page, totalPages).map((value, index) => value === "..." ? (
              <span className="pagination-ellipsis" key={`ellipsis-${index}`} aria-hidden="true">…</span>
            ) : (
              <button
                className={`pagination-button pagination-page${page === value ? " active" : ""}`}
                type="button"
                key={value}
                aria-label={`Go to page ${value}`}
                aria-current={page === value ? "page" : undefined}
                onClick={() => setPage(value)}
              >
                {value}
              </button>
            ))}
            <button
              className="pagination-button"
              type="button"
              aria-label="Next page"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </nav>
        ) : (
          <span className="pagination-single-page">Page 1 of 1</span>
        )}
      </div>
    </div>
  );
}
