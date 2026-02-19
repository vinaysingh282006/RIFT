
## PharmaGuard — 5 New UI Enhancement Features

This is a full build of the PharmaGuard frontend from scratch (since the current codebase is blank), **plus** all 5 requested enhancements integrated from the start. Here's exactly what will be built:

---

### 🏗️ Architecture — New Component Files

**Pages:**
- `src/pages/Index.tsx` — App shell with state management (upload state, analysis state, active mode)

**Core Components:**
- `src/components/Navbar.tsx` — Sticky nav with logo + links + Clinical Mode toggle
- `src/components/HeroSection.tsx` — Title, subtitle, CTA
- `src/components/InputSection.tsx` — VCF upload + drug chip selector
- `src/components/ResultsDashboard.tsx` — Hierarchical results layout
- `src/components/AnalysisPipeline.tsx` — ✨ **NEW: Animated timeline visualization**
- `src/components/RiskAssessmentPanel.tsx` — Primary focus card (large)
- `src/components/ClinicalRecommendation.tsx` — Primary focus card (large)
- `src/components/RiskComparisonTable.tsx` — ✨ **NEW: Multi-drug card comparison**
- `src/components/PharmacogenomicProfile.tsx` — Secondary card
- `src/components/AIExplanation.tsx` — Secondary card with Doctor/Patient toggle
- `src/components/EvidenceBadges.tsx` — ✨ **NEW: CPIC/PharmGKB/FDA source badges**
- `src/components/ConfidenceBar.tsx` — ✨ **NEW: Confidence with tooltip explanation**
- `src/components/QualityMetrics.tsx` — Secondary card
- `src/components/JsonOutputPanel.tsx` — Collapsible JSON viewer

**Shared Utilities:**
- `src/lib/mockData.ts` — All realistic mock data in one place

---

### ✨ Feature 1: Evidence Source Badges

Displayed prominently on the Risk Assessment Panel and Clinical Recommendation panel.

Three distinct badge styles:
- 🟢 **CPIC Guideline Supported** — green pill with shield icon
- 🔵 **PharmGKB Evidence Level A** — blue pill with database icon
- 🟠 **FDA Pharmacogenomic Label** — orange pill with government seal icon

Each badge is a compact inline chip. Hovering shows a tooltip with a one-line description of what that evidence source means (e.g., "Clinical Pharmacogenetics Implementation Consortium — highest tier guideline").

---

### ✨ Feature 2: Confidence Explanation Tooltip

Replaces the plain "Confidence: 87%" text.

Visual design:
- Animated progress bar with the percentage value
- An info icon `ⓘ` next to the label
- Hovering the icon opens a popover/tooltip containing:
  - "Based on variant evidence strength, guideline agreement, and data completeness."
  - Three sub-items shown as small progress rows: Variant Evidence / Guideline Match / Data Completeness — each with its own mini bar

Implemented using the existing `Tooltip` + `TooltipContent` Radix components already in the project.

---

### ✨ Feature 3: Animated Analysis Pipeline Timeline

Shown between the input section and results, triggered when "Run Analysis" is clicked.

Five steps displayed as a horizontal flow (desktop) / vertical stack (mobile):
1. 📄 **VCF Upload** — file validation
2. 🔬 **Variant Detection** — SNP/indel calling
3. 🧬 **Gene Interpretation** — diplotype assignment
4. ⚠️ **Drug Risk Scoring** — pharmacogenomic lookup
5. 📋 **Recommendation** — clinical guideline match

Animation behavior:
- Steps light up sequentially with a 600ms delay each (CSS transitions + a simple `setTimeout` chain using `useState`)
- Active step has a teal glowing ring and animated pulse dot
- Completed steps show a green checkmark
- Connecting lines animate fill left-to-right as each step completes
- Total pipeline animation runs ~3 seconds, then results fade in

---

### ✨ Feature 4: Risk Comparison Table (Multi-Drug View)

A dedicated panel in the results dashboard showing all analyzed drugs side-by-side.

Card grid layout (2 columns desktop, 1 column mobile):

Each drug card shows:
- Drug name in bold
- Large color-coded risk badge (Toxic / Adjust Dose / Safe / Unknown)
- Phenotype tag (e.g., PM, IM, NM)
- Confidence mini-bar
- One-line clinical note (e.g., "Avoid standard dosing — increased toxicity risk")
- Evidence badge row (mini versions)

Example mock data:
| Drug | Risk | Phenotype |
|------|------|-----------|
| CODEINE | 🔴 Toxic | PM |
| WARFARIN | 🟡 Adjust Dosage | IM |
| SIMVASTATIN | 🟢 Safe | NM |
| CLOPIDOGREL | 🔴 Ineffective | PM |

This panel sits at the top of results (high visual priority) so judges immediately grasp clinical realism.

---

### ✨ Feature 5: Hierarchical Results Dashboard Layout

Replaces the old equal-weight grid with a deliberate visual hierarchy:

**Tier 1 — Primary Focus (full width or 2/3 width):**
- Risk Assessment Panel (largest card, most visual weight)
- Clinical Recommendation Panel (prominent, formatted like a clinical note)

**Tier 2 — Supporting Context (side column or second row):**
- Risk Comparison Table (multi-drug grid)
- Pharmacogenomic Profile (gene/diplotype/phenotype details)

**Tier 3 — Supplemental (collapsed or compact):**
- AI Explanation (with Doctor/Patient toggle — already planned)
- Quality Metrics (data completeness indicators)
- JSON Output Panel (collapsible at the bottom)

Layout uses CSS Grid with named areas, adapting to a single column on mobile. Visual weight is communicated through card size, border prominence, and typography scale — not color alone (accessibility-friendly).

---

### 🎨 Design Tokens (Global CSS Variables)

The `index.css` will be updated to set the dark medical blue background as the default, define teal accent colors, and add custom CSS variables for status colors:
- `--risk-safe`, `--risk-adjust`, `--risk-toxic`, `--risk-unknown`

All Tailwind classes will reference these tokens for consistent theming.

---

### Clinical Mode Toggle (Global State)

A persistent toggle in the Navbar (`Doctor Mode | Patient Mode`) controls a React context/state that propagates to:
- `AIExplanation` — switches between technical pharmacokinetics text and plain language
- `ClinicalRecommendation` — switches between prescription-style wording and patient-friendly advice
- `PharmacogenomicProfile` — shows/hides technical gene notation

The toggle uses a clean pill-style switcher with smooth transition.
