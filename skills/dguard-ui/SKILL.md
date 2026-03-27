---
name: dguard-ui
description: Use when building or updating D-Guard web frontend pages in static HTML/CSS/JS, especially when the page should follow the established D-Guard layout, toolbar, table, filter, pagination, status-editing, and browser-verification patterns.
---

# D-Guard UI

## Overview

Use this skill when creating or modifying D-Guard-style frontend pages. It standardizes the layout, visual density, filters, tables, status-editing interactions, and verification flow used in the D-Guard web UI sample.

This skill is for implementation work, not product planning. Use it when the task is to build, refine, or extend a page so it matches the established D-Guard interaction pattern in static HTML/CSS/JS, including the current multi-page mock structure with shared and page-specific files.

## Quick Start

1. Inspect the existing page structure first.
2. Reuse the established D-Guard layout and density instead of inventing a new pattern.
3. Keep shared UI rules separate from page-specific logic and mock data.
4. After implementation, verify the page in a real browser with `playwright`.

If you need the detailed UI rules, read [references/common-patterns.md](references/common-patterns.md).

If you are starting a new page, read [references/page-input-checklist.md](references/page-input-checklist.md) before coding.

## Workflow

### 1. Build Context

- Read the current structure first:
  - `index.html` when it acts as the root entry or page list
  - `shared.css` and `shared.js` for reusable shell and UI rules
  - the target page's `*.html`, `*.css`, and `*.js`
  - the page-specific mock service files if present
- If an existing D-Guard page already exists in the workspace, preserve its established look and interaction model.
- Separate reusable UI rules from page-specific business rules before editing.

### 2. Apply D-Guard Patterns

- Use the standard shell layout: left sidebar, top header, card-based main content.
- Use the D-Guard color system and dense enterprise-style spacing.
- Reproduce the existing header treatment closely: compact white header card, bold page title, optional highlighted target pill, breadcrumb below, and right-aligned user menu pill.
- Use the standard top action bar pattern: search, detail filter, filter state, actions.
- For detail-page inner tables such as the `inspection-target-detail.html` table-info section, reuse the same pattern in a compact form: text-input filter, detail-filter popover, applied-filter summary row, and a visible count badge such as `설정 N개`.
- When search text is entered, reflect it in a filter state summary row placed under the text input filter and above the table. Use the pattern `검색 "키워드" 초기화` (e.g., `검색 "mssql" 초기화`). Detail filters should remain distinguishable alongside the search term.
- For detail filters and multi-condition searches, the filter summary must show concrete criteria (e.g., `상태 2개 선택`, `검색 "ff"`), not just a generic `필터 적용`.
- For list/table pages with a toolbar summary, keep the order as `텍스트 입력 필터`, `상세필터`, `전체 N건 X - Y 표시됨 Z건 선택됨`, concrete applied criteria such as `상태 1개 선택` or `검색 "ff"`, then `초기화`. Use `·` between filter criteria and apply rounded chip styling. Emphasize `전체 N건` and `초기화` with the highlight color.
- Keep table-top action buttons aligned with the `inspection-target.html` baseline: shared button sizing, `32px` height, `11px` text, unified minimum widths, monochrome SVG icons plus labels.
- In sample or mock pages, preserve the established action-button style using monochrome icons plus text, not colorful emoji.
- For list/table pages when the page benefits from it, include an inline list summary in the top action bar. The current baseline pattern is `전체 N건 X - Y 표시됨 Z건 선택됨`.
- When a page has top summary tiles such as `전체`, `점검완료`, `점검중`, `점검오류`, treat them as clickable filter shortcuts. Clicking a tile should apply the corresponding status filter, preserve other active search or keyword filters, and show a clear active state on the selected tile. Clicking the active tile again should clear that tile-driven status filter.
- When a page has top summary tiles immediately above a list table, prefer the `inspection-target.html` arrangement: place the tile strip inside the same list card as the toolbar and table, keep it visually attached to the table section, and use only tight vertical spacing.
- Match each summary tile's border, gradient tint, and strong-value color to the corresponding row-status chip color family so waiting, running, completed, and failed states read consistently.
- Use table interactions consistently: row selection, checkbox selection separation, sorting, pagination, empty states.
- When a detail-page table is settings-oriented, prefer an internal scrollable table shell with no pagination, while keeping counts and filters above the table.
- For row-level edit actions inside settings tables, prefer a monochrome icon-only edit button with an empty or narrow trailing header cell instead of a text `관리` label.
- For list/table pages with bulk selection, support Gmail-style bulk-selection guidance when the current page is fully checked: show a banner row under the header and allow escalation from current-page selection to all filtered rows.
- When pagination is placed directly under a table shell, leave clear vertical spacing between the table border and the pagination row so the controls do not appear stuck to the table edge.
- Keep table text density aligned with the current D-Guard sample instead of shrinking it. For the `detection-list.html` baseline, use `13px` headers and `14px` body text in the main detection table, and `12px` headers with `13px` body text in the lower PII table.
- Use status-editing patterns consistently: summary, dense status buttons, textarea with counter, searchable multi-select assignee picker.

