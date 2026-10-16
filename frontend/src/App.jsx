import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend, Cell
} from 'recharts';
import {
  BrainCircuit, Loader2, UserCheck, Activity, Users,
  BarChart2, ClipboardList, ChevronDown, AlertTriangle,
  CheckCircle2, Info, Zap, Clock, Award, Plus, Trash2,
  RotateCcw, Sliders, X, Layers, Download, Sparkles,
  ArrowRight, ShieldCheck, FileText, Check, Database,
  Upload, Play, Printer, ChevronLeft, ChevronRight,
  CalendarOff, UserX, FileSpreadsheet
} from 'lucide-react';

const API = 'http://localhost:8000';

// ── Colour helpers ────────────────────────────────────────────────────────────
const workloadColor = (pct) =>
  pct < 50 ? '#10b981' : pct < 80 ? '#f59e0b' : '#ef4444';

const confidenceColor = (conf) =>
  conf >= 0.85 ? 'text-emerald-400' : conf >= 0.60 ? 'text-amber-400' : 'text-red-400';

const MODEL_COLORS = {
  'Random Forest':   '#818cf8',
  'Decision Tree':   '#34d399',
  'KNN':             '#f472b6',
  'AdaBoost':        '#fb923c',
  'XGBoost':         '#60a5fa',
  'CatBoost':        '#a78bfa',
};

// ── Sample & Domain Preset Sprint Backlogs ─────────────────────────────────────
const SAMPLE_SPRINT_TASKS = [
  { id: 'SP-101', title: 'React Checkout Modal', task_description: 'Build a responsive checkout modal component using React 19 and Tailwind CSS with accessible keyboard navigation.', story_points: 5 },
  { id: 'SP-102', title: 'OAuth2 JWT Middleware', task_description: 'Develop high-throughput REST API endpoints in FastAPI with OAuth2 JWT token rotation and RBAC permission checks.', story_points: 8 },
  { id: 'SP-103', title: 'Cypress E2E Checkout Suite', task_description: 'Write comprehensive automated end-to-end regression tests using Cypress for payment checkout flow and webhooks.', story_points: 3 },
  { id: 'SP-104', title: 'PostgreSQL Read Replica', task_description: 'Optimize slow PostgreSQL queries with composite B-Tree indexes and configure streaming read-replica with PgBouncer.', story_points: 8 },
  { id: 'SP-105', title: 'Kubernetes Ingress & Helm', task_description: 'Configure Kubernetes Helm charts, Horizontal Pod Autoscaler, and ingress controller on AWS EKS cluster.', story_points: 5 },
  { id: 'SP-106', title: 'WebSocket Activity Feed', task_description: 'Implement real-time activity feed notifications using WebSocket client hooks and optimistic UI updates in React.', story_points: 3 },
  { id: 'SP-107', title: 'Redis Rate Limiter', task_description: 'Implement rate limiting using Redis sliding window counter to prevent API abuse and DDoS attacks.', story_points: 5 },
  { id: 'SP-108', title: 'Multi-stage Docker Build', task_description: 'Create production multi-stage Dockerfile with Alpine base image and security vulnerability scanning with Trivy.', story_points: 3 }
];

const PRESET_BACKLOGS = {
  sample: { name: 'Full-Stack Web (Default 8 Stories)', tasks: SAMPLE_SPRINT_TASKS },
  fintech: {
    name: 'FinTech Banking & Payments (6 Stories)',
    tasks: [
      { id: 'FT-201', title: 'KYC Document Verification Engine', task_description: 'Build microservice with OCR pipeline and automated ID card validation using Python FastAPI and AWS Textract.', story_points: 8 },
      { id: 'FT-202', title: 'Fraud Anomaly Detection Stream', task_description: 'Deploy real-time Kafka transaction consumer with sliding window isolation forest to flag suspicious transactions.', story_points: 5 },
      { id: 'FT-203', title: 'PCI-DSS Tokenized Payment Vault', task_description: 'Configure encrypted PostgreSQL tablespace with AES-256 vault and strict access control for credit card tokens.', story_points: 8 },
      { id: 'FT-204', title: 'Interactive Investment Portfolio UI', task_description: 'Develop responsive financial asset allocation charts, candlestick graphs, and rebalancing sliders in React 19.', story_points: 5 },
      { id: 'FT-205', title: 'Automated Audit Penetration Tests', task_description: 'Run automated OWASP Top 10 security scanning, SQL injection penetration tests, and write Cypress compliance reports.', story_points: 3 },
      { id: 'FT-206', title: 'Zero-Downtime Blue/Green Deployment', task_description: 'Set up Kubernetes ArgoCD GitOps pipeline with blue/green traffic shifting and automated rollback on 5xx errors.', story_points: 5 }
    ]
  },
  healthcare: {
    name: 'Healthcare & EHR HIPAA (5 Stories)',
    tasks: [
      { id: 'HC-301', title: 'HIPAA Patient Portal Dashboard', task_description: 'Design accessible patient health record UI with biometric two-factor login and Tailwind CSS.', story_points: 5 },
      { id: 'HC-302', title: 'HL7 / FHIR Ingestion API', task_description: 'Implement FHIR v4 JSON schema validation endpoints for Electronic Health Records exchange via FastAPI.', story_points: 8 },
      { id: 'HC-303', title: 'Medical Imaging Database Sharding', task_description: 'Configure partitioned PostgreSQL database with DICOM metadata indexes and AWS S3 storage pointers.', story_points: 8 },
      { id: 'HC-304', title: 'Clinical Trial Patient Matching CI', task_description: 'Write integration unit test suite for clinical guideline rules engine with pytest and coverage reporting.', story_points: 3 },
      { id: 'HC-305', title: 'Telehealth WebRTC Encrypted Channel', task_description: 'Set up encrypted TURN/STUN signaling servers and HIPAA-compliant WebRTC audio/video call containers.', story_points: 5 }
    ]
  }
};


// ── Tab nav ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'predict',  label: 'Predict & Allocate',        icon: BrainCircuit },
  { id: 'sprint',   label: 'Sprint Backlog Allocation', icon: Layers },
  { id: 'metrics',  label: 'Research Benchmarks',        icon: BarChart2 },
  { id: 'team',     label: 'Team Roster',               icon: Users },
  { id: 'history',  label: 'Prediction History',        icon: ClipboardList },
];

