import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend, Cell
} from 'recharts';
import {
  BrainCircuit, Loader2, UserCheck, Activity, Users,
  BarChart2, ClipboardList, ChevronDown, AlertTriangle,
  CheckCircle2, Info, Zap, Clock, Award, Plus, Trash2,
  RotateCcw, Sliders, X
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

// ── Tab nav ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'predict',  label: 'Predict & Allocate', icon: BrainCircuit },
  { id: 'metrics',  label: 'Model Comparison',   icon: BarChart2 },
  { id: 'team',     label: 'Team Roster',         icon: Users },
  { id: 'history',  label: 'Prediction History',  icon: ClipboardList },
];

export default function App() {
  const [activeTab, setActiveTab]   = useState('predict');
  const [task, setTask]             = useState('');
  const [modelChoice, setModelChoice] = useState('xgboost');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);

  const [metrics, setMetrics]       = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [history, setHistory]       = useState([]);

  const [highlightDev, setHighlightDev] = useState(null);

  const [showAddDev, setShowAddDev] = useState(false);
  const [newDev, setNewDev] = useState({
    name: '',
    role: 'Frontend Developer',
    workload: 30,
    velocity: 35,
    timezone: 'UTC+5:30'
  });
  const [devActionLoading, setDevActionLoading] = useState(false);

  // ── Fetch side-data on mount ─────────────────────────────────────────────
  useEffect(() => {
    axios.get(`${API}/metrics`).then(r => setMetrics(r.data)).catch(() => {});
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
      setNewDev({ name: '', role: 'Frontend Developer', workload: 30, velocity: 35, timezone: 'UTC+5:30' });
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
          <nav className="flex gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
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
            TAB: Model Comparison
        ════════════════════════════════════════════════════════════════ */}
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
                  return (
                    <div
                      key={dev.id}
                      className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                        isAllocated
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
                            <div className="font-semibold text-slate-100">{dev.name}</div>
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
                        <div className="text-xs text-slate-400 mb-3 truncate">{dev.role}</div>
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
    </div>
  );
}
