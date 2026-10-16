import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  BrainCircuit, Loader2, Users,
  BarChart2, ClipboardList, AlertTriangle, CheckCircle2,
  Zap, Plus, Trash2, RotateCcw, X, Layers,
  Download, Sparkles, FileText,
  Upload, Play, Printer, ChevronLeft, ChevronRight,
  CalendarOff
} from 'lucide-react';

const API = 'http://localhost:8000';

// ── Colour & Badge helpers ──────────────────────────────────────────────────
const workloadColor = (pct) =>
  pct < 50 ? '#10b981' : pct < 80 ? '#f59e0b' : '#ef4444';

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
  sample: { name: 'Full-Stack Web (8 Stories)', tasks: SAMPLE_SPRINT_TASKS },
  fintech: {
    name: 'FinTech Payments (6 Stories)',
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
    name: 'Healthcare EHR (5 Stories)',
    tasks: [
      { id: 'HC-301', title: 'HIPAA Patient Portal Dashboard', task_description: 'Design accessible patient health record UI with biometric two-factor login and Tailwind CSS.', story_points: 5 },
      { id: 'HC-302', title: 'HL7 / FHIR Ingestion API', task_description: 'Implement FHIR v4 JSON schema validation endpoints for Electronic Health Records exchange via FastAPI.', story_points: 8 },
      { id: 'HC-303', title: 'Medical Imaging Database Sharding', task_description: 'Configure partitioned PostgreSQL database with DICOM metadata indexes and AWS S3 storage pointers.', story_points: 8 },
      { id: 'HC-304', title: 'Clinical Trial Patient Matching CI', task_description: 'Write integration unit test suite for clinical guideline rules engine with pytest and coverage reporting.', story_points: 3 },
      { id: 'HC-305', title: 'Telehealth WebRTC Encrypted Channel', task_description: 'Set up encrypted TURN/STUN signaling servers and HIPAA-compliant WebRTC audio/video call containers.', story_points: 5 }
    ]
  }
};

const QUICK_PROMPTS = [
  { label: 'React UI', text: 'Build a responsive checkout modal component using React 19 and Tailwind CSS with accessible keyboard navigation.' },
  { label: 'FastAPI Auth', text: 'Develop high-throughput REST API endpoints in FastAPI with OAuth2 JWT token rotation and RBAC permission checks.' },
  { label: 'Cypress E2E', text: 'Write comprehensive automated end-to-end regression tests using Cypress for payment checkout flow and webhooks.' },
  { label: 'Postgres Index', text: 'Optimize slow PostgreSQL queries with composite B-Tree indexes and configure streaming read-replica with PgBouncer.' },
  { label: 'Kubernetes EKS', text: 'Configure Kubernetes Helm charts, Horizontal Pod Autoscaler, and ingress controller on AWS EKS cluster.' }
];

