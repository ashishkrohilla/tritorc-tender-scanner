# Tritorc Tender / SOW Keyword Scanner

A full-stack tool that scans uploaded tender/SOW documents (PDF or DOCX) for
Tritorc-relevant keywords (bolting, torque, flange management, etc.) and
generates a downloadable Excel summary with a relevance verdict per document.

## Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Communication:** REST API (multipart file upload → JSON + base64 Excel)
- **Libraries:** `pdf-parse` (PDF text), `mammoth` (DOCX text), `exceljs` (report generation)

## Project structure

```
tritorc-tender-scanner/
├── backend/
│   ├── config/keywords.json      # editable keyword list (not hardcoded)
│   ├── routes/scan.js            # POST /api/scan
│   ├── utils/extractText.js      # PDF/DOCX -> plain text
│   ├── utils/keywordMatch.js     # matching + relevance scoring
│   ├── utils/generateExcel.js    # builds the .xlsx report
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/UploadForm.jsx
│       ├── components/ResultsTable.jsx
│       ├── api.js
│       └── App.jsx
├── sample-docs/                  # test documents (see below)
├── AI_NOTES.txt
└── DEPLOY.md
```

## Setup — run locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# App runs on http://localhost:5173
```

Open `http://localhost:5173`, upload one or more PDF/DOCX files, click **Scan**,
and download the generated Excel report.

## How it works

1. **Upload** — React form (drag-and-drop or file picker) accepts multiple
   `.pdf`/`.docx` files and posts them to `POST /api/scan` as `multipart/form-data`.
2. **Text extraction** — the backend reads each file with `pdf-parse` (PDF) or
   `mammoth` (DOCX) to get plain text.
3. **Keyword matching** — text is lowercased and whitespace-normalized, then
   each keyword from `config/keywords.json` is matched with a small regex that
   also tolerates simple suffix variants on the last word (e.g. "torque wrench"
   also matches "torque wrenches"; "pre-tensioning" also matches
   "pre-tensioned"). This is a lightweight stand-in for full stemming/fuzzy
   matching (noted as a bonus in the brief).
4. **Relevance verdict** — computed dynamically from match count, not
   hardcoded: `0 → No`, `1–2 → Possible`, `3+ → Yes`. Thresholds live in
   `utils/keywordMatch.js::getRelevance` and can be tuned easily.
5. **Excel generation** — `exceljs` builds a `.xlsx` with columns
   `Document Name | Matched Keywords | Match Count | Relevance to Tritorc`,
   colour-coded by verdict, returned to the frontend as base64 and also
   summarized in the on-screen results table.

## Sample test documents (`sample-docs/`)

- `01_Related_HydraulicTorqueWrench_RSP.pdf` — real GeM bid for a Hydraulic
  Torque Wrench; expected to score **Related**.
- `02_NotRelated_HydraulicNut_BHEL.pdf` — real GeM bid for hydraulic nuts
  (unrelated commodity); expected **Not Related**.
- `03_NotRelated_TubeBevelingMachine_OPGC.pdf` — real GeM bid for a tube
  beveling machine; expected **Not Related**.
- `04_Borderline_ShutdownMaintenance_SOW.docx` — a custom-written SOW that
  mentions shutdown/turnaround language but explicitly excludes bolting/torque
  work, used to sanity-check the DOCX extraction path and the "Possible"
  threshold.

## Known simplifications

- Matching is substring/regex based (as the brief allows), so a keyword
  appearing in a negated sentence ("does NOT include bolted joint work")
  will still count as a match — a full NLP/negation-aware pass is out of
  scope for this exercise.
- MongoDB (scan history) was left out as it's marked optional/bonus in the
  brief; the app is fully stateless per scan.
