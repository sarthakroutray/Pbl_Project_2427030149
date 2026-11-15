# IntelliMed-AI Project Showcase

[![Project Status: Active](https://img.shields.io/badge/status-active-brightgreen.svg)](https://github.com/sarthakroutray/IntelliMed-AI)
[![Upstream Repository](https://img.shields.io/badge/upstream-sarthakroutray%2FIntelliMed--AI-00e5ff.svg)](https://github.com/sarthakroutray/IntelliMed-AI)
[![Test Suite](https://img.shields.io/badge/tests-297%20passing-brightgreen.svg)](https://github.com/sarthakroutray/IntelliMed-AI)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An academic showcase and research documentation portal for **[IntelliMed-AI](https://github.com/sarthakroutray/IntelliMed-AI)**, an edge-centric, privacy-preserving medical document lifecycle and diagnostic intelligence system.

Built with React 18, Vite, and Tailwind CSS using an authoritative brutalist dark theme, ready for GitHub Pages deployment.

---

## Academic Information

- **Institution**: Manipal University Jaipur
- **Department**: Department of Computer Science & Engineering
- **Course**: Project Based Learning (PBL 2026)
- **Registration Number**: `2427030149`
- **Project Guide**: Ms. Soni Gupta
- **Parent Repository**: [https://github.com/sarthakroutray/IntelliMed-AI](https://github.com/sarthakroutray/IntelliMed-AI)

---

## System Overview

**IntelliMed-AI** bridges the critical communication and safety gap between patients and healthcare providers. It provides end-to-end management of complex medical records—including printed and handwritten prescriptions, laboratory blood panels, and chest radiographs (X-rays)—without compromising patient privacy.

### Core Problems Addressed
1. **Extraction vs. Interpretation Conflation**: Monolithic LLMs routinely hallucinate numbers and clinical judgments when performing OCR and diagnosis in a single probabilistic pass.
2. **Cloud Dependency & PHI Exposure**: Centralized cloud systems transmit unencrypted protected health information (PHI) over WAN connections, failing HIPAA/GDPR Article 9 privacy-by-design standards.
3. **No Point-of-Capture Triage**: Blurry, glare-distorted photos degrade OCR accuracy; standard scanners lack quality gates or instant local panic-value triage.
4. **Disconnected Clinicians**: Patients lack an authenticated loop to share structured lab summaries with verified doctors for clinical verification and digital sign-off.

### Solution Architecture
IntelliMed-AI operates a **hybrid cloud/edge topology**:
- **Mobile Handsets (Edge)**: Execute on-device neural inference and deterministic normalization. Raw medical images are processed entirely in ephemeral volatile RAM and never leave the device during local capture.
- **Backend API Gateway**: FastAPI service managing JWT authentication, doctor-patient linking, Supabase private encrypted storage, and the three-stage server-side lab pipeline.
- **Web Single Page Application**: React dashboard enabling doctors to review AI-extracted medications, inspect longitudinal biomarker trends, annotate records, and apply digital sign-offs.

---

## Intelligence & Model Specifications

| Model / Engine | Footprint | Architecture / Runtime | Clinical Purpose | Optimization Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **ResNet-50** | ~94 MB | Fine-tuned PyTorch CNN; exported to ONNX (Opset 17) via `flutter_onnxruntime` | Chest X-Ray classification (Normal, Bacterial Pneumonia, Viral Pneumonia) | Parity across NPU/CPU; 93.8% test accuracy; zero cloud image upload |
| **Qwen3-0.6B** | ~382 MB | Q4_0 GGUF causal SLM via `llama_cpp_dart` FFI bindings | On-device clinical explanations & multilingual report translation | Pre-filled empty `<think>` block truncates reasoning latency by ~70% |
| **Falconsai T5-Small** | ~94 MB | Quantized int8 ONNX encoder/decoder pair (`t5_encoder_q8.onnx` + `t5_decoder_q8.onnx`) | Medical text summarization & non-prescription standardization | SentencePiece Dart runtime parity-pinned to Hugging Face reference vectors |
| **Rule Engine (Stage 3)** | 0 MB (Code) | Deterministic Python & native Dart ports (`clinical_rules.json`) | 10 derived formulas, 43 clinical patterns, panic-value thresholds | 100% deterministic; zero probabilistic hallucinations |

---

## Three-Stage Lab Understanding Pipeline

To guarantee clinical safety, the system enforces a strict separation between extraction and interpretation:

```
[Raw Document / Image]
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ Stage 1: Multimodal Extraction & Geometric Layout     │
│ - On-Device: Google ML Kit Document Scanner & OCR      │
│ - Server-Side: OpenDataLoader-PDF (xycut clustering)   │
│ - Fallback: EasyOCR (CRAFT + CRNN)                     │
│ Output: Raw tokens, 2D bounding boxes, table geometry   │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ Stage 2: Deterministic Normalization                   │
│ - Maps abbreviations (e.g., Hb -> Hemoglobin)          │
│ - Preserves raw values, prints exact reference bounds  │
│ - Strictly ZERO diagnostic judgments or inferred flags │
│ Output: Canonical 10-Key Lab Test JSON Schema          │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ Stage 3: Deterministic Rule Engine                     │
│ - 10 Derived Arithmetic Indices (eGFR, De Ritis, etc.) │
│ - 43 Multi-Analyte Clinical Pattern Engines            │
│ - Panic-Value & Critical Threshold Flagging            │
│ - Total Bilirubin / Protein Arithmetic Consistency     │
│ Output: Annotated Clinical Report + Verification Diffs │
└────────────────────────────────────────────────────────┘
```

### Supported Derived Clinical Formulas
1. **eGFR (CKD-EPI 2021 race-free)**: Glomerular filtration estimation for chronic kidney disease staging.
2. **Serum Anion Gap**: `Na⁺ - (Cl⁻ + HCO₃⁻)` for triage of High Anion Gap Metabolic Acidosis (DKA, lactic acidosis).
3. **De Ritis Ratio (AST/ALT)**: Differentiates alcoholic hepatitis (> 2.0) from viral/ischemic liver injury (< 1.0).
4. **Mentzer Index**: `MCV / RBC` to differentiate beta-thalassemia trait (< 13) from iron deficiency anemia (> 13).
5. **Payne's Corrected Calcium**: Corrects total serum calcium for hypoalbuminemic conditions.
6. **BUN / Creatinine Ratio**: Distinguishes prerenal azotemia (> 20:1) from acute tubular necrosis.
7. **Albumin-to-Globulin (A/G) Ratio**: Assesses chronic hepatic synthetic failure and monoclonal gammopathies.
8. **Non-HDL Cholesterol**: Quantifies total circulating atherogenic apolipoprotein B–containing lipoproteins.
9. **Transferrin Saturation Index (TSAT)**: Differentiates absolute iron deficiency (< 20%) from iron overload (> 45%).
10. **Neutrophil-to-Lymphocyte Ratio (NLR)**: Bedside index for occult bacterial sepsis and severe systemic inflammation.

---

## System Architecture & API Versioning

```
+───────────────────────────────────────────────────────────────────────────────────+
│                                  CLIENT LAYER                                     │
│  ┌────────────────────────────────────┐    ┌───────────────────────────────────┐  │
│  │   React 18 Web SPA (Vercel)        │    │ Flutter Mobile App (Android 8.0+) │  │
│  │ - Role-based route protection      │    │ - Google ML Kit Scanner & Gates   │  │
│  │ - Document Viewer & Doctor Review  │    │ - On-Device ResNet50 & Qwen3 SLM  │  │
│  │ - Digital Sign-Off Workflow        │    │ - SQLite Store + V2Sync Engine    │  │
│  └─────────────────┬──────────────────┘    └─────────────────┬─────────────────┘  │
+────────────────────┼─────────────────────────────────────────┼────────────────────+
                     │ HTTP REST (/api/v1/*)                   │ HTTP REST (/api/v1/* & /api/v2/*)
                     ▼                                         ▼
+───────────────────────────────────────────────────────────────────────────────────+
│                              BACKEND API GATEWAY                                  │
│                           FastAPI (Modal Serverless / Docker)                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │ Security: JWT Bearer (HS256) | Google OAuth Verification | bcrypt hashing   │  │
│  │ Caching: In-Memory FastAPICache + TTL Request Cache                         │  │
│  │ Endpoints: /api/v1/auth, /api/v1/doctor, /api/v1/patient, /api/v2/lab-reports │  │
│  └──────────────────────────────────────┬──────────────────────────────────────┘  │
+─────────────────────────────────────────┼─────────────────────────────────────────+
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
+────────────────────────────────────────┐  +───────────────────────────────────────+
│           STORAGE & DATABASE           │  │         SERVERLESS AI WORKERS         │
│ - PostgreSQL via Prisma ORM            │  │ - Modal GPU Worker (ResNet50/Torch)   │
│ - Supabase Storage (Private S3 Bucket) │  │ - OpenDataLoader-PDF Table Extractor  │
│ - Ephemeral Mobile SQLite Database     │  │ - Rule Engine Validation Pipeline     │
+────────────────────────────────────────+  +───────────────────────────────────────+
```

### API Contracts
- **`/api/v1/*` (Frozen Contract)**: Dedicated to the web application. Handles user authentication, profile data, patient-doctor linking, document retrieval, and doctor verification actions.
- **`/api/v2/*` (Structured Ingest)**: High-throughput ingestion of structured lab schemas emitted by the mobile on-device engine. Includes idempotent document sharing, background AI analysis queues, and longitudinal trend aggregation.

---

## Mobile Application Features

The native mobile app (`mobile/`, Flutter 3.44+ / Dart 3.12+) includes:
- **Classical CV Quality Gates**: Runs Laplacian variance blur detection, clipped-white glare filtering, and minimum contrast checks before OCR inference.
- **Document Scanner**: Perspective correction, edge detection, and auto-dewarping via `google_mlkit_document_scanner`.
- **Longitudinal Biomarker Trends**: Unit-consistent historical series displayed with dynamic reference-band shaded sparklines.
- **Offline-First Persistence**: Local SQLite database storing extraction payloads with automatic retry and `V2Sync` background worker synchronization.
- **Doctor Linking**: Patient generates ephemeral 6-character access codes directly from the profile screen.

---

## Verification & Automated Test Coverage

The parent IntelliMed-AI repository features **297 automated tests**:
- **Mobile Test Suite (`mobile/test/`)**: **248 automated tests** covering inference correctness, geometric table reconstruction, token refreshes, Dart clinical engine calculations, and widget layout regressions.
- **Backend Test Suite (`backend/tests/`)**: **49 automated tests** verifying arithmetic engine formulas, single-test reference flags, 43 multi-analyte pattern matches, and v2 structured schema conformance.

---

## Getting Started with this Showcase

### Prerequisites
- Node.js 18.x or newer
- npm 9.x or newer

### Installation

```bash
# Clone the repository
git clone https://github.com/sarthakroutray/Pbl_Project_2427030149.git
cd Pbl_Project_2427030149

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

### Deployment to GitHub Pages

```bash
npm run deploy
```
This builds the site with Vite and deploys the generated bundle to the `gh-pages` branch.

---

## Project Structure

```
├── public/                     # Static assets and screenshot previews
│   ├── Doctor Dashboard.png    # Doctor portal verification screenshot
│   ├── Patient_Dashboard.png   # Patient web dashboard screenshot
│   ├── Prescription Parsing.png# Lab table rebuild screenshot
│   ├── Xray.png                # On-device X-ray classification screenshot
│   ├── app_auth.jpeg           # Mobile OAuth sign-in screen
│   ├── app_capture.jpeg        # Mobile edge capture & quality gate
│   ├── app_home.jpeg           # Mobile dashboard & sync queue
│   ├── app_lab_report.jpeg     # Mobile structured lab report view
│   ├── app_profile.jpeg        # Mobile doctor linking & access code
│   └── app_trends.jpeg         # Mobile longitudinal biomarker sparklines
├── src/
│   ├── App.jsx                 # Showcase interactive dashboard & research sections
│   ├── main.jsx                # React application entry point
│   └── index.css               # Brutalist styling, custom typography & scrollbars
├── index.html                  # HTML entry with Inter & Material Symbols fonts
├── package.json                # Dependencies and deployment scripts
├── tailwind.config.js          # Brutalist dark theme configuration
└── vite.config.js              # Vite configuration
```

---

## References & Academic Citations

1. **Kaissis, G. A., et al. (2020)**. *Secure, privacy-preserving and federated machine learning in medical imaging*. Nature Machine Intelligence, 2(6), 305–311.
2. **Inker, L. A., et al. (2021)**. *New creatinine- and cystatin C–based equations to estimate GFR without race*. New England Journal of Medicine, 385(19), 1737–1749.
3. **Mentzer, W. C. (1973)**. *Differentiation of iron deficiency from thalassaemia trait*. The Lancet, 301(7808), 882.
4. **De Ritis, F., et al. (1957)**. *An enzymic test for the study of a generic form of acute hepatitis*. Clinica Chimica Acta, 2(1), 70–74.
5. **Emmett, M., & Narins, R. G. (1977)**. *Clinical use of the anion gap*. Medicine, 56(1), 38–54.
6. **Payne, R. B., et al. (1973)**. *Interpretation of serum calcium in patients with abnormal serum proteins*. British Medical Journal, 4(5893), 643–646.
7. **Grundy, S. M., et al. (2019)**. *2018 AHA/ACC Guideline on the Management of Blood Cholesterol*. Circulation, 139(25), e1082–e1143.
8. **Zahorec, R. (2001)**. *Ratio of neutrophil to lymphocyte counts—rapid and simple parameter of systemic inflammation and stress in critically ill*. Bratisl Lek Listy, 102(1), 5–14.
9. **He, K., et al. (2016)**. *Deep residual learning for image recognition*. IEEE CVPR, 770–778.
10. **Singhal, K., et al. (2023)**. *Large language models encode clinical knowledge*. Nature, 620(7972), 172–180.

---

**© 2026 Manipal University Jaipur — Department of Computer Science & Engineering**  
*Project Based Learning (PBL) Course — Registration No: 2427030149*
