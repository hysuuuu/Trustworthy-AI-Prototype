// ponytail: all data is fake. Ceiling = swap MOCK_AI_INSIGHTS for a real API call.

export const RETURNS = [
  {
    id: "r1",
    client: "Jane Smith",
    tax_year: 2024,
    filing_status: "Single",
    status: "ai_review",
    flags: 3,
    awaiting_review: 5,
    preparer: "Michael Chen",
    due_date: "2025-04-15",
  },
  {
    id: "r2",
    client: "Robert & Dana Okafor",
    tax_year: 2024,
    filing_status: "Married Filing Jointly",
    status: "in_progress",
    flags: 1,
    awaiting_review: 2,
    preparer: "Sarah Nguyen",
    due_date: "2025-04-15",
  },
  {
    id: "r3",
    client: "Marcus Delgado",
    tax_year: 2024,
    filing_status: "Head of Household",
    status: "complete",
    flags: 0,
    awaiting_review: 0,
    preparer: "Michael Chen",
    due_date: "2025-04-15",
  },
  {
    id: "r4",
    client: "Priya Sharma LLC",
    tax_year: 2024,
    filing_status: "S-Corp",
    status: "ai_review",
    flags: 5,
    awaiting_review: 8,
    preparer: "Sarah Nguyen",
    due_date: "2025-03-17",
  },
  {
    id: "r5",
    client: "Thomas Eckhart",
    tax_year: 2024,
    filing_status: "Single",
    status: "pending_client",
    flags: 2,
    awaiting_review: 0,
    preparer: "Michael Chen",
    due_date: "2025-04-15",
  },
];

// Source documents per return
export const SOURCE_DOCS = {
  r1: [
    { id: "doc_w2_1", label: "W-2", issuer: "Acme Corp", pages: 1 },
    { id: "doc_1099int", label: "1099-INT", issuer: "Chase Bank", pages: 1 },
    {
      id: "doc_1099div",
      label: "1099-DIV",
      issuer: "Fidelity Investments",
      pages: 2,
    },
    {
      id: "doc_1099b",
      label: "1099-B",
      issuer: "Fidelity Investments",
      pages: 3,
    },
  ],
  r4: [
    {
      id: "doc_k1",
      label: "Schedule K-1",
      issuer: "Priya Sharma LLC",
      pages: 2,
    },
    {
      id: "doc_1099nec",
      label: "1099-NEC",
      issuer: "Various Clients",
      pages: 1,
    },
  ],
};

