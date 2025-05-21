import React from "react";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { AppFetchBaseQueryError } from "../../utils/errorUtils";

export interface ColumnDefinition<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  cellClassName?: string | ((row: T) => string);
  sortable?: boolean;
  sortField?: keyof T;
}

interface DataTableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  isLoading: boolean;
  error:
    | FetchBaseQueryError
    | AppFetchBaseQueryError
    | SerializedError
    | undefined;
  page: number;
  pageSize: number;
  totalElements: number | undefined;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  availablePageSizes?: number[];
  getRowId?: (row: T, index: number) => string | number;
  onSortChange?: (sortField: keyof T, sortDirection: "asc" | "desc") => void;
  currentSortField?: keyof T;
  currentSortDirection?: "asc" | "desc";
  filterColumn?: string;
}

const MAX_VISIBLE_PAGE_BUTTONS = 5;

const SortAscIcon = () => (
  <svg className="w-4 h-4 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
    <path
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
      fillRule="evenodd"
      transform="rotate(180 10 10)"
    ></path>
  </svg>
);
const SortDescIcon = () => (
  <svg className="w-4 h-4 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
    <path
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
      fillRule="evenodd"
    ></path>
  </svg>
);
const SortIcon = () => (
  <svg
    className="w-4 h-4 ml-1 inline opacity-50"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M5 15a1 1 0 110-2 1 1 0 010 2zm0-4a1 1 0 110-2 1 1 0 010 2zm0-4a1 1 0 110-2 1 1 0 010 2zm10 8a1 1 0 110-2 1 1 0 010 2zm0-4a1 1 0 110-2 1 1 0 010 2zm0-4a1 1 0 110-2 1 1 0 010 2zm-5 8a1 1 0 110-2 1 1 0 010 2zm0-4a1 1 0 110-2 1 1 0 010 2zm0-4a1 1 0 110-2 1 1 0 010 2z"></path>
  </svg>
);

