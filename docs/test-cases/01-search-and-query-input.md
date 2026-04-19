# Search And Query Input Test Cases

## Scope

This document covers:

- main search input
- structured query fields
- input validation
- search submission behavior

## Preconditions

- frontend is accessible
- backend is running and reachable
- database connection is working

## Test Cases

### TC-SQI-001

- Title: Search using a plain-language medical question
- Priority: High
- Module: Search And Query Input

Steps:
1. Open the application.
2. Enter `Latest treatment for lung cancer` in the main search box.
3. Click `Search`.

Expected Result:
- the request is submitted successfully
- loading feedback is shown
- the app returns a research brief
- publication and trial sections are populated

### TC-SQI-002

- Title: Search using structured fields only
- Priority: High
- Module: Search And Query Input

Steps:
1. Open the application.
2. Leave the main search box empty.
3. Enter `Parkinson's disease` in the condition field.
4. Enter `Deep brain stimulation` in the intent field.
5. Enter `Toronto, Canada` in the location field.
6. Click `Search`.

Expected Result:
- the request is accepted
- the app uses structured input successfully
- results reflect the structured condition and intent

### TC-SQI-003

- Title: Search using both plain-language and structured input
- Priority: Medium
- Module: Search And Query Input

Steps:
1. Open the application.
2. Enter `Recent studies on heart disease` in the main search box.
3. Enter `Heart disease` in the condition field.
4. Enter `New treatment options` in the intent field.
5. Click `Search`.

Expected Result:
- the request is accepted
- the app combines both input styles correctly
- results align with the heart disease topic

### TC-SQI-004

- Title: Prevent empty search submission
- Priority: High
- Module: Search And Query Input

Steps:
1. Open the application.
2. Leave the main search box empty.
3. Leave the structured fields empty.
4. Click `Search`.

Expected Result:
- the request is not sent
- a user-friendly validation message is shown
- the page does not crash

### TC-SQI-005

- Title: Preserve entered values before search execution
- Priority: Medium
- Module: Search And Query Input

Steps:
1. Open the application.
2. Enter a valid search query.
3. Enter values in one or more structured fields.
4. Click `Search`.

Expected Result:
- all entered values remain visible while the request is processed
- no unexpected field reset happens during loading

### TC-SQI-006

- Title: Display loading state immediately after search click
- Priority: High
- Module: Search And Query Input

Steps:
1. Open the application.
2. Enter a valid query.
3. Click `Search`.

Expected Result:
- loading state appears immediately
- user clearly understands that the request is in progress

### TC-SQI-007

- Title: Handle long medical question safely
- Priority: Medium
- Module: Search And Query Input

Steps:
1. Open the application.
2. Enter a long question such as `What are the latest treatment options and clinical trials for advanced lung cancer in adults with non-small cell disease`.
3. Click `Search`.

Expected Result:
- the UI handles the input correctly
- no layout break happens
- the request is processed without frontend failure

