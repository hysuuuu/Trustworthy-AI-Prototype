# GreenGrowth CPAs: Trustworthy AI

## Workflow

1. In the Returns dashboard, select a specific client to enter the client's dashboard.
2. In the client's dashboard, select a specific field to review the source document and AI analysis.
3. Choose "Accept" to accept the AI analysis or "Edit value" to manually edit.

## Design

### 1. What the AI did

Every field shows a **"What the AI did"** section in the AI Analysis panel. It describes the extraction action in plain language, like "Extracted wages directly from Box 1 of the W-2 issued by Acme Corp." The AI's state is also displayed as a badge on the field row: `AI Suggested`, `Verified`, `Needs Review`, or `Adjusted`.

### 2. Why it made a recommendation

The panel's **"Suggested action"** section shows the AI's recommendation along with its rationale. For example, it might say "Accept: high confidence, single source, unambiguous" or "Flag for human review: cost basis is estimated." The CPA gets a direct prompt rather than a raw confidence score with no guidance.

### 3. What evidence supports it

The **Source Document panel** (middle column) renders a mock version of the originating document, such as a W-2, 1099-INT, 1099-DIV, or 1099-B. The exact row the AI read is highlighted in amber. The panel also lists the specific box number, page, and issuer. For calculated fields like standard deduction and taxable income, the **"Transformation"** section explains the arithmetic step by step.

### 4. What uncertainty exists

Fields below the confidence threshold receive a `Needs Review` tag with an amber badge. A flag reason is displayed prominently at the top of the AI Analysis panel, like "Two 1099-INTs detected; only one extracted" or "3 transactions have missing cost basis. AI estimated using FIFO." The confidence bar on each row gives a quick visual signal, and the "Uncertainty" section in the analysis panel explains the specific source of doubt.

### 5. What action they should take

The insight panel includes a persistent action footer pinned to the bottom:

- **✓ Accept**: A prominent green button that marks the field Verified.
- **✎ Edit value**: Opens an inline editor directly in the field row.

Once a field is Verified or Adjusted, the Accept button disappears to prevent redundant actions.

### 6. How to correct the AI without breaking the workflow

When a CPA edits a value, the field state changes to **Adjusted**. The original AI value is preserved and shown struck through beneath the new value (e.g., `was $4,810.00`). The AI's original reasoning, confidence score, and evidence remain intact in the insight panel, now preceded by an **"Adjusted"** banner that displays both values. The audit trail is maintained so reviewers can always see what the AI recommended versus what the human decided, and why.

## What's Genuinely Wired vs. Simulated

| Component                                                             | Status                                                               |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| UI interactions (click, edit, accept, deselect)                       | Fully wired                                                          |
| State transitions (`ai_suggested` to `verified` / `manually_changed`) | Fully wired                                                          |
| Audit trail (original AI value preserved on override)                 | Fully wired                                                          |
| Confidence bars, flag badges, status badges                           | Wired, driven by data fields                                         |
| Source document panel and field highlight                             | Wired, rendered from mock layout data                                |
| Field to source document linking (page, box, issuer)                  | Wired, each field has `source_doc`, `source_page`, `source_location` |
| AI insights (summary, evidence, uncertainty, action)                  | Stub, hardcoded JSON in `data/mock.js`                               |
| Confidence scores                                                     | Stub, hardcoded, not computed                                        |
| Document OCR and extraction                                           | Simulated, no real document parsing                                  |
| Multi-return data (r2 through r5)                                     | Stub, fields only populated for r1                                   |

## Mock Data

The interface reads its state from `data/mock.js`, which is mock data generated from LLM. The file exports four objects:

- `RETURNS`: The clients shown on the dashboard.
- `SOURCE_DOCS`: Metadata for the tax documents (W-2s, 1099s) attached to each return.
- `FIELDS`: The line items for each return. Each object tracks the current value, the AI suggestion, the source document, and the review state.
- `MOCK_AI_INSIGHTS`: The AI analysis for each field, covering the summary, evidence, and confidence score.

## Design Decisions

**Hiding information until needed.** The source document and AI analysis panels are hidden until a field is selected. The fields panel takes up the full width at first so CPAs can scan the entire return before drilling in. Clicking a field expands the panels, and clicking again collapses them.

**Corrections preserve data.** The AI's original value is stored in `original_ai_value` and displayed with a strikethrough. The reasoning panel stays visible. If a reviewer questions a CPA's override six months later, the original AI recommendation is still available.

**Confidence thresholds drive state.** Fields below 0.85 confidence are automatically flagged with a specific `flag_reason`. Fields above 0.95 can be pre-accepted in a real production environment. The score is shown numerically and as a color bar so CPAs can calibrate their own judgment.

**Everything on one screen.** The source document, AI analysis, edit input, and action buttons are all visible at once. There are no modals or page navigations. A CPA should be able to review and accept a field in under three seconds without losing context.

## Stack

- **HTML / CSS / Vanilla JS**: No framework, keep it simple.
- **Data:** `data/mock.js` contains hardcoded stubs for all AI outputs.
- **Deployment:** GitHub Pages (open `index.html` directly, or serve with `python3 -m http.server 8080`).
