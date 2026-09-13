import React, { useState } from "react";
import { Atom, Cpu, Zap, RefreshCw, Layers, ShieldAlert, Sparkles, BookOpen } from "lucide-react";
import { simulatePennyLaneCircuit } from "../utils/qmlSimulator";

export const QuantumArchitectureTab: React.FC = () => {
  // Test angle sliders for the 4 qubits (representing 4 PCA features)
  const [angles, setAngles] = useState<number[]>([1.45, 1.82, 0.95, 2.10]);
  const [circuitType, setCircuitType] = useState<"vqc" | "qsvc">("vqc");

  const qState = simulatePennyLaneCircuit(angles);

  const resetToDefault = () => {
    setAngles([1.45, 1.82, 0.95, 2.10]);
  };

  const handleAngleChange = (index: number, val: number) => {
    const updated = [...angles];
    updated[index] = val;
    setAngles(updated);
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
              <Atom className="h-4 w-4" />
              <span>PENNYLANE DEFAULT.QUBIT QUANTUM SIMULATOR</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              4-Qubit Hybrid Variational Quantum Classifier (VQC)
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
              We construct a parameterized quantum circuit using PennyLane. Classical biomedical signals are encoded into quantum amplitudes via <strong>AngleEmbedding</strong>, transformed through parameterized single-qubit rotations, and entangled via a <strong>circular CNOT topology</strong> to capture multi-body biomarker correlations in Hilbert space.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCircuitType("vqc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                circuitType === "vqc"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/50"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Variational Ansatz (VQC)
            </button>
            <button
              onClick={() => setCircuitType("qsvc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                circuitType === "qsvc"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/50"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Quantum Kernel (QSVC)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 4-Qubit Circuit Visualizer */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              Live Quantum Circuit Gate Pipeline
            </h3>
            <p className="text-xs text-slate-400">
              State preparation (AngleEmbedding) &rarr; Variational Layers ($R_y, R_z$) &rarr; Circular Entanglement &rarr; Pauli-Z Measurement
            </p>
          </div>
          <button
            onClick={resetToDefault}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-400 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Angles</span>
          </button>
        </div>

        {/* Visual Circuit Diagram Canvas */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 overflow-x-auto font-mono text-xs">
          <div className="min-w-[700px] space-y-6">
            {[0, 1, 2, 3].map((qubitIndex) => {
              const theta = angles[qubitIndex];
              const ryWeight = qState.rotationAnglesY[qubitIndex];
              const rzWeight = qState.rotationAnglesZ[qubitIndex];

              return (
                <div key={qubitIndex} className="flex items-center space-x-3">
                  {/* Qubit Label */}
                  <div className="w-16 flex items-center space-x-1.5 font-bold text-cyan-400">
                    <span className="text-slate-500">|0⟩</span>
                    <span>q[{qubitIndex}]</span>
                  </div>

                  {/* Wire line & Gates */}
                  <div className="flex-1 relative flex items-center">
                    {/* Background Wire line */}
                    <div className="absolute inset-x-0 h-0.5 bg-slate-700" />

                    {/* Gate Sequence */}
                    <div className="relative z-10 flex items-center space-x-6 pl-4">
                      {/* 1. Angle Embedding Gate */}
                      <div className="bg-cyan-950 border border-cyan-700 text-cyan-200 px-2.5 py-1.5 rounded shadow-md flex flex-col items-center">
                        <span className="text-[10px] text-cyan-400 font-bold">AngleEmb</span>
                        <span className="text-[11px]">Ry({theta.toFixed(2)})</span>
                      </div>

                      {/* 2. Variational RY Gate */}
                      <div className="bg-indigo-950 border border-indigo-700 text-indigo-200 px-2.5 py-1.5 rounded shadow-md flex flex-col items-center">
                        <span className="text-[10px] text-indigo-400 font-bold">Ansatz Layer 1</span>
                        <span className="text-[11px]">Ry({ryWeight > 0 ? `+${ryWeight}` : ryWeight})</span>
                      </div>

                      {/* 3. Variational RZ Gate */}
                      <div className="bg-purple-950 border border-purple-700 text-purple-200 px-2.5 py-1.5 rounded shadow-md flex flex-col items-center">
                        <span className="text-[10px] text-purple-400 font-bold">Phase Rot</span>
                        <span className="text-[11px]">Rz({rzWeight > 0 ? `+${rzWeight}` : rzWeight})</span>
                      </div>

                      {/* 4. Circular CNOT Entanglement Node */}
                      <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-300 px-2.5 py-1.5 rounded shadow-md flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-[11px]">
                          CNOT({qubitIndex} &rarr; {(qubitIndex + 1) % 4})
                        </span>
                      </div>

                      {/* 5. Measurement on Wire 0 */}
                      {qubitIndex === 0 ? (
                        <div className="bg-rose-950 border border-rose-600 text-rose-200 px-3 py-1.5 rounded shadow-md flex items-center space-x-1.5 font-bold">
                          <Zap className="h-3.5 w-3.5 text-rose-400" />
                          <span>⟨Z₀⟩ ExpVal</span>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-[11px] px-2 italic">
                          (Entangled state)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Simulator Output Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Hamiltonian Measurement</div>
              <div className="text-lg font-bold font-mono text-cyan-400">
                ⟨Z₀⟩ = {qState.expectationValZ0 > 0 ? `+${qState.expectationValZ0}` : qState.expectationValZ0}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Range: [-1, +1]</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Calibrated Cancer Probability</div>
              <div className="text-lg font-bold font-mono text-rose-400">
                {(qState.rawMalignancyProbability * 100).toFixed(1)}%
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Sigmoid Scaling</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Hilbert State Dimensions</div>
              <div className="text-lg font-bold font-mono text-purple-400">
                2⁴ = 16 States
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">4 Qubits</span>
          </div>
        </div>
      </div>

      {/* Interactive Angle Slider Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-cyan-400" />
            Input Feature Map Rotations (PCA Component Angles)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Adjust the classical PCA input projections to observe live quantum state rotation:
          </p>

          <div className="space-y-4">
            {angles.map((theta, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-mono">Qubit {idx} Rotation (PC{idx + 1}):</span>
                  <span className="text-cyan-400 font-mono font-semibold">
                    {theta.toFixed(2)} rad ({(theta / Math.PI).toFixed(2)}π)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.PI}
                  step="0.05"
                  value={theta}
                  onChange={(e) => handleAngleChange(idx, parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Theoretical Framework & Math */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            Quantum Mathematical Foundations
          </h3>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
              <span className="text-slate-400 block mb-1 font-sans font-semibold">1. Angle State Preparation:</span>
              |ψ(x)⟩ = ⨂ᵢ₌₀³ R_y(xᵢ)|0⟩ = ⨂ᵢ (cos(xᵢ/2)|0⟩ + sin(xᵢ/2)|1⟩)
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
              <span className="text-slate-400 block mb-1 font-sans font-semibold">2. Entangling Ansätze Layer:</span>
              U(θ, φ) = (∏ᵢ CNOT_(i, (i+1)%4)) · ⨂ᵢ R_z(φᵢ) R_y(θᵢ)
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
              <span className="text-slate-400 block mb-1 font-sans font-semibold">3. Kernel Inner Product (QSVC mode):</span>
              K(x, x') = |⟨ψ(x)|ψ(x')⟩|² = |⟨0000| U†(x') U(x) |0000⟩|²
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-cyan-950/40 border border-cyan-800/40 p-2.5 rounded-lg flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Why 4 Qubits?</strong> Tabular datasets in oncology often suffer from the "curse of dimensionality". Compressing 7 laboratory markers into 4 principal components balances information preservation (~94% variance) with fast, noiseless execution on both quantum simulators and real NISQ devices (e.g., IBM Quantum Eagle or Rigetti Aspen).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
