import { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Download, 
  X,
  AlertCircle, 
  RefreshCw, 
  Layers, 
  ChevronRight, 
  FileCode, 
  Github, 
  HelpCircle,
  Code,
  BookOpen,
  ArrowRight,
  Sparkles,
  Search,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LANGUAGES } from "./data";
import { DebugReport, LineIssue } from "./types";

export default function App() {
  // Application State
  const [selectedLangId, setSelectedLangId] = useState<string>("javascript");
  const [code, setCode] = useState<string>(LANGUAGES[0].sampleCode);
  const [errorLogs, setErrorLogs] = useState<string>(LANGUAGES[0].sampleError);
  const [extraContext, setExtraContext] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [report, setReport] = useState<DebugReport | null>(null);
  const [activeTab, setActiveTab] = useState<"annotated" | "explanation" | "corrected">("annotated");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Gutter line numbers based on code rows
  const [lineCount, setLineCount] = useState<number>(1);

  // Sync sample templates when changing languages
  const handleLanguageChange = (langId: string) => {
    setSelectedLangId(langId);
    const profile = LANGUAGES.find((l) => l.id === langId);
    if (profile) {
      setCode(profile.sampleCode);
      setErrorLogs(profile.sampleError);
    }
  };

  // Sync line numbers count
  useEffect(() => {
    const lines = code.split("\n").length;
    setLineCount(lines || 1);
  }, [code]);

  // Loading animations milestones
  const steps = [
    "Spinning up Diagnostic Kernel...",
    "Scanning Lexical Variables & Closures...",
    "Tracing Scope Chain Intersections...",
    "Querying Server Healing Agents...",
    "Validating Pristine Syntax Repair...",
    "Compiling Visual Diagnosis Report..."
  ];

  // Simulating timed progress steps during async load
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // API Call - Connect to server https://debugai-6uwo.onrender.com/api/debug
  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setApiError(null);
    setReport(null);

    try {
      const response = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: selectedLangId,
          errorLogs,
          extraContext
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to contact diagnostic engine.");
      }

      const data: DebugReport = await response.json();
      setReport(data);
      setActiveTab("annotated"); // Default back to visual line-by-line fix
    } catch (error: any) {
      console.error(error);
      setApiError(error.message || "Something went wrong. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy code helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Browser download helper
  const handleDownloadFile = () => {
    if (!report) return;
    const blob = new Blob([report.correctedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = report.fileNameSuggested || `corrected_${selectedLangId}_file.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Inline styles formatter for markdown
  const renderInlineStyles = (text: string) => {
    return text.split(/(\*\*.*?\*\*|`.*?`)/).map((chunk, j) => {
      if (chunk.startsWith("**") && chunk.endsWith("**")) {
        return <strong key={j} className="text-indigo-650 font-semibold">{chunk.slice(2, -2)}</strong>;
      }
      if (chunk.startsWith("`") && chunk.endsWith("`")) {
        return <code key={j} className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 text-[11px] border border-slate-200">{chunk.slice(1, -1)}</code>;
      }
      return chunk;
    });
  };

  // Format simple markdown helper
  const renderFormattedExplanation = (markdownText: string) => {
    if (!markdownText) return null;
    return markdownText.split("\n").map((line, i) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("### ")) {
        return (
          <h4 key={i} className="text-sm sm:text-base font-semibold text-indigo-650 mt-4 mb-2 first:mt-0">
            {renderInlineStyles(trimmedLine.replace("### ", ""))}
          </h4>
        );
      }
      if (trimmedLine.startsWith("## ")) {
        return (
          <h3 key={i} className="text-base sm:text-lg font-bold text-slate-800 mt-5 mb-2 border-b border-slate-200 pb-1.5">
            {renderInlineStyles(trimmedLine.replace("## ", ""))}
          </h3>
        );
      }
      if (trimmedLine.startsWith("# ")) {
        return (
          <h2 key={i} className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3 border-b border-slate-200 pb-2">
            {renderInlineStyles(trimmedLine.replace("# ", ""))}
          </h2>
        );
      }
      if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ") || trimmedLine.startsWith("+ ")) {
        const textContent = trimmedLine.replace(/^([-*+]\s+)/, "");
        return (
          <div key={i} className="flex items-start gap-2.5 ml-3 my-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
            <span className="text-xs sm:text-xs text-slate-600 leading-relaxed flex-1">
              {renderInlineStyles(textContent)}
            </span>
          </div>
        );
      }

      // Check for numbered list (1., 2. etc.)
      const numMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        const num = numMatch[1];
        const textContent = numMatch[2];
        return (
          <div key={i} className="flex items-start gap-2.5 ml-3 my-1.5">
            <span className="font-mono text-indigo-600 font-bold text-xs shrink-0 min-w-[14px]">
              {num}.
            </span>
            <span className="text-xs sm:text-xs text-slate-600 leading-relaxed flex-1">
              {renderInlineStyles(textContent)}
            </span>
          </div>
        );
      }

      if (trimmedLine === "") {
        return <div key={i} className="h-1.5" />;
      }

      return (
        <p key={i} className="text-xs sm:text-xs text-slate-600 my-2 leading-relaxed min-h-[1.2rem]">
          {renderInlineStyles(line)}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased selection:bg-indigo-150 selection:text-indigo-900 flex flex-col justify-between transition-colors duration-300" id="debugai-root-container">
      <div className="relative flex-1">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_75%,transparent_100%)] pointer-events-none opacity-40" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Bar Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-205 bg-white/90 backdrop-blur-md px-6 py-4 shadow-sm" id="debugai-primary-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 shadow-sm">
              <span className="text-white font-bold text-base">D</span>
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span className="font-semibold text-xl tracking-tight text-slate-900">debug<span className="text-indigo-600">ai</span></span>
              </div>
            </div>
          </div>

          {/* Prompt/Active Meta Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-medium text-indigo-700">Analysis Engine Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Primary App Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" id="debugai-main">
        
        {/* Split Grid Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT COLUMN: EDITOR & INPUT CABINET (Span 5 on Desktop) */}
          <section className="lg:col-span-5 space-y-6" id="debugai-input-cabinet">
            
            {/* Input Configuration Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500" />
              
              {/* Box Title */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold tracking-wider text-slate-700 uppercase flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  1. Choose Code Profile
                </h2>
                <span className="text-xs text-slate-400 font-mono">Input Workspace</span>
              </div>

              {/* Horizontal Language Quick Select */}
              <div className="flex flex-wrap gap-1.5 mb-5" id="language-tab-selector">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    id={`lang-btn-${lang.id}`}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                      selectedLangId === lang.id
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-inner"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200"
                    }`}
                  >
                    <span>{lang.icon}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>

              {/* Workspace code block */}
              <div className="space-y-4">
                <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden">
                  
                  {/* Top Editor Banner bar */}
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      </span>
                      <span className="text-xs font-mono text-slate-500 ml-2">
                        input_code.{LANGUAGES.find((l) => l.id === selectedLangId)?.ext || "txt"}
                      </span>
                    </div>

                    <button
                      id="btn-load-fresh-sample"
                      onClick={() => handleLanguageChange(selectedLangId)}
                      className="text-[10px] sm:text-xs text-slate-500 hover:text-indigo-650 transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100"
                      title="Reset input with template code"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Load Blank Template
                    </button>
                  </div>

                  {/* High Quality Rich Code input with dynamic Gutter Line Count numbers */}
                  <div className="flex min-h-[300px] font-mono text-xs leading-relaxed relative border-b border-slate-200">
                    {/* Left line numbers gutter */}
                    <div className="bg-slate-50 pt-4 select-none text-right pr-3.5 pl-2 text-slate-400 border-r border-slate-200 w-11 text-[11px] font-mono">
                      {Array.from({ length: lineCount }).map((_, i) => (
                        <div key={i} className="h-5">{i + 1}</div>
                      ))}
                    </div>

                    {/* True editing Textarea */}
                    <textarea
                      id="input-code-textarea"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="// Paste your buggy or broken code sequence here..."
                      className="w-full bg-transparent p-4 text-slate-850 font-mono text-xs leading-5 focus:outline-none resize-none focus:ring-0 min-h-[350px] overflow-y-auto whitespace-pre placeholder-slate-400"
                      spellCheck="false"
                    />
                  </div>
                </div>

                {/* Optional Error Logs Console Section */}
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-wide text-slate-600 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    2. Error Logs / Stack Traces <span className="text-[10px] text-slate-400 font-light font-mono">(Highly Recommended)</span>
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <textarea
                      id="input-errors-textarea"
                      value={errorLogs}
                      onChange={(e) => setErrorLogs(e.target.value)}
                      placeholder="Paste browser consoles, compiler error logs, type warnings, or describing bugs..."
                      className="w-full bg-transparent p-3.5 text-rose-700 font-mono text-xs leading-relaxed focus:outline-none focus:ring-0 min-h-[80px] h-[100px] resize-y placeholder-rose-300"
                      spellCheck="false"
                    />
                    <div className="absolute bottom-2 right-3 flex items-center pointer-events-none">
                      <span className="text-[9px] uppercase font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded tracking-widest border border-rose-200">logs terminal</span>
                    </div>
                  </div>
                </div>

                {/* Optional Environment Context Section */}
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-wide text-slate-600 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    3. Additional Environment Context <span className="text-[10px] text-slate-400 font-light font-mono">(Optional)</span>
                  </label>
                  <input
                    id="input-extra-context"
                    type="text"
                    value={extraContext}
                    onChange={(e) => setExtraContext(e.target.value)}
                    placeholder="e.g., Node version, React version, specific libraries used, target browser"
                    className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-colors"
                  />
                </div>

                {/* Submit Trigger Action Button */}
                <button
                  id="btn-run-diagnostics"
                  disabled={isLoading}
                  onClick={handleAnalyze}
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold text-xs tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md ${
                    isLoading 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 shadow-sm hover:scale-[1.01] cursor-pointer"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 animate-spin text-indigo-400" />
                      <span>IDENTIFYING ANOMALIES...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4.5 w-4.5 fill-white text-white" />
                      <span>LAUNCH DIAGNOSTIC DEBUGGING</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Helper Tips */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3 shadow-sm">
              <span className="p-1.5 bg-slate-50 rounded-lg text-indigo-600 border border-slate-200 flex-shrink-0">
                <HelpCircle className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-semibold text-slate-800">How DebugAI works:</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  Once you trigger diagnostics, Gemini scans code syntactics, maps bugs to exact lines, writes comprehensive architectural fixes, and generates pristine copyable outputs.
                </p>
              </div>
            </div>
            
          </section>

          {/* RIGHT COLUMN: ACTIVE TERMINAL AND ANALYTICS (Span 7 on Desktop) */}
          <section className="lg:col-span-7" id="debugai-analytics-deck">
            
            <AnimatePresence mode="wait">
              {/* STATE 1: LOADING MATRIX */}
              {isLoading && (
                <motion.div
                  key="diagnosing-loader"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl border border-indigo-100 p-8 sm:p-12 text-center shadow-lg relative overflow-hidden"
                  id="debugai-loader-panel"
                >
                  {/* Backdrop glowing scanners */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-600 animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />
                  
                  <div className="mx-auto w-16 h-16 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center mb-6 relative">
                    <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
                    <div className="absolute inset-0 border border-indigo-500/20 rounded-xl animate-ping opacity-30" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 tracking-wide">Debugging System Scanning</h3>
                  <p className="text-xs text-indigo-600 font-mono tracking-wider mt-1.5 uppercase">AI AGENTS ENGAGED</p>

                  {/* Micro-stages checklist logs */}
                  <div className="max-w-md mx-auto mt-8 bg-slate-55/50 rounded-xl border border-slate-200 p-5 text-left font-mono text-[11px] space-y-3">
                    {steps.map((stepText, idx) => {
                      const isActive = loadingStep === idx;
                      const isDone = loadingStep > idx;
                      return (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between transition-opacity duration-300 ${
                            isActive ? "text-indigo-600 font-semibold" : isDone ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{isDone ? "✓" : isActive ? "❖" : "○"}</span>
                            <span>{stepText}</span>
                          </div>
                          <span>
                            {isDone ? "[ COMPLETE ]" : isActive ? "[ WORKING... ]" : "[ PENDING ]"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-500 mt-6 leading-relaxed">
                    Analyzing compiler behavior and generating high-accuracy line-by-line repairs. This takes roughly 3 to 6 seconds...
                  </p>
                </motion.div>
              )}

              {/* STATE 2: ERROR/FAILURE STATE */}
              {!isLoading && apiError && (
                <motion.div
                  key="diagnosing-error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-xl border border-rose-250 p-6 sm:p-8 shadow-sm"
                  id="debugai-error-panel"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="font-bold text-slate-800">An API Error Has Occurred</h3>
                      <p className="text-xs text-rose-700 leading-relaxed font-mono bg-rose-50 p-3 rounded-lg border border-rose-100">
                        {apiError}
                      </p>
                      <div className="pt-3">
                        <button
                          id="btn-retry-diagnose"
                          onClick={handleAnalyze}
                          className="px-4 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Retry Diagnostics Request
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STATE 3: IDLE AWAITING INPUT */}
              {!isLoading && !apiError && !report && (
                <motion.div
                  key="diagnosing-idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-xl border border-slate-200 p-10 sm:p-16 text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center group"
                  id="debugai-idle-panel"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
                  
                  <div className="h-12 w-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-indigo-600 font-mono mb-6 group-hover:border-indigo-500/20 group-hover:shadow-sm transition-all">
                    <Code className="h-6 w-6" />
                  </div>

                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Diagnostic Console Ready</h3>
                  <p className="text-slate-600 text-xs leading-relaxed max-w-sm mt-2 mx-auto">
                    Select a code preset or paste your own script on the left, then activate diagnostic core to identify anomalies.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3 items-center justify-center text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <span className="text-emerald-600">✓</span> Syntax Repair
                    </span>
                    <span className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <span className="text-emerald-600">✓</span> Line Highlights
                    </span>
                    <span className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <span className="text-emerald-600">✓</span> Copier & Downloader
                    </span>
                  </div>
                </motion.div>
              )}

              {/* STATE 4: REPORT DASHBOARD LOADED */}
              {!isLoading && !apiError && report && (
                <motion.div
                  key="diagnosing-complete"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                  id="debugai-report-panel"
                >
                  
                  {/* Visual tab navigation bars */}
                  <div className="bg-slate-100 rounded-xl border border-slate-200 p-1.5 flex gap-1 font-mono text-xs" id="diagnostic-tab-bar">
                    <button
                      id="tab-diagnostic-annotated"
                      onClick={() => setActiveTab("annotated")}
                      className={`flex-1 py-3 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === "annotated"
                          ? "bg-white border border-slate-200 text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Original &</span> Line Fixes
                    </button>
                    <button
                      id="tab-diagnostic-explanation"
                      onClick={() => setActiveTab("explanation")}
                      className={`flex-1 py-3 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === "explanation"
                          ? "bg-white border border-slate-200 text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Explanation /</span> Learn Bug
                    </button>
                    <button
                      id="tab-diagnostic-corrected"
                      onClick={() => setActiveTab("corrected")}
                      className={`flex-1 py-3 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === "corrected"
                          ? "bg-white border border-slate-200 text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <FileCode className="h-3.5 w-3.5" />
                      Corrected Code
                    </button>
                  </div>

                  {/* ACTIVE TAB DISPLAY CARDS */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm min-h-[380px]">
                    
                    {/* TAB A: ORIGINAL WITH ANNOTATED INLINE FLAGS */}
                    {activeTab === "annotated" && (
                      <div className="space-y-5" id="view-annotated-lines">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-550" />
                            Line-by-Line Error Gutter
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono">Annotated Source Code</span>
                        </div>

                        {/* Line list block */}
                        <div className="bg-slate-50 rounded-xl border border-slate-150 p-4 font-mono text-xs overflow-x-auto select-text leading-relaxed">
                          {code.split("\n").map((lineText, idx) => {
                            const lineNum = idx + 1;
                            // Find line issue matching this line count
                            const associatedIssues = report.lineIssues?.filter(
                              (i: LineIssue) => Number(i.line) === lineNum
                            ) || [];

                            return (
                              <div key={idx} className="group/line py-[1px] relative">
                                <div className={`flex items-start ${associatedIssues.length > 0 ? "bg-rose-50 select-none" : ""}`}>
                                  {/* Line Number indicator */}
                                  <span className={`w-8 text-right pr-3 select-none inline-block font-semibold ${
                                    associatedIssues.length > 0 ? "text-rose-600 font-extrabold" : "text-slate-400"
                                  }`}>
                                    {lineNum}
                                  </span>
                                  {/* Code Line representation */}
                                  <pre className={`text-[11px] sm:text-xs overflow-x-visible whitespace-pre flex-1 ${
                                    associatedIssues.length > 0 ? "text-rose-750 font-semibold" : "text-slate-700"
                                  }`}>
                                    {lineText || " "}
                                  </pre>
                                </div>
                                
                                {/* Inject error notification banner directly below the erroneous row */}
                                {associatedIssues.map((issueItem, issueIdx) => (
                                  <div 
                                    key={issueIdx} 
                                    className="ml-8 my-2 bg-rose-50/80 rounded-lg border-l-2 border-rose-500 p-3 text-[11px] leading-relaxed relative overflow-hidden shadow-sm"
                                  >
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                                      <div className="space-y-1.5 flex-1">
                                        <div className="text-rose-800 font-bold">
                                          Issue: <span className="font-normal text-slate-700">{issueItem.issue}</span>
                                        </div>
                                        {issueItem.fix && (
                                          <div className="bg-white p-2 rounded border border-rose-100 font-mono text-[10px] text-emerald-700">
                                            <span className="font-bold text-emerald-600">Fix suggestions:</span> <span className="text-slate-600">{issueItem.fix}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-normal">
                          <span className="text-rose-500 shrink-0 font-bold font-mono">[!]</span>
                          <span>The diagnostic markers are aligned dynamically against the original buggy rows. Click on the other tabs above to view complete explanations or clean copyable code.</span>
                        </div>
                      </div>
                    )}

                    {/* TAB B: TECHNICAL markdown EXPLANATION */}
                    {activeTab === "explanation" && (
                      <div className="space-y-4" id="view-markdown-explanation">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            Bug Architecture & Resolution
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono">Diagnostic Report</span>
                        </div>
                        
                        {/* Render generated narrative and explanations in custom Markdown parser */}
                        <div className="p-1 px-1.5 prose max-w-none overflow-y-auto max-h-[500px]">
                          {renderFormattedExplanation(report.explanation)}
                        </div>
                      </div>
                    )}

                    {/* TAB C: PRISTINE COPYABLE CODE */}
                    {activeTab === "corrected" && (
                      <div className="space-y-4" id="view-corrected-code">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="space-y-0.5">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-705 flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Corrected Output File
                            </h3>
                            <p className="text-[10px] text-slate-400 font-mono">Ready for execution</p>
                          </div>
                          
                          {/* File naming suggested */}
                          <div className="text-xs bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 text-slate-600 font-mono">
                            📂 {report.fileNameSuggested || "index.js"}
                          </div>
                        </div>

                        {/* Output code block with Copy control */}
                        <div className="relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden group/box">
                          {/* Code container */}
                          <pre className="p-4 overflow-x-auto text-[11px] sm:text-xs font-mono leading-relaxed text-slate-800 select-all max-h-[350px]">
                            <code>{report.correctedCode}</code>
                          </pre>

                          {/* Quick copy code button float */}
                          <button
                            id="btn-copy-code"
                            onClick={() => handleCopy(report.correctedCode)}
                            className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 rounded-lg text-[11px] font-semibold border border-slate-200 flex items-center gap-1 cursor-pointer select-none"
                          >
                            {copiedCode ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* File Action Controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <span className="text-[11px] text-slate-500 leading-normal flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />
                            Click copy or download raw code file directly.
                          </span>
                          <button
                            id="btn-clean-download"
                            onClick={handleDownloadFile}
                            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download corrected file
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Dedicated Corrected Code Station (Always visible below active tab when looking at other tabs) */}
                  {activeTab !== "corrected" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-indigo-100 p-5 sm:p-6 shadow-sm space-y-4"
                      id="debugai-corrected-code-addon"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Corrected Code Station (Copy / Companion Panel)
                          </h3>
                          <p className="text-[10.5px] text-slate-505">Copy or download the pristine, fixed code from this convenient reference view.</p>
                        </div>
                        <span className="text-xs font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-slate-600 self-start sm:self-center">
                          📂 {report.fileNameSuggested || "index.js"}
                        </span>
                      </div>

                      {/* Code container with Copy button */}
                      <div className="relative rounded-lg border border-slate-200 bg-slate-50 overflow-hidden group/addon">
                        <pre className="p-4 overflow-x-auto text-[11px] sm:text-xs font-mono leading-relaxed text-slate-800 select-all max-h-[300px]">
                          <code>{report.correctedCode}</code>
                        </pre>

                        <button
                          id="btn-copy-code-addon"
                          onClick={() => handleCopy(report.correctedCode)}
                          className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-955 rounded-lg text-[11px] font-semibold border border-slate-200 flex items-center gap-1 cursor-pointer select-none transition-colors"
                        >
                          {copiedCode ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-indigo-650" />
                              <span>Copy Corrected Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-205">
                        <span className="text-[10.5px] text-slate-500 leading-normal">
                          💡 Tip: The code is fully resolved, syntax checked, and ready to swap into your workspace.
                        </span>
                        <button
                          onClick={handleDownloadFile}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-[11px] font-semibold rounded-md text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          Download Script
                        </button>
                      </div>
                    </motion.div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>

          </section>

        </div>

      </main>
      </div>

      {/* Footer Status Bar matching specified Sleek Interface */}
      <footer className="mt-auto px-6 py-3 bg-[#e2e8f0]/40 flex items-center justify-between text-[11px] font-medium text-slate-505 border-t border-slate-200" id="debugai-status-footer">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            AI Analysis Core: Online
          </span>
          <span className="text-slate-350">|</span>
          <span>Line count: {code.split("\n").length}</span>
        </div>
        <div className="flex gap-4 font-mono">
          <span className="opacity-80">v2.4.0 Engine</span>
        </div>
      </footer>
    </div>
  );
}
