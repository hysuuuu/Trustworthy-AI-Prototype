import {
  RETURNS,
  FIELDS,
  SOURCE_DOCS,
  MOCK_AI_INSIGHTS,
  STATE_CONFIG,
  RETURN_STATUS_CONFIG,
} from "./data/mock.js";

// ponytail: no framework. Mutate state, call render(). Ceiling = React if app grows past ~10 screens.

// ── Mutable field state (copy of mock so edits don't touch the source) ──
const fieldState = {};
RETURNS.forEach((r) => {
  if (FIELDS[r.id]) fieldState[r.id] = FIELDS[r.id].map((f) => ({ ...f }));
});

const state = {
  view: "dashboard", // 'dashboard' | 'review'
  returnId: null,
  selectedFieldId: null,
  editingFieldId: null,
};

// ── Fake document layouts ─────────────────────────────────────────────────
// ponytail: inline here, not in mock.js — this is view-layer rendering data.
const DOC_LAYOUTS = {
  doc_w2_1: {
    title: "W-2 Wage and Tax Statement",
    rows: [
      {
        box: "Box 1",
        label: "Wages, tips, other compensation",
        value: "$87,420.00",
      },
      {
        box: "Box 2",
        label: "Federal income tax withheld",
        value: "$14,210.00",
      },
      { box: "Box 3", label: "Social security wages", value: "$87,420.00" },
      {
        box: "Box 4",
        label: "Social security tax withheld",
        value: "$5,420.04",
      },
      { box: "Box 5", label: "Medicare wages and tips", value: "$87,420.00" },
      { box: "Box 6", label: "Medicare tax withheld", value: "$1,267.59" },
      {
        box: "Box 12a",
        label: "401(k) elective deferrals",
        value: "$8,500.00",
      },
      { box: "Box 16", label: "State wages, tips, etc.", value: "$87,420.00" },
      { box: "Box 17", label: "State income tax", value: "$4,891.00" },
    ],
  },
  doc_1099int: {
    title: "1099-INT Interest Income",
    rows: [
      { box: "Box 1", label: "Interest income", value: "$1,240.00" },
      { box: "Box 2", label: "Early withdrawal penalty", value: "$0.00" },
      { box: "Box 3", label: "Interest on U.S. Savings Bonds", value: "$0.00" },
      { box: "Box 4", label: "Federal income tax withheld", value: "$0.00" },
      { box: "Box 8", label: "Tax-exempt interest", value: "$0.00" },
    ],
  },
  doc_1099div: {
    title: "1099-DIV Dividends and Distributions",
    rows: [
      { box: "Box 1a", label: "Total ordinary dividends", value: "$4,810.00" },
      { box: "Box 1b", label: "Qualified dividends", value: "$2,940.00" },
      {
        box: "Box 2a",
        label: "Total capital gain distributions",
        value: "$0.00",
      },
      { box: "Box 2b", label: "Unrecaptured Sec. 1250 gain", value: "$0.00" },
      { box: "Box 4", label: "Federal income tax withheld", value: "$0.00" },
      { box: "Box 5", label: "Section 199A dividends", value: "$124.00" },
    ],
  },
  doc_1099b: {
    title: "1099-B Proceeds from Broker Transactions",
    rows: [
      {
        box: "Schedule D summary",
        label: "Net capital gain / loss",
        value: "$4,520.00",
      },
      { box: "Short-term", label: "Box A transactions", value: "$1,840.00" },
      { box: "Long-term", label: "Box D transactions", value: "$2,680.00" },
      { box: "Cost basis", label: "3 positions — FIFO est.", value: "⚠ Est." },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────

function getFields(rid) {
  return fieldState[rid] || [];
}

function getField(rid, fid) {
  return getFields(rid).find((f) => f.id === fid) || null;
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});
}

function confColor(c) {
  if (c >= 0.9) return "#2da06a";
  if (c >= 0.8) return "#cc8f20";
  return "#cc3f3f";
}

function pct(c) {
  return Math.round(c * 100) + "%";
}

// Append 2-digit hex alpha to a 6-digit hex color string
function alpha(hex, a) {
  return hex + a;
}

// ── Badge ─────────────────────────────────────────────────────────────────

function badge(field) {
  const cfg = STATE_CONFIG[field.state];
  if (!cfg) return "";
  return `<span class="badge" style="color:${cfg.color};border-color:${alpha(cfg.color, "28")};background:${alpha(cfg.color, "12")}">${cfg.icon} ${cfg.label}</span>`;
}

// ── Confidence bar ────────────────────────────────────────────────────────

function confBar(c, large = false) {
  const color = confColor(c);
  return `
    <div class="confidence-wrap">
      <div class="confidence-bar-bg${large ? " large" : ""}">
        <div class="confidence-bar-fill" style="width:${pct(c)};background:${color}"></div>
      </div>
      <span class="confidence-num" style="color:${color}">${pct(c)}</span>
    </div>`;
}

// ── Dashboard ─────────────────────────────────────────────────────────────

function renderDashboard() {
  const totFlags = RETURNS.reduce((n, r) => n + r.flags, 0);
  const totReview = RETURNS.reduce((n, r) => n + r.awaiting_review, 0);

  const rows = RETURNS.map((r) => {
    const sc = RETURN_STATUS_CONFIG[r.status];
    const flagCell =
      r.flags > 0
        ? `<span class="flag-count">${r.flags}</span>`
        : `<span class="text-3">—</span>`;
    const reviewCell =
      r.awaiting_review > 0
        ? r.awaiting_review
        : `<span class="text-3">—</span>`;
    return `
      <tr class="return-row" data-action="open-return" data-id="${r.id}">
        <td class="client-name">${r.client}</td>
        <td class="text-2">${r.filing_status}</td>
        <td><span class="badge" style="color:${sc.color};border-color:${alpha(sc.color, "28")};background:${alpha(sc.color, "12")}">${sc.label}</span></td>
        <td class="num">${flagCell}</td>
        <td class="num">${reviewCell}</td>
        <td class="text-2">${r.preparer}</td>
        <td class="text-2 mono">${r.due_date}</td>
      </tr>`;
  }).join("");

  return `
    <header class="header">
      <div class="header-brand">GreenGrowth CPAs</div>
      <div class="header-user">Michael Chen</div>
    </header>
    <main class="dashboard">
      <div class="dashboard-title">
        <h1>Returns</h1>
        <div class="stats-row">
          <span><strong>${RETURNS.length}</strong> returns</span>
          <span class="stat-sep">·</span>
          <span><strong>${totFlags}</strong> flags</span>
          <span class="stat-sep">·</span>
          <span><strong>${totReview}</strong> awaiting review</span>
        </div>
      </div>
      <table class="returns-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Filing Status</th>
            <th>Status</th>
            <th class="num">Flags</th>
            <th class="num">Awaiting Review</th>
            <th>Preparer</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </main>`;
}

// ── Fields panel ──────────────────────────────────────────────────────────

function renderFieldsPanel(rid) {
  const fields = getFields(rid);
  const grouped = groupBy(fields, "section");
  const flagged = fields.filter((f) => f.state === "flagged").length;
  const sel = state.selectedFieldId;
  const editing = state.editingFieldId;

  const tbody = Object.entries(grouped)
    .map(([section, sFields]) => {
      const fieldRows = sFields
        .map((f) => {
          const isSelected = sel === f.id;
          const isEditing = editing === f.id;

          const valueCell = isEditing
            ? `<input class="inline-input" id="edit-input" value="${f.value}" />`
            : `<span class="field-value mono">${f.value}</span>
           ${f.state === "manually_changed" ? `<span class="original-val mono">was ${f.original_ai_value}</span>` : ""}`;

          const doc = f.source_doc
            ? SOURCE_DOCS[rid]?.find((d) => d.id === f.source_doc)
            : null;
          const sourceCell = doc
            ? `<span class="source-badge">${doc.label} · ${f.source_location} · p.${f.source_page}</span>`
            : `<span class="text-3">${f.source_location}</span>`;

          const canAccept = !["verified", "manually_changed"].includes(f.state);
          const actions = isEditing
            ? `<button class="btn-sm btn-primary" data-action="save-field" data-id="${f.id}">Save</button>
           <button class="btn-sm btn-ghost" data-action="cancel-edit">Cancel</button>`
            : `${canAccept ? `<button class="btn-sm btn-ghost" data-action="accept-field" data-id="${f.id}">Accept</button>` : ""}
           <button class="btn-sm btn-ghost" data-action="edit-field" data-id="${f.id}">Edit</button>`;

          return `
        <tr class="field-row${isSelected ? " selected" : ""}${f.state === "flagged" ? " flagged" : ""}"
            data-action="select-field" data-id="${f.id}">
          <td class="col-line mono text-3">${f.line}</td>
          <td class="field-label">${f.label}</td>
          <td class="col-value">${valueCell}</td>
          <td>${sourceCell}</td>
          <td class="col-conf">${doc ? confBar(f.confidence) : ""}</td>
          <td>${badge(f)}</td>
          <td class="col-actions" onclick="event.stopPropagation()">${actions}</td>
        </tr>`;
        })
        .join("");

      return `<tbody>
      <tr class="section-row"><td colspan="7">${section}</td></tr>
      ${fieldRows}
    </tbody>`;
    })
    .join("");

  return `
    <div class="panel fields-panel">
      <div class="panel-header">
        <span class="panel-title">Return Fields</span>
        <span class="panel-sub">${fields.length} fields · ${flagged} flagged</span>
      </div>
      <div class="fields-scroll">
        <table class="fields-table">
          <thead>
            <tr>
              <th class="col-line">Line</th>
              <th>Field</th>
              <th class="col-value">Value</th>
              <th>Source</th>
              <th class="col-conf">Confidence</th>
              <th>Status</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          ${tbody}
        </table>
      </div>
    </div>`;
}

// ── Document panel ────────────────────────────────────────────────────────

function renderDocPanel(rid) {
  const field = state.selectedFieldId
    ? getField(rid, state.selectedFieldId)
    : null;
  const emptyMsg =
    '<div class="doc-empty">Select a field with a source document</div>';

  if (!field || !field.source_doc) {
    return `<div class="panel doc-panel">
      <div class="panel-header"><span class="panel-title">Source Document</span></div>
      ${emptyMsg}
    </div>`;
  }

  const layout = DOC_LAYOUTS[field.source_doc];
  const docMeta = SOURCE_DOCS[rid]?.find((d) => d.id === field.source_doc);

  if (!layout) {
    return `<div class="panel doc-panel">
      <div class="panel-header"><span class="panel-title">Source Document</span></div>
      <div class="doc-empty">Preview not available</div>
    </div>`;
  }

  const docRows = layout.rows
    .map((row) => {
      const hl = row.box === field.source_location ? " doc-row-highlight" : "";
      return `
      <div class="doc-row${hl}">
        <div class="doc-box-label">${row.box}</div>
        <div class="doc-box-desc">${row.label}</div>
        <div class="doc-box-value">${row.value}</div>
      </div>`;
    })
    .join("");

  return `
    <div class="panel doc-panel">
      <div class="panel-header">
        <span class="panel-title">Source Document</span>
        <span class="panel-sub">${docMeta?.label} · ${docMeta?.issuer} · p.${field.source_page || 1}</span>
      </div>
      <div class="doc-scroll">
        <div class="doc-sheet">
          <div class="doc-sheet-header">
            <div class="doc-sheet-title">${layout.title}</div>
            <div class="doc-sheet-issuer">${docMeta?.issuer} · Tax Year 2024</div>
          </div>
          <div class="doc-fields">${docRows}</div>
        </div>
      </div>
    </div>`;
}

// ── Insight panel ─────────────────────────────────────────────────────────

function renderInsightPanel(rid) {
  const field = state.selectedFieldId
    ? getField(rid, state.selectedFieldId)
    : null;

  if (!field) {
    return `<div class="panel insight-panel">
      <div class="panel-header"><span class="panel-title">AI Analysis</span></div>
      <div class="insight-empty">Select a field</div>
    </div>`;
  }

  const insight = MOCK_AI_INSIGHTS[field.id];

  const overrideBanner =
    field.state === "manually_changed"
      ? `
    <div class="insight-override-banner">
      <div class="override-label">Manually Override</div>
      <div class="override-detail">
        AI suggested: <span class="mono">${field.original_ai_value}</span><br>
        Current value: <span class="mono">${field.value}</span>
      </div>
    </div>`
      : "";

  const flagBanner =
    field.state === "flagged" && field.flag_reason
      ? `
    <div class="insight-flag-banner">
      <div class="flag-label">⚠ Needs Review</div>
      <div class="flag-detail">${field.flag_reason}</div>
    </div>`
      : "";

  const insightBody = insight
    ? `
    <div class="insight-section">
      <div class="insight-section-label">What the AI did</div>
      <div class="insight-text">${insight.summary}</div>
    </div>
    <div class="insight-section">
      <div class="insight-section-label">Confidence</div>
      <div class="confidence-large">
        <div class="confidence-bar-bg large" style="flex:1">
          <div class="confidence-bar-fill" style="width:${pct(insight.confidence)};background:${confColor(insight.confidence)}"></div>
        </div>
        <span class="confidence-num-large" style="color:${confColor(insight.confidence)}">${pct(insight.confidence)}</span>
      </div>
    </div>
    <div class="insight-section">
      <div class="insight-section-label">Evidence</div>
      <div class="insight-text">${insight.evidence}</div>
    </div>    
    ${
      insight.uncertainty
        ? `
    <div class="insight-section">
      <div class="insight-section-label">Uncertainty</div>
      <div class="insight-uncertainty">${insight.uncertainty}</div>
    </div>`
        : ""
    }
    <div class="insight-section">
      <div class="insight-section-label">Suggested action</div>
      <div class="insight-action">${insight.suggested_action}</div>
    </div>
    ${
      insight.correction_hint
        ? `
    <div class="insight-section">
      <div class="insight-section-label">Correction guidance</div>
      <div class="insight-text">${insight.correction_hint}</div>
    </div>`
        : ""
    }
    ${
      field.transformation
        ? `
    <div class="insight-section">
      <div class="insight-section-label">Transformation</div>
      <div class="insight-text">${field.transformation}</div>
    </div>`
        : ""
    }
  `
    : `<div class="insight-section"><div class="insight-text">No AI analysis for this field.</div></div>`;

  return `
    <div class="panel insight-panel">
      <div class="panel-header">
        <span class="panel-title">AI Analysis</span>
        ${badge(field)}
      </div>
      <div class="insight-scroll">
        ${overrideBanner}
        ${flagBanner}
        ${insightBody}
      </div>
    </div>`;
}

// ── Review screen ─────────────────────────────────────────────────────────

function renderReview(rid) {
  const ret = RETURNS.find((r) => r.id === rid);
  if (!ret) return '<div class="p14 text-3">Return not found.</div>';
  const sc = RETURN_STATUS_CONFIG[ret.status];

  return `
    <header class="header">
      <div class="header-brand">GreenGrowth CPAs</div>
      <div class="header-user">Michael Chen</div>
    </header>
    <div class="review-bar">
      <button class="back-btn" data-action="go-dashboard">← Returns</button>
      <div class="review-client">
        <span class="review-client-name">${ret.client}</span>
        <span class="text-3">·</span>
        <span class="text-2">${ret.tax_year} · ${ret.filing_status}</span>
        <span class="badge" style="color:${sc.color};border-color:${alpha(sc.color, "28")};background:${alpha(sc.color, "12")}">${sc.label}</span>
      </div>
      <div class="review-meta">Preparer: ${ret.preparer} · Due ${ret.due_date}</div>
    </div>
    <div class="review-grid">
      ${renderFieldsPanel(rid)}
      ${renderDocPanel(rid)}
      ${renderInsightPanel(rid)}
    </div>`;
}

// ── Render ────────────────────────────────────────────────────────────────

function render() {
  const app = document.getElementById("app");
  app.innerHTML =
    state.view === "dashboard"
      ? renderDashboard()
      : renderReview(state.returnId);

  if (state.editingFieldId) {
    const input = document.getElementById("edit-input");
    if (input) {
      input.focus();
      input.select();
    }
  }
}

// ── Events ────────────────────────────────────────────────────────────────

document.getElementById("app").addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;

  const action = el.dataset.action;
  const id = el.dataset.id;

  if (action === "open-return") {
    state.view = "review";
    state.returnId = id;
    state.selectedFieldId = null;
    state.editingFieldId = null;
  } else if (action === "go-dashboard") {
    state.view = "dashboard";
    state.returnId = null;
    state.selectedFieldId = null;
    state.editingFieldId = null;
  } else if (action === "select-field") {
    if (state.editingFieldId) return; // lock during edit
    state.selectedFieldId = id;
  } else if (action === "accept-field") {
    const f = getField(state.returnId, id);
    if (f) f.state = "verified";
    state.selectedFieldId = id;
  } else if (action === "edit-field") {
    state.editingFieldId = id;
    state.selectedFieldId = id;
  } else if (action === "save-field") {
    // read input value before re-render wipes the DOM
    const input = document.getElementById("edit-input");
    const newVal = input ? input.value.trim() : "";
    const f = getField(state.returnId, id);
    if (f && newVal && newVal !== f.value) {
      f.value = newVal;
      f.state = "manually_changed";
    }
    state.editingFieldId = null;
  } else if (action === "cancel-edit") {
    state.editingFieldId = null;
  }

  render();
});

// ── Init ──────────────────────────────────────────────────────────────────
render();