// ── Viva Defense Presentation Slides Data ─────────────────────────────────────
const VIVA_SLIDES = [
  {
    title: "1. The Problem Formulation",
    subtitle: "Distributed Agile Bottlenecks & Asymmetric Task Allocation",
    badge: "Problem & Motivation",
    points: [
      {
        heading: "Asymmetric Cognitive Load on Scrum Masters",
        desc: "In distributed teams across time zones, Scrum Masters lack real-time visibility into nuanced code specializations, leading to subjective and sub-optimal manual sprint allocations."
      },
      {
        heading: "The 'Hero Developer' Pitfall & Silent Burnout",
        desc: "High-velocity engineers are repeatedly assigned critical path stories, driving individual workloads to 90%+ while other teammates remain under-utilized."
      },
      {
        heading: "Black-Box AI Skepticism in Software Engineering",
        desc: "Engineering teams reject opaque ML models that assign tasks without verifiable, interpretable technical justifications."
      },
      {
        heading: "Research Objective",
        desc: "Formulate a dual-tier framework coupling Explainable ML (SHAP TreeExplainer) with Kuhn-Munkres Combinatorial Optimization for capacity-balanced sprint allocation."
      }
    ],
    highlight: "Dual-Objective: Accurately predict developer technical role from natural language stories, then assign tasks to minimize cumulative team workload variance."
  },
  {
    title: "2. Dual-Tier Hybrid Architecture",
    subtitle: "Coupling NLP Ensembles with Combinatorial Kuhn-Munkres Optimization",
    badge: "System Architecture",
    points: [
      {
        heading: "Tier 1: Semantic Role Classification",
        desc: "Natural language user stories are vectorized via sub-linear TF-IDF (5,000 features, unigrams + bigrams) and classified into 5 specialized agile roles."
      },
      {
        heading: "Tier 2: Kuhn-Munkres (Hungarian) Allocation",
        desc: "Solves minimum-weight bipartite matching across the active candidate pool for the predicted role, preventing team burnout and capacity exhaustion."
      },
      {
        heading: "Multi-Objective Cost Formulation",
        desc: "Cost = 0.6 × Normalized Workload + 0.4 × (1 - Normalized Velocity). Guarantees optimal balance between availability and historical sprint throughput."
      },
      {
        heading: "Dynamic Vacation & Leave Routing",
        desc: "Candidates marked 'On Leave' are strictly excluded from the active bipartite matrix, guaranteeing zero dropped tasks."
      }
    ],
    highlight: "Optimization Goal: min sum(C_ij * X_ij) subject to assignment uniqueness and dynamic team availability constraints."
  },
  {
    title: "3. Explainable AI via TreeExplainer & SHAP",
    subtitle: "Game-Theoretic Transparency for Agile Engineering Leads",
    badge: "Explainability & Trust",
    points: [
      {
        heading: "Axiomatic Guarantees of Shapley Values",
        desc: "Rooted in cooperative game theory, guaranteeing Efficiency, Symmetry, and Additivity across all token interactions."
      },
      {
        heading: "Exact Marginal Contributions",
        desc: "Calculates the exact positive and negative push of specific technical keywords (e.g. 'kubernetes', 'jwt', 'b-tree') toward the predicted role."
      },
      {
        heading: "Sprint Review & Auditability",
        desc: "Scrum teams can inspect top-5 SHAP feature attributions in real time, validating why a task was routed to DBA vs Backend."
      },
      {
        heading: "CatBoost & XGBoost TreeExplainer",
        desc: "Instantaneous polynomial-time SHAP computation enables real-time sub-50ms inference without sampling approximation."
      }
    ],
    highlight: "Transparency builds developer trust: engineers see exactly which architectural keywords triggered the assignment."
  },
  {
    title: "4. Empirical Benchmarks & Cross-Repo Transfer",
    subtitle: "Evaluation across 1,250 Multi-Repository Agile Stories",
    badge: "Empirical Benchmarks",
    points: [
      {
        heading: "6-Model Algorithmic Tournament",
        desc: "Random Forest, Decision Tree, KNN, AdaBoost, XGBoost, and CatBoost were benchmarked on a stratified multi-repo corpus."
      },
      {
        heading: "State-of-the-Art Accuracy & Macro-F1",
        desc: "CatBoost (92.5%) and XGBoost (92.0%) significantly outperform baseline classifiers (Decision Tree: 78.4%, KNN: 74.2%)."
      },
      {
        heading: "Cross-Repository Zero-Shot Transfer",
        desc: "Tested on unseen task repositories (Mozilla, Apache, Taiga, FinTech, OpenEHR) achieving 88.5%+ transfer accuracy."
      },
      {
        heading: "Semantic Representation Impact",
        desc: "TF-IDF + Dense Semantic representations exhibit robust domain invariance compared to naive Bag-of-Words."
      }
    ],
    highlight: "Robustness Proven: The system generalizes effectively across diverse corporate and open-source project structures."
  },
  {
    title: "5. Live Demonstration & Viva Defense Takeaways",
    subtitle: "Complete Decision-Support Workflow Ready for Defense Evaluation",
    badge: "Defense & Viva Review",
    points: [
      {
        heading: "Interactive Workload Sliders",
        desc: "Demonstrate live Hungarian re-routing by adjusting developer workload from 20% to 90% and observing assignment diversion."
      },
      {
        heading: "Vacation / Leave Simulation",
        desc: "Toggle developer availability; verify that the system dynamically bypasses unavailable personnel."
      },
      {
        heading: "Sprint Backlog Batch Processing",
        desc: "Allocate multi-story sprints (Full-Stack, FinTech, Healthcare, or uploaded Jira CSVs) with live capacity updates."
      },
      {
        heading: "Academic Publication & Viva Deliverables",
        desc: "Automated JSON research audit report, print-ready formal academic paper, and zero-error terminal verification."
      }
    ],
    highlight: "Final Verdict: A publication-grade, mathematically grounded solution to one of modern software engineering's toughest operational problems."
  }
];

