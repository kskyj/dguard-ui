# D-Guard UI Common Patterns

## Layout

- Prefer a static multi-page mock structure:
  - `index.html` as the root entry or page list when useful
  - `shared.css` and `shared.js` for reusable shell and UI behavior
  - page-specific `*.html`, `*.css`, and `*.js` for each screen
  - page-specific mock service files for sample data
- Use `sidebar + page shell` as the base structure.
- Sidebar width defaults:
  - expanded: `200px`
  - collapsed: `64px`
- Use a single top header card.
- Use dense cards for main content areas.
- Design for FHD and browser zoom 100%.
- Keep reusable shell, button, table, filter, modal, toast, and pagination rules in shared files.
- Keep page-only layout structures, detail rails, and business-specific visuals in page files.

## Header

- Structure: `page title + optional highlighted target + breadcrumb + user menu`
- Use a compact white header card with tight vertical padding, not a tall hero banner.
- Keep header spacing close to the current sample rather than adding extra whitespace.
- The page title should remain visually dominant.
- When used, the highlighted target should appear as an accent-colored pill next to the title.
- Omit the highlighted target pill when the screen does not need extra target-specific context.
- Breadcrumb is always shown under the title.
- Breadcrumb separator is `>`.
- Breadcrumb items should look clickable and have hover feedback.
- The current breadcrumb item is darker and heavier.
- User menu should use `icon + user id/name + dropdown indicator`.
- The user menu trigger should also look like a compact accent-tinted pill.

## Design Tokens

- Page background: `#EDF0F5`
- Card background: `#FFFFFF`
- Accent: `#987BE9`
- Primary action button: `#727CF4`
- Primary button text: `#FFFFFF`
- Tables do not use vertical borders.

## Typography And Density

### Header
- Page title: `18px`, `800`
- Breadcrumb: `12px`
- Breadcrumb current item: `700`
- Sidebar label: `14px`, `700`

### Tables
- In `detection-list.html`, the main detection table body is `14px`.
- In `detection-list.html`, the main detection table header is `13px`.
- In `detection-list.html`, the lower PII table body is `13px`.
- In `detection-list.html`, the lower PII table header is `12px`.
- Do not reduce these sizes by default when generating a new page.
- Numeric columns align right by default.
- Identifier columns may align center when useful.

### Inputs And Buttons
- Standard button height: `32px`
- Standard button font size: `11px`
- Main action minimum width: `92px`
- For the `inspection-target.html` baseline, table-top action buttons use the shared `11px` text size and `32px` height.
- In sample pages, action buttons should use monochrome icons plus text rather than colorful emoji.
- Prefer SVG icons that follow `currentColor`.
- Current shared baseline icon size is `14px`.
- Icons and labels must be vertically centered.
- Filter popover apply/cancel buttons: `36px` high
- Status buttons: about `24px` high
- Search input width: `280px`
- Status textarea text: `13px`
- Status textarea placeholder: `12px`
- Counter text: `12px`

## Top Search/Action Bar

- Base order: `search input + detail filter button + action buttons`
- For compact detail-page tables, keep the same order in a reduced form: `text-input filter + detail filter button + count badge + actions`.
- Keep it on one line when possible.
- Keep action buttons aligned to the right.
- Keep main actions visually consistent with the current sample:
  - filter/detail icon + `?곸꽭?꾪꽣`
  - edit icon + `?섏젙`
  - delete icon + `??젣`
  - recheck icon + `?댄뻾?먭?`
  - export/download icon + `?대낫?닿린`
- For list/table pages when useful, include an inline list summary next to the filter control.
- Baseline summary pattern: `?꾩껜 N嫄?X - Y ?쒖떆??Z嫄??좏깮??
- Summary meaning:
  - total filtered rows
  - visible range on the current page
  - checked row count
- Baseline emphasis pattern:
  - `?꾩껜 N嫄?, `Z嫄??좏깮??: accent/purple emphasis
  - `X - Y ?쒖떆??: dark text
