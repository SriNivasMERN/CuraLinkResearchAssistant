# Evidence Board Test Cases

## Scope

This document covers:

- evidence board section
- tab behavior
- evidence counts
- evidence card rendering

## Preconditions

- at least one successful search result is available

## Test Cases

### TC-EB-001

- Title: Show evidence board after successful search
- Priority: High
- Module: Evidence Board

Steps:
1. Run a valid search.

Expected Result:
- the evidence board is displayed below the research brief

### TC-EB-002

- Title: Show counts in evidence tabs
- Priority: High
- Module: Evidence Board

Steps:
1. Run a valid search.
2. Inspect the evidence tabs.

Expected Result:
- tab labels show counts such as `All (X)`, `Studies (X)`, `Trials (X)`, `Sources (X)`

### TC-EB-003

- Title: Open All tab successfully
- Priority: High
- Module: Evidence Board

Steps:
1. Run a valid search.
2. Click `All`.

Expected Result:
- combined evidence feed is shown
- cards include both study and trial items where available

### TC-EB-004

- Title: Open Studies tab successfully
- Priority: High
- Module: Evidence Board

Steps:
1. Run a valid search.
2. Click `Studies`.

Expected Result:
- only study cards are shown
- section title reflects the study count

### TC-EB-005

- Title: Open Trials tab successfully
- Priority: High
- Module: Evidence Board

Steps:
1. Run a valid search.
2. Click `Trials`.

Expected Result:
- only clinical trial cards are shown
- section title reflects the trial count

### TC-EB-006

- Title: Open Sources tab successfully
- Priority: High
- Module: Evidence Board

Steps:
1. Run a valid search.
2. Click `Sources`.

Expected Result:
- source attribution cards are shown
- supporting source information is visible

### TC-EB-007

- Title: Show numbered labels on evidence cards
- Priority: Medium
- Module: Evidence Board

Steps:
1. Run a valid search.
2. Inspect visible evidence cards.

Expected Result:
- cards display labels such as `Study 1` or `Trial 1`

### TC-EB-008

- Title: Open evidence source links
- Priority: High
- Module: Evidence Board

Steps:
1. Run a valid search.
2. Open one study source link.
3. Open one trial source link if available.

Expected Result:
- links open the correct external source page
- no broken link is shown

