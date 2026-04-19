# History And Follow-Up Test Cases

## Scope

This document covers:

- saved search history
- follow-up question behavior
- context continuity

## Preconditions

- application is connected to the backend and database

## Test Cases

### TC-HF-001

- Title: Save successful search into history
- Priority: High
- Module: History And Follow-Up

Steps:
1. Run a valid search.
2. Check the history panel.

Expected Result:
- the new search appears in the history section

### TC-HF-002

- Title: Reopen a previous search thread
- Priority: High
- Module: History And Follow-Up

Steps:
1. Run at least two valid searches.
2. Click an earlier history item.

Expected Result:
- the older result set is restored
- the active thread changes correctly

### TC-HF-003

- Title: Preserve disease context in follow-up question
- Priority: High
- Module: History And Follow-Up

Steps:
1. Run `Latest treatment for lung cancer`.
2. After results load, search `Can I take Vitamin D?`

Expected Result:
- the app keeps the lung cancer context
- the follow-up answer is not treated like a random general query

### TC-HF-004

- Title: Show history items without clipping or overlap
- Priority: High
- Module: History And Follow-Up

Steps:
1. Create multiple search history entries.
2. Inspect the history panel.

Expected Result:
- titles are readable
- no overlapping text appears
- spacing is stable

### TC-HF-005

- Title: Maintain context after reloading a saved thread
- Priority: Medium
- Module: History And Follow-Up

Steps:
1. Reopen a previous search thread.
2. Run a follow-up question.

Expected Result:
- context is preserved from the reopened thread
- results remain aligned to that context

