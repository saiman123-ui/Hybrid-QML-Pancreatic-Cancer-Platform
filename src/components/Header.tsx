import React from "react";
import { Activity, Atom, Sparkles, Terminal, ShieldCheck, Stethoscope } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  threshold: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, threshold }) => {
  const tabs = [
    { id: "inference", label: "Patient Inference & AI", icon: Stethoscope },
    { id: "benchmark", label: "Model Benchmarks", icon: Activity },
    { id: "quantum", label: "Quantum Circuit (4-Qubit)", icon: Atom },
    { id: "dataset", label: "Biomarker Dataset & PCA", icon: ShieldCheck },
    { id: "code", label: "Python Suite & Colab", icon: Terminal },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand & Mission */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
              <Atom className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                  QuantumPancreas <span className="text-cyan-400 font-mono text-xs px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800">4-QUBIT QML</span>
                </h1>
                <span className="inline-flex items-center text-xs text-amber-400 bg-amber-950/50 border border-amber-800/60 rounded px-1.5 py-0.5 font-medium">
                  Early Pancreatic Cancer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hybrid PennyLane VQC &bull; Debernardi Biomarkers (LYVE1, REG1B, TFF1) &bull; Gemini 3.8 Flash Explainability
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2">
              <span className="text-slate-400">Decision Threshold:</span>
              <span className="font-mono font-semibold text-cyan-400">{(threshold * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Simulator Ready</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 mt-3 pt-2 border-t border-slate-900 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm shadow-cyan-950"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