- Show a clear applied-filter state and reset action in a slim row placed under the text input filter and above the table.
- In compact detail-page tables, a count badge such as `설정 N개` can sit in the section header while the applied-filter summary row still stays directly above the table.
- When a page includes top summary tiles such as 전체, 점검완료, 점검중, 점검오류, those tiles should be clickable and act as status-filter shortcuts with a visible active state.
- Place summary tiles inside the same list card as the toolbar and table when following the `inspection-target.html` pattern, with tight spacing instead of a detached summary card.
- Summary tile colors should follow the matching status-chip color family for that state.
- Applied search summary pattern: `寃??"?ㅼ썙??`, `珥덇린??.

## Detail Filter

- Use a popover under the filter button, not a full modal.
- Use searchable multi-select dropdowns.
- Show selected values as flat chips.
- Chips must support removal with `x`.
- Do not apply immediately while choosing.
- Only apply when the user presses `?곸슜`.
- Use `?꾩껜` as the default placeholder.
- Use `寃??寃곌낵 ?놁쓬` when no options match.

## Table Behavior

- Header background must be distinguishable from the body.
- Provide hover and selected row states.
- Separate row selection from checkbox selection.
- Checkbox state changes only from checkbox interaction.
- For settings-oriented detail-page tables, prefer a scrollable table region without pagination when the user mainly needs scan-and-edit behavior.
- When a row only supports edit, use a trailing narrow header cell with an icon-only pencil action instead of a labeled `관리` column.
- For list/table pages with checkbox bulk selection, a Gmail-style selection banner may appear directly under the table header.
- Baseline banner copy: `?섏씠吏?먯꽌 5媛쒓? ?좏깮?섏뿀?듬땲?? 紐⑸줉?먯꽌 珥?8媛??곗씠???좏깮`
- The action in that banner should expand selection from current-page rows to all filtered rows.
- Provide sortable headers where meaningful.
- Use pagination by default.
- Consider hiding zero-count rows when that fits the page rule.

## Pagination

- Use a caption like `1-5 / 20嫄? by default.
- For list/table pages, if the same information is already presented in the top action bar summary, the lower-left caption can be removed to avoid duplication.
- Use `?댁쟾 / page numbers / ?ㅼ쓬`.
- Pagination must honor search, filters, and sorting.

## Status Editing

- Show selected item summary at the top.
- Use dense status buttons in a grid.
- Include textarea and live character count.
- Use searchable multi-select assignee controls.
- Selected assignees appear as removable chips.
- Save is enabled only when there is a change.
- Respect role-based state restrictions.

## Feedback

- Use toast for save, delete, copy, export, and recheck feedback.
- Use confirmation UI for destructive or batch actions.
- Provide empty states in each relevant section.
- Disabled controls must be visually obvious.

## Code Structure

- UI state, rendering, and event binding belong in the page UI layer.
- Reusable shell, menu, table, filter, pagination, modal, and toast patterns belong in shared files.
- Mock data and sample business logic belong in separate page-specific mock/business files.
- Keep shared UI patterns reusable; keep page business rules isolated.

## Verification

- Verify with the `playwright` skill after implementation.
- Check FHD and browser zoom 100%.
- Confirm:
  - no console errors
  - no hidden overlays blocking the page
  - no overlap or broken wrapping
  - action icons are monochrome and vertically centered
  - top summary counts and checked-row counts are correct when the page uses that pattern
  - Gmail-style select-all banner appears and expands selection correctly
  - duplicate lower-left pagination captions are removed when the top summary already covers them
  - filters, sorting, pagination, popovers, modals, and dropdowns work
  - summary-tile status shortcuts apply and clear the expected filters
  - role-based visibility and disabled states are correct
  - shared rules are not duplicated across page-specific stylesheets
- Use screenshot capture only when visual proof is needed.