// Return fields — the core dataset
// states: "ai_suggested" | "verified" | "flagged" | "changed_by_human" | "manual"
export const FIELDS = {
  r1: [
    {
      id: "f_wages",
      section: "Income",
      label: "Total Wages & Salaries",
      line: "1a",
      value: "$87,420.00",
      original_ai_value: "$87,420.00",
      source_doc: "doc_w2_1",
      source_page: 1,
      source_location: "Box 1",
      confidence: 0.97,
      state: "ai_suggested",
      transformation: null,
    },
    {
      id: "f_fed_withheld",
      section: "Income",
      label: "Federal Tax Withheld",
      line: "25a",
      value: "$14,210.00",
      original_ai_value: "$14,210.00",
      source_doc: "doc_w2_1",
      source_page: 1,
      source_location: "Box 2",
      confidence: 0.97,
      state: "verified",
      transformation: null,
    },
    {
      id: "f_interest",
      section: "Income",
      label: "Taxable Interest Income",
      line: "2b",
      value: "$1,240.00",
      original_ai_value: "$1,240.00",
      source_doc: "doc_1099int",
      source_page: 1,
      source_location: "Box 1",
      confidence: 0.78,
      state: "flagged",
      transformation: null,
      flag_reason:
        "Confidence below threshold. Two 1099-INTs detected; only one extracted.",
    },
    {
      id: "f_dividends",
      section: "Income",
      label: "Ordinary Dividends",
      line: "3b",
      value: "$3,810.00",
      original_ai_value: "$4,810.00",
      source_doc: "doc_1099div",
      source_page: 1,
      source_location: "Box 1a",
      confidence: 0.93,
      state: "changed_by_human",
      transformation: null,
    },
    {
      id: "f_qual_dividends",
      section: "Income",
      label: "Qualified Dividends",
      line: "3a",
      value: "$2,940.00",
      original_ai_value: "$2,940.00",
      source_doc: "doc_1099div",
      source_page: 1,
      source_location: "Box 1b",
      confidence: 0.93,
      state: "ai_suggested",
      transformation: null,
    },
    {
      id: "f_cap_gains",
      section: "Income",
      label: "Capital Gain or Loss",
      line: "7",
      value: "$4,520.00",
      original_ai_value: "$4,520.00",
      source_doc: "doc_1099b",
      source_page: 1,
      source_location: "Schedule D summary",
      confidence: 0.81,
      state: "flagged",
      transformation:
        "Net of proceeds minus cost basis across 12 transactions. Short-term and long-term combined.",
      flag_reason:
        "3 transactions have missing cost basis. AI estimated using FIFO. Verify with client.",
    },
    {
      id: "f_std_deduction",
      section: "Deductions",
      label: "Standard Deduction",
      line: "12",
      value: "$14,600.00",
      original_ai_value: "$14,600.00",
      source_doc: null,
      source_page: null,
      source_location: "IRS 2024 table — Single filer",
      confidence: 1.0,
      state: "verified",
      transformation:
        "Applied standard deduction for Single filing status, 2024.",
    },
    {
      id: "f_taxable_income",
      section: "Deductions",
      label: "Taxable Income",
      line: "15",
      value: "$82,390.00",
      original_ai_value: "$82,390.00",
      source_doc: null,
      source_page: null,
      source_location: "Calculated",
      confidence: 1.0,
      state: "ai_suggested",
      transformation:
        "Total income ($96,990) minus standard deduction ($14,600).",
    },
    {
      id: "f_tax",
      section: "Tax & Credits",
      label: "Tax (from tax table)",
      line: "16",
      value: "$14,108.00",
      original_ai_value: "$14,108.00",
      source_doc: null,
      source_page: null,
      source_location: "IRS 2024 tax table",
      confidence: 0.99,
      state: "ai_suggested",
      transformation: "22% bracket applied to taxable income of $82,390.",
    },
    {
      id: "f_refund",
      section: "Refund",
      label: "Amount Overpaid (Refund)",
      line: "35a",
      value: "$102.00",
      original_ai_value: "$102.00",
      source_doc: null,
      source_page: null,
      source_location: "Calculated",
      confidence: 1.0,
      state: "flagged",
      transformation: "Federal withheld ($14,210) minus tax owed ($14,108).",
      flag_reason:
        "Unusually small refund. Verify federal withholding total is complete — client has two employers.",
    },
  ],
};

