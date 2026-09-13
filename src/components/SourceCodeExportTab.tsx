import React, { useState, useEffect } from "react";
import { Terminal, Copy, Check, Download, FileCode, Play, ExternalLink, Sparkles, BookOpen } from "lucide-react";

export const SourceCodeExportTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>("app.py");
  const [fileContent, setFileContent] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fileList = [
    { name: "app.py", label: "Streamlit App (app.py)", desc: "Single-file runnable QML prototype with PennyLane, Scikit-learn & Gemini" },
    { name: "requirements.txt", label: "Requirements (requirements.txt)", desc: "Exact pip package versions" },
    { name: "setup_guide.md", label: "Setup Guide (setup_guide.md)", desc: "Colab & Local step-by-step documentation & QML theory" },
    { name: "debernardi_dataset.csv", label: "Dataset (debernardi_dataset.csv)", desc: "220-sample Debernardi urinary biomarker cohort" },
  ];

  useEffect(() => {
    fetchFileContent(selectedFile);
  }, [selectedFile]);

  const fetchFileContent = async (filename: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/files/${filename}`);
      const data = await res.json();
      if (data.content) {
        setFileContent(data.content);
      } else {
        setFileContent(`Error loading ${filename}`);
      }
    } catch (err: any) {
      setFileContent(`Error fetching file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCurrentFile = () => {
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = selectedFile;
    link.click();
    URL.revokeObjectURL(url);
  };

  const colabSnippet = `# -------------------------------------------------------------
# 1-CLICK GOOGLE COLAB LAUNCH SCRIPT FOR HACKATHON
# Paste this code block into a single Google Colab cell and Run!
# -------------------------------------------------------------
!pip install -q streamlit pennylane scikit-learn pandas numpy plotly google-genai pyngrok

import os
# (Optional) Provide your Gemini API Key for clinical report generation:
os.environ["GEMINI_API_KEY"] = "YOUR_GEMINI_API_KEY"

# Download or run app.py:
!curl -s -O https://raw.githubusercontent.com/quantum-pancreas/mvp/main/app.py
!streamlit run app.py & npx localtunnel --port 8501
`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
              <Terminal className="h-4 w-4" />
              <span>HACKATHON PYTHON PROTOTYPE & EXPORT HUB</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Downloadable Python Source Code & Google Colab Quickstart
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
              Everything required to run the standalone Streamlit app on your local machine or in Google Colab with <strong>PennyLane</strong>, <strong>Scikit-Learn</strong>, and <strong>google-genai</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium flex items-center space-x-1.5 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy File"}</span>
            </button>
            <button
              onClick={downloadCurrentFile}
              className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-900/30 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download {selectedFile}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column: Quickstart guides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Terminal Run Guide */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>Local Terminal Execution (Linux / macOS / Windows)</span>
          </div>
          <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-cyan-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`# 1. Setup virtual environment
python3 -m venv qml_env && source qml_env/bin/activate

# 2. Install pinned dependencies
pip install -r requirements.txt

# 3. Export Gemini API Key (Optional)
export GEMINI_API_KEY="your-gemini-key"

# 4. Launch Streamlit Application
streamlit run app.py`}
          </pre>
        </div>

        {/* Google Colab 1-Click Guide */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <Play className="h-4 w-4 text-emerald-400" />
              <span>Google Colab 1-Click Script</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(colabSnippet);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              <Copy className="h-3 w-3" />
              <span>Copy Colab Cell</span>
            </button>
          </div>
          <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
            {colabSnippet}
          </pre>
        </div>
      </div>

      {/* File Selector Tabs & Code Viewer */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
        {/* Tab Buttons */}
        <div className="flex space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {fileList.map((f) => (
            <button
              key={f.name}
              onClick={() => setSelectedFile(f.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center space-x-2 whitespace-nowrap ${
                selectedFile === f.name
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80"
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>{f.name}</span>
            </button>
          ))}
        </div>

        {/* Code Block Container */}
        <div className="relative">
          {isLoading ? (
            <div className="h-96 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
              Loading {selectedFile}...
            </div>
          ) : (
            <div className="relative">
              <pre className="bg-slate-950 text-slate-200 font-mono text-xs p-5 rounded-xl border border-slate-800 overflow-x-auto max-h-[550px] leading-relaxed select-all">
                <code>{fileContent}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
