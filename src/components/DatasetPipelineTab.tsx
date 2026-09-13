import React, { useState } from "react";
import { PatientRecord } from "../types";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { Filter, Database, Sparkles, ChevronRight, Activity, Info } from "lucide-react";
import { PCA_EXPLAINED_VARIANCE, projectTo4Qubits } from "../utils/qmlSimulator";

interface DatasetPipelineTabProps {
  dataset: PatientRecord[];
}

export const DatasetPipelineTab: React.FC<DatasetPipelineTabProps> = ({ dataset }) => {
  const [filterDiag, setFilterDiag] = useState<string>("all");
  const [selectedBiomarker, setSelectedBiomarker] = useState<string>("lyve1");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredData = dataset.filter((p) => {
    if (filterDiag === "0" && p.diagnosis !== 0) return false;
    if (filterDiag === "1" && p.diagnosis !== 1) return false;
    if (searchTerm && !p.patient_id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Calculate PCA projections for scatter plotting
  const pcaScatterData = dataset.map((p) => {
    const qAngles = projectTo4Qubits(p);
    return {
      id: p.patient_id,
      pc1: parseFloat((qAngles[0] - Math.PI / 2).toFixed(2)),
      pc2: parseFloat((qAngles[1] - Math.PI / 2).toFixed(2)),
      diagnosis: p.diagnosis,
      diagnosisLabel: p.diagnosis === 1 ? "Early-Stage PDAC" : "Control / Benign",
      lyve1: p.lyve1,
      reg1b: p.reg1b,
      tff1: p.tff1,
      ca199: p.plasma_ca19_9,
    };
  });

  const controlsPca = pcaScatterData.filter((d) => d.diagnosis === 0);
  const pdacPca = pcaScatterData.filter((d) => d.diagnosis === 1);

  // Grouped comparison data for biomarker bar chart
  const ctrlAvg = {
    lyve1: 1.15,
    reg1b: 38.5,
    tff1: 82.0,
    ca199: 18.2,
    creatinine: 1.05,
  };

  const pdacAvg = {
    lyve1: 6.2,
    reg1b: 480.0,
    tff1: 720.0,
    ca199: 185.0,
    creatinine: 1.12,
  };

  const biomarkerComparisonData = [
    { marker: "LYVE1 (ng/mL)", Control: ctrlAvg.lyve1, PDAC: pdacAvg.lyve1, foldChange: "5.4x" },
    { marker: "REG1B (ng/mL / 10)", Control: ctrlAvg.reg1b / 10, PDAC: pdacAvg.reg1b / 10, foldChange: "12.5x" },
    { marker: "TFF1 (ng/mL / 10)", Control: ctrlAvg.tff1 / 10, PDAC: pdacAvg.tff1 / 10, foldChange: "8.8x" },
    { marker: "CA19-9 (U/mL / 5)", Control: ctrlAvg.ca199 / 5, PDAC: pdacAvg.ca199 / 5, foldChange: "10.2x" },
    { marker: "Creatinine (mg/dL)", Control: ctrlAvg.creatinine, PDAC: pdacAvg.creatinine, foldChange: "1.0x" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
              <Database className="h-4 w-4" />
              <span>CLINICAL DATA PREPROCESSING PIPELINE</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Debernardi et al. Urinary Biomarker Panel (PLoS Medicine)
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
              Standard clinical screening relies on plasma CA 19-9, which fails to detect asymptomatic early lesions and is completely negative in 10-15% of patients lacking the Lewis blood group enzyme. The 3-biomarker urinary panel (<strong>LYVE1</strong>, <strong>REG1B</strong>, <strong>TFF1</strong>) normalized with urinary <strong>Creatinine</strong> achieves high sensitivity for Stage I/II PDAC.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-center">
              <div className="text-slate-400">Total Cohort</div>
              <div className="text-base font-bold text-slate-100">{dataset.length} Patients</div>
            </div>
            <div className="bg-slate-950 border border-emerald-900/60 rounded-lg px-3 py-2 text-center">
              <div className="text-emerald-400">Controls / Benign</div>
              <div className="text-base font-bold text-emerald-400">
                {dataset.filter((d) => d.diagnosis === 0).length}
              </div>
            </div>
            <div className="bg-slate-950 border border-rose-900/60 rounded-lg px-3 py-2 text-center">
              <div className="text-rose-400">Early-Stage PDAC</div>
              <div className="text-base font-bold text-rose-400">
                {dataset.filter((d) => d.diagnosis === 1).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PCA Projection Scatter */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                PCA Projection to 4 Qubit Hilbert Space
              </h3>
              <p className="text-xs text-slate-400">
                7 Clinical Features compressed to 4 Principal Components ({((PCA_EXPLAINED_VARIANCE[0] + PCA_EXPLAINED_VARIANCE[1] + PCA_EXPLAINED_VARIANCE[2] + PCA_EXPLAINED_VARIANCE[3]) * 100).toFixed(1)}% total variance explained)
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              PC1 vs PC2
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="pc1"
                  name="PC1"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Principal Component 1 (Urinary Biomarker Intensity)", position: "bottom", offset: 5, fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="pc2"
                  name="PC2"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  label={{ value: "PC2 (Age + CA19-9 Axis)", angle: -90, position: "left", offset: -5, fill: "#94a3b8", fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
                          <div className="font-bold text-slate-200">{data.id}</div>
                          <div className={`mt-1 font-semibold ${data.diagnosis === 1 ? "text-rose-400" : "text-emerald-400"}`}>
                            {data.diagnosisLabel}
                          </div>
                          <div className="mt-2 space-y-0.5 text-slate-300 font-mono text-[11px]">
                            <div>LYVE1: {data.lyve1} ng/mL</div>
                            <div>REG1B: {data.reg1b} ng/mL</div>
                            <div>TFF1: {data.tff1} ng/mL</div>
                            <div>CA19-9: {data.ca199} U/mL</div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Controls / Benign" data={controlsPca} fill="#10b981" opacity={0.8} />
                <Scatter name="Early PDAC" data={pdacPca} fill="#f43f5e" opacity={0.85} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Benign / Control</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Early PDAC</span>
              </span>
            </div>
            <span className="font-mono text-cyan-400">4-Component Quantum Input</span>
          </div>
        </div>

        {/* Relative Fold-Change Comparison */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-400" />
                Mean Biomarker Elevation in Early Pancreatic Cancer
              </h3>
              <p className="text-xs text-slate-400">
                Comparing benign conditions (chronic pancreatitis, gallstones) vs early malignancy
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              Fold-Elevation
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={biomarkerComparisonData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="marker" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ payload, label }) => {
                    if (payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs shadow-xl">
                          <div className="font-semibold text-slate-200">{label}</div>
                          <div className="mt-1 text-emerald-400">Control: {payload[0]?.value}</div>
                          <div className="text-rose-400">PDAC: {payload[1]?.value}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                <Bar dataKey="Control" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="PDAC" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-slate-400 pt-3 border-t border-slate-800 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>Notice: Urinary REG1B and TFF1 show over 8x to 12x elevation, providing high dynamic range for quantum angle encoding.</span>
          </div>
        </div>
      </div>

      {/* Cohort Explorer Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Patient Cohort Records</h3>
            <p className="text-xs text-slate-400">Individual laboratory panels used in training and testing</p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search Patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-36 sm:w-44"
            />
            <select
              value={filterDiag}
              onChange={(e) => setFilterDiag(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Diagnoses</option>
              <option value="0">Control / Benign</option>
              <option value="1">Early PDAC</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Age / Sex</th>
                <th className="px-4 py-3">Creatinine (mg/dL)</th>
                <th className="px-4 py-3">LYVE1 (ng/mL)</th>
                <th className="px-4 py-3">REG1B (ng/mL)</th>
                <th className="px-4 py-3">TFF1 (ng/mL)</th>
                <th className="px-4 py-3">CA 19-9 (U/mL)</th>
                <th className="px-4 py-3">Pathology Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredData.slice(0, 10).map((p) => (
                <tr key={p.patient_id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-2.5 text-cyan-300 font-semibold">{p.patient_id}</td>
                  <td className="px-4 py-2.5 text-slate-300">{p.age}y / {p.sex === 1 ? "M" : "F"}</td>
                  <td className="px-4 py-2.5 text-slate-300">{p.creatinine.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-slate-300">{p.lyve1.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-slate-300">{p.reg1b.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-slate-300">{p.tff1.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-slate-300">
                    <span className={p.plasma_ca19_9 > 37 ? "text-amber-400 font-bold" : "text-slate-400"}>
                      {p.plasma_ca19_9.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {p.diagnosis === 1 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
                        Early PDAC
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        Control / Benign
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
          <span>Showing first 10 of {filteredData.length} records</span>
          <span className="font-mono text-cyan-400">Standardized to [0, π] for PennyLane AngleEmbedding</span>
        </div>
      </div>
    </div>
  );
};
