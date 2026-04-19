# Research Brief Test Cases

## Scope

This document covers:

- research brief rendering
- answer readability
- answer mode visibility
- summary section behavior

## Preconditions

- at least one successful search result is available

## Test Cases

### TC-RB-001

- Title: Show research brief after successful search
- Priority: High
- Module: Research Brief

Steps:
1. Run a valid search.

Expected Result:
- the research brief section is displayed
- the section is visible near the top of the results workspace

### TC-RB-002

- Title: Show clear answer title and context
- Priority: High
- Module: Research Brief

Steps:
1. Run `Latest treatment for lung cancer`.

Expected Result:
- the research brief headline reflects the active medical topic
- the summary feels aligned to the question asked

### TC-RB-003

- Title: Display summary cards without layout overlap
- Priority: High
- Module: Research Brief

Steps:
1. Run any valid search.
2. Inspect the summary cards visually.

Expected Result:
- cards are readable
- no text overlap is visible
- spacing between cards is consistent

### TC-RB-004

- Title: Show answer mode badge
- Priority: Medium
- Module: Research Brief

Steps:
1. Run any valid search.
2. Inspect the answer header.

Expected Result:
- the answer mode badge is visible
- the badge clearly indicates model mode or backup mode

### TC-RB-005

- Title: Show summary content in simple readable sections
- Priority: High
- Module: Research Brief

Steps:
1. Run a valid search.
2. Read the summary sections.

Expected Result:
- summary is broken into short readable parts
- content is easier to scan than a long paragraph

### TC-RB-006

- Title: Show friendly fallback message when model path is unavailable
- Priority: Medium
- Module: Research Brief

Steps:
1. Trigger a case where fallback mode is used.
2. Inspect the research brief.

Expected Result:
- the app still shows a usable summary
- fallback wording is understandable
- the section remains stable

