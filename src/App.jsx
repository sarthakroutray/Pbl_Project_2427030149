import React, { useEffect, useState } from 'react'

const REPO_OWNER = 'sarthakroutray'
const REPO_NAME = 'IntelliMed-AI'
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`
const GITHUB_API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`
const GITHUB_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
}

const GITHUB_FALLBACK = {
  stars: 0,
  forks: 0,
  openIssues: 0,
  watchers: 0,
  defaultBranch: 'main',
  pushedAt: '2026-04-09T21:43:18Z',
  updatedAt: '2026-04-09T21:43:22Z',
  latestCommitSha: '3f560d9',
  latestCommitMessage: 'Feat: Update Readme and Documentation to Latest Version',
  latestCommitDate: '2026-04-09T21:43:11Z',
  contributors: 1,
  branches: 2,
  topContributor: 'sarthakroutray',
  topContributions: 21,
  languages: [
    { name: 'Dart', percentage: 45 },
    { name: 'Python', percentage: 15 },
    { name: 'Other', percentage: 40 }
  ]
}

const formatStopwatchTime = (milliseconds) => {
  const totalCentiseconds = Math.floor(milliseconds / 10)
  const minutes = String(Math.floor(totalCentiseconds / 6000)).padStart(2, '0')
  const seconds = String(Math.floor((totalCentiseconds % 6000) / 100)).padStart(2, '0')
  const centiseconds = String(totalCentiseconds % 100).padStart(2, '0')
  return `${minutes}:${seconds}.${centiseconds}`
}

const formatGithubDate = (value) => {
  if (!value) {
    return 'N/A'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A'
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).toUpperCase()
}

const getLanguageBreakdown = (languagesObject) => {
  if (!languagesObject || typeof languagesObject !== 'object') {
    return []
  }

  const entries = Object.entries(languagesObject)
  if (!entries.length) {
    return []
  }

  const totalBytes = entries.reduce((accumulator, [, bytes]) => accumulator + bytes, 0)

  return entries
    .sort(([, currentBytes], [, nextBytes]) => nextBytes - currentBytes)
    .slice(0, 5)
    .map(([name, bytes]) => ({
      name,
      percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0
    }))
}

const MIGRATION_ROWS = [
  { feature: 'Data Architecture', legacy: 'Centralized cloud uploads; MongoDB for unstructured AI results.', expanded: 'Privacy-first hybrid; PostgreSQL/Prisma for structured metadata; private object storage.' },
  { feature: 'Processing Node', legacy: 'Basic API gateway coordinating remote cloud AI services.', expanded: 'Edge-centric; on-device AI/ML (ResNet-50, Qwen3 SLM).' },
  { feature: 'User Workflow', legacy: 'Passive storage with web-dashboard summaries.', expanded: 'Active full-cycle doctor-verification loops with digital sign-off.' },
  { feature: 'Intelligence Logic', legacy: 'Opaque server-side model calls.', expanded: 'Deterministic extraction / interpretation separation for clinical safety.' }
]

const PRIOR_ART = [
  { title: 'Generic Scanners', ex: 'Lens, Adobe Scan', desc: 'Great dewarp + OCR, but generic text — 11.2 next to Hemoglobin is never read as a biomarker vs a range.' },
  { title: 'Rx / Report Apps', ex: '1mg, Practo', desc: 'Extract med names + doses, but no deterministic interpretation, panic triage, or doctor sign-off.' },
  { title: 'Ambient Scribes', ex: 'DAX, Abridge', desc: 'Cloud speech-to-text + generative notes — probabilistic LLMs sit in the diagnostic path, hallucination risk.' },
  { title: 'Symptom Checkers', ex: 'Ada, Buoy', desc: 'Real triage logic, but manual questionnaire input only — never parse raw Rx, labs, or X-rays.' },
  { title: 'PHR Aggregators', ex: 'Apple Health, Portals', desc: 'Passive EHR storage — no extraction, normalization, or interpretation of paper scans.' }
]

const CORE_GAPS = [
  { n: '01', title: 'Extraction ≠ Interpretation', desc: 'Opaque LLMs do both jobs at once — high hallucination risk in diagnostics.' },
  { n: '02', title: 'Cloud Dependency', desc: 'Raw unencrypted documents shipped to servers; no offline-first neural inference.' },
  { n: '03', title: 'No Point-of-Capture Triage', desc: 'No blur/glare gates or live local rule checks for panic-level labs at capture.' },
  { n: '04', title: 'Disconnected Clinicians', desc: 'Scanning tools isolated from doctors — no review, annotate, sign-off loop.' }
]

const GAP_MATRIX = [
  { sys: 'Generic Scanners', ocr: 'Yes', rules: 'No', edge: 'Yes', loop: 'No', cv: 'No' },
  { sys: 'Consumer Rx Scanners', ocr: 'Yes', rules: 'No', edge: 'Partial', loop: 'No', cv: 'No' },
  { sys: 'Ambient Scribes', ocr: 'Speech', rules: 'LLM', edge: 'No', loop: 'Partial', cv: 'No' },
  { sys: 'Symptom Checkers', ocr: 'No', rules: 'Yes', edge: 'No', loop: 'Partial', cv: 'No' },
  { sys: 'PHR Aggregators', ocr: 'No', rules: 'No', edge: 'N/A', loop: 'No', cv: 'No' },
  { sys: 'IntelliMed-AI', ocr: 'Yes', rules: 'Deterministic', edge: 'Yes', loop: 'Yes', cv: 'Yes', highlight: true }
]

const BRIDGE_STAGES = [
  { n: 'S1', title: 'Multimodal Extraction', desc: 'ML Kit on-device / OpenDataLoader-EasyOCR on backend: text, boxes, geometry.' },
  { n: 'S2', title: 'Deterministic Structuring', desc: 'Unified 10-key schema (names, units, bounds) — zero diagnostic judgments.' },
  { n: 'S3', title: 'Rule Engine', desc: 'Pure rules, no LLM: panic thresholds, Mentzer / eGFR, multi-analyte patterns.' },
  { n: 'S4', title: 'Doctor Loop', desc: '6-char access codes; clinicians review, annotate, digitally stamp results.' }
]

const PIPELINE_STAGES = [
  { n: '01', title: 'Capture', desc: 'Perspective correction and dewarping via Google ML Kit.' },
  { n: '02', title: 'Quality Gate', desc: 'Laplacian variance checks for blur, glare, darkness.' },
  { n: '03', title: 'Extraction', desc: 'Google ML Kit OCR or character-level digital PDF extraction.' },
  { n: '04', title: 'Structuring', desc: 'Y-axis projection + horizontal gutters to rebuild rows and columns.' },
  { n: '05', title: 'Normalization', desc: 'Map to canonical 10-key schema via bundled clinical_rules.json.' },
  { n: '06', title: 'Persistence', desc: 'Local SQLite + V2Sync background worker for eventual consistency.' }
]

const MODEL_ROWS = [
  { model: 'ResNet-50', size: '~94MB', purpose: 'Chest X-ray classification', spec: 'ONNX, opset 17', opt: 'NPU/CPU runtime parity' },
  { model: 'Qwen3-0.6B', size: '~382MB', purpose: 'Clinical explanations', spec: 'Q4_0 GGUF', opt: 'Empty think-block prefill cuts tokens ~70%' }
]