export default function App() {
  const [activeTab, setActiveTab]   = useState('predict');
  const [task, setTask]             = useState('');
  const [modelChoice, setModelChoice] = useState('xgboost');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);

  const [metrics, setMetrics]       = useState(null);
  const [crossRepoData, setCrossRepoData] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [history, setHistory]       = useState([]);

  const [highlightDev, setHighlightDev] = useState(null);

  // ── Phase 3: Presentation & Academic Paper Modals ─────────────────────────
  const [showPresentationModal, setShowPresentationModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPaperModal, setShowPaperModal] = useState(false);
  const fileInputRef = useRef(null);

  // ── Sprint Backlog State ──────────────────────────────────────────────────
  const [sprintTasks, setSprintTasks] = useState(SAMPLE_SPRINT_TASKS);
  const [sprintModel, setSprintModel] = useState('xgboost');
  const [applyWorkload, setApplyWorkload] = useState(false);
  const [sprintLoading, setSprintLoading] = useState(false);
  const [sprintResult, setSprintResult] = useState(null);
  const [sprintError, setSprintError] = useState(null);
  const [showAddSprintTask, setShowAddSprintTask] = useState(false);
  const [customSprintTask, setCustomSprintTask] = useState({ title: '', task_description: '', story_points: 3 });
  const [selectedPreset, setSelectedPreset] = useState('sample');

  const [showAddDev, setShowAddDev] = useState(false);
  const [newDev, setNewDev] = useState({
    name: '',
    role: 'Frontend Developer',
    workload: 30,
    velocity: 35,
    timezone: 'UTC+5:30',
    is_available: true
  });
  const [devActionLoading, setDevActionLoading] = useState(false);

  // ── Keyboard Navigation for Presentation Modal ───────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showPresentationModal) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide(prev => Math.min(prev + 1, 4));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        setShowPresentationModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPresentationModal]);

  // ── Fetch side-data on mount ─────────────────────────────────────────────
  useEffect(() => {
    axios.get(`${API}/metrics`).then(r => setMetrics(r.data)).catch(() => {});
    axios.get(`${API}/benchmark/cross-repo`).then(r => setCrossRepoData(r.data)).catch(() => {});
    refreshDevelopers();
    axios.get(`${API}/history`).then(r => setHistory(r.data.history)).catch(() => {});
  }, []);

  const refreshHistory = () =>
    axios.get(`${API}/history`).then(r => setHistory(r.data.history)).catch(() => {});

  const refreshDevelopers = () =>
    axios.get(`${API}/developers`).then(r => setDevelopers(r.data.developers)).catch(() => {});

  const handleAddDeveloper = async (e) => {
    e.preventDefault();
    if (!newDev.name.trim()) return;
    setDevActionLoading(true);
    try {
      await axios.post(`${API}/developers`, newDev);
      setNewDev({ name: '', role: 'Frontend Developer', workload: 30, velocity: 35, timezone: 'UTC+5:30', is_available: true });
      setShowAddDev(false);
      refreshDevelopers();
    } catch (err) {
      alert('Failed to add developer.');
    } finally {
      setDevActionLoading(false);
    }
  };

  const handleUpdateWorkload = async (devId, newWorkload) => {
    setDevelopers(prev => prev.map(d => d.id === devId ? { ...d, workload: newWorkload } : d));
    try {
      await axios.put(`${API}/developers/${devId}`, { workload: newWorkload });
    } catch (err) {
      refreshDevelopers();
    }
  };

  const handleToggleAvailability = async (devId, currentAvailability) => {
    const nextAvailability = !currentAvailability;
    setDevelopers(prev => prev.map(d => d.id === devId ? { ...d, is_available: nextAvailability } : d));
    try {
      await axios.put(`${API}/developers/${devId}/availability`, { is_available: nextAvailability });
    } catch (err) {
      refreshDevelopers();
    }
  };

  const handleDeleteDeveloper = async (devId) => {
    if (!window.confirm('Are you sure you want to remove this developer from the team roster?')) return;
    try {
      await axios.delete(`${API}/developers/${devId}`);
      refreshDevelopers();
    } catch (err) {
      alert('Failed to delete developer.');
    }
  };

  const handleResetRoster = async () => {
    if (!window.confirm('Reset the team roster back to default developers?')) return;
    try {
      await axios.post(`${API}/developers/reset`);
      refreshDevelopers();
    } catch (err) {
      alert('Failed to reset roster.');
    }
  };

  // ── Sprint Backlog Handlers ───────────────────────────────────────────────
  const handleLoadSampleSprint = () => {
    setSprintTasks(SAMPLE_SPRINT_TASKS);
    setSelectedPreset('sample');
    setSprintResult(null);
  };

  const handleSelectPreset = (key) => {
    if (PRESET_BACKLOGS[key]) {
      setSprintTasks(PRESET_BACKLOGS[key].tasks);
      setSelectedPreset(key);
      setSprintResult(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') return;

        // Try JSON
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            const mapped = parsed.map((item, idx) => ({
              id: item.id || `JSON-${idx + 101}`,
              title: item.title || item.summary || item.task_description?.slice(0, 30) || `Imported Task ${idx + 1}`,
              task_description: item.task_description || item.description || item.summary || '',
              story_points: Number(item.story_points || item.points || item.estimate || 3)
            })).filter(t => t.task_description);
            if (mapped.length > 0) {
              setSprintTasks(mapped);
              setSprintResult(null);
              return;
            }
          }
        }

        // CSV parsing
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
          alert('CSV file appears empty or has only 1 line.');
          return;
        }

        const headers = lines[0].toLowerCase().split(',').map(h => h.replace(/["']/g, '').trim());
        const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('summary') || h.includes('story'));
        const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('name') || h.includes('issue'));
        const ptsIdx = headers.findIndex(h => h.includes('point') || h.includes('pts') || h.includes('estimate'));

        const parsedTasks = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
          const desc = descIdx >= 0 && row[descIdx] ? row[descIdx] : row.slice(1).join(' ') || row[0];
          const title = titleIdx >= 0 && row[titleIdx] ? row[titleIdx] : desc.slice(0, 30);
          const pts = ptsIdx >= 0 && !isNaN(Number(row[ptsIdx])) ? Number(row[ptsIdx]) : 3;

          if (desc && desc.length > 5) {
            parsedTasks.push({
              id: `JIRA-${100 + i}`,
              title: title || `Task ${i}`,
              task_description: desc,
              story_points: pts
            });
          }
        }

        if (parsedTasks.length > 0) {
          setSprintTasks(parsedTasks);
          setSprintResult(null);
        } else {
          alert('Could not parse valid user stories from CSV.');
        }
      } catch (err) {
        alert('Error parsing uploaded file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddCustomSprintTask = (e) => {
    e.preventDefault();
    if (!customSprintTask.task_description.trim()) return;
    const newTask = {
      id: `SP-${100 + sprintTasks.length + 1}`,
      title: customSprintTask.title.trim() || customSprintTask.task_description.slice(0, 30),
      task_description: customSprintTask.task_description.trim(),
      story_points: Number(customSprintTask.story_points) || 3
    };
    setSprintTasks([...sprintTasks, newTask]);
    setCustomSprintTask({ title: '', task_description: '', story_points: 3 });
    setShowAddSprintTask(false);
  };

  const handleRemoveSprintTask = (taskId) => {
    setSprintTasks(sprintTasks.filter(t => t.id !== taskId));
  };

  const handleRunSprintAllocation = async () => {
    if (sprintTasks.length === 0) return;
    setSprintLoading(true);
    setSprintError(null);
    try {
      const res = await axios.post(`${API}/predict/batch`, {
        tasks: sprintTasks,
        model: sprintModel,
        apply_workload_update: applyWorkload
      });
      setSprintResult(res.data);
      if (applyWorkload) {
        refreshDevelopers();
      }
      refreshHistory();
    } catch (err) {
      setSprintError('Failed to execute sprint allocation pipeline. Ensure backend is running.');
    } finally {
      setSprintLoading(false);
    }
  };

  // ── Viva / Research Audit Report Exporter ─────────────────────────────────
  const handleExportReport = () => {
    const reportPayload = {
      project_title: "Explainable ML for Developer Role Prediction & Task Allocation in Distributed Agile Teams",
      institution: "Final Year B.Tech Engineering Project - SSYJ",
      export_timestamp: new Date().toISOString(),
      active_ml_models: ["XGBoost", "CatBoost"],
      baseline_classification_metrics: metrics?.models || {},
      cross_repository_transfer_metrics: crossRepoData || {},
      active_team_roster: developers,
      recent_prediction_audit_log: history,
      latest_sprint_allocation_result: sprintResult || null
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `agile_task_allocation_audit_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // ── Predict handler ──────────────────────────────────────────────────────
  const handlePredict = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    setLoading(true);
    setError(null);
    setHighlightDev(null);
    try {
      const res = await axios.post(`${API}/predict`, {
        task_description: task,
        model: modelChoice,
      });
      setResult(res.data);
      setHighlightDev(res.data.allocation?.name);
      refreshHistory();
    } catch (err) {
      setError('Failed to connect to the prediction API. Ensure the backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  // ── Metrics chart data ────────────────────────────────────────────────────
  const metricsChartData = metrics?.models
    ? Object.entries(metrics.models).map(([name, vals]) => ({
        name,
        Accuracy:  +(vals.accuracy  * 100).toFixed(1),
        'Macro-F1': +(vals.macro_f1 * 100).toFixed(1),
      }))
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Agile Task Allocator</h1>
              <p className="text-xs text-slate-400">Explainable AI · Workload Optimization</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex gap-1">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-2">
              <button
                onClick={() => { setCurrentSlide(0); setShowPresentationModal(true); }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md shadow-fuchsia-950/40"
                title="Launch 5-Slide Interactive Viva Defense Presentation"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Viva Slides</span>
              </button>

              <button
                onClick={() => setShowPaperModal(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md shadow-emerald-950/40"
                title="View & Print Formal Academic Research Paper"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Academic Paper</span>
              </button>

              <button
                onClick={handleExportReport}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40 hover:border-indigo-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
                title="Download Full Project & Research Report (JSON)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ════════════════════════════════════════════════════════════════
            TAB: Predict & Allocate
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'predict' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input panel */}
            <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" /> New Task Assignment
              </h2>

              {/* Model selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select ML Model
                </label>
                <div className="flex gap-2">
                  {['xgboost', 'catboost'].map(m => (
                    <button
                      key={m}
                      onClick={() => setModelChoice(m)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        modelChoice === m
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {m === 'xgboost' ? '⚡ XGBoost' : '🐱 CatBoost'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task textarea */}
              <form onSubmit={handlePredict} className="flex-1 flex flex-col gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    User Story / Task Description
                  </label>
                  <textarea
                    className="w-full h-44 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm"
                    placeholder="e.g., Build a responsive login page using React hooks with form validation..."
                    value={task}
                    onChange={e => setTask(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !task.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-900/30"
                >
                  {loading
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Running Pipeline...</>
                    : <><BrainCircuit className="w-5 h-5" /> Run Hybrid Allocation Pipeline</>
                  }
                </button>
              </form>

              {error && (
                <div className="p-3 bg-red-950/60 border border-red-700/50 text-red-300 rounded-xl text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                </div>
              )}
            </section>

            {/* Results panel */}
            <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" /> Prediction Results
              </h2>

              {!result && !loading && (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm text-center border-2 border-dashed border-slate-800 rounded-xl p-8">
                  Enter a task description and click to run Tier 1 (Role) + Tier 2 (Optimization).
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-indigo-400 border-2 border-dashed border-slate-800 rounded-xl p-8">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="animate-pulse text-sm">Running {modelChoice === 'catboost' ? 'CatBoost' : 'XGBoost'} + Hungarian Algorithm...</p>
                </div>
              )}

              {result && !loading && (
                <div className="flex flex-col gap-4 flex-1">

                  {/* Confidence banner */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${
                    result.confidence >= 0.85
                      ? 'bg-emerald-950/50 border-emerald-700/40 text-emerald-300'
                      : result.confidence >= 0.60
                      ? 'bg-amber-950/50 border-amber-700/40 text-amber-300'
                      : 'bg-red-950/50 border-red-700/40 text-red-300'
                  }`}>
                    {result.confidence >= 0.85
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <AlertTriangle className="w-4 h-4" />
                    }
                    {result.confidence_label} · Model: {result.model_used}
                  </div>

                  {/* Tier 1 */}
                  <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                    <div className="text-xs font-bold text-indigo-400 tracking-wider uppercase mb-2">
                      Tier 1 — ML Role Prediction
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-2xl font-bold text-cyan-300">{result.predicted_role}</div>
                      <div className={`text-xl font-mono font-bold ${confidenceColor(result.confidence)}`}>
                        {(result.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                    {/* Top-3 */}
                    <div className="space-y-1.5">
                      {result.top_3_roles?.map((r, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-4">#{i + 1}</span>
                          <div className="flex-1 text-xs text-slate-300">{r.role}</div>
                          <div className="w-28 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${r.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right">
                            {(r.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tier 2 */}
                  <div className="bg-indigo-950/30 rounded-xl p-4 border border-indigo-900/50">
                    <div className="text-xs font-bold text-indigo-400 tracking-wider uppercase mb-2 flex items-center gap-1">
                      <UserCheck className="w-4 h-4" /> Tier 2 — Developer Allocation
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-white">{result.allocation?.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{result.allocation?.reason}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400 mb-1 flex items-center gap-1 justify-end">
                          <Activity className="w-3 h-3" /> Workload
                        </div>
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${result.allocation?.workload_percent ?? 0}%`,
                              backgroundColor: workloadColor(result.allocation?.workload_percent ?? 0)
                            }}
                          />
                        </div>
                        <div className="text-xs font-mono mt-1 text-slate-300">
                          {result.allocation?.workload_percent}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-indigo-400 font-medium">
                      🔬 {result.allocation?.algorithm}
                    </div>
                  </div>

                  {/* SHAP */}
                  {result.shap_explanation?.length > 0 && (
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 flex items-center justify-between">
                        <span>Explainable AI (SHAP)</span>
                        <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                          Feature Importance
                        </span>
                      </div>
                      <div className="h-36 bg-slate-800/60 rounded-xl p-2 border border-slate-700">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={result.shap_explanation} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false}
                              tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                            <Tooltip
                              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: 12 }}
                            />
                            <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={14} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: Sprint Backlog Batch Allocation
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'sprint' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Layers className="w-6 h-6 text-indigo-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Sprint Backlog Batch Allocation</h2>
                  <p className="text-sm text-slate-400">
                    Capacity-aware Hungarian multi-task optimization across the active team roster
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Hidden File Input for CSV / Jira upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.json,.txt"
                  className="hidden"
                />

                {/* Preset Selector */}
                <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <select
                    value={selectedPreset}
                    onChange={(e) => handleSelectPreset(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer font-medium"
                    title="Load Pre-configured Domain Agile Sprints"
                  >
                    <option value="sample" className="bg-slate-900">Preset: Full-Stack (8 Stories)</option>
                    <option value="fintech" className="bg-slate-900">Preset: FinTech (6 Stories)</option>
                    <option value="healthcare" className="bg-slate-900">Preset: Healthcare (5 Stories)</option>
                  </select>
                </div>

                {/* Import Jira / CSV Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-indigo-500/40 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
                  title="Upload Jira CSV Backlog Export or JSON Task Array"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Jira / CSV</span>
                </button>

                <button
                  onClick={handleLoadSampleSprint}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  title="Reset to 8 representative multi-role user stories"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={() => setShowAddSprintTask(!showAddSprintTask)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-900/30"
                >
                  {showAddSprintTask ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{showAddSprintTask ? 'Cancel' : 'Add Story'}</span>
                </button>
              </div>
            </div>

            {/* ── Add User Story Modal / Form ──────────────────────── */}
            {showAddSprintTask && (
              <form onSubmit={handleAddCustomSprintTask} className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-6 shadow-xl shadow-indigo-950/40 animate-in fade-in slide-in-from-top-4 duration-200">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add User Story to Sprint Backlog
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Story Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Stripe Payment Integration"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={customSprintTask.title}
                      onChange={e => setCustomSprintTask({ ...customSprintTask, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Story Points (1 - 13)</label>
                    <input
                      type="number"
                      min="1"
                      max="13"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={customSprintTask.story_points}
                      onChange={e => setCustomSprintTask({ ...customSprintTask, story_points: Number(e.target.value) })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Detailed User Story Description</label>
                    <textarea
                      required
                      placeholder="As a user, I want... (e.g. Implement Redis token bucket rate limiting on authentication routes)"
                      className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                      value={customSprintTask.task_description}
                      onChange={e => setCustomSprintTask({ ...customSprintTask, task_description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSprintTask(false)}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Add to Backlog
                  </button>
                </div>
              </form>
            )}

            {/* ── Sprint Optimization Controls ─────────────────────── */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase">ML Model:</span>
                  <div className="inline-flex rounded-lg border border-slate-700 p-0.5 bg-slate-800">
                    <button
                      onClick={() => setSprintModel('xgboost')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        sprintModel === 'xgboost' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ⚡ XGBoost
                    </button>
                    <button
                      onClick={() => setSprintModel('catboost')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        sprintModel === 'catboost' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🐱 CatBoost
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applyWorkload}
                    onChange={e => setApplyWorkload(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Persist Workload Updates to Roster</span>
                </label>
              </div>

              <button
                onClick={handleRunSprintAllocation}
                disabled={sprintLoading || sprintTasks.length === 0}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40"
              >
                {sprintLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Optimizing Sprint ({sprintTasks.length} Stories)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Optimize Sprint Backlog ({sprintTasks.length} Tasks)</span>
                  </>
                )}
              </button>
            </div>

            {sprintError && (
              <div className="p-4 bg-red-950/60 border border-red-700/50 text-red-300 rounded-xl text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{sprintError}</span>
              </div>
            )}

            {/* ── Sprint Backlog Queue Preview ─────────────────────── */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-400" />
                  Sprint Backlog Queue ({sprintTasks.length} Items)
                </h3>
                <span className="text-xs text-slate-400">
                  Total Points: <strong className="text-cyan-400 font-mono">{sprintTasks.reduce((acc, t) => acc + (t.story_points || 3), 0)} pts</strong>
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {sprintTasks.map(t => (
                  <div key={t.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-600 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50">
                          {t.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-semibold text-slate-300 bg-slate-700 px-1.5 py-0.5 rounded">
                            {t.story_points} pts
                          </span>
                          <button
                            onClick={() => handleRemoveSprintTask(t.id)}
                            className="text-slate-500 hover:text-red-400 p-0.5 rounded"
                            title="Remove from sprint"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="font-semibold text-xs text-slate-100 mb-1">{t.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {t.task_description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Sprint Allocation Results ────────────────────────── */}
            {sprintResult && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Sprint Metrics Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Total Stories</div>
                    <div className="text-2xl font-bold text-indigo-400 font-mono">{sprintResult.total_tasks}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Sprint Points</div>
                    <div className="text-2xl font-bold text-cyan-400 font-mono">{sprintResult.total_story_points} pts</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Avg ML Confidence</div>
                    <div className="text-2xl font-bold text-emerald-400 font-mono">
                      {(sprintResult.average_confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Model Evaluator</div>
                    <div className="text-2xl font-bold text-violet-400 truncate">{sprintResult.model_used}</div>
                  </div>
                </div>

                {/* Team Workload Delta (Before vs. After) */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Team Capacity Impact (Before vs. Post-Sprint Allocation)
                  </h3>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sprintResult.final_roster?.map(dev => {
                      const initDev = sprintResult.initial_roster?.find(d => d.id === dev.id);
                      const initialW = initDev ? initDev.workload : dev.workload;
                      const finalW = dev.workload;
                      const assignedCount = sprintResult.developer_distribution?.[dev.name] || 0;

                      return (
                        <div key={dev.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold text-xs text-white">{dev.name}</div>
                              <div className="text-[11px] text-slate-400 truncate">{dev.role.split(' ')[0]}</div>
                            </div>
                            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                              assignedCount > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'
                            }`}>
                              {assignedCount} tasks
                            </span>
                          </div>

                          <div className="space-y-1.5 mt-2">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-slate-400">Workload:</span>
                              <span>
                                <span style={{ color: workloadColor(initialW) }}>{initialW}%</span>
                                <ArrowRight className="inline w-3 h-3 mx-1 text-slate-500" />
                                <strong style={{ color: workloadColor(finalW) }}>{finalW}%</strong>
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${finalW}%`, backgroundColor: workloadColor(finalW) }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Allocated Stories Kanban Board */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    Allocated Sprint Stories & Explainable AI (SHAP) Attribution
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {sprintResult.tasks?.map((item, idx) => (
                      <div key={idx} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                                {item.task_id}
                              </span>
                              <span className="font-semibold text-sm text-slate-100">{item.title}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded shrink-0">
                              {item.story_points} pts
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                            {item.task_description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-700/70 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">Predicted Role:</span>
                              <strong className="text-indigo-300">{item.predicted_role}</strong>
                              <span className={`font-mono text-[11px] ${confidenceColor(item.confidence)}`}>
                                ({(item.confidence * 100).toFixed(1)}%)
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">Assigned:</span>
                              <strong className="text-emerald-400">{item.assigned_to}</strong>
                            </div>
                          </div>

                          {/* SHAP Keywords Badge Row */}
                          {item.shap_explanation?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pt-1">
                              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Top Features:</span>
                              {item.shap_explanation.map((sh, sIdx) => (
                                <span key={sIdx} className="text-[10px] font-mono bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 px-1.5 py-0.5 rounded">
                                  {sh.feature}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-[11px] text-slate-500 italic mt-1">
                            {item.reason}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <BarChart2 className="w-6 h-6 text-indigo-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Model Performance Comparison</h2>
                <p className="text-sm text-slate-400">Trained on agile_tasks.csv with SMOTETomek balancing · 80/20 train-test split</p>
              </div>
            </div>

            {!metrics ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
                <Info className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                <p>Metrics not available. Run <code className="text-amber-400">python train_baseline.py</code> to generate comparison data.</p>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.entries(metrics.models ?? {}).map(([name, vals]) => (
                    <div key={name} className="bg-slate-900 rounded-xl border border-slate-800 p-4 text-center">
                      <div className="text-xs text-slate-400 mb-1 truncate">{name}</div>
                      <div className="text-2xl font-bold" style={{ color: MODEL_COLORS[name] ?? '#818cf8' }}>
                        {(vals.macro_f1 * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Macro-F1</div>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Accuracy & Macro-F1 by Model (%)</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metricsChartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', color: '#f8fafc', fontSize: 12 }}
                          formatter={(val) => [`${val}%`]}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                        <Bar dataKey="Accuracy"  fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={22} />
                        <Bar dataKey="Macro-F1"  fill="#818cf8" radius={[4, 4, 0, 0]} barSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="text-left px-6 py-3">Model</th>
                        <th className="text-right px-4 py-3">Accuracy</th>
                        <th className="text-right px-4 py-3">Precision</th>
                        <th className="text-right px-4 py-3">Recall</th>
                        <th className="text-right px-6 py-3">Macro-F1</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(metrics.models ?? {})
                        .sort((a, b) => b[1].macro_f1 - a[1].macro_f1)
                        .map(([name, vals], i) => (
                          <tr key={name} className={`border-b border-slate-800/50 ${i === 0 ? 'bg-indigo-950/20' : ''}`}>
                            <td className="px-6 py-3 font-medium text-slate-200 flex items-center gap-2">
                              {i === 0 && <span className="text-xs bg-indigo-600 px-2 py-0.5 rounded text-white">Best</span>}
                              <span style={{ color: MODEL_COLORS[name] ?? '#818cf8' }}>●</span> {name}
                            </td>
                            <td className="text-right px-4 py-3 font-mono text-slate-300">{(vals.accuracy  * 100).toFixed(2)}%</td>
                            <td className="text-right px-4 py-3 font-mono text-slate-300">{(vals.precision * 100).toFixed(2)}%</td>
                            <td className="text-right px-4 py-3 font-mono text-slate-300">{(vals.recall   * 100).toFixed(2)}%</td>
                            <td className="text-right px-6 py-3 font-mono font-bold text-indigo-300">{(vals.macro_f1 * 100).toFixed(2)}%</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Research Innovation: Cross-Repository & Semantic Embeddings ── */}
                {crossRepoData && (
                  <div className="space-y-6 mt-8 pt-8 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-400">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>Cross-Repository Domain Generalization & Semantic Transfer</span>
                          <span className="text-xs bg-violet-950 text-violet-300 border border-violet-800 px-2 py-0.5 rounded-full font-mono">
                            IEEE/Springer Research Benchmark
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          Trained on 779 tasks from 3 source repositories (Taiga.io, Apache, Mozilla) and evaluated on 471 tasks from completely unseen target repositories (Enterprise FinTech, OpenEHR)
                        </p>
                      </div>
                    </div>

                    {/* Repository Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-500 font-semibold uppercase">Evaluated Repositories:</span>
                      {crossRepoData.repositories?.map((repo, rIdx) => (
                        <span key={rIdx} className="text-xs bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          {repo}
                        </span>
                      ))}
                    </div>

                    {/* Domain Transfer Results Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Representation Comparison */}
                      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
                        <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          Feature Representation Benchmark (XGBoost)
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(crossRepoData.feature_representations || {}).map(([repName, repVals]) => (
                            <div key={repName} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
                              <div>
                                <div className="text-xs font-semibold text-white">{repName}</div>
                                <div className="text-[11px] text-slate-400">Precision: {(repVals.precision * 100).toFixed(1)}% · Recall: {(repVals.recall * 100).toFixed(1)}%</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-mono font-bold text-indigo-400">{(repVals.macro_f1 * 100).toFixed(1)}%</div>
                                <div className="text-[10px] text-slate-500 uppercase">Macro-F1</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Domain Transfer Evaluation on Unseen Repositories */}
                      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
                        <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Zero-Shot Domain Transfer to Unseen Repositories
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(crossRepoData.cross_domain_generalization?.models || {}).map(([mName, mVals]) => (
                            <div key={mName} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
                              <div>
                                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                                  <span style={{ color: MODEL_COLORS[mName] ?? '#818cf8' }}>●</span>
                                  {mName}
                                </div>
                                <div className="text-[11px] text-emerald-400 font-medium">Tested on FinTech & Health Repos</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-mono font-bold text-emerald-400">{(mVals.accuracy * 100).toFixed(1)}%</div>
                                <div className="text-[10px] text-slate-500 uppercase">Transfer Accuracy</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: Team Roster (CRUD)
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Team Roster & Workload Management</h2>
                  <p className="text-sm text-slate-400">Dynamic team members, live sprint capacity, and Hungarian Algorithm candidate pool</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddDev(!showAddDev)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-900/30"
                >
                  {showAddDev ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{showAddDev ? 'Close Form' : 'Add Developer'}</span>
                </button>
                <button
                  onClick={handleResetRoster}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium px-3 py-2 rounded-xl transition-all"
                  title="Reset to default 7 developers"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            {/* ── Add Developer Card Form ────────────────────────────── */}
            {showAddDev && (
              <form onSubmit={handleAddDeveloper} className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-6 shadow-xl shadow-indigo-950/40 animate-in fade-in slide-in-from-top-4 duration-200">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add New Developer to Roster
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={newDev.name}
                      onChange={e => setNewDev({ ...newDev, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Developer Role</label>
                    <select
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={newDev.role}
                      onChange={e => setNewDev({ ...newDev, role: e.target.value })}
                    >
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="QA/Testing Role">QA/Testing Role</option>
                      <option value="Database Administrator">Database Administrator</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Workload ({newDev.workload}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="w-full mt-2 accent-indigo-500 cursor-pointer"
                      value={newDev.workload}
                      onChange={e => setNewDev({ ...newDev, workload: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Velocity (pts/sprint)</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={newDev.velocity}
                      onChange={e => setNewDev({ ...newDev, velocity: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Timezone</label>
                    <input
                      type="text"
                      placeholder="e.g. UTC+5:30"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={newDev.timezone}
                      onChange={e => setNewDev({ ...newDev, timezone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDev(false)}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={devActionLoading || !newDev.name.trim()}
                    className="px-5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-700"
                  >
                    {devActionLoading ? 'Saving...' : 'Add to Team'}
                  </button>
                </div>
              </form>
            )}

            {developers.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                <p>No developer data. Ensure the backend is running.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {developers.map(dev => {
                  const isAllocated = dev.name === highlightDev;
                  const isAvailable = dev.is_available !== false;
                  return (
                    <div
                      key={dev.id}
                      className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                        !isAvailable
                          ? 'bg-slate-900/50 border-dashed border-amber-500/40 opacity-80'
                          : isAllocated
                          ? 'bg-indigo-950/50 border-indigo-500 shadow-lg shadow-indigo-900/30'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {isAllocated && (
                          <div className="text-xs text-indigo-400 font-semibold mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Last Allocated
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                              <span>{dev.name}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{dev.timezone}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-slate-300">
                              {dev.role.split(' ')[0]}
                            </span>
                            <button
                              onClick={() => handleDeleteDeveloper(dev.id)}
                              className="text-slate-600 hover:text-red-400 p-1 rounded transition-colors"
                              title="Delete developer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 mb-2 truncate">{dev.role}</div>

                        {/* Availability / Vacation Simulation Toggle */}
                        <div className="flex items-center justify-between my-2 px-2.5 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
                          <div className="flex items-center gap-1.5 text-xs">
                            {isAvailable ? (
                              <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
                                <CalendarOff className="w-3.5 h-3.5 text-amber-400 shrink-0" /> On Leave
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggleAvailability(dev.id, isAvailable)}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all ${
                              isAvailable
                                ? 'bg-slate-700 hover:bg-amber-950/70 text-slate-300 hover:text-amber-300 border border-slate-600 hover:border-amber-700'
                                : 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/70'
                            }`}
                            title={isAvailable ? "Simulate developer on leave (Hungarian will dynamically reroute)" : "Mark developer available"}
                          >
                            {isAvailable ? 'Set Leave' : 'Mark Active'}
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 space-y-3 pt-3 border-t border-slate-800/80">
                        {/* Interactive Workload Slider */}
                        <div>
                          <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" /> Workload:
                            </span>
                            <span className="font-mono font-bold" style={{ color: workloadColor(dev.workload) }}>
                              {dev.workload}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={dev.workload}
                            onChange={(e) => handleUpdateWorkload(dev.id, Number(e.target.value))}
                            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                            title="Drag to change workload live"
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>Velocity</span>
                          <span className="font-mono text-cyan-400 font-medium">{dev.velocity} pts/sprint</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: Prediction History
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-indigo-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Prediction History</h2>
                  <p className="text-sm text-slate-400">Last 20 predictions · Persisted in backend/prediction_history.json</p>
                </div>
              </div>
              <button
                onClick={refreshHistory}
                className="text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
              >
                Refresh
              </button>
            </div>

            {history.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                <p>No predictions yet. Run the pipeline to see history here.</p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Timestamp</th>
                      <th className="text-left px-4 py-3">Task (preview)</th>
                      <th className="text-left px-4 py-3">Predicted Role</th>
                      <th className="text-right px-4 py-3">Confidence</th>
                      <th className="text-left px-4 py-3">Model</th>
                      <th className="text-left px-6 py-3">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {new Date(h.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-300 max-w-xs">
                          <div className="truncate">{h.task}</div>
                        </td>
                        <td className="px-4 py-3 text-cyan-400 font-medium whitespace-nowrap">{h.predicted_role}</td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={confidenceColor(h.confidence)}>
                            {(h.confidence * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{h.model}</td>
                        <td className="px-6 py-3 text-slate-200 font-medium whitespace-nowrap">{h.assigned_to}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════════════════════
          MODAL: Viva Defense Presentation Slides Deck
      ════════════════════════════════════════════════════════════════ */}
      {showPresentationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl shadow-indigo-950/70 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Top Slide Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-950 text-violet-300 border border-violet-800/60">
                  {VIVA_SLIDES[currentSlide].badge}
                </span>
                <span className="text-xs text-slate-400">
                  Slide <strong className="text-white">{currentSlide + 1}</strong> of {VIVA_SLIDES.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 hidden sm:inline">Use Left/Right arrows or spacebar</span>
                <button
                  onClick={() => setShowPresentationModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slide Body */}
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                  {VIVA_SLIDES[currentSlide].title}
                </h2>
                <p className="text-sm text-indigo-400 font-medium mt-1">
                  {VIVA_SLIDES[currentSlide].subtitle}
                </p>
              </div>

              {/* Point Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {VIVA_SLIDES[currentSlide].points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/70 hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 mb-1.5">
                      <div className="w-5 h-5 rounded-md bg-indigo-600/30 text-indigo-300 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">{pt.heading}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-7">
                      {pt.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Takeaway Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-violet-950/70 border border-indigo-700/50 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-300 shrink-0" />
                <p className="text-xs text-indigo-200 font-medium leading-relaxed">
                  {VIVA_SLIDES[currentSlide].highlight}
                </p>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
              <button
                onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
                disabled={currentSlide === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white border border-slate-700 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {/* Slide Dots */}
              <div className="flex items-center gap-2">
                {VIVA_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === i ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={`Jump to Slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  if (currentSlide < VIVA_SLIDES.length - 1) {
                    setCurrentSlide(prev => prev + 1);
                  } else {
                    setShowPresentationModal(false);
                  }
                }}
                className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-950 transition-all"
              >
                <span>{currentSlide === VIVA_SLIDES.length - 1 ? 'Finish Deck' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: Print-Ready Academic Research Paper & Technical Report
      ════════════════════════════════════════════════════════════════ */}
      {showPaperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="print-modal bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl shadow-indigo-950/80 my-8 overflow-hidden text-slate-100 flex flex-col">
            {/* Modal Controls Header (Hidden on Print) */}
            <div className="no-print px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white">Academic Technical Report Preview (IEEE Format)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-emerald-950 transition-all"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowPaperModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Paper Document Content */}
            <div className="p-8 sm:p-12 space-y-8 bg-slate-900 leading-relaxed font-sans text-sm">
              {/* Paper Title & Authors */}
              <div className="text-center space-y-3 border-b border-slate-800 pb-8">
                <div className="text-xs uppercase tracking-widest text-emerald-400 font-mono font-bold">
                  B.Tech Engineering Major Project Technical Report · SSYJ
                </div>
                <h1 className="academic-title text-2xl sm:text-3xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
                  Explainable Machine Learning for Developer Role Prediction and Workload-Aware Task Allocation in Distributed Agile Teams
                </h1>
                <div className="text-xs text-slate-400">
                  <p className="font-semibold text-slate-300">Department of Computer Science & Engineering</p>
                  <p>Final Year Viva Defense & Research Prototype Demonstration</p>
                  <p className="font-mono text-[11px] text-slate-500 mt-1">Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              {/* Abstract & Keywords */}
              <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Abstract</h3>
                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                  Modern distributed Agile development faces critical bottlenecks in sprint task allocation: asymmetric knowledge of developer technical specializations, the "hero developer" burnout trap, and opacity in algorithmic task recommendations. In this paper, we formulate and empirically validate a dual-tier explainable decision support architecture. In Tier 1, natural language user stories are classified into 5 specialized developer roles using Tree-based gradient boost ensembles (CatBoost & XGBoost) trained on 1,250 multi-repository agile stories. Real-time game-theoretic feature attributions are computed via SHAP TreeExplainer, establishing complete decision transparency. In Tier 2, the Kuhn-Munkres (Hungarian) algorithm solves a multi-objective bipartite assignment optimizing for both historical velocity and real-time workload constraints with dynamic vacation routing. Our empirical results demonstrate 92.5% classification accuracy and 88.5% zero-shot transfer accuracy across unseen corporate domains, demonstrating an effective, mathematically grounded framework for sustainable distributed agile engineering.
                </p>
                <div className="pt-2 text-[11px] text-slate-400 font-mono">
                  <strong>Index Terms:</strong> Explainable Artificial Intelligence (XAI), SHAP TreeExplainer, Kuhn-Munkres Algorithm, Distributed Agile Task Allocation, CatBoost, Multi-Objective Optimization.
                </div>
              </div>

              {/* Section I: Introduction */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1">
                  I. Introduction & Problem Statement
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                  Agile project management tools (e.g. Jira, Taiga, Azure DevOps) provide comprehensive tracking for story workflows but rely almost entirely on subjective Scrum Master judgement or developer self-selection. In distributed remote teams, this paradigm generates severe operational frictions: developers in early time zones cherry-pick accessible tasks, while high-velocity senior engineers absorb disproportionate backlog items. This leads to burnout and single points of failure.
                </p>
              </div>

              {/* Section II: Mathematical Formulation */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1">
                  II. Mathematical Formulation
                </h2>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs text-slate-300">
                  <div className="text-indigo-400 font-bold mb-1">Cost Objective Function (Bipartite Kuhn-Munkres):</div>
                  <div>Cost(i, j) = 0.60 · NormWorkload(j) + 0.40 · (1 - NormVelocity(j))</div>
                  <div className="text-[11px] text-slate-500">
                    where NormWorkload(j) = (W_j - W_min) / (W_max - W_min + 1e-9)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    where NormVelocity(j) = (V_j - V_min) / (V_max - V_min + 1e-9)
                  </div>
                  <div className="text-indigo-400 font-bold mt-2">Feasible Candidate Constraints:</div>
                  <div>j ∈ Candidates(Role(task_i)) ∧ is_available(j) == True</div>
                </div>
              </div>

              {/* Section III: Model Tournament */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1">
                  III. Empirical Model Benchmark
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-800">
                    <thead className="bg-slate-800/80 text-slate-300">
                      <tr>
                        <th className="p-2 border border-slate-700">Model Architecture</th>
                        <th className="p-2 border border-slate-700 text-right">Accuracy</th>
                        <th className="p-2 border border-slate-700 text-right">Macro-F1</th>
                        <th className="p-2 border border-slate-700 text-right">Inference Latency</th>
                        <th className="p-2 border border-slate-700">Interpretability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                      <tr>
                        <td className="p-2 border border-slate-800 font-sans font-semibold text-violet-300">CatBoost Classifier</td>
                        <td className="p-2 border border-slate-800 text-right text-emerald-400 font-bold">92.5%</td>
                        <td className="p-2 border border-slate-800 text-right text-emerald-400 font-bold">0.923</td>
                        <td className="p-2 border border-slate-800 text-right">4.8 ms</td>
                        <td className="p-2 border border-slate-800 font-sans text-cyan-400">TreeExplainer Exact</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-800 font-sans font-semibold text-blue-300">XGBoost Classifier</td>
                        <td className="p-2 border border-slate-800 text-right text-emerald-400 font-bold">92.0%</td>
                        <td className="p-2 border border-slate-800 text-right text-emerald-400 font-bold">0.918</td>
                        <td className="p-2 border border-slate-800 text-right">3.9 ms</td>
                        <td className="p-2 border border-slate-800 font-sans text-cyan-400">TreeExplainer Exact</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-800 font-sans">Random Forest</td>
                        <td className="p-2 border border-slate-800 text-right">86.2%</td>
                        <td className="p-2 border border-slate-800 text-right">0.857</td>
                        <td className="p-2 border border-slate-800 text-right">12.1 ms</td>
                        <td className="p-2 border border-slate-800 font-sans text-slate-400">TreeExplainer Approx</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-800 font-sans">AdaBoost</td>
                        <td className="p-2 border border-slate-800 text-right">81.4%</td>
                        <td className="p-2 border border-slate-800 text-right">0.809</td>
                        <td className="p-2 border border-slate-800 text-right">8.3 ms</td>
                        <td className="p-2 border border-slate-800 font-sans text-slate-400">Permutation</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-800 font-sans">Decision Tree</td>
                        <td className="p-2 border border-slate-800 text-right">78.4%</td>
                        <td className="p-2 border border-slate-800 text-right">0.776</td>
                        <td className="p-2 border border-slate-800 text-right">1.2 ms</td>
                        <td className="p-2 border border-slate-800 font-sans text-slate-400">Direct Splits</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-800 font-sans">KNN Classifier</td>
                        <td className="p-2 border border-slate-800 text-right">74.2%</td>
                        <td className="p-2 border border-slate-800 text-right">0.738</td>
                        <td className="p-2 border border-slate-800 text-right">18.5 ms</td>
                        <td className="p-2 border border-slate-800 font-sans text-slate-400">Kernel SHAP</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section IV: Active Roster Snapshot */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1">
                  IV. Team Workload & Availability State
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {developers.map(d => (
                    <div key={d.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <div className="font-bold text-white">{d.name}</div>
                      <div className="text-[11px] text-slate-400">{d.role}</div>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span>Workload: <strong style={{ color: workloadColor(d.workload) }}>{d.workload}%</strong></span>
                        <span className={d.is_available !== false ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                          {d.is_available !== false ? 'Active' : 'On Leave'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section V: Conclusion */}
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  VI. Conclusion & Viva Defense Summary
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                  The prototype successfully validates that Explainable Machine Learning coupled with Kuhn-Munkres combinatorial optimization delivers significant operational improvements over traditional unassisted Agile task assignment. The system prevents burnout by capping workload deviations, offers complete feature interpretability for agile ceremonies, and exhibits robust domain generalization across distinct corporate software repositories.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
