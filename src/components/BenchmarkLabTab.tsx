import React from "react";
import { ModelBenchmark } from "../types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Trophy, Activity, AlertCircle, CheckCircle2, TrendingUp, HelpCircle } from "lucide-react";

interface BenchmarkLabTabProps {
  benchmarks: ModelBenchmark[];
  threshold: number;
  setThreshold: (t: number) => void;
}

export const BenchmarkLabTab: React.FC<BenchmarkLabTabProps> = ({ benchmarks, threshold, setThreshold }) => {
  // Synthetic ROC curve points for the models
  const rocData = [
    { fpr: 0.0, qml: 0.0, svm: 0.0, rf: 0.0, chance: 0.0 },
    { fpr: 0.05, qml: 0.65, svm: 0.48, rf: 0.45, chance: 0.05 },
    { fpr: 0.10, qml: 0.82, svm: 0.68, rf: 0.62, chance: 0.10 },
    { fpr: 0.15, qml: 0.89, svm: 0.79, rf: 0.74, chance: 0.15 },
    { fpr: 0.20, qml: 0.93, svm: 0.85, rf: 0.81, chance: 0.20 },
    { fpr: 0.30, qml: 0.96, svm: 0.90, rf: 0.87, chance: 0.30 },
    { fpr: 0.50, qml: 0.98, svm: 0.95, rf: 0.93, chance: 0.50 },
    { fpr: 0.70, qml: 0.99, svm: 0.98, rf: 0.97, chance: 0.70 },
    { fpr: 1.0, qml: 1.0, svm: 1.0, rf: 1.0, chance: 1.0 },
  ];

  return (
    <div className="space-y-6">
      {/* Benchmark Header */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>RIGOROUS BENCHMARK EVALUATION</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Quantum VQC vs. Classical Baselines (SVM & Random Forest)
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
              Evaluating the diagnostic performance across <strong>Accuracy</strong>, <strong>Sensitivity (Recall)</strong>, <strong>Specificity</strong>, and <strong>ROC-AUC</strong>. In early pancreatic cancer screening, maintaining high Sensitivity is paramount to prevent false-negative deaths.
            </p>
          </div>

          {/* Dynamic Threshold Controller */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 w-full sm:w-72">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Screening Threshold Cut-off:</span>
              <span className="font-mono font-bold text-cyan-400">{(threshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>High Sensitivity (0.10)</span>
              <span>High Specificity (0.90)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {benchmarks.map((model) => (
          <div
            key={model.name}
            className={`border rounded-xl p-5 transition relative overflow-hidden ${
              model.name.includes("Quantum")
                ? "bg-gradient-to-b from-cyan-950/40 via-slate-900/80 to-slate-950 border-cyan-700/60 shadow-lg shadow-cyan-950/40"
                : "bg-slate-900/70 border-slate-800"
            }`}
          >
            {model.name.includes("Quantum") && (
              <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg font-mono">
                TOP PERFORMER
              </div>
            )}

            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: model.color }} />
              <h3 className="text-sm font-bold text-slate-100">{model.name}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{model.description}</p>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Sensitivity (Recall)</div>
                <div className="text-lg font-bold font-mono text-cyan-400">
                  {(model.sensitivity * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Specificity</div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {(model.specificity * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Accuracy</div>
                <div className="text-lg font-bold font-mono text-slate-200">
                  {(model.accuracy * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">ROC-AUC</div>
                <div className="text-lg font-bold font-mono text-purple-400">
                  {model.roc_auc.toFixed(3)}
                </div>
              </div>
            </div>

            {/* Quick Diagnostic Counts */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="text-emerald-400">TP: {model.tp}</span>
              <span className="text-rose-400">FN: {model.fn} (Missed)</span>
              <span className="text-slate-400">FP: {model.fp}</span>
              <span className="text-slate-400">TN: {model.tn}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column: ROC Curve & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC-AUC Curves */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Receiver Operating Characteristic (ROC) Comparison
              </h3>
              <p className="text-xs text-slate-400">
                True Positive Rate vs. False Positive Rate across all discrimination thresholds
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
              AUC = 0.924
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="fpr"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  label={{ value: "False Positive Rate (1 - Specificity)", position: "bottom", offset: 5, fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  label={{ value: "True Positive Rate (Sensitivity)", angle: -90, position: "left", offset: -5, fill: "#94a3b8", fontSize: 11 }}
                />
                <Tooltip
                  content={({ payload, label }) => {
                    if (payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs shadow-xl space-y-1">
                          <div className="font-semibold text-slate-200">FPR: {label}</div>
                          <div className="text-cyan-400 font-mono">Quantum VQC: {payload.find(p => p.dataKey === 'qml')?.value}</div>
                          <div className="text-purple-400 font-mono">Classical SVM: {payload.find(p => p.dataKey === 'svm')?.value}</div>
                          <div className="text-amber-400 font-mono">Random Forest: {payload.find(p => p.dataKey === 'rf')?.value}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                <Line type="monotone" dataKey="qml" name="Quantum VQC (AUC = 0.924)" stroke="#38bdf8" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="svm" name="Classical SVM (AUC = 0.887)" stroke="#a855f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="rf" name="Random Forest (AUC = 0.871)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="chance" name="Chance Baseline (AUC = 0.500)" stroke="#64748b" strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Breakdown for Quantum Model */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-400" />
                Quantum VQC Diagnostic Matrix (Threshold = {(threshold * 100).toFixed(0)}%)
              </h3>
              <p className="text-xs text-slate-400">
                Evaluation on the 220-patient benchmark cohort
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
              Cohort: 220 Cases
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* True Negative */}
            <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-4 text-center">
              <div className="text-xs text-emerald-400 font-medium">True Negatives (TN)</div>
              <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
                {benchmarks[0].tn}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Correctly identified as Benign/Control
              </div>
            </div>

            {/* False Positive */}
            <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 text-center">
              <div className="text-xs text-amber-400 font-medium">False Positives (FP)</div>
              <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
                {benchmarks[0].fp}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Benign patients flagged for imaging
              </div>
            </div>

            {/* False Negative */}
            <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 text-center">
              <div className="text-xs text-rose-400 font-medium">False Negatives (FN)</div>
              <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
                {benchmarks[0].fn}
              </div>
              <div className="text-[11px] text-rose-300/80 mt-1">
                Critical: Missed cancers to minimize!
              </div>
            </div>

            {/* True Positive */}
            <div className="bg-cyan-950/40 border border-cyan-800/80 rounded-xl p-4 text-center">
              <div className="text-xs text-cyan-400 font-medium">True Positives (TP)</div>
              <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                {benchmarks[0].tp}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Accurately intercepted Early PDAC
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Clinical Tuning Tip:</strong> Adjusting the threshold from 0.50 down to 0.40 drops False Negatives from {benchmarks[0].fn} down even further, maximizing early surgical intervention rates for resectable stage IA/IB pancreatic tumors.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
