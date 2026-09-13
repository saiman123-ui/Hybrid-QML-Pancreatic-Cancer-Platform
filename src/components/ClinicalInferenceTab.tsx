import React, { useState } from "react";
import { PatientRecord } from "../types";
import { projectTo4Qubits, simulatePennyLaneCircuit, predictClassicalSVM, predictRandomForest } from "../utils/qmlSimulator";
import { Stethoscope, Sparkles, User, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, Send, FileText, ChevronRight, Activity } from "lucide-react";

interface ClinicalInferenceTabProps {
  threshold: number;
  setThreshold: (t: number) => void;
}

export const ClinicalInferenceTab: React.FC<ClinicalInferenceTabProps> = ({ threshold, setThreshold }) => {
  // Patient state
  const [patient, setPatient] = useState<Partial<PatientRecord>>({
    patient_id: "PAT-CLINICAL-LIVE",
    age: 66,
    sex: 1, // Male
    creatinine: 1.15,
    lyve1: 4.85,
    reg1b: 380.0,
    tff1: 520.0,
    plasma_ca19_9: 68.0,
  });

  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [geminiReport, setGeminiReport] = useState<string | null>(null);
  const [reportSource, setReportSource] = useState<string>("gemini-3.8-flash");
  const [reportNotice, setReportNotice] = useState<string | null>(null);

  // Calculate live quantum inference
  const qAngles = projectTo4Qubits(patient);
  const qSimulation = simulatePennyLaneCircuit(qAngles);
  const qProb = qSimulation.rawMalignancyProbability;
  const svmProb = predictClassicalSVM(patient);
  const rfProb = predictRandomForest(patient);

  // Risk Stratification
  let riskTier = "Low Risk (Screen Negative)";
  let badgeColor = "bg-emerald-950 text-emerald-300 border-emerald-800";
  let tierLevel: "low" | "moderate" | "high" = "low";

  if (qProb >= 0.65) {
    riskTier = "High Risk (Malignancy Suspected)";
    badgeColor = "bg-rose-950 text-rose-300 border-rose-800";
    tierLevel = "high";
  } else if (qProb >= threshold) {
    riskTier = "Moderate Risk (Indeterminate / Workup Indicated)";
    badgeColor = "bg-amber-950 text-amber-300 border-amber-800";
    tierLevel = "moderate";
  }

  // Archetypes
  const loadArchetype = (type: "healthy" | "benign" | "early_pdac" | "lewis_neg") => {
    if (type === "healthy") {
      setPatient({
        patient_id: "PAT-SAMPLE-HEALTHY",
        age: 52,
        sex: 0,
        creatinine: 0.95,
        lyve1: 0.65,
        reg1b: 32.0,
        tff1: 45.0,
        plasma_ca19_9: 12.5,
      });
    } else if (type === "benign") {
      setPatient({
        patient_id: "PAT-SAMPLE-PANCREATITIS",
        age: 58,
        sex: 1,
        creatinine: 1.05,
        lyve1: 1.35,
        reg1b: 95.0,
        tff1: 125.0,
        plasma_ca19_9: 31.0,
      });
    } else if (type === "early_pdac") {
      setPatient({
        patient_id: "PAT-SAMPLE-EARLY-PDAC",
        age: 69,
        sex: 1,
        creatinine: 1.10,
        lyve1: 6.80,
        reg1b: 440.0,
        tff1: 680.0,
        plasma_ca19_9: 88.0,
      });
    } else if (type === "lewis_neg") {
      // Key clinical demonstration: CA 19-9 is FALSE NEGATIVE (< 37 U/mL), but urinary markers catch the cancer!
      setPatient({
        patient_id: "PAT-SAMPLE-LEWIS-NEG",
        age: 64,
        sex: 0,
        creatinine: 0.98,
        lyve1: 5.40,
        reg1b: 390.0,
        tff1: 590.0,
        plasma_ca19_9: 14.0, // Normal blood test!
      });
    }
    setGeminiReport(null);
    setReportNotice(null);
  };

  // Call Gemini API server endpoint with fallback resilience
  const requestGeminiExplanation = async () => {
    setIsLoadingGemini(true);
    setReportNotice(null);
    try {
      const res = await fetch("/api/clinical-decision-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientData: patient,
          qmlProb: qProb,
          threshold: threshold,
          riskTier: riskTier,
        }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setGeminiReport(data.report);
        setReportSource(data.source || "gemini-3.8-flash");
        if (data.notice) {
          setReportNotice(data.notice);
        }
      } else {
        // Fallback to local clinical synthesis if backend error occurs
        setReportSource("clinical-synthesis");
        setReportNotice("Cloud model was temporarily unavailable; displayed validated clinical oncological synthesis.");
        setGeminiReport(`Clinical Oncology Decision Support
Diagnostic Risk Status: ${riskTier} (Quantum Probability: ${(qProb * 100).toFixed(1)}%)
Operating Sensitivity Cut-off: ${(threshold * 100).toFixed(1)}%

Biomarker Evaluation:
- LYVE1 (${patient.lyve1} ng/mL): ${Number(patient.lyve1) > 1.2 ? "Elevated; indicates active peritumoral lymphangiogenesis." : "Within normal limits."}
- REG1B (${patient.reg1b} ng/mL): ${Number(patient.reg1b) > 90 ? "Markedly upregulated; consistent with ductal metaplasia." : "Normal."}
- TFF1 (${patient.tff1} ng/mL): ${Number(patient.tff1) > 140 ? "Elevated; mucin-associated trefoil peptide marker." : "Normal."}
- CA 19-9 (${patient.plasma_ca19_9} U/mL): ${Number(patient.plasma_ca19_9) > 37 ? "Elevated serum titer." : "Normal titer. Urinary markers provide critical rescue for Lewis-negative non-secretors."}

Recommended Next Steps:
1. High-resolution multiphasic Pancreas-Protocol CT or MRI/MRCP.
2. Endoscopic Ultrasound (EUS) with fine-needle biopsy.
3. Multidisciplinary gastrointestinal oncology review.`);
      }
    } catch (err: any) {
      setReportSource("clinical-synthesis");
      setReportNotice("Network connection reset; displayed local clinical oncology synthesis.");
      setGeminiReport(`Clinical Oncology Decision Support
Diagnostic Risk Status: ${riskTier} (Quantum Probability: ${(qProb * 100).toFixed(1)}%)
Operating Sensitivity Cut-off: ${(threshold * 100).toFixed(1)}%

Biomarker Summary:
- LYVE1: ${patient.lyve1} ng/mL
- REG1B: ${patient.reg1b} ng/mL
- TFF1: ${patient.tff1} ng/mL
- CA 19-9: ${patient.plasma_ca19_9} U/mL

Urgent Oncology Pathway:
1. Pancreas-protocol contrast CT / MRI.
2. Endoscopic ultrasound (EUS) with biopsy.`);
    } finally {
      setIsLoadingGemini(false);
    }
  };

  // Helper to clean raw markdown hashes and asterisks for pristine left-aligned clinical display
  const cleanClinicalText = (text: string) => {
    if (!text) return "";
    return text
      // Replace header markdown lines (e.g. ### 1. Header or ### Header) with clean header text
      .replace(/^#{1,6}\s*/gm, "")
      // Remove all bold/italic asterisks
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
      // Remove any leftover solitary or trailing asterisks
      .replace(/\*/g, "")
      // Clean up markdown blockquotes
      .replace(/^>\s*/gm, "")
      .trim();
  };

  return (
    <div className="space-y-6">
      {/* Header & Clinical Sample Buttons */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
              <Stethoscope className="h-4 w-4" />
              <span>POINT-OF-CARE RISK STRATIFICATION</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Patient Biomarker Inference & AI Oncology Decision Support
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Input laboratory urinary biomarker assay concentrations to obtain instant Quantum VQC posterior malignancy probabilities and generate an evidence-based clinical reasoning report using Google Gemini 3.8 Flash.
            </p>
          </div>

          {/* Quick Archetype Loaders */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Load Archetype:</span>
            <button
              onClick={() => loadArchetype("healthy")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition"
            >
              Healthy Control
            </button>
            <button
              onClick={() => loadArchetype("benign")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 transition"
            >
              Chronic Pancreatitis
            </button>
            <button
              onClick={() => loadArchetype("early_pdac")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-800 transition"
            >
              Early PDAC
            </button>
            <button
              onClick={() => loadArchetype("lewis_neg")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 text-purple-300 border border-purple-700/60 transition flex items-center gap-1 shadow-sm"
              title="Blood CA 19-9 is falsely negative, but urine markers reveal cancer"
            >
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span>Lewis-Negative Rescue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs on Left, Quantum Predictions & AI Report on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Biomarker Laboratory Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <User className="h-4 w-4 text-cyan-400" />
              Patient Biomarker Input Panel
            </h3>
            <span className="text-[11px] font-mono text-slate-400">{patient.patient_id}</span>
          </div>

          {/* Demographic Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium flex justify-between">
                <span>Age:</span>
                <span className="font-mono text-cyan-400">{patient.age} yrs</span>
              </label>
              <input
                type="range"
                min="35"
                max="85"
                value={patient.age}
                onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) })}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium">Biological Sex:</label>
              <div className="flex space-x-2 mt-1">
                <button
                  onClick={() => setPatient({ ...patient, sex: 0 })}
                  className={`flex-1 py-1 text-xs rounded font-medium transition ${
                    patient.sex === 0
                      ? "bg-cyan-900/80 text-cyan-200 border border-cyan-700"
                      : "bg-slate-950 text-slate-400 border border-slate-800"
                  }`}
                >
                  Female (0)
                </button>
                <button
                  onClick={() => setPatient({ ...patient, sex: 1 })}
                  className={`flex-1 py-1 text-xs rounded font-medium transition ${
                    patient.sex === 1
                      ? "bg-cyan-900/80 text-cyan-200 border border-cyan-700"
                      : "bg-slate-950 text-slate-400 border border-slate-800"
                  }`}
                >
                  Male (1)
                </button>
              </div>
            </div>
          </div>

          {/* Urine Creatinine */}
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Urine Creatinine (Dilution factor):</span>
              <span className="font-mono text-cyan-400">{patient.creatinine?.toFixed(2)} mg/dL</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.8"
              step="0.05"
              value={patient.creatinine}
              onChange={(e) => setPatient({ ...patient, creatinine: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-1"
            />
            <span className="text-[10px] text-slate-400">Normal reference range: 0.5 - 2.0 mg/dL</span>
          </div>

          {/* Urinary LYVE1 */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-200 font-semibold">Urinary LYVE1 (Lymphatic remodeling):</span>
              <span className={`font-mono font-bold ${(patient.lyve1 || 0) > 1.5 ? "text-rose-400" : "text-emerald-400"}`}>
                {patient.lyve1?.toFixed(2)} ng/mL
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="15.0"
              step="0.1"
              value={patient.lyve1}
              onChange={(e) => setPatient({ ...patient, lyve1: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Normal &lt; 1.0</span>
              <span>Elevated in tumor lymphangiogenesis</span>
            </div>
          </div>

          {/* Urinary REG1B */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-200 font-semibold">Urinary REG1B (Regenerating Islet):</span>
              <span className={`font-mono font-bold ${(patient.reg1b || 0) > 90 ? "text-rose-400" : "text-emerald-400"}`}>
                {patient.reg1b?.toFixed(0)} ng/mL
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="1200"
              step="10"
              value={patient.reg1b}
              onChange={(e) => setPatient({ ...patient, reg1b: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Normal &lt; 75</span>
              <span>Ductal metaplasia marker</span>
            </div>
          </div>

          {/* Urinary TFF1 */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-200 font-semibold">Urinary TFF1 (Trefoil Factor 1):</span>
              <span className={`font-mono font-bold ${(patient.tff1 || 0) > 140 ? "text-rose-400" : "text-emerald-400"}`}>
                {patient.tff1?.toFixed(0)} ng/mL
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="1800"
              step="15"
              value={patient.tff1}
              onChange={(e) => setPatient({ ...patient, tff1: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Normal &lt; 120</span>
              <span>Mucin-associated peptide in PanIN</span>
            </div>
          </div>

          {/* Plasma CA 19-9 */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-200 font-semibold">Plasma CA 19-9 (Serum Standard):</span>
              <span className={`font-mono font-bold ${(patient.plasma_ca19_9 || 0) > 37 ? "text-amber-400" : "text-emerald-400"}`}>
                {patient.plasma_ca19_9?.toFixed(1)} U/mL
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="500"
              step="5"
              value={patient.plasma_ca19_9}
              onChange={(e) => setPatient({ ...patient, plasma_ca19_9: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Standard Cut-off: 37 U/mL</span>
              <span className="text-purple-400 font-medium">12% Lewis-Negative Rate</span>
            </div>
          </div>

          {/* Sensitivity Threshold Tuning Bar */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-cyan-400 font-semibold">Clinician Decision Threshold:</span>
              <span className="font-mono font-bold text-cyan-400">{(threshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-1"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Lower cut-off prioritizes high sensitivity (fewer missed early malignancies).
            </p>
          </div>
        </div>

        {/* Right Column: Quantum Decision Card & Gemini Report (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quantum Prediction Gauge & Diagnostic Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Quantum VQC Diagnostic Score
                </h3>
                <span className="text-xs text-slate-400">
                  4-Qubit PennyLane Simulator &bull; Hilbert Dimension = 16
                </span>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
                {riskTier}
              </span>
            </div>

            {/* Probability Progress Bar & Metrics */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-300">Malignancy Probability:</span>
                <span className="text-3xl font-black font-mono tracking-tight text-slate-100">
                  {(qProb * 100).toFixed(1)}%
                </span>
              </div>

              {/* Custom Bar with Threshold indicator */}
              <div className="relative h-4 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    qProb >= 0.65
                      ? "bg-gradient-to-r from-amber-500 to-rose-600"
                      : qProb >= threshold
                      ? "bg-gradient-to-r from-emerald-500 to-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, qProb * 100))}%` }}
                />
                {/* Threshold Marker Pin */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                  style={{ left: `${threshold * 100}%` }}
                  title={`Cut-off threshold: ${(threshold * 100).toFixed(0)}%`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                <span>0% (Benign)</span>
                <span className="text-cyan-400">Cut-off Threshold: {(threshold * 100).toFixed(0)}%</span>
                <span>100% (PDAC)</span>
              </div>
            </div>

            {/* Tri-Model Comparison mini-grid */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800 text-center font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-cyan-800/40">
                <div className="text-[10px] text-cyan-400 font-sans">Quantum VQC</div>
                <div className="text-base font-bold text-cyan-300 mt-0.5">{(qProb * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-slate-500">⟨Z₀⟩={qSimulation.expectationValZ0}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-purple-800/40">
                <div className="text-[10px] text-purple-400 font-sans">Classical SVM</div>
                <div className="text-base font-bold text-purple-300 mt-0.5">{(svmProb * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-slate-500">RBF Kernel</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-amber-800/40">
                <div className="text-[10px] text-amber-400 font-sans">Random Forest</div>
                <div className="text-base font-bold text-amber-300 mt-0.5">{(rfProb * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-slate-500">Bagged Trees</div>
              </div>
            </div>
          </div>

          {/* Gemini AI Oncology Reasoning Box */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  Gemini 3.8 Flash Clinical Decision Support
                </h3>
                <p className="text-xs text-slate-400">
                  Plain-English oncological risk explanation and clinical workup guidance
                </p>
              </div>

              <button
                id="btn-generate-gemini-report"
                onClick={requestGeminiExplanation}
                disabled={isLoadingGemini}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {isLoadingGemini ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing Biomarkers...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Generate Clinical Report</span>
                  </>
                )}
              </button>
            </div>

            {/* Rendered Clinical Report */}
            {geminiReport ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs text-slate-200 space-y-3 leading-relaxed">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400 gap-2">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono">
                    <FileText className="h-3.5 w-3.5" />
                    ONCOLOGY CONSULTATION SUMMARY
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      Engine: {reportSource.includes("gemini") ? `Google ${reportSource}` : "Clinical Oncology Decision Engine"}
                    </span>
                  </div>
                </div>

                {reportNotice && (
                  <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-2.5 text-[11px] text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{reportNotice}</span>
                  </div>
                )}

                <div
                  id="clinical-report-content"
                  className="whitespace-pre-line text-left prose prose-invert max-w-none text-slate-200"
                  style={{ textAlign: "left" }}
                >
                  {cleanClinicalText(geminiReport)}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400 space-y-2">
                <FileText className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="font-medium text-slate-300">No Clinical Report Generated Yet</p>
                <p className="max-w-md mx-auto text-slate-400">
                  Click the <strong>"Generate Clinical Report"</strong> button above to request real-time Gemini AI analysis of this patient's urinary panel, Lewis antigen interaction, and quantum risk assessment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
