# End To End Application Workflow Test Cases

## Scope

This document covers the complete workflow of the application from first load to result review and follow-up behavior.

## Preconditions

- frontend is deployed or running
- backend is running
- database connection is working
- required external source APIs are reachable

## Test Cases

### TC-E2E-001

- Title: Complete full app flow using a natural-language question
- Priority: Critical
- Module: End To End Workflow

Steps:
1. Open the application.
2. Enter `Latest treatment for lung cancer`.
3. Click `Search`.
4. Wait for the result to load.
5. Review the research brief.
6. Open the `Studies` tab.
7. Open the `Trials` tab.
8. Open the `Sources` tab.

Expected Result:
- search is submitted successfully
- loading feedback is shown
- research brief is generated
- studies are shown
- trials are shown
- sources are shown
- no major UI failure occurs

### TC-E2E-002

- Title: Complete full app flow using structured input
- Priority: High
- Module: End To End Workflow

Steps:
1. Open the application.
2. Leave the main search input empty.
3. Enter `Parkinson's disease` in the condition field.
4. Enter `Deep brain stimulation` in the intent field.
5. Enter `Toronto, Canada` in the location field.
6. Click `Search`.

Expected Result:
- the app accepts structured input
- results are returned
- output is aligned to the structured search context

### TC-E2E-003

- Title: Complete full app flow using a trial-focused query
- Priority: High
- Module: End To End Workflow

Steps:
1. Open the application.
2. Enter `Clinical trials for diabetes`.
3. Click `Search`.

Expected Result:
- the app returns a trial-relevant result set
- trial evidence is visible
- publication evidence is also available if returned

### TC-E2E-004

- Title: Complete full app flow using follow-up context
- Priority: High
- Module: End To End Workflow

Steps:
1. Search `Latest treatment for lung cancer`.
2. After results appear, search `Can I take Vitamin D?`

Expected Result:
- the second query uses previous context
- answer remains relevant to lung cancer

### TC-E2E-005

- Title: Reopen saved thread and continue research
- Priority: Medium
- Module: End To End Workflow

Steps:
1. Run at least two valid searches.
2. Open one previous search from the history panel.
3. Continue with a new follow-up question.

Expected Result:
- previous context is restored
- user can continue the same research lane

## Recommended Manual Test Data

Use these search examples:

- `Latest treatment for lung cancer`
- `Clinical trials for diabetes`
- `Recent studies on heart disease`
- Condition: `Parkinson's disease`
- Intent: `Deep brain stimulation`
- Location: `Toronto, Canada`

## Final Sign-Off Checklist

Mark the build ready only if all of these are true:

- search input works
- structured input works
- research brief works
- evidence board works
- studies tab works
- trials tab works
- sources tab works
- follow-up behavior works
- history works
- loading and error states work
- no broken links are found
- no major text overlap or layout failure is visible
