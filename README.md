# GreenGrowth CPAs: AI Engineer Case Study

**Challenge 10: Trustworthy AI** _(combined with Challenge 01: Source Document Traceability)_

---

## Trustworthy AI

A prototype of an AI-powered tax return review interface for CPAs.

The core interaction:

1. click any field on a tax return
2. see the source document it came from
3. see the AI's reasoning, confidence, and evidence
4. accept or correct it without breaking the audit trail.

## Component Status

| Component                                          | Status                                     |
| -------------------------------------------------- | ------------------------------------------ |
| UI interactions (clicking, editing, accepting)     | Fully wired                                |
| Navigation between returns and fields              | Fully wired                                |
| Correction workflow + audit trail                  | Fully wired                                |
| Confidence scores & AI insight cards               | Wired — data is hardcoded JSON             |
| Source document "bounding box" highlight           | Wired — CSS overlay on a fake document div |
| AI outputs (recommendations, confidence, evidence) | Stub function returning hardcoded JSON     |

## Design Decisions

**1. Confidence scores are shown, not hidden — but not overwhelming.**
Low-confidence fields use an amber badge so they stand out without causing alarm. The threshold for flagging is 85%. Above 85%, the field is pre-accepted but remains auditable. Below that, the CPA is prompted to review.

**2. Corrections don't erase the AI.**
When a CPA overrides a value, the AI's original recommendation and reasoning stay below the field in a collapsed note. This keeps the audit trail intact so reviewers can see exactly what the AI recommended vs. what the human decided.

**3. The source document panel is always visible alongside the return.**
CPAs shouldn't have to trust a number they can't easily verify. The split-panel layout keeps both the source document and the return field on screen at the same time, without forcing users to open modals or switch tabs.

## Stack

- HTML / CSS / Vanilla JS — no framework, no bundler
- Hosted on GitHub Pages
- All AI data: hardcoded `mock.js` stub

## Running Locally

Open `index.html` in a browser. No server required.
