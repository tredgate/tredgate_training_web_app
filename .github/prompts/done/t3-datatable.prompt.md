# Task 3 — DataTable Component

> **Layer**: 2 (Shared Components) · **Depends on**: T1 (testIds.ts), T2 (app shell running) · **Parallelizable** with T4-T7

## Objective

Build the reusable `DataTable` component — the most complex shared component in the app. It will be used on every list page (DefectList, ProjectList, TestPlanList, TeamList). It must support sortable columns, text search, dropdown filters, pagination with page size selector, optional row selection (checkboxes), row click handler, custom cell renderers, and an empty state.

## Constraints

- Follow architecture §9 (DataTable Props) exactly for the prop API.
- All `data-testid` values from `src/shared/testIds.ts`. Use the `testIdPrefix` prop to scope all internal test IDs.
- Styling: `.glass` card wrapper, `.input-dark` for search, Tailwind utilities for table. Dark theme — no white backgrounds.
- Fully controlled — no internal data fetching. Receives `data` array, handles sorting/filtering/pagination internally via local state.
- Default export.

## File to Create

### `src/components/data/DataTable.tsx`

#### Types & Props (per architecture §9)

Generic over the row type `T`. `T` must have a numeric `id` field (default `keyField`).

```ts
export interface Column<T> {
  key: keyof T | string; // "string" allows computed columns (e.g. "actions") not on T
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
  keyField?: keyof T;                       // default "id"
  searchable?: boolean;                     // default false
  searchPlaceholder?: string;               // default "Search..."
  filters?: FilterConfig[];
  pagination?: boolean;                     // default false
  pageSize?: number;                        // default 10
  pageSizeOptions?: readonly number[];      // default [5, 10, 25, 50]
  selectable?: boolean;                     // default false
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedIds: number[]) => void;
  emptyMessage?: string;                    // default "No data found"
  testIdPrefix?: string;                    // default "table"
  className?: string;
}

export default function DataTable<T extends { id: number }>(
  props: DataTableProps<T>
): JSX.Element;
```

Note: use **default parameter values** in the function signature for defaults — TS doesn't support `defaultProps` on generic components.

#### Internal State

- `sortKey` (string | null) — which column is sorted
- `sortDirection` ("asc" | "desc")
- `searchQuery` (string)
- `activeFilters` ({ [filterKey]: selectedValue | "" })
- `currentPage` (number, 1-based)
- `currentPageSize` (number)
- `selectedIds` (Set)

#### Behavior

1. **Search**: Filters rows where ANY column value (stringified) contains the search query (case-insensitive).
2. **Filters**: Each filter dropdown filters rows where `row[filterKey] === selectedValue`. Multiple filters are AND-combined.
3. **Sorting**: Click column header to sort. First click → asc, second → desc, third → unsorted. Show sort indicator arrow (▲/▼) on active column.
4. **Pagination**: Show page info ("Showing 1-10 of 47"), prev/next buttons (disabled at bounds), page size selector dropdown.
5. **Selection**: Header checkbox selects/deselects all visible rows. Individual row checkboxes. Call `onSelectionChange` with array of selected `keyField` values.
6. **Row click**: If `onRowClick` provided, rows get `cursor-pointer` and hover effect. Clicking the checkbox column does NOT trigger row click.
7. **Empty state**: When filtered/searched data is empty, show the `emptyMessage` text centered in the table area using `EmptyState` component if available, or a simple centered `<p>`.

#### Data Pipeline

```
data → filter(searchQuery) → filter(activeFilters) → sort(sortKey, sortDirection) → paginate(currentPage, pageSize) → render
```

Reset `currentPage` to 1 whenever search, filters, or page size change.

#### Rendered Structure