### 3. Keep Code Structured

- Keep reusable shell, table, filter, pagination, toast, and menu behavior in shared files.
- Keep page DOM rendering, page state, and page event wiring in the page-specific UI layer.
- Keep mock data and sample business rules in separate page-specific mock/business files.
- Avoid mixing sample-only business rules deeply into rendering code.

### 4. Verify in Browser

- After implementation, verify the page with the `playwright` skill.
- Check FHD and browser zoom 100% as the default baseline.
- Confirm there are no console errors, hidden overlays, overlap issues, broken wrapping, or interaction regressions.
- Use screenshots only when visual evidence is useful for review or delivery.

## Required Rules

- Preserve the D-Guard visual language across pages.
- Prefer dense, operational layouts over roomy marketing-style layouts.
- Match the current header visual pattern unless the user explicitly asks for a new one.
- Do not replace the established D-Guard action buttons with colorful emoji or plain text-only labels.
- Prefer monochrome SVG icons that follow `currentColor` and align vertically with the label text.
- Do not reduce table font sizes below the established D-Guard baseline without an explicit request.
- Keep toolbar actions on one line when feasible.
- Keep filters explicit: draft inside the filter UI, then apply.
- Hide zero-count rows only when that matches the page's business rule.
- For list/table pages, if a top action bar summary already shows total count and visible range, do not duplicate the same count summary again in the lower-left pagination caption.
- Place the page-size selector on the left side of the pagination row, aligned to the bottom-left of the table.
- Do not hardcode page-specific domain semantics into the shared UI layer unless the task explicitly requires it.
- Do not copy a full page stylesheet into another page file when the rules are truly shared; move reusable rules into shared files first.

## Page-Specific Inputs

When the user asks for a new page, gather or infer these inputs:

- Page title
- Highlighted target name
- Breadcrumb values
- Table columns
- Filter fields
- Action buttons
- Detail panel fields
- Permission rules
- Mock data shape
- Business rules such as delete, save, or recheck behavior

Use [references/page-input-checklist.md](references/page-input-checklist.md) as the checklist.

## Verification Checklist

- Layout follows the standard sidebar/header/card structure.
- Shared files contain only reusable rules; page-only layout or business-specific visuals stay in page files.
- Typography, spacing, button heights, and search widths follow the D-Guard density standard.
- Header styling, target highlighting, breadcrumb treatment, and user menu styling match the established D-Guard sample.
- Omit the highlighted target pill when the page does not need extra target-specific context.
- Toolbar actions preserve the expected monochrome icon-plus-label treatment.
- Action icons are vertically centered with the label text.
- Toolbar action font sizing matches the `inspection-target.html` baseline and is not enlarged ad hoc.
- Table font sizes are consistent with the D-Guard baseline and are not unintentionally reduced.
- Top action bar summaries correctly show total rows, visible range, and checked count when that pattern is used.
- Detail-page table sections that use a compact toolbar correctly show their count badge, text-input filter, detail-filter popover, and applied-filter summary row.
- Summary tiles stay visually attached to the list section rather than floating in a detached summary card when the page follows the `inspection-target.html` pattern.
- Gmail-style select-all guidance appears correctly when the current page is fully checked and can expand selection to all filtered rows.
- Lower-left pagination captions are removed when they are redundant with the top summary.
- Pagination rows have enough top spacing to read as a separate control area from the table border.
- Search, detail filter, sorting, pagination, and dropdowns work as intended.
- Clickable summary tiles correctly apply and clear their linked status filters without breaking other active filters.
- Role-based states and button visibility are correct.
- Browser verification is complete with no visible layout breakage.
