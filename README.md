# CuraLink Research Assistant

CuraLink Research Assistant is a full-stack medical research assistant that helps users explore health topics through a structured, source-backed workflow. The application is designed to accept either natural language queries or structured medical context, retrieve relevant publications and clinical trials, and present the findings in a clean, research-oriented interface.

## App Overview

The product is built to reduce the effort required to search across multiple medical research platforms and manually connect the findings. Instead of relying on a generic chat response, the app combines medical publications and clinical trial data into one workflow so users can review evidence in a more organized and traceable way.

The experience is designed for scenarios such as:

- exploring recent treatment options for a disease
- reviewing available clinical trials for a condition
- comparing publication evidence across multiple sources
- using structured disease and intent input instead of only free-text search

## Core Modules

### Query Input
Captures the user request through:

- natural language search
- disease field
- additional research intent
- optional location
- optional patient label

This module is responsible for starting the research workflow with enough context to retrieve meaningful results.

### Research Retrieval
Connects to the required medical sources and gathers raw evidence:

- OpenAlex for publications
- PubMed for publications
- ClinicalTrials.gov for clinical trials

This module retrieves the source data needed for downstream filtering, ranking, and reasoning.

### Publications
Displays publication results with core research details such as:

- title
- summary or abstract
- authors
- publication year
- source platform
- source link

This module helps users inspect the publication evidence directly.

### Clinical Trials
Displays trial results with relevant study information such as:

- trial title
- recruiting status
- eligibility-related summary
- location
- contact-related details when available
- source link

This module helps users review active or relevant clinical studies alongside publications.

### Conversation and Search History
Stores the search request and conversation context so the application can support continuity across searches and future follow-up logic.

### Structured Answer Layer
This module is intended to turn ranked evidence into a structured answer with clear sections such as:

- condition overview
- research insights
- clinical trial summary
- source-backed references

## Workflow

The application follows this high-level workflow:

1. The user enters a natural query or structured research details.
2. The backend receives the request and prepares a usable search input.
3. The retrieval layer sends requests to OpenAlex, PubMed, and ClinicalTrials.gov.
4. The backend normalizes the returned source data into a shared internal format.
5. The frontend renders publication and trial results in separate sections.
6. The stored search and conversation data prepare the application for deeper ranking, reasoning, and follow-up support.

## Tech Stack

### Frontend
- React
- Vite
- Axios

### Backend
- Node.js
- Express
- Axios
- xml2js

### Database
- MongoDB
- Mongoose

### External Research Sources
- OpenAlex
- PubMed
- ClinicalTrials.gov

## Current Foundation

The current codebase includes:

- frontend scaffold and search workspace
- backend scaffold and API routing
- MongoDB configuration
- normalized retrieval integration layer
- initial end-to-end search flow shell