```html
<div data-testid="{prefix}-table" class="glass overflow-hidden">
  <!-- Toolbar: search + filters -->
  <div class="p-4 border-b border-white/10 flex gap-4 items-center">
    {searchable &&
    <input data-testid="{prefix}-input-search" class="input-dark" />}
    {filters.map(f =>
    <select data-testid="{prefix}-select-{f.key}-filter" class="input-dark" />)}
  </div>

  <!-- Table -->
  <table class="w-full">
    <thead>
      <tr class="border-b border-white/10">
        {selectable &&
        <th>
          <input type="checkbox" data-testid="{prefix}-checkbox-select-all" />
        </th>
        } {columns.map(col => (
        <th
          data-testid="{prefix}-btn-sort-{col.key}"
          class="... cursor-pointer"
          onClick="{sort}"
        >
          {col.label} {sortIndicator}
        </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {pageData.map(row => (
      <tr
        key="{row[keyField]}"
        data-testid="{prefix}-row-{row[keyField]}"
        onClick="{onRowClick}"
        class="border-b border-white/10 hover:bg-white/5"
      >
        {selectable &&
        <td>
          <input
            type="checkbox"
            data-testid="{prefix}-checkbox-row-{row[keyField]}"
          />
        </td>
        } {columns.map(col => (
        <td data-testid="{prefix}-cell-{col.key}-{row[keyField]}">
          {col.render ? col.render(row[col.key], row) : row[col.key]}
        </td>
        ))}
      </tr>
      ))}
    </tbody>
  </table>

  <!-- Pagination -->
  {pagination && (
  <div
    data-testid="{prefix}-pagination"
    class="p-4 border-t border-white/10 flex justify-between items-center"
  >
    <span>Showing {start}-{end} of {total}</span>
    <div class="flex items-center gap-2">
      <select data-testid="{prefix}-select-page-size" class="input-dark" />
      <button
        data-testid="{prefix}-btn-page-prev"
        disabled="{page"
        =""
        =""
        ="1}"
      >
        Previous
      </button>
      <span>Page {page} of {totalPages}</span>
      <button
        data-testid="{prefix}-btn-page-next"
        disabled="{page"
        =""
        =""
        ="totalPages}"
      >
        Next
      </button>
    </div>
  </div>
  )}
</div>
```

### `src/shared/testIds.ts` — Extend

Add DataTable dynamic builder functions:

```ts
// DataTable builders — prefix is passed as testIdPrefix prop
export const dataTableTestId = (prefix: string, element: string): string =>
  `${prefix}-${element}`;
export const dataTableRow = (prefix: string, id: number | string): string =>
  `${prefix}-row-${id}`;
export const dataTableCell = (prefix: string, column: string, id: number | string): string =>
  `${prefix}-cell-${column}-${id}`;
export const dataTableBtn = (prefix: string, action: string): string =>
  `${prefix}-btn-${action}`;
export const dataTableCheckbox = (prefix: string, qualifier: string): string =>
  `${prefix}-checkbox-${qualifier}`;
```

## Verification Checklist

- [ ] Renders a table with column headers from `columns` prop
- [ ] Clicking a sortable column header sorts data asc → desc → unsorted
- [ ] Sort indicator (▲/▼) visible on active sort column
- [ ] Search input filters rows across all columns (case-insensitive)
- [ ] Filter dropdowns filter by specific column value, AND-combined
- [ ] Pagination shows correct "Showing X-Y of Z", prev/next work, disabled at bounds
- [ ] Page size selector changes page size and resets to page 1
- [ ] Search/filter changes reset to page 1
- [ ] Row checkbox selection works, header checkbox selects/deselects all visible
- [ ] `onRowClick` fires when clicking row (not checkbox column)
- [ ] Empty state message shown when no data matches
- [ ] Custom `render` function in column config works (for badges, buttons, etc.)
- [ ] All elements have correct `data-testid` with `testIdPrefix`
- [ ] Component accepts `className` prop for wrapper styling

## Do NOT

- Do not fetch data inside the component — it's fully controlled via `data` prop
- Do not add virtual scrolling or infinite scroll
- Do not add column resizing or drag-and-drop reorder
- Do not add export/download functionality
- Use TypeScript (strict) per architecture §16b — `DataTable<T extends { id: number }>` generic component, `DataTableProps<T>` interface. No PropTypes, no JSDoc, no `any`.
