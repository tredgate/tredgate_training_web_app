import { useState, useMemo } from "react";import type { JSX } from 'react';import { ChevronUp, ChevronDown, Search } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: readonly string[];
}

export interface DataTableProps<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  searchable?: boolean;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedIds: number[]) => void;
  emptyMessage?: string;
  testIdPrefix?: string;
  className?: string;
}

export default function DataTable<T extends { id: number }>(
  props: DataTableProps<T>,
): JSX.Element {
  const {
    columns,
    data,
    keyField = "id",
    searchable = false,
    searchPlaceholder = "Search...",
    filters = [],
    pagination = false,
    pageSize = 10,
    pageSizeOptions = [5, 10, 25, 50],
    selectable = false,
    onRowClick,
    onSelectionChange,
    emptyMessage = "No data found",
    testIdPrefix = "table",
    className = "",
  } = props;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {},
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Apply search filter
  const searchedData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value =
          col.key === "actions" ? "" : String(row[col.key as keyof T] ?? "");
        return value.toLowerCase().includes(query);
      }),
    );
  }, [data, searchQuery, columns]);

  // Apply filters
  const filteredData = useMemo(() => {
    return searchedData.filter((row) =>
      Object.entries(activeFilters).every(([filterKey, filterValue]) => {
        if (!filterValue) return true;
        return String(row[filterKey as keyof T] ?? "") === filterValue;
      }),
    );
  }, [searchedData, activeFilters]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey as keyof T] ?? "";
      const bVal = b[sortKey as keyof T] ?? "";

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Apply pagination
  const pageData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * currentPageSize;
    return sortedData.slice(start, start + currentPageSize);
  }, [sortedData, pagination, currentPage, currentPageSize]);

  const totalPages = Math.ceil(sortedData.length / currentPageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(pageData.map((row) => row.id)));
    } else {
      setSelectedIds(new Set());
    }
    if (onSelectionChange) {
      onSelectionChange(checked ? pageData.map((row) => row.id) : []);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected));
    }
  };

  const allSelected =
    pageData.length > 0 && pageData.every((row) => selectedIds.has(row.id));

  if (sortedData.length === 0) {
    return (
      <div
        data-testid={`${testIdPrefix}-table`}
        className={`glass overflow-hidden ${className}`}
      >
        <div className="p-8 text-center text-gray-400">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div
      data-testid={`${testIdPrefix}-table`}
      className={`glass overflow-hidden ${className}`}
    >
      {/* Toolbar */}
      <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 items-center">
        {searchable && (
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <input
              data-testid={`${testIdPrefix}-input-search`}
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input-dark pl-10"
            />
          </div>
        )}
        {filters.map((filter) => (
          <select
            key={filter.key}
            data-testid={`${testIdPrefix}-select-${filter.key}-filter`}
            value={activeFilters[filter.key] ?? ""}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="input-dark"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {selectable && (
                <th className="px-4 py-3 text-left w-10">
                  <input
                    data-testid={`${testIdPrefix}-checkbox-select-all`}
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  data-testid={`${testIdPrefix}-btn-sort-${String(col.key)}`}
                  className={`px-4 py-3 text-left text-gray-300 font-medium ${
                    col.sortable ? "cursor-pointer hover:text-white" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable &&
                      sortKey === String(col.key) &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => (
              <tr
                key={row.id}
                data-testid={`${testIdPrefix}-row-${row.id}`}
                onClick={() => !selectable && onRowClick && onRowClick(row)}
                className={`border-b border-white/10 ${
                  onRowClick && !selectable
                    ? "hover:bg-white/5 cursor-pointer"
                    : ""
                }`}
              >
                {selectable && (
                  <td className="px-4 py-3 w-10">
                    <input
                      data-testid={`${testIdPrefix}-checkbox-row-${row.id}`}
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={(e) =>
                        handleSelectRow(row.id, e.target.checked)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    data-testid={`${testIdPrefix}-cell-${String(col.key)}-${row.id}`}
                    className="px-4 py-3 text-gray-100"
                  >
                    {col.render
                      ? col.render(row[col.key as keyof T], row)
                      : String(row[col.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div
          data-testid={`${testIdPrefix}-pagination`}
          className="p-4 border-t border-white/10 flex flex-wrap justify-between items-center gap-4"
        >
          <span className="text-sm text-gray-400">
            Showing{" "}
            {sortedData.length === 0
              ? 0
              : (currentPage - 1) * currentPageSize + 1}
            -{Math.min(currentPage * currentPageSize, sortedData.length)} of{" "}
            {sortedData.length}
          </span>
          <div className="flex items-center gap-4">
            <select
              data-testid={`${testIdPrefix}-select-page-size`}
              value={currentPageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="input-dark"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                data-testid={`${testIdPrefix}-btn-page-prev`}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400 min-w-[100px] text-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                data-testid={`${testIdPrefix}-btn-page-next`}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