const ACADEMIC_DOMAINS = [
  {
    id: 'edge',
    tag: 'Domain 01',
    title: 'Edge Computing & Privacy-Preserving Health Architectures',
    icon: 'security',
    priorArt: 'Traditional Clinical Decision Support Systems (e.g., Epic Cosmos, Cerner Millennium, IBM Watson Health) rely strictly on centralized cloud warehousing. This exposes Protected Health Information (PHI) to broad threat surfaces, incurs high network latency (500ms–5000ms), and fails in low-bandwidth clinic settings.',
    solution: 'IntelliMed-AI implements a Decentralized Privacy-Preserving AI (PPAI) framework compliant with GDPR Art. 9 and HIPAA 45 CFR § 164.514. Raw imagery is processed entirely in on-device volatile RAM and discarded; only canonical 10-key structured JSON is ever synced.',
    citations: [
      {
        author: 'Kaissis, G. A., et al.',
        year: '2020',
        title: 'Secure, privacy-preserving and federated machine learning in medical imaging',
        venue: 'Nature Machine Intelligence, 2(6), 305–311',
        doi: '10.1038/s42256-020-0186-1',
        url: 'https://doi.org/10.1038/s42256-020-0186-1',
        badge: 'Privacy-Preserving ML'
      },
      {
        author: 'Shi, W., et al.',
        year: '2016',
        title: 'Edge Computing: Vision and Challenges',
        venue: 'IEEE Internet of Things Journal, 3(5), 637–646',
        doi: '10.1109/JIOT.2016.2579198',
        url: 'https://doi.org/10.1109/JIOT.2016.2579198',
        badge: 'Edge Architecture'
      },
      {
        author: 'Ghane, B., et al.',
        year: '2024',
        title: 'Edge Computing in Healthcare: Enhancing Clinical Decision-Making and Operational Efficiency',
        venue: 'Journal of Healthcare Informatics Research, 8(2), 145–168',
        doi: '10.1007/s41666-024-00162-8',
        url: 'https://doi.org/10.1007/s41666-024-00162-8',
        badge: 'IoMT Health Nodes'
      }
    ]
  },
  {
    id: 'neurosymbolic',
    tag: 'Domain 02',
    title: 'Neuro-Symbolic AI & Clinical Hallucination Mitigation',
    icon: 'psychology',
    priorArt: 'Pure generative LLMs (e.g., Med-PaLM 2, GPT-4, BioGPT) suffer from stochastic hallucinations, probabilistic non-determinism, and erroneous unit conversions, making unconstrained generative models hazardous for automated diagnostic thresholding.',
    solution: 'IntelliMed-AI implements Governed Convergence: LLMs strictly power the natural language interaction and query parsing layer, while an auditable, deterministic symbolic rules engine retains sole authority over diagnostic classifications, dosage validation, and emergency escalation.',
    citations: [
      {
        author: 'Singhal, K., et al.',
        year: '2023',
        title: 'Large Language Models Encode Clinical Knowledge',
        venue: 'Nature, 620(7972), 172–180',
        doi: '10.1038/s41586-023-06291-2',
        url: 'https://doi.org/10.1038/s41586-023-06291-2',
        badge: 'Medical LLM Benchmark'
      },
      {
        author: 'Marcus, G.',
        year: '2020',
        title: 'The Next Decades in AI: Four Steps Towards Robust Artificial Intelligence',
        venue: 'arXiv preprint arXiv:2002.06177',
        doi: '10.48550/arXiv.2002.06177',
        url: 'https://arxiv.org/abs/2002.06177',
        badge: 'Neuro-Symbolic AI'
      },
      {
        author: 'Healthily Clinical Safety Team',
        year: '2024',
        title: 'Generistic AI: The Governed Convergence of Generative and Deterministic AI in Healthcare',
        venue: 'Healthily Clinical Safety White Paper',
        doi: null,
        url: 'https://www.livehealthily.com',
        badge: 'Deterministic Safety'
      }
    ]
  },
  {
    id: 'quantization',
    tag: 'Domain 03',
    title: 'On-Device Neural Optimization & Quantization',
    icon: 'memory',
    priorArt: 'Server-class vision backbones and unquantized LLMs require excessive VRAM (>16GB) and high memory bandwidth, triggering severe thermal throttling, battery drain, and out-of-memory termination on mobile consumer hardware.',
    solution: 'ResNet-50 is compiled via ONNX (opset 17) for cross-platform NPU/CPU hardware parity (Android NNAPI / CoreML). Small Language Models (Qwen3 / LLaMA variants) run via 4-bit integer quantization (Q4_K_M GGUF in llama.cpp) with empty thinking delimiter pre-filling (<think>\\n</think>) that suppresses verbose internal monologue tokens to cut decode latency by ~70%.',
    citations: [
      {
        author: 'He, K., et al.',
        year: '2016',
        title: 'Deep Residual Learning for Image Recognition',
        venue: 'IEEE Conference on Computer Vision and Pattern Recognition (CVPR), 770–778',
        doi: '10.1109/CVPR.2016.90',
        url: 'https://doi.org/10.1109/CVPR.2016.90',
        badge: 'Residual Networks'
      },
      {
        author: 'Rajpurkar, P., et al.',
        year: '2017',
        title: 'CheXNet: Radiologist-Level Pneumonia Detection on Chest X-Rays with Deep Learning',
        venue: 'arXiv preprint arXiv:1711.05225',
        doi: '10.48550/arXiv.1711.05225',
        url: 'https://arxiv.org/abs/1711.05225',
        badge: 'Radiology CV'
      },
      {
        author: 'Dettmers, T., et al.',
        year: '2022',
        title: 'LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale',
        venue: 'Advances in Neural Information Processing Systems (NeurIPS), 35, 30318–30332',
        doi: '10.48550/arXiv.2208.07339',
        url: 'https://arxiv.org/abs/2208.07339',
        badge: 'INT8 Quantization'
      },
      {
        author: 'Gerganov, G.',
        year: '2023',
        title: 'llama.cpp: Port of Facebook\'s LLaMA model in C/C++',
        venue: 'GitHub Open Source Archive',
        doi: null,
        url: 'https://github.com/ggerganov/llama.cpp',
        badge: 'Edge LLM Runtime'
      }
    ]
  },
  {
    id: 'clinical',
    tag: 'Domain 04',
    title: 'Standardized Clinical Rule Formulations (Dart/Python)',
    icon: 'calculate',
    priorArt: 'Clinical calculations embedded inside black-box models or generic health apps often fail silently, introduce regional formula variations, or retain deprecated racial coefficients that lead to unequal diagnostic care.',
    solution: 'IntelliMed encodes peer-reviewed mathematical guidelines into dual-engine parity (Python backend + Dart mobile). Features the race-free CKD-EPI 2021 equation, Mentzer Index for microcytic anemia differentiation, De Ritis liver ratio, Serum Anion Gap, and Payne corrected calcium.',
    citations: [
      {
        author: 'Inker, L. A., et al.',
        year: '2021',
        title: 'New Creatinine- and Cystatin C–Based Equations to Estimate GFR without Race',
        venue: 'New England Journal of Medicine, 385(19), 1737–1749',
        doi: '10.1056/NEJMoa2102953',
        url: 'https://doi.org/10.1056/NEJMoa2102953',
        badge: 'Nephrology'
      },
      {
        author: 'Mentzer, W. C.',
        year: '1973',
        title: 'Differentiation of iron deficiency from thalassaemia trait',
        venue: 'The Lancet, 301(7808), 882',
        doi: '10.1016/S0140-6736(73)91446-3',
        url: 'https://doi.org/10.1016/S0140-6736(73)91446-3',
        badge: 'Hematology'
      },
      {
        author: 'De Ritis, F., et al.',
        year: '1957',
        title: 'An enzymic test for the study of a generic form of acute hepatitis',
        venue: 'Clinica Chimica Acta, 2(1), 70–74',
        doi: '10.1016/0009-8981(57)90027-X',
        url: 'https://doi.org/10.1016/0009-8981(57)90027-X',
        badge: 'Hepatology'
      },
      {
        author: 'Emmett, M., & Narins, R. G.',
        year: '1977',
        title: 'Clinical use of the anion gap',
        venue: 'Medicine, 56(1), 38–54',
        doi: '10.1097/00005792-197701000-00002',
        url: 'https://doi.org/10.1097/00005792-197701000-00002',
        badge: 'Metabolic Profiles'
      },
      {
        author: 'Payne, R. B., et al.',
        year: '1973',
        title: 'Interpretation of serum calcium in patients with abnormal serum proteins',
        venue: 'British Medical Journal, 4(5893), 643–646',
        doi: '10.1136/bmj.4.5893.643',
        url: 'https://doi.org/10.1136/bmj.4.5893.643',
        badge: 'Biochemistry'
      }
    ]
  },
  {
    id: 'document',
    tag: 'Domain 05',
    title: 'Document Layout Geometry & Interoperable Clinical Schemas',
    icon: 'table_view',
    priorArt: 'Standard 1D OCR treats multi-column lab reports as linear text streams, resulting in severe transposition errors where numerical values are misaligned with incorrect reference intervals or analyte headers.',
    solution: 'IntelliMed utilizes 2D spatial coordinate clustering, horizontal gutter projection cuts, and LayoutLM geometric principles to reconstruct tabular cell relationships. Extracted findings map into standardized HL7 FHIR (Release 4) Observation schemas for seamless clinical interoperability.',
    citations: [
      {
        author: 'Xu, Y., et al.',
        year: '2020',
        title: 'LayoutLM: Pre-training of Text and Layout for Document Image Understanding',
        venue: 'ACM SIGKDD International Conference on Knowledge Discovery & Data Mining, 1192–1200',
        doi: '10.1145/3394486.3403172',
        url: 'https://doi.org/10.1145/3394486.3403172',
        badge: 'Spatial Document AI'
      },
      {
        author: 'Huang, Y., et al.',
        year: '2022',
        title: 'LayoutLMv3: Pre-training for Document AI with Unified Text and Image Masking',
        venue: 'Proceedings of the 30th ACM International Conference on Multimedia, 4083–4091',
        doi: '10.1145/3503161.3548112',
        url: 'https://doi.org/10.1145/3503161.3548112',
        badge: 'Multimodal Parsing'
      },
      {
        author: 'Mandel, J. C., et al.',
        year: '2016',
        title: 'SMART on FHIR: a standards-based, interoperable apps platform for electronic health records',
        venue: 'Journal of the American Medical Informatics Association, 23(5), 899–908',
        doi: '10.1093/jamia/ocv189',
        url: 'https://doi.org/10.1093/jamia/ocv189',
        badge: 'HL7 FHIR Standards'
      }
    ]
  }
]

const CLINICAL_FORMULAS = [
  {
    name: 'eGFR (CKD-EPI 2021)',
    specialty: 'Nephrology',
    badge: 'Race-Free Standard',
    purpose: 'Estimated Glomerular Filtration Rate without race variables for unconstrained CKD staging',
    formula: '142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^(-1.200) × 0.9938^Age × [1.012 if female]',
    params: [
      'Scr: Serum Creatinine (mg/dL)',
      'Female: κ = 0.7, α = -0.241',
      'Male: κ = 0.9, α = -0.302'
    ],
    threshold: 'eGFR < 60 mL/min/1.73m² indicates Chronic Kidney Disease (Stage G3a+); < 15 indicates kidney failure.',
    citation: 'Inker et al. (NEJM 2021)',
    doi: '10.1056/NEJMoa2102953'
  },
  {
    name: 'Mentzer Index',
    specialty: 'Hematology',
    badge: 'Microcytic Triage',
    purpose: 'Differentiating iron deficiency anemia from beta-thalassemia trait',
    formula: 'Index = MCV (fL) / RBC Count (10⁶/µL)',
    params: [
      'MCV: Mean Corpuscular Volume (fL)',
      'RBC: Total Red Blood Cell count (10⁶/µL)'
    ],
    threshold: 'Index < 13 suggests β-Thalassemia trait; Index > 13 indicates Iron Deficiency Anemia. Prevents toxic empiric iron overload.',
    citation: 'Mentzer, W. C. (The Lancet 1973)',
    doi: '10.1016/S0140-6736(73)91446-3'
  },
  {
    name: 'De Ritis Ratio',
    specialty: 'Hepatology',
    badge: 'Hepatic Injury Profile',
    purpose: 'Evaluating liver disease etiology and advancing parenchymal damage',
    formula: 'Ratio = Serum AST (U/L) / Serum ALT (U/L)',
    params: [
      'AST: Aspartate Aminotransferase',
      'ALT: Alanine Aminotransferase'
    ],
    threshold: 'Ratio ≥ 2.0 indicates Alcoholic Liver Disease / Cirrhosis; Ratio < 1.0 points to NAFLD or acute viral hepatitis.',
    citation: 'De Ritis et al. (Clin Chim Acta 1957) & Botros (2013)',
    doi: '10.1016/0009-8981(57)90027-X'
  },
  {
    name: 'Serum Anion Gap',
    specialty: 'Metabolic Profiling',
    badge: 'Acid-Base Balance',
    purpose: 'Arithmetic check detecting high anion gap metabolic acidosis (HAGMA)',
    formula: 'Anion Gap = [Na⁺] - ([Cl⁻] + [HCO₃⁻])',
    params: [
      '[Na⁺]: Serum Sodium (mEq/L)',
      '[Cl⁻]: Serum Chloride (mEq/L)',
      '[HCO₃⁻]: Serum Bicarbonate (mEq/L)'
    ],
    threshold: 'Normal reference: 8–12 mEq/L. AG > 12 detects High Anion Gap Metabolic Acidosis (DKA, lactic acidosis, uremia, toxic ingestion).',
    citation: 'Emmett & Narins (Medicine 1977)',
    doi: '10.1097/00005792-197701000-00002'
  },
  {
    name: "Payne's Corrected Calcium",
    specialty: 'Biochemistry / Endocrine',
    badge: 'Hypoalbuminemia Guard',
    purpose: 'Compensating for albumin-bound calcium in hypoalbuminemic states',
    formula: 'Corrected Ca (mg/dL) = Measured Total Ca + 0.8 × (4.0 - Serum Albumin [g/dL])',
    params: [
      'Total Ca: Total Serum Calcium (mg/dL)',
      'Albumin: Serum Albumin (g/dL)',
      '4.0: Target baseline physiological albumin level'
    ],
    threshold: 'Prevents false diagnosis of symptomatic hypocalcemia when ionized free calcium remains physiologically preserved.',
    citation: 'Payne et al. (BMJ 1973)',
    doi: '10.1136/bmj.4.5893.643'
  }
]