export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading,
  error,
  page,
  pageSize,
  totalElements = 0,
  onPageChange,
  onPageSizeChange,
  availablePageSizes = [10, 20, 50, 100],
  onSortChange,
  currentSortField,
  currentSortDirection,
  filterColumn,
}: DataTableProps<T>) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.ceil(totalElements / safePageSize);

  const handlePreviousPage = () => {
    if (page > 0) onPageChange(page - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages - 1) onPageChange(page + 1);
  };
  const handleGoToPage = (targetPage: number) => {
    if (targetPage >= 0 && targetPage < totalPages) {
      onPageChange(targetPage);
    }
  };

  const handleSort = (column: ColumnDefinition<T>) => {
    if (!onSortChange || !column.sortable) return;
    const sortFieldToUse = column.sortField || column.accessorKey;
    if (!sortFieldToUse) return;

    let newDirection: "asc" | "desc";
    if (currentSortField === sortFieldToUse) {
      newDirection = currentSortDirection === "asc" ? "desc" : "asc";
    } else {
      newDirection = "asc";
    }
    onSortChange(sortFieldToUse, newDirection);
  };

  const renderPageNumbers = () => {
    if (totalPages <= 1) return null;
    const pageNumbers: (number | string)[] = [];
    const halfWay = Math.ceil(MAX_VISIBLE_PAGE_BUTTONS / 2);
    let startPage = page - halfWay + 1;
    let endPage = page + halfWay - 1;
    if (totalPages <= MAX_VISIBLE_PAGE_BUTTONS) {
      startPage = 0;
      endPage = totalPages - 1;
    } else if (page < halfWay) {
      startPage = 0;
      endPage = MAX_VISIBLE_PAGE_BUTTONS - 1;
    } else if (page >= totalPages - halfWay) {
      startPage = totalPages - MAX_VISIBLE_PAGE_BUTTONS;
      endPage = totalPages - 1;
    }
    if (startPage > 0) {
      pageNumbers.push(0);
      if (startPage > 1) pageNumbers.push("ellipsis-start");
    }
    for (let i = startPage; i <= endPage; i++) {
      if (i >= 0 && i < totalPages) pageNumbers.push(i);
    }
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) pageNumbers.push("ellipsis-end");
      pageNumbers.push(totalPages - 1);
    }
    return pageNumbers.map((pg, index) => {
      if (typeof pg === "string") {
        return (
          <span
            key={pg + index}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          >
            ...
          </span>
        );
      }
      return (
        <button
          key={pg}
          onClick={() => handleGoToPage(pg)}
          aria-current={page === pg ? "page" : undefined}
          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pg ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}
        >
          {pg + 1}
        </button>
      );
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500">Loading data...</p>
      </div>
    );
  if (error) {
    let errorMessage = "Error loading data. Please try again.";
    if (typeof error === "object" && error !== null && "status" in error)
      errorMessage += ` (Status: ${error.status})`;
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-red-500">{errorMessage}</p>
      </div>
    );
  }
  if (!data || data.length === 0)
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500">No data found.</p>
      </div>
    );

  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      {" "}
      <table className="min-w-full divide-y divide-gray-200 hidden md:table">
        {" "}
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ""} ${col.sortable && onSortChange ? "cursor-pointer hover:bg-gray-100" : ""}`}
                onClick={() => handleSort(col)}
              >
                {col.header}
                {col.sortable &&
                  onSortChange &&
                  (currentSortField === (col.sortField || col.accessorKey) ? (
                    currentSortDirection === "asc" ? (
                      <SortAscIcon />
                    ) : (
                      <SortDescIcon />
                    )
                  ) : (
                    <SortIcon />
                  ))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={getRowId ? getRowId(row, rowIndex) : rowIndex}
              className="hover:bg-gray-50"
            >
              {columns.map((col, colIndex) => {
                const cellKey = getRowId
                  ? `${getRowId(row, rowIndex)}-${col.header}`
                  : `${rowIndex}-${colIndex}`;
                let currentCellClassName = "text-gray-500";
                if (col.cellClassName) {
                  if (typeof col.cellClassName === "function") {
                    currentCellClassName = col.cellClassName(row);
                  } else {
                    currentCellClassName = col.cellClassName;
                  }
                }
                return (
                  <td
                    key={cellKey}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${currentCellClassName}`}
                  >
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                        ? String(row[col.accessorKey])
                        : "N/A"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="md:hidden">
        {data.map((row, rowIndex) => (
          <div
            key={getRowId ? getRowId(row, rowIndex) : rowIndex}
            className="bg-white shadow border border-gray-200 rounded-lg p-4 mb-4"
          >
            {columns.map((col, colIndex) => (
              <div
                key={
                  getRowId
                    ? `${getRowId(row, rowIndex)}-card-${col.header}`
                    : `${rowIndex}-card-${colIndex}`
                }
                className="mb-2"
              >
                <p className="text-xs font-medium text-gray-500 uppercase">
                  {col.header}
                </p>
                <p
                  className={`text-sm ${typeof col.cellClassName === "function" ? col.cellClassName(row) : col.cellClassName || "text-gray-700"}`}
                >
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey
                      ? String(row[col.accessorKey])
                      : "N/A"}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
      {totalElements > 0 && (
        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">Show:</span>
              <select
                id="pageSize"
                name="pageSize"
                className="block w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={safePageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                {availablePageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-700 ml-2">per page</span>
            </div>
            <p className="text-sm text-gray-700 hidden md:block">
              Showing{" "}
              <span className="font-medium">{page * safePageSize + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min((page + 1) * safePageSize, totalElements)}
              </span>{" "}
              of <span className="font-medium">{totalElements}</span> results
            </p>
          </div>

          {totalPages > 1 && (
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={handlePreviousPage}
                disabled={page === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                aria-label="Previous page"
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {renderPageNumbers()}
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages - 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                aria-label="Next page"
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          )}
          <p className="text-sm text-gray-700 md:hidden mt-2 sm:mt-0">
            {totalPages > 1 ? `Page ${page + 1} of ${totalPages}` : ""} (
            {totalElements} results)
          </p>
        </div>
      )}
    </div>
  );
}
