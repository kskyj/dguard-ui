# D-Guard UI Page Input Checklist

Use this checklist before creating a new D-Guard page.

## Basic Context

- What is the page name?
- What is the highlighted target name in the header?
- What breadcrumb path should be shown?
- Is the page desktop-only or does it need responsive behavior?

## Main Sections

- What are the main cards or sections on the page?
- Which section is primary?
- Which section depends on another selection?

## Table Definition

- What tables are on the page?
- What columns does each table need?
- Which columns are numeric?
- Which columns should sort?
- Which columns need checkbox selection?
- Should zero-count rows be hidden?
- Should the top action bar show a list summary such as `전체 N건 X - Y 표시됨 Z건 선택됨`?
- If the page has checkbox bulk selection, should it support a Gmail-style `select all filtered rows` banner?
- If the top summary is used, should the lower-left pagination caption be removed to avoid duplication?

## Filters And Search

- What does the main search input search?
- Which fields belong in detail filters?
- Are detail filters multi-select?
- Should detail filters apply immediately or only on confirm?

## Actions

- What action buttons exist in the top action bar?
- Which actions are role-dependent?
- Which actions require confirmation?
- Which actions update only UI state and which simulate business behavior?

## Detail And Editing

- What appears in the detail panel?
- What summary should be shown for the selected item?
- Are there status buttons?
- Is there comment input?
- Is there assignee selection?
- Are assignees single-select or multi-select?

## Permission Rules

- Which roles exist?
- What can each role see?
- What can each role change?
- Which actions are admin-only?

## Mock Data And Business Rules

- What mock entities are needed?
- Which IDs must be unique?
- What counts or status values exist?
- What happens on save, delete, export, copy, or recheck?
- When should a row disappear from the list?

## Verification

- What is the expected FHD layout?
- Which interactions must be tested in the browser?
- Is screenshot evidence needed for delivery?