const COMPARATIVE_SOTA = [
  {
    dimension: 'Compute Topology',
    legacy: 'Centralized Enterprise Cloud (AWS/Azure)',
    pureLlm: 'Cloud API Endpoint (GPU Cluster)',
    intelliMed: 'Mobile Edge-First Node (Client-Side)'
  },
  {
    dimension: 'Data Sovereignty (PHI)',
    legacy: 'Centralized storage; cloud breach vulnerability',
    pureLlm: 'Raw prompt transmission to model provider',
    intelliMed: 'Zero-Transmission; images discarded on device'
  },
  {
    dimension: 'Inference Latency',
    legacy: 'Network dependent (1.0s – 5.0s)',
    pureLlm: 'High generative decoding delay (3.0s – 15.0s)',
    intelliMed: 'Instantaneous on-device (< 400ms)'
  },
  {
    dimension: 'Reasoning Paradigm',
    legacy: 'Rigid monolithic rule tables',
    pureLlm: 'Pure autoregressive probabilistic generation',
    intelliMed: 'Governed Convergence (Neuro-Symbolic)'
  },
  {
    dimension: 'Hallucination Risk',
    legacy: 'Low (static non-adaptive logic)',
    pureLlm: 'High (stochastic numerical fabrications)',
    intelliMed: 'Eliminated in clinical bounds (symbolic core)'
  },
  {
    dimension: 'Offline Continuity',
    legacy: 'None (requires continuous intranet)',
    pureLlm: 'None (hard dependency on cloud APIs)',
    intelliMed: '100% Offline-capable mobile execution'
  },
  {
    dimension: 'Regulatory Compliance',
    legacy: 'Enterprise BAA / Cloud audit trail',
    pureLlm: 'Uncertain under HIPAA / GDPR Art. 9',
    intelliMed: 'Privacy-by-Design verified (HIPAA & GDPR Art. 9)'
  }
]

const BIBTEX_ENTRIES = `@article{kaissis2020secure,
  title={Secure, privacy-preserving and federated machine learning in medical imaging},
  author={Kaissis, Georgios A and Makowski, Marcus R and R{\\"u}ckert, Daniel and Braren, Rickmer F},
  journal={Nature Machine Intelligence},
  volume={2},
  number={6},
  pages={305--311},
  year={2020},
  publisher={Nature Publishing Group},
  doi={10.1038/s42256-020-0186-1}
}

@article{inker2021new,
  title={New creatinine-and cystatin C--based equations to estimate GFR without race},
  author={Inker, Lesley A and Eneanya, Nwamaka D and Coresh, Josef and Tighiouart, Hocine and Wang, Deidra and Sang, Yingying and others},
  journal={New England Journal of Medicine},
  volume={385},
  number={19},
  pages={1737--1749},
  year={2021},
  doi={10.1056/NEJMoa2102953}
}

@article{mentzer1973differentiation,
  title={Differentiation of iron deficiency from thalassaemia trait},
  author={Mentzer, William C},
  journal={The Lancet},
  volume={301},
  number={7808},
  pages={882},
  year={1973},
  doi={10.1016/S0140-6736(73)91446-3}
}

@article{deritis1957enzymic,
  title={An enzymic test for the study of a generic form of acute hepatitis},
  author={De Ritis, Fernando and Coltorti, M and Giusti, G},
  journal={Clinica Chimica Acta},
  volume={2},
  number={1},
  pages={70--74},
  year={1957},
  doi={10.1016/0009-8981(57)90027-X}
}

@article{emmett1977clinical,
  title={Clinical use of the anion gap},
  author={Emmett, Michael and Narins, Robert G},
  journal={Medicine},
  volume={56},
  number={1},
  pages={38--54},
  year={1977},
  doi={10.1097/00005792-197701000-00002}
}

@article{payne1973interpretation,
  title={Interpretation of serum calcium in patients with abnormal serum proteins},
  author={Payne, RB and Little, AJ and Williams, RB and Milner, JR},
  journal={British Medical Journal},
  volume={4},
  number={5893},
  pages={643--646},
  year={1973},
  doi={10.1136/bmj.4.5893.643}
}

@inproceedings{xu2020layoutlm,
  title={LayoutLM: Pre-training of text and layout for document image understanding},
  author={Xu, Yang and Li, Minghao and Cui, Lei and Huang, Shaohan and Wei, Furu and Zhou, Ming},
  booktitle={Proceedings of the 26th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining},
  pages={1192--1200},
  year={2020},
  doi={10.1145/3394486.3403172}
}

@inproceedings{he2016deep,
  title={Deep residual learning for image recognition},
  author={He, Kaiming and Zhang, Xiangyu and Ren, Shaoqing and Sun, Jian},
  booktitle={Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)},
  pages={770--778},
  year={2016},
  doi={10.1109/CVPR.2016.90}
}

@article{singhal2023large,
  title={Large language models encode clinical knowledge},
  author={Singhal, Karan and Azizi, Shekoofeh and Tu, Tao and Mahdavi, S Sara and Wei, Jason and others},
  journal={Nature},
  volume={620},
  number={7972},
  pages={172--180},
  year={2023},
  doi={10.1038/s41586-023-06291-2}
}`

const RULE_ENGINES = ['Anion Gap', 'De Ritis Ratio', 'Corrected Calcium', 'Bilirubin Consistency', 'Mentzer Index', 'eGFR (CKD-EPI 2021)', 'Arithmetic consistency checks', 'Panic-value flags']

