import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, RefreshCw, Terminal, Cpu, FileCode, Check, Server, Eye, Download, ShieldCheck } from 'lucide-react';

interface PipelineStep {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  duration?: string;
  logs: string[];
}

interface UnitTest {
  id: string;
  name: string;
  file: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  duration?: string;
}

export default function CIModule() {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'tests' | 'config'>('pipeline');
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineSuccess, setPipelineSuccess] = useState<boolean | null>(null);

  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: 'step-1', name: 'Checkout Workspace Repository', status: 'idle', logs: ['[INFO] Fetching latest commits from git ref...', '[SUCCESS] Successfully cloned main branch.'] },
    { id: 'step-2', name: 'Syntax Linting check', status: 'idle', logs: ['[INFO] Running compiler linting check...', '[SUCCESS] Clean exit. No syntax errors detected.'] },
    { id: 'step-3', name: 'Execute Sandboxed Unit Tests', status: 'idle', logs: ['[INFO] Running Jest test suite...', '[SUCCESS] All 8 workspace unit tests completed with 100% success.'] },
    { id: 'step-4', name: 'Static Shield Security Audit', status: 'idle', logs: ['[INFO] Scanning for exposed keys/tokens...', '[SUCCESS] Clean audit: No hardcoded API keys detected.'] },
    { id: 'step-5', name: 'Compile Production Bundle', status: 'idle', logs: ['[INFO] Bundling assets using Vite compilers...', '[SUCCESS] Production bundle generated under /dist (84 KB).'] },
    { id: 'step-6', name: 'Docker Container Ingress Deploy', status: 'idle', logs: ['[INFO] Generating container overlay...', '[SUCCESS] Deploy completed. Global routing established.'] },
  ]);

  const [unitTests, setUnitTests] = useState<UnitTest[]>([
    { id: 't1', name: 'should load initial environment variables', file: 'server.test.js', status: 'idle' },
    { id: 't2', name: 'should write file successfully to sandbox filesystem', file: 'workspace.test.js', status: 'idle' },
    { id: 't3', name: 'should return correct mock tables from SQLite database', file: 'sqlite.test.js', status: 'idle' },
    { id: 't4', name: 'should initialize Gemini client with API key validation', file: 'gemini.test.js', status: 'idle' },
    { id: 't5', name: 'should safely reject invalid SQL expressions', file: 'sqlite.test.js', status: 'idle' },
    { id: 't6', name: 'should bundle production container assets recursively', file: 'deploy.test.js', status: 'idle' },
  ]);

  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testStats, setTestStats] = useState({ passed: 0, failed: 0, coverage: 0 });

  // YAML Config state
  const [workflowYml, setWorkflowYml] = useState(`name: Oggy Shield CI/CD Pipeline Suite
on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Node environment
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Sandboxed Dependencies
        run: npm install

      - name: Execute Workspace Linters
        run: npm run lint

      - name: Run Jest Integrity Tests
        run: npm run test

  deploy-production:
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker Container Ingress
        run: npm run build
      - name: 1-Click Cloud Deployment
        run: curl -X POST https://api.studio.ai/deploy
`);

  const handleRunPipeline = async () => {
    setIsRunningPipeline(true);
    setPipelineSuccess(null);
    setPipelineLogs(['[START] Initiating Continuous Integration / CD Automation Pipeline...']);

    // Reset steps to idle
    setSteps(prev => prev.map(s => ({ ...s, status: 'idle' })));

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      // Set current step to running
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
      setPipelineLogs(prev => [...prev, `[RUN] Commencing: ${step.name}...`]);

      await new Promise(resolve => setTimeout(resolve, 800));

      // Execute step logs
      for (const log of step.logs) {
        setPipelineLogs(prev => [...prev, `  ${log}`]);
      }

      // Mark step as success
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'success', duration: '0.8s' } : s));
    }

    setPipelineLogs(prev => [...prev, '[SUCCESS] All continuous delivery checks validated! Ingress container is live.']);
    setPipelineSuccess(true);
    setIsRunningPipeline(false);
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    setUnitTests(prev => prev.map(t => ({ ...t, status: 'running' })));
    setTestStats({ passed: 0, failed: 0, coverage: 0 });

    let passedCount = 0;
    for (let i = 0; i < unitTests.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      const test = unitTests[i];
      const isPassed = Math.random() > 0.1; // 90% pass chance
      if (isPassed) passedCount++;

      setUnitTests(prev => prev.map((t, idx) => idx === i ? { ...t, status: isPassed ? 'passed' : 'failed', duration: '120ms' } : t));
      setTestStats(prev => ({
        ...prev,
        passed: passedCount,
        failed: (i + 1) - passedCount,
        coverage: Math.round((passedCount / unitTests.length) * 100),
      }));
    }

    setIsRunningTests(false);
  };

  return (
    <div id="ci-module-container" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Module Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-cyan-400">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Oggy Build Pipeline & CI/CD Suite <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-0.5 rounded border border-cyan-500/20">Phase 5 Active</span>
            </h3>
            <p className="text-xs text-slate-400">Continuous delivery engine, headless automation workflows, sandboxed unit runners, and security audit gateways</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveSubTab('pipeline')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              activeSubTab === 'pipeline' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PIPELINE ORCHESTRATION
          </button>
          <button
            onClick={() => setActiveSubTab('tests')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              activeSubTab === 'tests' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SANDBOX UNIT RUNNER
          </button>
          <button
            onClick={() => setActiveSubTab('config')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              activeSubTab === 'config' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CI WORKFLOW CONFIG
          </button>
        </div>
      </div>

      {activeSubTab === 'pipeline' && (
        <div className="flex-1 flex min-h-0">
          {/* Left Panel: Steps Pipeline Visualizer */}
          <div className="w-1/2 p-4 border-r border-slate-800/80 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Workflow Step Execution
              </span>
              <button
                onClick={handleRunPipeline}
                disabled={isRunningPipeline}
                className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 text-slate-950 font-bold text-xs font-mono rounded-lg transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                {isRunningPipeline ? 'RUNNING PIPELINE...' : 'TRIGGER PIPELINE'}
              </button>
            </div>

            <div className="relative pl-6 space-y-4">
              {/* Vertical line connector */}
              <div className="absolute left-2.5 top-2 bottom-6 w-0.5 bg-slate-800"></div>

              {steps.map((step, idx) => (
                <div key={step.id} className="relative flex items-start gap-4">
                  {/* Indicator dot */}
                  <div className="absolute -left-6 top-1 flex items-center justify-center">
                    {step.status === 'success' && (
                      <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                    )}
                    {step.status === 'running' && (
                      <div className="w-5.5 h-5.5 rounded-full bg-cyan-500/10 border border-cyan-500 text-cyan-400 flex items-center justify-center animate-spin text-[10px]">
                        ◌
                      </div>
                    )}
                    {step.status === 'failed' && (
                      <div className="w-5.5 h-5.5 rounded-full bg-rose-500/10 border border-rose-500 text-rose-400 flex items-center justify-center font-bold text-xs">
                        ×
                      </div>
                    )}
                    {step.status === 'idle' && (
                      <div className="w-5.5 h-5.5 rounded-full bg-slate-950 border border-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs font-mono">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 bg-slate-900/30 border border-slate-850 p-3 rounded-xl hover:border-slate-800 transition-all">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${step.status === 'running' ? 'text-cyan-400' : 'text-slate-200'}`}>
                        {step.name}
                      </span>
                      {step.duration && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-950 border border-slate-850 px-1.5 py-0.2 rounded">
                          {step.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 mt-1">
                      Status: <span className={
                        step.status === 'success' ? 'text-emerald-400' :
                        step.status === 'running' ? 'text-cyan-400 animate-pulse' :
                        'text-slate-500'
                      }>{step.status.toUpperCase()}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Logs terminal */}
          <div className="w-1/2 p-4 bg-slate-950/60 overflow-y-auto flex flex-col space-y-4">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" /> Pipeline STDOUT / STDERR
            </span>

            <div className="flex-1 bg-[#070b13] border border-slate-850 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-1.5 overflow-y-auto max-h-[380px]">
              {pipelineLogs.length === 0 ? (
                <div className="text-slate-500 italic text-center py-24 select-none">
                  Trigger the CI/CD pipeline flow to watch the container build daemon stream full console logs.
                </div>
              ) : (
                pipelineLogs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.includes('[SUCCESS]') || log.includes('✓')
                        ? 'text-emerald-400'
                        : log.includes('[RUN]')
                        ? 'text-cyan-400 font-bold'
                        : log.includes('[START]')
                        ? 'text-violet-400 font-bold'
                        : 'text-slate-400'
                    }
                  >
                    {log}
                  </div>
                ))
              )}

              {pipelineSuccess && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-400 space-y-1 mt-4">
                  <span className="font-bold flex items-center gap-1.5 uppercase text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> PIPELINE INTEGRATION SUCCESSFUL
                  </span>
                  <p className="text-[11px] font-mono text-slate-300 leading-normal">
                    Docker container was pushed, and ingress endpoint routing successfully targeted to Port 3000 on main cluster nodes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'tests' && (
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Quick Stats overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Unit tests Passed</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">{testStats.passed}</span>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500/20" />
            </div>

            <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Failed Checks</span>
                <span className="text-2xl font-bold text-rose-400 font-mono mt-1 block">{testStats.failed}</span>
              </div>
              <XCircle className="w-8 h-8 text-rose-500/20" />
            </div>

            <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">File Code Coverage</span>
                <span className="text-2xl font-bold text-cyan-400 font-mono mt-1 block">{testStats.coverage}%</span>
              </div>
              <Cpu className="w-8 h-8 text-cyan-500/20" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Integrity testing list ({unitTests.length})
            </span>
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 text-slate-950 font-bold text-xs font-mono rounded-lg transition-all flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              {isRunningTests ? 'TESTING SYSTEM...' : 'RUN TESTS'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {unitTests.map((t) => (
              <div key={t.id} className="p-3 bg-slate-900/20 border border-slate-850 hover:border-slate-800 rounded-xl flex items-center justify-between transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold bg-slate-850 px-1.5 py-0.2 rounded text-slate-400 border border-slate-750">
                      {t.file}
                    </span>
                    <span className="text-xs text-slate-100 font-medium">{t.name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Runner: Node-Jest Core v29.4
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  {t.duration && <span className="text-slate-600">{t.duration}</span>}
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                    t.status === 'passed' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20' :
                    t.status === 'failed' ? 'bg-rose-950/30 text-rose-400 border border-rose-500/20' :
                    t.status === 'running' ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-500/20 animate-pulse' :
                    'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'config' && (
        <div className="flex-1 p-4 flex flex-col space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Continuous Integration Configuration (.yml)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Format: YAML syntax</span>
          </div>

          <textarea
            value={workflowYml}
            onChange={(e) => setWorkflowYml(e.target.value)}
            className="flex-1 bg-[#070b13] border border-slate-850 p-4 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 leading-relaxed resize-none h-80 min-h-[300px]"
          />
        </div>
      )}
    </div>
  );
}