// AI insight cards — one per field
export const MOCK_AI_INSIGHTS = {
  f_wages: {
    summary:
      "Extracted wages directly from Box 1 of the W-2 issued by Acme Corp.",
    evidence: "W-2 · Box 1 — value reads $87,420.00. No ambiguity detected.",
    confidence: 0.97,
    uncertainty: null,
    suggested_action: "Accept — high confidence, single source, unambiguous.",
    correction_hint:
      "If incorrect, check if client has additional W-2s not yet uploaded.",
  },
  f_fed_withheld: {
    summary: "Federal withholding extracted from Box 2 of the W-2.",
    evidence: "W-2 · Box 2 — value reads $14,210.00.",
    confidence: 0.97,
    uncertainty: null,
    suggested_action: "Accept — already verified.",
    correction_hint: null,
  },
  f_interest: {
    summary:
      "Interest income extracted from a single 1099-INT. A second 1099-INT may exist.",
    evidence:
      "1099-INT · Box 1 from Chase Bank — $1,240.00. Document metadata suggests a second institution.",
    confidence: 0.78,
    uncertainty:
      "Client's prior-year return included interest from two banks. Only one 1099-INT uploaded.",
    suggested_action:
      "Flag for client — request confirmation that all 1099-INTs have been provided.",
    correction_hint:
      "Upload any missing 1099-INT documents and re-extract, or enter the correct total manually.",
  },
  f_dividends: {
    summary:
      "Ordinary dividends extracted from Box 1a of the Fidelity 1099-DIV.",
    evidence: "1099-DIV · Box 1a — $4,810.00.",
    confidence: 0.93,
    uncertainty: null,
    suggested_action:
      "Accept — value is clear and sourced from a single document.",
    correction_hint: null,
  },
  f_qual_dividends: {
    summary:
      "Qualified dividends extracted from Box 1b of the Fidelity 1099-DIV.",
    evidence:
      "1099-DIV · Box 1b — $2,940.00. Qualified dividends are a subset of ordinary dividends.",
    confidence: 0.93,
    uncertainty: null,
    suggested_action:
      "Accept — consistent with Box 1a. Qualified amount does not exceed ordinary.",
    correction_hint: null,
  },
  f_cap_gains: {
    summary:
      "Net capital gains calculated from 12 transactions on the 1099-B. Three transactions are missing cost basis.",
    evidence:
      "1099-B · Schedule D — 9 of 12 transactions have complete cost basis. 3 used FIFO estimate.",
    confidence: 0.81,
    uncertainty:
      "FIFO assumption applied to 3 positions. Actual cost basis may differ if shares were acquired at different times.",
    suggested_action:
      "Review the 3 transactions flagged below and confirm cost basis with client before accepting.",
    correction_hint:
      "Enter the correct cost basis for each flagged transaction or override the net gain directly.",
  },
  f_std_deduction: {
    summary: "Standard deduction applied per IRS 2024 table for Single filers.",
    evidence:
      "IRS Publication 501 · 2024 — Standard deduction for Single: $14,600.",
    confidence: 1.0,
    uncertainty: null,
    suggested_action: "Accept — statutory value, no extraction required.",
    correction_hint:
      "Override only if client qualifies for a different deduction (e.g., blind, age 65+).",
  },
  f_taxable_income: {
    summary:
      "Taxable income calculated as total income minus standard deduction.",
    evidence:
      "Total income $96,990.00 − Standard deduction $14,600.00 = $82,390.00.",
    confidence: 1.0,
    uncertainty: null,
    suggested_action:
      "Accept — straightforward arithmetic. Will update automatically if upstream values change.",
    correction_hint: null,
  },
  f_tax: {
    summary: "Income tax computed from 2024 tax brackets for Single filers.",
    evidence:
      "22% marginal rate applied to taxable income of $82,390. Effective rate: 17.1%.",
    confidence: 0.99,
    uncertainty: null,
    suggested_action:
      "Accept — standard bracket computation. Verify no credits or AMT apply.",
    correction_hint: null,
  },
  f_refund: {
    summary:
      "Refund is unusually small. Client likely has a second employer whose withholding is missing.",
    evidence:
      "$14,210.00 withheld − $14,108.00 tax = $102.00 refund. Prior year refund was $1,840.",
    confidence: 1.0,
    uncertainty:
      "Withholding appears low relative to prior year and current income. A second W-2 may be missing.",
    suggested_action:
      "Do not file. Request client confirm all W-2s are uploaded before proceeding.",
    correction_hint:
      "Upload the second W-2. Federal withholding total will update automatically.",
  },
};

// Bounding box positions per field (% of the fake document div)
// Simulates where on the source document the extracted value lives
export const BOUNDING_BOXES = {
  f_wages: { top: "18%", left: "58%", width: "22%", height: "5%", page: 1 },
  f_fed_withheld: {
    top: "26%",
    left: "58%",
    width: "22%",
    height: "5%",
    page: 1,
  },
  f_interest: { top: "34%", left: "12%", width: "30%", height: "5%", page: 1 },
  f_dividends: { top: "20%", left: "12%", width: "30%", height: "5%", page: 1 },
  f_qual_dividends: {
    top: "28%",
    left: "12%",
    width: "30%",
    height: "5%",
    page: 1,
  },
  f_cap_gains: { top: "42%", left: "12%", width: "60%", height: "5%", page: 1 },
};

// Status display config — maps state keys to UI labels and colors
export const STATE_CONFIG = {
  ai_suggested: { label: "AI Suggested", color: "var(--accent)", icon: "✦" },
  verified: { label: "Verified", color: "var(--success)", icon: "✓" },
  flagged: { label: "Needs Review", color: "var(--warning)", icon: "⚠" },
  manual: { label: "Manual Entry", color: "var(--muted)", icon: "✎" },
};

export const RETURN_STATUS_CONFIG = {
  ai_review: { label: "AI Review", color: "var(--accent)" },
  in_progress: { label: "In Progress", color: "var(--warning)" },
  complete: { label: "Complete", color: "var(--success)" },
  pending_client: { label: "Pending Client", color: "var(--muted)" },
};