function App() {
    const [selectedDomain, setSelectedDomain] = useState('all')
  const [copiedBibtex, setCopiedBibtex] = useState(false)
  const [showBibtex, setShowBibtex] = useState(false)

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(BIBTEX_ENTRIES)
    setCopiedBibtex(true)
    setTimeout(() => setCopiedBibtex(false), 2500)
  }
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [githubData, setGithubData] = useState({
    status: 'loading',
    ...GITHUB_FALLBACK
  })

  useEffect(() => {
    let isMounted = true

    const fetchGithubJson = async (endpoint) => {
      try {
        const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers: GITHUB_HEADERS })
        if (!response.ok) {
          return { ok: false, data: null }
        }

        const data = await response.json()
        return { ok: true, data }
      } catch {
        return { ok: false, data: null }
      }
    }

    const loadGithubData = async () => {
      const repoResult = await fetchGithubJson('')

      const [languageResult, commitResult, contributorResult, branchResult] = await Promise.all([
        fetchGithubJson('/languages'),
        fetchGithubJson('/commits?per_page=1'),
        fetchGithubJson('/contributors?per_page=100'),
        fetchGithubJson('/branches?per_page=100')
      ])

      if (!isMounted) {
        return
      }

      if (!repoResult.ok) {
        setGithubData((previousValue) => ({
          ...previousValue,
          status: 'fallback',
          latestCommitMessage: `${previousValue.latestCommitMessage} (cached snapshot)`
        }))
        return
      }

      const repo = repoResult.data
      const commitList = Array.isArray(commitResult.data) ? commitResult.data : []
      const contributorList = Array.isArray(contributorResult.data) ? contributorResult.data : []
      const branchList = Array.isArray(branchResult.data) ? branchResult.data : []
      const latestCommit = commitList[0]
      const topContributor = contributorList[0]
      const liveLanguages = getLanguageBreakdown(languageResult.data)

      setGithubData((previousValue) => ({
        ...previousValue,
        status: 'ready',
        stars: repo.stargazers_count ?? previousValue.stars,
        forks: repo.forks_count ?? previousValue.forks,
        openIssues: repo.open_issues_count ?? previousValue.openIssues,
        watchers: repo.subscribers_count ?? repo.watchers_count ?? previousValue.watchers,
        defaultBranch: repo.default_branch ?? previousValue.defaultBranch,
        pushedAt: repo.pushed_at ?? previousValue.pushedAt,
        updatedAt: repo.updated_at ?? previousValue.updatedAt,
        latestCommitSha: latestCommit?.sha ? latestCommit.sha.slice(0, 7) : previousValue.latestCommitSha,
        latestCommitMessage: latestCommit?.commit?.message ?? previousValue.latestCommitMessage,
        latestCommitDate: latestCommit?.commit?.author?.date ?? previousValue.latestCommitDate,
        contributors: contributorList.length || previousValue.contributors,
        branches: branchList.length || previousValue.branches,
        topContributor: topContributor?.login ?? previousValue.topContributor,
        topContributions: topContributor?.contributions ?? previousValue.topContributions,
        languages: liveLanguages.length ? liveLanguages : previousValue.languages
      }))
    }

    loadGithubData()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isRunning) {
      return undefined
    }

    const increment = 12.5
    const interval = 10
    const intervalId = setInterval(() => {
      setElapsedTime((previousTime) => previousTime + increment)
    }, interval)

    return () => clearInterval(intervalId)
  }, [isRunning])

  const githubMarqueeItems = [
    { icon: 'offline_bolt', label: '100% Offline Inference' },
    { icon: 'smartphone', label: '~480MB On-Device Models' },
    { icon: 'document_scanner', label: '6-Stage Edge Pipeline' },
    { icon: 'science', label: 'Deterministic Rule Engine' },
    { icon: 'verified', label: '297 Automated Tests' },
    { icon: 'lock', label: 'Zero Raw Images to Cloud' },
    { icon: 'group', label: 'Doctor Sign-Off Loop' }
  ]

  const latestCommitUrl = githubData.latestCommitSha
    ? `${REPO_URL}/commit/${githubData.latestCommitSha}`
    : REPO_URL

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b-4 border-[#283339] bg-background-light dark:bg-background-dark">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div className="flex items-center justify-between p-4 md:px-8 md:py-6 border-b-2 md:border-b-0 md:border-r-2 border-[#283339] bg-primary/10">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">
                INTELLIMED<span className="text-primary">-AI</span>
              </h1>
            </div>
            <button className="md:hidden p-2 border-2 border-[#283339] rounded text-primary hover:bg-primary hover:text-white transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
          <div className="hidden md:flex flex-1 justify-end">
            <div className="flex">
              <a className="px-6 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#genesis">Gap</a>
              <a className="px-6 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all text-primary" href="#literature">Literature</a>
              <a className="px-6 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#architecture">Architecture</a>
              <a className="px-6 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#edge">Edge Core</a>
              <a className="px-6 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#pipeline">Pipeline</a>
              <a className="px-6 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#experience">UX</a>
              <a className="px-6 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#security">Security</a>
              <a className="px-6 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#stack">Stack</a>
              <a className="px-6 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#team">Team</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <header className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[85vh] border-b-4 border-[#283339]">
          <div className="lg:col-span-7 flex flex-col justify-center p-6 md:p-12 lg:p-20 border-b-4 lg:border-b-0 lg:border-r-4 border-[#283339] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold bg-[#283339] text-white rounded uppercase tracking-widest">MUJ PBL 2026</span>
              <span className="px-3 py-1 text-xs font-bold border border-primary text-primary rounded uppercase tracking-widest">Privacy-First</span>
              <span className="px-3 py-1 text-xs font-bold border border-primary text-primary rounded uppercase tracking-widest">Offline-First Edge AI</span>
            </div>
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter uppercase mb-8">
              IntelliMed<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-100">-AI</span>
            </h2>
            <p className="text-lg md:text-xl font-medium text-gray-400 max-w-2xl leading-relaxed border-l-4 border-primary pl-6 mb-8">
              A privacy-first clinical intelligence platform. Raw prescriptions, lab reports and radiology images never leave the device — on-device ResNet-50 + Qwen3 SLM turn them into severity-annotated datasets, synced through a FastAPI gateway to a unified doctor dashboard.
            </p>
            <div className="flex flex-wrap gap-2 mb-8 max-w-3xl">
              <span className="px-3 py-1 text-xs font-mono bg-[#111618] border-2 border-[#283339] text-primary uppercase">Flutter Edge Node</span>
              <span className="px-3 py-1 text-xs font-mono bg-[#111618] border-2 border-[#283339] text-primary uppercase">React SPA Thin Client</span>
              <span className="px-3 py-1 text-xs font-mono bg-[#111618] border-2 border-[#283339] text-primary uppercase">FastAPI /api/v1 + /api/v2</span>
              <span className="px-3 py-1 text-xs font-mono bg-[#111618] border-2 border-[#283339] text-primary uppercase">248 Mobile + 49 Backend Tests</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-3xl">
              <div className="border-2 border-[#283339] bg-[#111618] px-3 py-3">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Latest Commit</div>
                <div className="text-sm text-white font-black">{githubData.latestCommitSha || 'N/A'}</div>
              </div>
              <div className="border-2 border-[#283339] bg-[#111618] px-3 py-3">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Contributors</div>
                <div className="text-sm text-white font-black">{githubData.contributors}</div>
              </div>
              <div className="border-2 border-[#283339] bg-[#111618] px-3 py-3">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Default Branch</div>
                <div className="text-sm text-white font-black uppercase">{githubData.defaultBranch}</div>
              </div>
              <div className="border-2 border-[#283339] bg-[#111618] px-3 py-3">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Repo Status</div>
                <div className="text-sm text-white font-black uppercase">
                  {githubData.status === 'ready' ? 'Live Sync' : githubData.status === 'loading' ? 'Syncing' : 'Cached Snapshot'}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="group relative px-8 py-4 bg-primary text-[#111618] text-lg font-bold uppercase tracking-wider overflow-hidden border-2 border-transparent hover:border-primary transition-all">
                <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center gap-2">
                  View Github Repo
                  <span className="material-symbols-outlined">arrow_outward</span>
                </span>
              </a>
              <a href={latestCommitUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 border-2 border-[#283339] text-white text-lg font-bold uppercase tracking-wider hover:border-primary hover:text-primary transition-all">
                Latest Commit
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 relative bg-[#1a2327] flex flex-col">
            <div className="h-1/2 w-full bg-cover bg-center border-b-4 border-[#283339]" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBjcZxplohYdkyb8EIZPL_gzRnNKziR9NE8RsxM8RVADNLfGUuqdhqbvdTcTiBCer-c-UR82tK1EmkLhLD3Qb2RkueeFyfN7xE5DsQ--dD6hMrear_MS-DPLaPod8oz3rtor8gVZLaBrLNQNMJzpNywgP4gN_HsBhd-MbAP3CthhpF6hYdwNvkClaB8uXauhUdTAlzNXyJNBwOsRKiuJN5VBBV1hrxatz4czfq7SiF0pFF_0wbroXadra6ZJxu6xNfTdv8Z5WXhJwU')"}}>
              <div className="w-full h-full bg-primary/20 backdrop-brightness-75 flex items-end p-6">
                <span className="bg-black/80 text-white px-2 py-1 text-xs font-mono">FIG 1.0: EDGE INTELLIGENCE NODE</span>
              </div>
            </div>
            <div className="h-1/2 w-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBOQBc5H6Y7NJZof0sOB-aNJBIVk28ET8gVN8ASP7HmyaGA9_yfGUwr7qFYQeMrUT6__DfO-hvExtEUkv1uKpLK6PXiAiJS-PSr9dyIFUEH2_mqWzNSnIAqHrHWfhSUX0ph4b2En50aty32fJXkdQwHZpbBB6bzsoPki0-gxvkibIAlQuR3XYBdpvRzrOvAe5q10zRcJd-8EZr0ZcQLkMt1Pk5UxqbHKW6B0Q_nwBljH7OXV3IWpa0URh_QUR_XOSiYy1BrvHM0kQU')"}}>
              <div className="w-full h-full bg-[#111618]/60 flex items-end p-6">
                <span className="bg-black/80 text-white px-2 py-1 text-xs font-mono">FIG 1.1: ON-DEVICE CV + SLM</span>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#111618] border-4 border-primary p-6 shadow-[8px_8px_0px_0px_rgba(0,229,255,0.3)] max-w-xs w-full">
              <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-xs font-mono uppercase">On-Device Models</span>
                <span className="material-symbols-outlined text-primary">smartphone</span>
              </div>
              <div className="text-5xl font-black text-white mb-1">~480MB</div>
              <div className="text-sm font-bold text-primary">Bundled APK — raw images stay local</div>
              <div className="text-[11px] text-gray-400 mt-3 font-mono">LAST PUSH: {formatGithubDate(githubData.pushedAt)}</div>
            </div>
          </div>
        </header>

        {/* Marquee */}
        <div className="border-b-4 border-[#283339] bg-primary overflow-hidden py-3">
          <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
            {[...githubMarqueeItems, ...githubMarqueeItems].map((item, index) => (
              <span key={`${item.label}-${index}`} className="text-[#111618] font-black text-xl uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-2 border-r-4 border-[#283339] bg-[#161b1e] p-8 sticky top-[88px] h-[calc(100vh-88px)]">
            <div className="flex flex-col gap-6">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Contents</span>
              <nav className="flex flex-col gap-3">
                <a className="text-sm font-bold text-white hover:text-primary flex items-center gap-2 group" href="#genesis">
                  <span className="w-1 h-1 bg-primary rounded-full group-hover:w-3 transition-all"></span> 01. Research Gap
                </a>
                <a className="text-sm font-bold text-primary hover:text-white flex items-center gap-2 group" href="#literature">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full group-hover:w-3 transition-all"></span> 02. Prior Art & Lit
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#architecture">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 03. Architecture
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#edge">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 04. Edge Core
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#pipeline">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 05. AI Pipeline
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#experience">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 06. UX
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#security">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 07. Security & Scale
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#stack">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 08. Stack
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#demo">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 09. Demo
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#team">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 10. Team
                </a>
              </nav>
            </div>
            <div className="mt-auto pt-8 border-t-2 border-[#283339]">
              <div className="text-xs text-gray-500 font-mono uppercase mb-1">LAST UPDATED</div>
              <div className="text-sm font-mono text-white">{formatGithubDate(githubData.pushedAt)}</div>
              <div className="text-xs text-gray-500 font-mono uppercase mt-3 mb-1">SYNC STATUS</div>
              <div className="text-xs font-mono text-primary uppercase">
                {githubData.status === 'ready' ? 'LIVE GITHUB DATA' : githubData.status === 'loading' ? 'SYNCING' : 'USING CACHED SNAPSHOT'}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-10">
            {/* 01 Research Gap + Prior Art */}
            <section className="border-b-4 border-[#283339] bg-[#161b1e] p-6 md:p-16" id="genesis">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 01 — Research Gap</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Prior Art Falls Short.<br />We Close The Gap.</h3>
                <p className="text-gray-300 max-w-3xl text-lg mt-4 border-l-4 border-primary pl-4">
                  No single system combines raw capture, OCR extraction, deterministic interpretation, a doctor-verification loop, and a 100% offline privacy-preserving mobile pipeline. Point solutions do one job — IntelliMed-AI unifies all five.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {PRIOR_ART.map((item) => (
                  <div key={item.title} className="border-2 border-[#283339] bg-[#111618] p-6 hover:border-primary transition-colors group">
                    <div className="text-xs font-mono text-gray-500 uppercase mb-2">{item.ex}</div>
                    <h4 className="font-black uppercase text-white mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                ))}
                <div className="border-2 border-primary bg-[#111618] p-6 shadow-[8px_8px_0px_0px_rgba(0,229,255,0.2)]">
                  <div className="text-xs font-mono text-primary uppercase mb-2">This project</div>
                  <h4 className="font-black uppercase text-white mb-2">IntelliMed-AI</h4>
                  <p className="text-sm text-gray-300">OCR extraction <span className="text-primary font-bold">Yes</span> · deterministic rules <span className="text-primary font-bold">Yes</span> · on-device <span className="text-primary font-bold">Yes</span> · doctor loop <span className="text-primary font-bold">Yes</span> · X-ray CV <span className="text-primary font-bold">Yes</span>.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {CORE_GAPS.map((gap) => (
                  <div key={gap.n} className="border-2 border-[#283339] bg-[#111618] p-6">
                    <span className="text-4xl font-black text-[#283339]">{gap.n}</span>
                    <h4 className="font-black uppercase text-primary mt-2 mb-2 text-sm">{gap.title}</h4>
                    <p className="text-sm text-gray-400">{gap.desc}</p>
                  </div>
                ))}
              </div>
              <div className="border-4 border-[#283339] bg-[#111618] overflow-x-auto mb-8">
                <div className="px-6 py-4 border-b-2 border-[#283339] text-xs font-bold uppercase tracking-widest text-gray-400">Capability Matrix — Who Covers All Five?</div>
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="text-left uppercase text-xs tracking-widest text-gray-500">
                      <th className="px-6 py-4">System</th>
                      <th className="px-6 py-4">OCR</th>
                      <th className="px-6 py-4">Rules</th>
                      <th className="px-6 py-4">On-Device</th>
                      <th className="px-6 py-4">Doctor Loop</th>
                      <th className="px-6 py-4">X-ray CV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GAP_MATRIX.map((row) => (
                      <tr key={row.sys} className={`border-t-2 ${row.highlight ? 'border-primary bg-primary/5' : 'border-[#283339]'}`}>
                        <td className={`px-6 py-3 font-black uppercase ${row.highlight ? 'text-primary' : 'text-white'}`}>{row.sys}</td>
                        <td className="px-6 py-3 text-gray-300">{row.ocr}</td>
                        <td className="px-6 py-3 text-gray-300">{row.rules}</td>
                        <td className="px-6 py-3 text-gray-300">{row.edge}</td>
                        <td className="px-6 py-3 text-gray-300">{row.loop}</td>
                        <td className="px-6 py-3 text-gray-300">{row.cv}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {BRIDGE_STAGES.map((stage) => (
                  <div key={stage.n} className="border-2 border-[#283339] bg-[#111618] p-6 hover:border-primary transition-colors">
                    <span className="text-xs font-mono text-primary uppercase">{stage.n}</span>
                    <h4 className="font-black uppercase text-white mt-1 mb-2">{stage.title}</h4>
                    <p className="text-sm text-gray-400">{stage.desc}</p>
                  </div>
                ))}
              </div>
              <div className="border-4 border-[#283339] bg-[#111618] overflow-x-auto">
                <div className="px-6 py-4 border-b-2 border-[#283339] text-xs font-bold uppercase tracking-widest text-gray-400">Legacy Vision → Expanded Scope (Privacy-First Hybrid)</div>
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-left uppercase text-xs tracking-widest text-gray-500">
                      <th className="px-6 py-4">Feature</th>
                      <th className="px-6 py-4">Legacy (Cloud-Centric)</th>
                      <th className="px-6 py-4 text-primary">Expanded (Privacy-First)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MIGRATION_ROWS.map((row) => (
                      <tr key={row.feature} className="border-t-2 border-[#283339] align-top">
                        <td className="px-6 py-4 font-black uppercase text-white">{row.feature}</td>
                        <td className="px-6 py-4 text-gray-400">{row.legacy}</td>
                        <td className="px-6 py-4 text-gray-200">{row.expanded}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 02 Prior Art & Academic References */}
            <section className="border-b-4 border-[#283339] bg-background-light dark:bg-background-dark p-6 md:p-16" id="literature">
              <div className="flex flex-col gap-2 mb-12">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 02 — Academic Literature</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-primary/20 text-primary border border-primary/40 rounded uppercase">Peer-Reviewed Foundations</span>
                </div>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
                  Prior Art &amp; Academic References
                </h3>
                <p className="text-gray-300 max-w-4xl text-lg mt-4 border-l-4 border-primary pl-4 leading-relaxed">
                  To anchor IntelliMed-AI within existing clinical informatics and computer science literature, the system bridges five core domains: Edge-AI Clinical Decision Support (CDSS), Neuro-Symbolic Governance, Mobile Quantization, Standardized Clinical Mathematical Formulations, and Spatial Document AI.
                </p>
              </div>

              {/* Domain Filter Pills */}
              <div className="flex flex-wrap gap-2 mb-10">
                <button
                  type="button"
                  onClick={() => setSelectedDomain('all')}
                  className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-2 transition-all ${
                    selectedDomain === 'all'
                      ? 'border-primary bg-primary text-[#111618] shadow-[4px_4px_0px_0px_rgba(0,229,255,0.3)]'
                      : 'border-[#283339] bg-[#111618] text-gray-400 hover:border-primary hover:text-white'
                  }`}
                >
                  All Domains ({ACADEMIC_DOMAINS.length})
                </button>
                {ACADEMIC_DOMAINS.map((domain) => (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => setSelectedDomain(domain.id)}
                    className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-2 transition-all flex items-center gap-1.5 ${
                      selectedDomain === domain.id
                        ? 'border-primary bg-primary text-[#111618] shadow-[4px_4px_0px_0px_rgba(0,229,255,0.3)]'
                        : 'border-[#283339] bg-[#111618] text-gray-400 hover:border-primary hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{domain.icon}</span>
                    {domain.tag}
                  </button>
                ))}
              </div>

              {/* Domain Cards Grid */}
              <div className="grid grid-cols-1 gap-6 mb-12">
                {ACADEMIC_DOMAINS.filter((d) => selectedDomain === 'all' || selectedDomain === d.id).map((domain) => (
                  <div key={domain.id} className="border-4 border-[#283339] bg-[#161b1e] p-6 md:p-8 hover:border-primary/80 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#283339] pb-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#111618] border-2 border-primary flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-xl">{domain.icon}</span>
                        </div>
                        <div>
                          <span className="text-xs font-mono text-primary uppercase tracking-widest">{domain.tag}</span>
                          <h4 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight">{domain.title}</h4>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-gray-400 bg-[#111618] px-3 py-1 border border-[#283339]">
                        {domain.citations.length} Verified References
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="border-2 border-red-950/60 bg-[#141011] p-5">
                        <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold uppercase mb-2">
                          <span className="material-symbols-outlined text-base">report_problem</span>
                          Prior Art &amp; SOTA Deficiencies
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{domain.priorArt}</p>
                      </div>

                      <div className="border-2 border-primary/40 bg-[#111618] p-5 shadow-[4px_4px_0px_0px_rgba(0,229,255,0.1)]">
                        <div className="flex items-center gap-2 text-primary text-xs font-mono font-bold uppercase mb-2">
                          <span className="material-symbols-outlined text-base">verified_user</span>
                          IntelliMed-AI Architectural Solution
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed">{domain.solution}</p>
                      </div>
                    </div>

                    <div className="border-t-2 border-[#283339] pt-4">
                      <div className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">menu_book</span>
                        Key Academic Citations
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {domain.citations.map((citation, cIndex) => (
                          <div key={cIndex} className="border border-[#283339] bg-[#111618] p-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5">
                                  {citation.badge}
                                </span>
                                <span className="text-xs font-mono text-gray-400 font-bold">{citation.year}</span>
                              </div>
                              <h5 className="text-xs font-bold text-white mb-1 line-clamp-2">{citation.title}</h5>
                              <p className="text-[11px] text-gray-400 mb-1">{citation.author}</p>
                              <p className="text-[10px] text-gray-500 italic mb-2">{citation.venue}</p>
                            </div>
                            <div className="pt-2 border-t border-[#283339] mt-2">
                              {citation.doi ? (
                                <a
                                  href={citation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1 group"
                                >
                                  <span>DOI: {citation.doi}</span>
                                  <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">arrow_outward</span>
                                </a>
                              ) : (
                                <a
                                  href={citation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-mono text-gray-400 hover:text-white flex items-center gap-1"
                                >
                                  <span>White Paper / Source</span>
                                  <span className="material-symbols-outlined text-xs">arrow_outward</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Spotlight: Standardized Clinical Rule Formulations */}
              <div className="border-4 border-[#283339] bg-[#111618] p-6 md:p-8 mb-12">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b-2 border-[#283339] pb-6 mb-8">
                  <div>
                    <span className="text-primary font-mono text-xs uppercase tracking-widest">// Mathematical Formulations</span>
                    <h4 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                      Validated Clinical Calculations (Dart &amp; Python)
                    </h4>
                    <p className="text-sm text-gray-400 mt-1 max-w-2xl">
                      Deterministic mathematical equations implemented in local mobile Dart and verified against Python backend unit tests (248 mobile + 49 server tests).
                    </p>
                  </div>
                  <span className="px-3 py-1.5 text-xs font-mono font-bold bg-[#161b1e] text-primary border-2 border-primary self-start md:self-auto">
                    100% Deterministic — Zero Hallucination
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CLINICAL_FORMULAS.map((formula) => (
                    <div key={formula.name} className="border-2 border-[#283339] bg-[#161b1e] p-5 flex flex-col justify-between hover:border-primary transition-colors group">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-primary font-bold">{formula.specialty}</span>
                          <span className="text-[10px] font-mono bg-[#111618] text-gray-300 border border-[#283339] px-2 py-0.5">
                            {formula.badge}
                          </span>
                        </div>
                        <h5 className="text-lg font-black uppercase text-white mb-2">{formula.name}</h5>
                        <p className="text-xs text-gray-400 mb-3">{formula.purpose}</p>

                        <div className="bg-[#111618] border border-[#283339] p-3 font-mono text-xs text-primary font-bold mb-3 break-words">
                          {formula.formula}
                        </div>

                        <div className="mb-3 space-y-1">
                          <div className="text-[10px] font-mono uppercase text-gray-500">Parameters:</div>
                          {formula.params.map((p, pIdx) => (
                            <div key={pIdx} className="text-[11px] font-mono text-gray-300 pl-2 border-l border-primary/40">
                              {p}
                            </div>
                          ))}
                        </div>

                        <div className="bg-primary/5 border-l-2 border-primary p-2.5 mb-4">
                          <div className="text-[10px] font-mono uppercase text-primary font-bold">Decision Boundary:</div>
                          <div className="text-xs text-gray-200 mt-0.5">{formula.threshold}</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#283339] flex items-center justify-between text-xs">
                        <span className="text-gray-400 text-[11px] font-mono">{formula.citation}</span>
                        <a
                          href={`https://doi.org/${formula.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-mono text-[11px] flex items-center gap-0.5"
                        >
                          Ref <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparative SOTA Architecture Matrix */}
              <div className="border-4 border-[#283339] bg-[#111618] overflow-x-auto mb-12">
                <div className="px-6 py-4 border-b-2 border-[#283339] flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-primary font-mono">// Benchmark Comparison</div>
                    <div className="text-lg font-black uppercase text-white">Prior Art Architectural Matrix</div>
                  </div>
                  <span className="text-xs font-mono text-gray-400">Comparing SOTA CDSS, Pure LLMs &amp; IntelliMed-AI</span>
                </div>
                <table className="w-full text-sm min-w-[760px]">
                  <thead>
                    <tr className="text-left uppercase text-xs tracking-widest text-gray-500 bg-[#161b1e]">
                      <th className="px-6 py-4">Architectural Dimension</th>
                      <th className="px-6 py-4">Legacy Centralized CDSS</th>
                      <th className="px-6 py-4">Pure Medical LLM (Cloud)</th>
                      <th className="px-6 py-4 text-primary bg-primary/10">IntelliMed-AI (Proposed)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARATIVE_SOTA.map((row) => (
                      <tr key={row.dimension} className="border-t-2 border-[#283339] align-top hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-black uppercase text-white text-xs tracking-wider">{row.dimension}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">{row.legacy}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">{row.pureLlm}</td>
                        <td className="px-6 py-4 text-gray-100 text-xs font-bold bg-primary/5 border-l-2 border-primary/40">{row.intelliMed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Academic BibTeX Export Drawer */}
              <div className="border-4 border-[#283339] bg-[#161b1e] p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">format_quote</span>
                    <div>
                      <h4 className="text-lg font-black uppercase text-white">Academic Citation Archive (BibTeX)</h4>
                      <p className="text-xs text-gray-400">Export verified citations for LaTeX, Overleaf, or reference managers.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBibtex(!showBibtex)}
                      className="px-4 py-2 border-2 border-[#283339] bg-[#111618] text-white text-xs font-mono font-bold uppercase hover:border-primary transition-colors"
                    >
                      {showBibtex ? 'Hide BibTeX' : 'View BibTeX'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyBibtex}
                      className="px-4 py-2 border-2 border-primary bg-primary text-[#111618] text-xs font-mono font-bold uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">{copiedBibtex ? 'done' : 'content_copy'}</span>
                      {copiedBibtex ? 'Copied to Clipboard!' : 'Copy All BibTeX'}
                    </button>
                  </div>
                </div>

                {showBibtex && (
                  <div className="mt-4 border-2 border-[#283339] bg-[#111618] p-4 overflow-x-auto max-h-96 text-xs font-mono text-gray-300 leading-relaxed">
                    <pre>{BIBTEX_ENTRIES}</pre>
                  </div>
                )}
              </div>
            </section>


            {/* 02 Architecture */}
            <section className="border-b-4 border-[#283339] bg-[#161b1e] p-6 md:p-16" id="architecture">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 03 — Dual-Client Design</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Hybrid Cloud / Edge</h3>
                <p className="text-gray-400 max-w-3xl text-lg mt-4 border-l-2 border-[#283339] pl-4">
                  High-throughput web review for clinicians + high-privacy offline capture for patients. Five-layer stack with API version freezing: legacy web at <span className="font-mono text-primary">/api/v1</span>, structured mobile ingest at <span className="font-mono text-primary">/api/v2</span>.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {[
                  { icon: 'web', title: 'Web Client', desc: 'React SPA thin client for review + admin actions.' },
                  { icon: 'smartphone', title: 'Mobile Client', desc: 'Flutter Android edge intelligence node.' },
                  { icon: 'bolt', title: 'Backend API', desc: 'FastAPI gateway: auth, RBAC, server pipelines.' },
                  { icon: 'smart_toy', title: 'AI/ML Layer', desc: 'ONNX Runtime, llama.cpp, PyTorch inference.' },
                  { icon: 'database', title: 'Persistence', desc: 'Prisma/PostgreSQL + Supabase buckets (signed URLs) + SQLite on-device.' }
                ].map((layer) => (
                  <div key={layer.title} className="border-2 border-[#283339] bg-[#111618] p-6 hover:border-primary transition-colors group">
                    <span className="material-symbols-outlined text-4xl text-gray-500 group-hover:text-primary mb-3">{layer.icon}</span>
                    <h4 className="font-black uppercase text-white mb-2">{layer.title}</h4>
                    <p className="text-sm text-gray-400">{layer.desc}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-[#283339] bg-[#111618] p-6">
                  <h4 className="font-black uppercase text-primary mb-3">Reliability Engineering</h4>
                  <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
                    <li><span className="font-mono text-white">Pseudo-path abstraction</span> — synthetic paths like <span className="font-mono">app-structured/lab_report</span> prevent signed-URL failures when mobile uploads structured results without raw files.</li>
                    <li><span className="font-mono text-white">Multi-tier caching</span> — 120s TTL on hot lookups such as <span className="font-mono">doctor_has_patient_access</span>.</li>
                  </ul>
                </div>
                <div className="border-2 border-[#283339] bg-[#111618] p-6">
                  <h4 className="font-black uppercase text-primary mb-3">Origin Tagging</h4>
                  <p className="text-sm text-gray-300">Every record carries provenance (<span className="font-mono text-white">web</span> vs <span className="font-mono text-white">app</span>) — one unified doctor dashboard with a full audit trail of where data was captured and processed.</p>
                </div>
              </div>
            </section>

            {/* 03 Edge core */}
            <section className="border-b-4 border-[#283339] bg-background-light dark:bg-background-dark p-6 md:p-16" id="edge">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 04 — Mobile Deep Dive</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Edge Intelligence Core</h3>
                <p className="text-gray-400 max-w-3xl text-lg mt-4 border-l-2 border-[#283339] pl-4">
                  The Flutter Android app is the primary deliverable — a self-contained offline-first node. Six-stage local pipeline, mid-range hardware friendly, no multi-minute stalls.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {PIPELINE_STAGES.map((stage) => (
                  <div key={stage.n} className="group border-2 border-[#283339] bg-[#1a2327] hover:border-primary transition-colors p-6 relative overflow-hidden">
                    <span className="text-5xl font-black text-[#283339] group-hover:text-primary transition-colors">{stage.n}</span>
                    <h4 className="text-lg font-black uppercase text-white mt-2 mb-2">{stage.title}</h4>
                    <p className="text-sm text-gray-400">{stage.desc}</p>
                  </div>
                ))}
              </div>
              <div className="border-4 border-[#283339] bg-[#111618] overflow-x-auto">
                <div className="px-6 py-4 border-b-2 border-[#283339] text-xs font-bold uppercase tracking-widest text-gray-400">On-Device Model Orchestration</div>
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="text-left uppercase text-xs tracking-widest text-gray-500">
                      <th className="px-6 py-4">Model</th>
                      <th className="px-6 py-4">Size</th>
                      <th className="px-6 py-4">Purpose</th>
                      <th className="px-6 py-4">Spec</th>
                      <th className="px-6 py-4 text-primary">Optimization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODEL_ROWS.map((row) => (
                      <tr key={row.model} className="border-t-2 border-[#283339]">
                        <td className="px-6 py-4 font-black text-white">{row.model}</td>
                        <td className="px-6 py-4 font-mono text-gray-300">{row.size}</td>
                        <td className="px-6 py-4 text-gray-300">{row.purpose}</td>
                        <td className="px-6 py-4 font-mono text-gray-300">{row.spec}</td>
                        <td className="px-6 py-4 text-gray-200">{row.opt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 04 Pipeline */}
            <section className="border-b-4 border-[#283339] bg-[#161b1e] p-6 md:p-16" id="pipeline">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 05 — Three-Stage Intelligence</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Extract, Then Interpret</h3>
                <p className="text-gray-400 max-w-3xl text-lg mt-4 border-l-2 border-[#283339] pl-4">
                  Extraction is strictly separated from interpretation to block generative hallucinations. The Python server pipeline is ported to native Dart (<span className="font-mono text-primary">clinical_rules.json</span>) so handset and server flags match exactly.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="border-2 border-[#283339] bg-[#111618] p-6">
                  <span className="text-xs font-mono text-primary uppercase">Stage 1 — OCR & Geometry</span>
                  <h4 className="text-xl font-black uppercase text-white mt-2 mb-3">Read Order</h4>
                  <p className="text-sm text-gray-300">OpenDataLoader-PDF for digital docs preserves reading order; mobile captures use on-device Google ML Kit.</p>
                </div>
                <div className="border-2 border-[#283339] bg-[#111618] p-6">
                  <span className="text-xs font-mono text-primary uppercase">Stage 2 — Normalization</span>
                  <h4 className="text-xl font-black uppercase text-white mt-2 mb-3">No Judgments</h4>
                  <p className="text-sm text-gray-300">Raw text like <span className="font-mono text-white">Hb</span> maps to canonical <span className="font-mono text-white">Hemoglobin</span>. Flags recorded only if explicitly printed on source.</p>
                </div>
                <div className="border-2 border-primary bg-[#111618] p-6 shadow-[8px_8px_0px_0px_rgba(0,229,255,0.2)]">
                  <span className="text-xs font-mono text-primary uppercase">Stage 3 — Rule Engine</span>
                  <h4 className="text-xl font-black uppercase text-white mt-2 mb-3">Deterministic Logic</h4>
                  <div className="flex flex-wrap gap-2">
                    {RULE_ENGINES.map((rule) => (
                      <span key={rule} className="px-2 py-1 text-xs font-bold bg-[#283339] text-white uppercase">{rule}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 05 UX */}
            <section className="border-b-4 border-[#283339] bg-background-light dark:bg-background-dark p-6 md:p-16" id="experience">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 06 — Interface</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Functional UX</h3>
                <p className="text-gray-400 max-w-3xl text-lg mt-4 border-l-2 border-[#283339] pl-4">
                  Complex medical data made actionable for patients and clinicians — from capture to verified summary.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-[#283339] bg-[#1a2327] p-6">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2">lock</span>
                  <h4 className="font-black uppercase text-white mb-2">Auth & Home</h4>
                  <p className="text-sm text-gray-400">Google OAuth entry. Home shows Pending Sync counts from the V2Sync queue so offline work is always visible.</p>
                </div>
                <div className="border-2 border-[#283339] bg-[#1a2327] p-6">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2">document_scanner</span>
                  <h4 className="font-black uppercase text-white mb-2">Capture</h4>
                  <p className="text-sm text-gray-400">Auto-classification vs manual Lab / Rx / X-ray. Handles BMP, TIF, TIFF with live scan-quality feedback.</p>
                </div>
                <div className="border-2 border-[#283339] bg-[#1a2327] p-6">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2">query_stats</span>
                  <h4 className="font-black uppercase text-white mb-2">Analysis & Trends</h4>
                  <p className="text-sm text-gray-400">Standardized biomarker summaries plus longitudinal sparkline Trends against reference bands.</p>
                </div>
                <div className="border-2 border-[#283339] bg-[#1a2327] p-6">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2">encrypted</span>
                  <h4 className="font-black uppercase text-white mb-2">Doctor Linking</h4>
                  <p className="text-sm text-gray-400">Patients generate 6-character hex access codes; doctors redeem them to link accounts and start verification.</p>
                </div>
              </div>
            </section>

            {/* 06 Security */}
            <section className="border-b-4 border-[#283339] bg-[#161b1e] p-6 md:p-16" id="security">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 10 — Security & Effort</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Privacy By Design</h3>
                <p className="text-gray-400 max-w-3xl text-lg mt-4 border-l-2 border-[#283339] pl-4">
                  ~480MB of bundled models is a deliberate trade-off: on-device de-identification means only structured JSON reaches the cloud.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="border-2 border-[#283339] bg-[#111618] p-6">
                  <h4 className="font-black uppercase text-primary mb-2">Access Control</h4>
                  <p className="text-sm text-gray-300">JWT (HS256) + role guards. Doctor registration gated by <span className="font-mono text-white">DOCTOR_ACCESS_CODE</span> secret.</p>
                </div>
                <div className="border-2 border-[#283339] bg-[#111618] p-6">
                  <h4 className="font-black uppercase text-primary mb-2">Verification Loop</h4>
                  <p className="text-sm text-gray-300">Doctors annotate AI findings and digitally sign off; verification syncs back to the patient dashboard.</p>
                </div>
                <div className="border-2 border-[#283339] bg-[#111618] p-6">
                  <h4 className="font-black uppercase text-primary mb-2">Testing</h4>
                  <p className="text-sm text-gray-300"><span className="font-black text-white">248</span> mobile tests + <span className="font-black text-white">49</span> backend tests over arithmetic and rule engines.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="border-4 border-[#283339] bg-[#111618] p-6">
                  <h4 className="font-black uppercase text-white mb-4 border-b border-[#283339] pb-3">Lines by Language</h4>
                  {[
                    { lang: 'Dart — 81 files', lines: '22,665', pct: 45 },
                    { lang: 'Python — 35 files', lines: '7,641', pct: 15 },
                    { lang: 'Other (JS, JSON) — 92 files', lines: '19,793', pct: 40 }
                  ].map((row) => (
                    <div key={row.lang} className="mb-4">
                      <div className="flex justify-between text-xs font-bold uppercase text-gray-400 mb-1">
                        <span>{row.lang}</span><span className="text-white">{row.lines} · {row.pct}%</span>
                      </div>
                      <div className="h-4 bg-[#283339]">
                        <div className="h-full bg-primary" style={{ width: `${row.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-4 border-[#283339] bg-[#111618] p-6">
                  <h4 className="font-black uppercase text-white mb-4 border-b border-[#283339] pb-3">Lines by Layer</h4>
                  {[
                    { layer: 'Mobile App', lines: '24,752 · 110 files', pct: 50 },
                    { layer: 'Web Frontend', lines: '11,738 · 40 files', pct: 24 },
                    { layer: 'Backend', lines: '10,100 · 45 files', pct: 20 },
                    { layer: 'DevOps / Docs', lines: '3,509 · 13 files', pct: 7 }
                  ].map((row) => (
                    <div key={row.layer} className="mb-4">
                      <div className="flex justify-between text-xs font-bold uppercase text-gray-400 mb-1">
                        <span>{row.layer}</span><span className="text-white">{row.lines}</span>
                      </div>
                      <div className="h-4 bg-[#283339]">
                        <div className="h-full bg-primary" style={{ width: `${row.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Tech Stack Section */}
            <section className="border-b-4 border-[#283339] bg-background-light dark:bg-background-dark p-6 md:p-16" id="stack">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 07</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">The Stack</h3>
                <p className="text-gray-400 max-w-3xl text-lg mt-4 border-l-2 border-[#283339] pl-4">
                  Live language distribution from the IntelliMed repository. Top contributor: {githubData.topContributor || 'N/A'} ({githubData.topContributions} commits).
                </p>
              </div>
              <div className="border-2 border-[#283339] bg-[#111618] p-6 mb-10">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">GitHub Language Breakdown</div>
                <div className="flex flex-wrap gap-3">
                  {githubData.languages.length > 0 ? (
                    githubData.languages.map((language) => (
                      <div key={language.name} className="border border-[#283339] bg-[#161b1e] px-3 py-2">
                        <div className="text-sm font-black text-white uppercase">{language.name}</div>
                        <div className="text-xs font-mono text-primary">{language.percentage}% of repo</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400">Language snapshot unavailable.</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { icon: 'smartphone', name: 'Flutter', sub: 'Edge Client' },
                  { icon: 'bolt', name: 'FastAPI', sub: 'Backend' },
                  { icon: 'psychology', name: 'PyTorch', sub: 'ResNet-50' },
                  { icon: 'memory', name: 'ONNX RT', sub: 'Opset 17' },
                  { icon: 'smart_toy', name: 'Qwen3', sub: 'Q4_0 GGUF' },
                  { icon: 'code', name: 'React', sub: 'Web SPA' },
                  { icon: 'database', name: 'Prisma', sub: 'ORM' },
                  { icon: 'storage', name: 'Postgres', sub: 'Database' },
                  { icon: 'cloud', name: 'Supabase', sub: 'Signed URLs' },
                  { icon: 'security', name: 'JWT HS256', sub: 'Auth' }
                ].map((tech) => (
                  <div key={tech.name} className="bg-[#111618] border-2 border-[#283339] p-8 flex flex-col items-center justify-center hover:bg-[#1a2327] hover:border-primary transition-all group">
                    <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-primary">{tech.icon}</span>
                    <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">{tech.name}</span>
                    <span className="text-xs text-gray-500 mt-1">{tech.sub}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Demo Screenshots Section */}
            <section className="border-b-4 border-[#283339] bg-background-light dark:bg-background-dark p-6 md:p-16" id="demo">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 08</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Project Demo</h3>
                <p className="text-gray-400 max-w-2xl text-lg mt-4 border-l-2 border-[#283339] pl-4">
                  Patient dashboards, edge-processed lab summaries with sparkline trends, X-ray classification, and the doctor digital sign-off loop.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Screenshot 1 */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                    <img
                      src="./Patient_Dashboard.png"
                      alt="Patient Dashboard Screenshot"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="p-6 border-t-4 border-[#283339]">
                    <h4 className="text-xl font-bold uppercase text-white mb-2">Patient Dashboard</h4>
                    <p className="text-sm text-gray-400">Offline-first capture with Pending Sync (V2Sync queue), biomarker summaries, and sparkline Trends against reference bands.</p>
                  </div>
                </div>

                {/* Screenshot 2 */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                    <img
                      src="./Xray.png"
                      alt="X-Ray Classification Screenshot"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="p-6 border-t-4 border-[#283339]">
                    <h4 className="text-xl font-bold uppercase text-white mb-2">On-Device X-Ray</h4>
                    <p className="text-sm text-gray-400">ResNet-50 ONNX (opset 17, ~94MB) running on-device with NPU/CPU parity — raw images never leave the handset.</p>
                  </div>
                </div>

                {/* Screenshot 3 */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                    <img
                      src="./Prescription Parsing.png"
                      alt="Prescription Parsing Screenshot"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="p-6 border-t-4 border-[#283339]">
                    <h4 className="text-xl font-bold uppercase text-white mb-2">Lab Structuring</h4>
                    <p className="text-sm text-gray-400">ML Kit OCR + Y-axis projection table rebuild, normalized to the 10-key clinical_rules.json schema with panic-value flags.</p>
                  </div>
                </div>

                {/* Screenshot 4 */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                    <img
                      src="./Doctor Dashboard.png"
                      alt="Doctor Verification Screenshot"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="p-6 border-t-4 border-[#283339]">
                    <h4 className="text-xl font-bold uppercase text-white mb-2">Doctor Verification</h4>
                    <p className="text-sm text-gray-400">6-char hex code linking, origin-tagged (web/app) unified view, annotation + digital sign-off synced back to the patient.</p>
                  </div>
                </div>

              </div>

              {/* Mobile App Screenshots — portrait phone screens */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-8">

                {/* App Screenshot 5 — Auth / Welcome */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-[9/16] relative overflow-hidden">
                    <img
                      src="./app_auth.jpeg"
                      alt="IntelliMed-AI Welcome / Sign-In Screen"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 border-t-4 border-[#283339]">
                    <h4 className="text-base font-bold uppercase text-white mb-1">Welcome &amp; Auth</h4>
                    <p className="text-xs text-gray-400">Google OAuth entry point. Sign-in syncs structured results to the doctor dashboard; offline inference runs without a network connection once authenticated.</p>
                  </div>
                </div>

                {/* App Screenshot 6 — Home Dashboard */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-[9/16] relative overflow-hidden">
                    <img
                      src="./app_home.jpeg"
                      alt="IntelliMed-AI Home Dashboard"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 border-t-4 border-[#283339]">
                    <h4 className="text-base font-bold uppercase text-white mb-1">Home Dashboard</h4>
                    <p className="text-xs text-gray-400">At-a-glance summary of Reports, Documents, Captures, and Pending Sync count from the V2Sync queue — offline work always visible with quick-action shortcuts.</p>
                  </div>
                </div>

                {/* App Screenshot 7 — Capture */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-[9/16] relative overflow-hidden">
                    <img
                      src="./app_capture.jpeg"
                      alt="IntelliMed-AI Capture Screen"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 border-t-4 border-[#283339]">
                    <h4 className="text-base font-bold uppercase text-white mb-1">Edge Capture</h4>
                    <p className="text-xs text-gray-400">Auto or manual Lab / Rx / X-ray classification. Perspective correction and Laplacian blur/glare gates run before OCR; supports PDF, JPG, PNG, WEBP, BMP, TIF/TIFF.</p>
                  </div>
                </div>

                {/* App Screenshot 8 — Profile & Doctor Linking */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-[9/16] relative overflow-hidden">
                    <img
                      src="./app_profile.jpeg"
                      alt="IntelliMed-AI Patient Profile and Doctor Linking"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 border-t-4 border-[#283339]">
                    <h4 className="text-base font-bold uppercase text-white mb-1">Profile &amp; Doctor Linking</h4>
                    <p className="text-xs text-gray-400">Patient generates a 6-character access code; doctors redeem it to link accounts and start the verification loop. Connected doctors and profile in one place.</p>
                  </div>
                </div>

                {/* App Screenshot 9 — Lab Report Detail */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-[9/16] relative overflow-hidden">
                    <img
                      src="./app_lab_report.jpeg"
                      alt="IntelliMed-AI On-Device Lab Report Structured Result"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 border-t-4 border-[#283339]">
                    <h4 className="text-base font-bold uppercase text-white mb-1">Structured Lab Report</h4>
                    <p className="text-xs text-gray-400">AI-generated standardized summary with 25 measurements — biomarker values, reference ranges, derived indices (Mentzer Index), and key findings fully on-device.</p>
                  </div>
                </div>

                {/* App Screenshot 10 — Trends */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-[9/16] relative overflow-hidden">
                    <img
                      src="./app_trends.jpeg"
                      alt="IntelliMed-AI Longitudinal Biomarker Trends"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 border-t-4 border-[#283339]">
                    <h4 className="text-base font-bold uppercase text-white mb-1">Longitudinal Trends</h4>
                    <p className="text-xs text-gray-400">Sparkline charts for every tracked biomarker (Hemoglobin, Hematocrit, Lymphocyte, Eosinophils, etc.) across multiple readings — latest value and date at a glance.</p>
                  </div>
                </div>

              </div>
              <div className="mt-12 text-center">
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-transparent border-2 border-primary text-primary text-lg font-bold uppercase tracking-wider hover:bg-primary hover:text-[#111618] transition-all">
                  View Full Documentation
                </a>
              </div>
            </section>

            {/* Team Section */}
            <section className="p-6 md:p-16 bg-[#161b1e]" id="team">
              <div className="flex flex-col gap-2 mb-12 text-center md:text-left">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 09</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Project Team</h3>
                <p className="text-gray-400 text-lg mt-2">Department of Computer Science & Engineering</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-[#111618] border-2 border-[#283339] p-4 flex flex-col items-center text-center group hover:border-primary transition-all hover:-translate-y-1">
                  <div className="w-24 h-24 mb-4 border-2 border-[#283339] bg-gradient-to-br from-primary/20 to-cyan-900/20 rounded flex items-center justify-center">
                    <span className="text-4xl font-black text-primary">SR</span>
                  </div>
                  <h5 className="text-lg font-black uppercase text-white mb-1">Sarthak Routray</h5>
                  <span className="text-xs font-mono text-primary uppercase tracking-wider mb-2">2427030149</span>
                  <span className="text-xs text-gray-400 mb-4">Team Member</span>
                  <div className="flex gap-2 mt-auto">
                    <a className="w-8 h-8 flex items-center justify-center border border-[#283339] hover:bg-white hover:text-black transition-colors" href="#">
                      <span className="material-symbols-outlined text-sm">mail</span>
                    </a>
                    <a className="w-8 h-8 flex items-center justify-center border border-[#283339] hover:bg-white hover:text-black transition-colors" href="#">
                      <span className="material-symbols-outlined text-sm">link</span>
                    </a>
                  </div>
                </div>
                <div className="bg-[#111618] border-2 border-[#283339] p-4 flex flex-col items-center text-center group hover:border-primary transition-all hover:-translate-y-1">
                  <div className="w-24 h-24 mb-4 border-2 border-[#283339] bg-gradient-to-br from-cyan-900/40 to-primary/10 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-primary">school</span>
                  </div>
                  <h5 className="text-lg font-black uppercase text-white mb-1">Ms. Soni Gupta</h5>
                  <span className="text-xs font-mono text-primary uppercase tracking-wider mb-2">Project Guide</span>
                  <span className="text-xs text-gray-400 mb-4">CSE Department</span>
                  <div className="flex gap-2 mt-auto">
                    <a className="w-8 h-8 flex items-center justify-center border border-[#283339] hover:bg-white hover:text-black transition-colors" href="#">
                      <span className="material-symbols-outlined text-sm">mail</span>
                    </a>
                    <a className="w-8 h-8 flex items-center justify-center border border-[#283339] hover:bg-white hover:text-black transition-colors" href="#">
                      <span className="material-symbols-outlined text-sm">link</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t-4 border-[#283339] bg-[#0b0f11] p-8 md:p-16">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                  <h2 className="text-3xl font-black uppercase text-white mb-4">IntelliMed<br />-AI</h2>
                  <p className="text-gray-500 max-w-sm mb-6">
                    Department of Computer Science & Engineering<br />
                    Manipal University Jaipur<br />
                    PBL Project 2026 — Privacy-First Clinical Intelligence
                  </p>
                  <div className="flex gap-4">
                    <a className="text-gray-400 hover:text-primary font-bold uppercase text-sm" href={REPO_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a className="text-gray-400 hover:text-primary font-bold uppercase text-sm" href="#literature">Literature</a>
                    <a className="text-gray-400 hover:text-primary font-bold uppercase text-sm" href="#demo">Demo</a>
                    <a className="text-gray-400 hover:text-primary font-bold uppercase text-sm" href="#team">Contact</a>
                  </div>
                </div>
                <div className="w-full md:max-w-md border-2 border-[#283339] bg-[#111618] p-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Latest GitHub Commit</div>
                  <div className="text-sm text-white font-semibold mb-2">{githubData.latestCommitMessage}</div>
                  <div className="text-xs text-gray-400 font-mono">SHA: {githubData.latestCommitSha || 'N/A'} | DATE: {formatGithubDate(githubData.latestCommitDate)}</div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </main>
      <div className="fixed bottom-6 right-6 z-50 w-[240px] h-[160px] border-4 border-[#283339] bg-[#111618] shadow-[8px_8px_0px_0px_rgba(0,229,255,0.2)]">
        <div className="flex items-center justify-between border-b-2 border-[#283339] px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Stopwatch</span>
          <span className="material-symbols-outlined text-primary text-base">timer</span>
        </div>
        <div className="px-3 py-4">
          <div className="text-3xl font-black text-white text-center mb-3 font-mono">{formatStopwatchTime(elapsedTime)}</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsRunning((currentValue) => !currentValue)}
              className="border-2 border-primary bg-primary text-[#111618] text-xs font-bold uppercase py-2 hover:bg-transparent hover:text-primary transition-colors"
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRunning(false)
                setElapsedTime(0)
              }}
              className="border-2 border-[#283339] text-gray-300 text-xs font-bold uppercase py-2 hover:border-primary hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
