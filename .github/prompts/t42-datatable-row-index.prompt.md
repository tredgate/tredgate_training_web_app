# T42 — Bug: DataTable Row Indices Should Use Row Index, Not Entity ID

## Problem

DataTable rows currently use the entity's database ID (e.g., `defect-list-row-5`) in their `data-testid` attributes. For Playwright tests, **row index** (position in the visible table) is far more useful than entity ID because:

- Tests assert on "the 3rd row in the table" — they don't know or care about internal IDs.
- After filtering or sorting, the entity at row 1 changes, but a test targeting `row-1` should always get the first visible row.
- Entity IDs are unstable across seed resets, making tests brittle.

## Scope

Audit all pages that use `DataTable` and the `dataTableRow` / `dataTableCell` builder functions:

1. `src/components/data/DataTable.tsx` — the core component that renders rows.
2. `src/shared/testIds.ts` — `dataTableRow()`, `dataTableCell()`, and related builders.
3. All pages passing `testIdPrefix` to `DataTable` or manually rendering table rows.

## Fix

Change `dataTableRow(prefix, entity.id)` → `dataTableRow(prefix, rowIndex)` (and similarly for `dataTableCell`), where `rowIndex` is the **0-based index** of the row in the currently rendered (filtered + sorted + paginated) list.

## Acceptance

- `npm run build` passes.
- `data-testid` on table rows uses sequential indices (`row-0`, `row-1`, `row-2`, …) instead of entity IDs.
- Cell test IDs follow the same pattern (`cell-title-0`, `cell-status-1`, …).
- Indices reset per page (paginated tables start at 0 on each page).

## Depends on

T3 (DataTable must exist).