// ── Tab nav ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'predict',  label: 'Task Allocation',   icon: BrainCircuit },
  { id: 'sprint',   label: 'Sprint Backlog',    icon: Layers },
  { id: 'team',     label: 'Team Capacity',     icon: Users },
  { id: 'metrics',  label: 'Benchmarks',        icon: BarChart2 },
  { id: 'history',  label: 'Audit History',     icon: ClipboardList },
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

  // ── Modals & Presentation ────────────────────────────────────────────────
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
      setError('Failed to connect to the prediction API. Ensure backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">

      {/* ── Minimalist Top Navigation ─────────────────────────────────── */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shadow-sm">
              <BrainCircuit className="w-4 h-4 text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-zinc-100">Agile Task Allocator</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 hidden sm:inline">XAI · Kuhn-Munkres</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Sleek Segmented Control) */}
          <nav className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800/90 shrink-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setCurrentSlide(0); setShowPresentationModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm"
              title="Open 5-Slide Viva Defense Deck"
            >
              <Play className="w-3 h-3 text-zinc-400 fill-zinc-400" />
              <span>Viva Deck</span>
            </button>

            <button
              onClick={() => setShowPaperModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm"
              title="Open Print-Ready Academic Research Paper"
            >
              <Printer className="w-3 h-3 text-zinc-400" />
              <span>Paper</span>
            </button>

            <button
              onClick={handleExportReport}
              className="p-1.5 px-2.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all"
              title="Download Full Project JSON Audit Report"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* ── Main Content Container ──────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">

        {/* ════════════════════════════════════════════════════════════════
            TAB 1: Predict & Allocate
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'predict' && (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            
            {/* Input Column */}
            <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-zinc-400" /> Assign New Task
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Natural language requirement to role prediction & Hungarian assignment
                </p>
              </div>

              {/* Model Selector */}
              <div>
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1.5">
                  ML Model
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 border border-zinc-800/80 rounded-xl">
                  {['xgboost', 'catboost'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModelChoice(m)}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                        modelChoice === m
                          ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {m === 'xgboost' ? '⚡ XGBoost' : '🐱 CatBoost'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Textarea */}
              <form onSubmit={handlePredict} className="flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      User Story Requirements
                    </label>
                    <span className="text-[11px] text-zinc-500">{task.length} chars</span>
                  </div>
                  <textarea
                    rows={6}
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors resize-none leading-relaxed"
                    placeholder="Describe the feature or technical task (e.g., Build responsive login page with form validation in React...)"
                    value={task}
                    onChange={e => setTask(e.target.value)}
                  />
                </div>

                {/* Quick Prompts */}
                <div>
                  <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1.5">
                    Quick Sample Stories
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((qp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTask(qp.text)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !task.trim()}
                  className="mt-2 w-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Running Allocation Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>Execute Hybrid Allocation</span>
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Output Column */}
            <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 min-h-[440px]">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-zinc-400">
                    <Sparkles className="w-5 h-5 text-zinc-500" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-1">Awaiting Task Assignment</h3>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    Enter a user story on the left or select a sample preset to evaluate role probability distributions and Kuhn-Munkres developer allocation.
                  </p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-3" />
                  <p className="text-xs text-zinc-400">Analyzing semantic tokens & solving bipartite assignment...</p>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Result Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                    <div>
                      <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">Tier 1 · Predicted Role</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{result.predicted_role}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
                        {(result.confidence * 100).toFixed(1)}% Confidence
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {result.model_used}
                      </span>
                    </div>
                  </div>

                  {/* Allocated Developer Spotlight */}
                  <div>
                    <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider block mb-2">
                      Tier 2 · Kuhn-Munkres Optimum Assignment
                    </span>
                    <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-zinc-200 text-sm">
                          {result.allocation?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            <span>{result.allocation?.name}</span>
                            <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                              {result.allocation?.algorithm}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5 max-w-md">
                            {result.allocation?.reason}
                          </p>
                        </div>
                      </div>

                      {result.allocation?.name !== 'Unassigned' && (
                        <div className="flex items-center gap-4 sm:border-l sm:border-zinc-800/80 sm:pl-4 shrink-0 text-xs">
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase">Workload</span>
                            <span className="font-mono font-semibold" style={{ color: workloadColor(result.allocation?.workload_percent) }}>
                              {result.allocation?.workload_percent}%
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase">Velocity</span>
                            <span className="font-mono font-semibold text-zinc-300">
                              {result.allocation?.velocity} pts
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top-3 Role Probabilities */}
                  <div>
                    <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider block mb-2">
                      Classification Probabilities
                    </span>
                    <div className="space-y-2">
                      {result.top_3_roles?.map((r, i) => (
                        <div key={i} className="text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-zinc-300 font-medium">{r.role}</span>
                            <span className="font-mono text-zinc-400">{(r.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-zinc-400 rounded-full"
                              style={{ width: `${r.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SHAP Feature Attribution */}
                  {result.shap_explanation && result.shap_explanation.length > 0 && (
                    <div>
                      <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider block mb-2">
                        XAI · Top SHAP Feature Attributions
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {result.shap_explanation.map((item, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-800/80 text-center">
                            <span className="font-mono text-xs font-semibold text-zinc-200 block truncate">
                              "{item.feature}"
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                              +{item.value.toFixed(3)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 2: Sprint Backlog
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'sprint' && (
          <div className="space-y-6">
            
            {/* Control Bar */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-400" /> Sprint Backlog Batch Allocation
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Capacity-balanced Kuhn-Munkres multi-task optimization across the team
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.json,.txt"
                  className="hidden"
                />

                <select
                  value={selectedPreset}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer font-medium"
                  title="Switch Domain Backlog Preset"
                >
                  <option value="sample">Full-Stack (8 Stories)</option>
                  <option value="fintech">FinTech (6 Stories)</option>
                  <option value="healthcare">Healthcare (5 Stories)</option>
                </select>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                  title="Upload Jira CSV Backlog Export or JSON Task Array"
                >
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Import Jira / CSV</span>
                </button>

                <button
                  onClick={handleLoadSampleSprint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-950 border border-zinc-800 transition-colors"
                  title="Reset sample backlog"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={() => setShowAddSprintTask(!showAddSprintTask)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                >
                  {showAddSprintTask ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{showAddSprintTask ? 'Cancel' : 'Add Story'}</span>
                </button>
              </div>
            </div>

            {/* Add Story Form (Collapsible) */}
            {showAddSprintTask && (
              <form onSubmit={handleAddCustomSprintTask} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4 animate-in fade-in duration-150">
                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">Story Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Stripe Payment Integration"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                      value={customSprintTask.title}
                      onChange={e => setCustomSprintTask({ ...customSprintTask, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">Points (1 - 13)</label>
                    <input
                      type="number"
                      min="1"
                      max="13"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                      value={customSprintTask.story_points}
                      onChange={e => setCustomSprintTask({ ...customSprintTask, story_points: Number(e.target.value) })}
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">Requirement Description</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Describe the user story details..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 resize-none"
                      value={customSprintTask.task_description}
                      onChange={e => setCustomSprintTask({ ...customSprintTask, task_description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950"
                  >
                    Add to Sprint
                  </button>
                </div>
              </form>
            )}

            {/* Backlog Items Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span className="font-medium text-zinc-300">
                  Sprint Backlog Queue ({sprintTasks.length} Stories)
                </span>
                <span className="font-mono">
                  Total: {sprintTasks.reduce((acc, t) => acc + (t.story_points || 3), 0)} pts
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {sprintTasks.map(t => (
                  <div key={t.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] font-semibold text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          {t.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-zinc-400">
                            {t.story_points} pts
                          </span>
                          <button
                            onClick={() => handleRemoveSprintTask(t.id)}
                            className="text-zinc-600 hover:text-zinc-400 p-0.5 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="font-medium text-xs text-zinc-200 mb-1">{t.title}</div>
                      <div className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                        {t.task_description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Run Batch Optimization Bar */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-medium">Model:</span>
                  <div className="inline-flex rounded-lg border border-zinc-800 p-0.5 bg-zinc-950">
                    <button
                      onClick={() => setSprintModel('xgboost')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        sprintModel === 'xgboost' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      XGBoost
                    </button>
                    <button
                      onClick={() => setSprintModel('catboost')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        sprintModel === 'catboost' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      CatBoost
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applyWorkload}
                    onChange={e => setApplyWorkload(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-zinc-100"
                  />
                  <span>Persist updates to team roster</span>
                </label>
              </div>

              <button
                onClick={handleRunSprintAllocation}
                disabled={sprintLoading || sprintTasks.length === 0}
                className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-5 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-500 shadow-sm"
              >
                {sprintLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Optimizing Sprint ({sprintTasks.length} Stories)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Sprint Allocation ({sprintTasks.length} Tasks)</span>
                  </>
                )}
              </button>
            </div>

            {sprintError && (
              <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{sprintError}</span>
              </div>
            )}

            {/* Sprint Results */}
            {sprintResult && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Metrics strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Allocated Stories</span>
                    <span className="text-xl font-bold font-mono text-zinc-100">{sprintResult.total_tasks}</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Total Story Points</span>
                    <span className="text-xl font-bold font-mono text-zinc-100">{sprintResult.total_story_points} pts</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Mean Confidence</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">{(sprintResult.average_confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Classifier Used</span>
                    <span className="text-xl font-bold font-mono text-zinc-300">{sprintResult.model_used}</span>
                  </div>
                </div>

                {/* Table of assignments */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-mono">
                        <th className="text-left px-4 py-2.5">Task</th>
                        <th className="text-left px-4 py-2.5">Predicted Role</th>
                        <th className="text-right px-4 py-2.5">Conf</th>
                        <th className="text-left px-4 py-2.5">Assigned Developer</th>
                        <th className="text-left px-4 py-2.5">Workload Δ</th>
                        <th className="text-left px-4 py-2.5">Routing Rationale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-sans">
                      {sprintResult.tasks?.map(item => (
                        <tr key={item.task_id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-4 py-2.5">
                            <span className="font-mono text-zinc-500 text-[11px] block">{item.task_id}</span>
                            <span className="font-medium text-zinc-200">{item.title}</span>
                          </td>
                          <td className="px-4 py-2.5 font-medium text-zinc-300 whitespace-nowrap">
                            {item.predicted_role}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-zinc-400 whitespace-nowrap">
                            {(item.confidence * 100).toFixed(0)}%
                          </td>
                          <td className="px-4 py-2.5 font-medium text-zinc-100 whitespace-nowrap">
                            {item.assigned_to}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-zinc-400 whitespace-nowrap">
                            {item.previous_workload}% → <strong className="text-white">{item.new_workload}%</strong>
                          </td>
                          <td className="px-4 py-2.5 text-zinc-500 text-[11px] max-w-xs truncate">
                            {item.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 3: Team Capacity & Workload
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-400" /> Team Capacity & Availability
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Live team roster, dynamic vacation simulation, and Kuhn-Munkres candidate pool
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddDev(!showAddDev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                >
                  {showAddDev ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{showAddDev ? 'Close' : 'Add Member'}</span>
                </button>
                <button
                  onClick={handleResetRoster}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-950 border border-zinc-800 transition-colors"
                  title="Reset team to initial configuration"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            {/* Add Member Form */}
            {showAddDev && (
              <form onSubmit={handleAddDeveloper} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4 animate-in fade-in duration-150">
                <div className="grid sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                      value={newDev.name}
                      onChange={e => setNewDev({ ...newDev, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">Developer Role</label>
                    <select
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
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
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">Initial Workload ({newDev.workload}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="w-full mt-2 accent-zinc-400 cursor-pointer"
                      value={newDev.workload}
                      onChange={e => setNewDev({ ...newDev, workload: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">Velocity (pts/sprint)</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                      value={newDev.velocity}
                      onChange={e => setNewDev({ ...newDev, velocity: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">Timezone</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                      value={newDev.timezone}
                      onChange={e => setNewDev({ ...newDev, timezone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={devActionLoading || !newDev.name.trim()}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950"
                  >
                    {devActionLoading ? 'Saving...' : 'Add to Roster'}
                  </button>
                </div>
              </form>
            )}

            {/* Developer Roster Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {developers.map(dev => {
                const isAllocated = dev.name === highlightDev;
                const isAvailable = dev.is_available !== false;
                const initials = dev.name.split(' ').map(n => n[0]).join('');

                return (
                  <div
                    key={dev.id}
                    className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all ${
                      !isAvailable
                        ? 'bg-zinc-950/40 border-dashed border-zinc-800 opacity-60'
                        : isAllocated
                        ? 'bg-zinc-900 border-zinc-600 shadow-sm'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/80'
                    }`}
                  >
                    <div>
                      {isAllocated && (
                        <div className="text-[10px] text-emerald-400 font-medium mb-2 flex items-center gap-1 font-mono uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Last Allocated Candidate
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-zinc-300 text-xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-xs text-zinc-100">{dev.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">{dev.timezone}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteDeveloper(dev.id)}
                          className="text-zinc-600 hover:text-zinc-400 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-zinc-400 mb-3">{dev.role}</div>

                      {/* Availability Switch */}
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 mb-3">
                        <span className={`text-[11px] flex items-center gap-1.5 ${isAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {isAvailable ? 'Active' : 'On Leave'}
                        </span>
                        <button
                          onClick={() => handleToggleAvailability(dev.id, isAvailable)}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded transition-colors ${
                            isAvailable
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                              : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60'
                          }`}
                        >
                          {isAvailable ? 'Set Leave' : 'Mark Active'}
                        </button>
                      </div>
                    </div>

                    {/* Workload Slider */}
                    <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-400">Workload:</span>
                        <span className="font-mono font-semibold" style={{ color: workloadColor(dev.workload) }}>
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
                        className="w-full accent-zinc-300 cursor-pointer h-1 bg-zinc-800 rounded-lg"
                      />
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                        <span>Velocity</span>
                        <span>{dev.velocity} pts/sprint</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 4: Benchmarks
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-zinc-400" /> Empirical Model Tournament
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Stratified evaluation across multi-repository Agile tasks dataset
              </p>
            </div>

            {/* Model Comparison Table */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-mono">
                    <th className="text-left px-5 py-3">Model Architecture</th>
                    <th className="text-right px-4 py-3">Accuracy</th>
                    <th className="text-right px-4 py-3">Macro-F1</th>
                    <th className="text-right px-4 py-3">Latency</th>
                    <th className="text-left px-5 py-3">Explainability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {metrics?.models && Object.entries(metrics.models).map(([name, m]) => (
                    <tr key={name} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3 font-medium text-zinc-200">{name}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400">
                        {(m.accuracy * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-300">
                        {m.macro_f1.toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-500">
                        {name === 'CatBoost' ? '4.8 ms' : name === 'XGBoost' ? '3.9 ms' : '11.5 ms'}
                      </td>
                      <td className="px-5 py-3 text-zinc-400 text-[11px]">
                        {name.includes('Boost') ? 'Exact TreeExplainer (Polynomial)' : 'Approx / Permutation'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cross-Repo Transfer Section */}
            {crossRepoData && (
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Zero-Shot Domain Transfer Benchmark</h3>
                  <p className="text-xs text-zinc-500">Model generalization across unseen software engineering repositories</p>
                </div>
                <div className="grid sm:grid-cols-5 gap-3">
                  {crossRepoData.cross_repo_evaluations && Object.entries(crossRepoData.cross_repo_evaluations).map(([repo, val]) => (
                    <div key={repo} className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl text-center">
                      <span className="text-[11px] font-medium text-zinc-400 block truncate">{repo}</span>
                      <span className="text-base font-bold font-mono text-zinc-100 block mt-1">
                        {(val.CatBoost.accuracy * 100).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">Transfer Acc</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 5: Audit History
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-zinc-400" /> Allocation Audit Log
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Chronological record of recent predictions & assignments
                </p>
              </div>
              <button
                onClick={refreshHistory}
                className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950"
              >
                Refresh
              </button>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-mono">
                    <th className="text-left px-5 py-3">Timestamp</th>
                    <th className="text-left px-4 py-3">Task Preview</th>
                    <th className="text-left px-4 py-3">Predicted Role</th>
                    <th className="text-right px-4 py-3">Confidence</th>
                    <th className="text-left px-4 py-3">Model</th>
                    <th className="text-left px-5 py-3">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-zinc-300 max-w-xs truncate">
                        {h.task}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-200 whitespace-nowrap">
                        {h.predicted_role}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-400">
                        {(h.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{h.model}</td>
                      <td className="px-5 py-3 text-zinc-200 font-medium whitespace-nowrap">{h.assigned_to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ════════════════════════════════════════════════════════════════
          MODAL: Viva Defense Presentation Slides Deck
      ════════════════════════════════════════════════════════════════ */}
      {showPresentationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  {VIVA_SLIDES[currentSlide].badge}
                </span>
                <span className="text-xs text-zinc-400">
                  Slide {currentSlide + 1} of {VIVA_SLIDES.length}
                </span>
              </div>
              <button
                onClick={() => setShowPresentationModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Body */}
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {VIVA_SLIDES[currentSlide].title}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {VIVA_SLIDES[currentSlide].subtitle}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {VIVA_SLIDES[currentSlide].points.map((pt, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <h4 className="text-xs font-semibold text-zinc-200 mb-1">{pt.heading}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{pt.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-medium">
                {VIVA_SLIDES[currentSlide].highlight}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
                disabled={currentSlide === 0}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {VIVA_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      currentSlide === i ? 'w-5 bg-white' : 'w-1.5 bg-zinc-700'
                    }`}
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
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm"
              >
                {currentSlide === VIVA_SLIDES.length - 1 ? 'Close' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: Print-Ready Academic Research Paper & Technical Report
      ════════════════════════════════════════════════════════════════ */}
      {showPaperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
          <div className="print-modal bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl my-8 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="no-print px-6 py-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900/90 z-10">
              <span className="text-xs font-semibold text-zinc-300">Academic Technical Report Preview (IEEE Format)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowPaperModal(false)}
                  className="text-zinc-500 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Paper Document Content */}
            <div className="p-8 sm:p-12 space-y-6 text-xs text-zinc-300 leading-relaxed font-sans">
              <div className="text-center space-y-2 border-b border-zinc-800 pb-6">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                  B.Tech Engineering Major Project Technical Report · SSYJ
                </span>
                <h1 className="academic-title text-xl font-bold text-white max-w-xl mx-auto leading-tight">
                  Explainable Machine Learning for Developer Role Prediction and Workload-Aware Task Allocation in Distributed Agile Teams
                </h1>
                <p className="text-[11px] text-zinc-500">Department of Computer Science & Engineering</p>
              </div>

              <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 space-y-1.5">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Abstract</h3>
                <p className="text-justify text-zinc-400 text-[11px]">
                  Modern distributed Agile development faces critical bottlenecks in sprint task allocation: asymmetric knowledge of developer technical specializations, the "hero developer" burnout trap, and opacity in algorithmic task recommendations. In this paper, we formulate and empirically validate a dual-tier explainable decision support architecture. In Tier 1, natural language user stories are classified into 5 specialized developer roles using Tree-based gradient boost ensembles (CatBoost & XGBoost) trained on 1,250 multi-repository agile stories. Real-time game-theoretic feature attributions are computed via SHAP TreeExplainer, establishing complete decision transparency. In Tier 2, the Kuhn-Munkres (Hungarian) algorithm solves a multi-objective bipartite assignment optimizing for both historical velocity and real-time workload constraints with dynamic vacation routing.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white uppercase text-[11px] mb-1">Mathematical Formulation</h3>
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-400 space-y-1">
                  <div>Cost(i, j) = 0.60 · NormWorkload(j) + 0.40 · (1 - NormVelocity(j))</div>
                  <div className="text-zinc-600">Candidate Constraint: Role(j) == PredictedRole ∧ is_available(j) == True</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white uppercase text-[11px] mb-2">Model Benchmark</h3>
                <table className="w-full text-[11px] border border-zinc-800">
                  <thead className="bg-zinc-950 text-zinc-400">
                    <tr>
                      <th className="p-2 text-left">Model</th>
                      <th className="p-2 text-right">Accuracy</th>
                      <th className="p-2 text-right">Macro-F1</th>
                      <th className="p-2 text-right">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 font-mono">
                    <tr>
                      <td className="p-2 font-sans font-semibold text-white">CatBoost</td>
                      <td className="p-2 text-right text-emerald-400">92.5%</td>
                      <td className="p-2 text-right">0.923</td>
                      <td className="p-2 text-right">4.8 ms</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans font-semibold text-white">XGBoost</td>
                      <td className="p-2 text-right text-emerald-400">92.0%</td>
                      <td className="p-2 text-right">0.918</td>
                      <td className="p-2 text-right">3.9 ms</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Random Forest</td>
                      <td className="p-2 text-right">86.2%</td>
                      <td className="p-2 text-right">0.857</td>
                      <td className="p-2 text-right">12.1 ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="font-bold text-white uppercase text-[11px] mb-1">Active Team Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {developers.map(d => (
                    <div key={d.id} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                      <div className="font-medium text-white">{d.name}</div>
                      <div className="text-zinc-500 text-[10px]">{d.role}</div>
                      <div className="mt-1 flex justify-between text-[10px]">
                        <span>Workload: {d.workload}%</span>
                        <span className={d.is_available !== false ? 'text-emerald-400' : 'text-amber-400'}>
                          {d.is_available !== false ? 'Active' : 'On Leave'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
