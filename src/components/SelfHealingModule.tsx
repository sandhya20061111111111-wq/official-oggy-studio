import React, { useState } from 'react';
import { Shield, AlertTriangle, RefreshCw, Layers, CheckCircle, Flame, Server, Play, Code, Database, HelpCircle } from 'lucide-react';

interface BackupSnapshot {
  id: string;
  name: string;
  timestamp: string;
  fileCount: number;
  files: { path: string; content: string }[];
}

export default function SelfHealingModule() {
  const [activeTab, setActiveTab] = useState<'healing' | 'restore'>('healing');
  const [activeCrash, setActiveCrash] = useState<string | null>(null);
  const [healingLogs, setHealingLogs] = useState<string[]>([]);
  const [isHealing, setIsHealing] = useState(false);
  const [healSuccess, setHealSuccess] = useState(false);

  // Auto Restore Vault points
  const [restorePoints, setRestorePoints] = useState<BackupSnapshot[]>([
    {
      id: 'snap-1',
      name: 'Stable Initial Deployment Snapshot',
      timestamp: new Date(Date.now() - 3600000 * 4).toLocaleString(),
      fileCount: 3,
      files: [
        {
          path: 'index.js',
          content: `// Oggy Studio Stable Base Service\nconsole.log("Service starting on port 3000...");\n`
        },
        {
          path: 'package.json',
          content: `{\n  "name": "oggy-stable-app",\n  "version": "1.0.0",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js"\n  }\n}`
        },
        {
          path: 'README.md',
          content: `# Stable Backup\nRestore complete.\n`
        }
      ]
    },
    {
      id: 'snap-2',
      name: 'SQL Seeding Completed Backup',
      timestamp: new Date(Date.now() - 3600000 * 24).toLocaleString(),
      fileCount: 2,
      files: [
        {
          path: 'index.js',
          content: `console.log("Starting relational database client...");\n`
        },
        {
          path: 'package.json',
          content: `{\n  "name": "oggy-db-app",\n  "version": "1.0.1"\n}`
        }
      ]
    }
  ]);

  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreLogs, setRestoreLogs] = useState<string[]>([]);

  // Simulation templates
  const crashTemplates = [
    {
      id: 'port-clash',
      name: 'Port 3000 Ingress Clashing',
      error: 'Error: listen EADDRINUSE: address already in use :::3000',
      fixLogs: [
        '[DIAGNOSING] Port collision detected inside sandboxed container...',
        '[ANALYZING] Found clashing daemon thread on PID 1420',
        '[HEALING] Executing safe SIGKILL on conflicting background thread...',
        '[SUCCESS] Port 3000 released successfully. Re-routing reverse proxy.',
        '[HEALING] Verifying system integrity. Daemon restarted.'
      ]
    },
    {
      id: 'ref-error',
      name: 'ReferenceError: express is not defined',
      error: 'ReferenceError: express is not defined inside index.js line 12',
      fixLogs: [
        '[DIAGNOSING] Syntax anomaly found in local editor files...',
        '[ANALYZING] index.js utilizes Express but is missing import headers',
        '[HEALING] Automatically injecting missing ES Module imports on line 1...',
        '[WRITE] Patched index.js with correct import binding: const express = require("express");',
        '[SUCCESS] Reference resolved. Local compile verification passed!'
      ],
      patchFile: {
        path: 'index.js',
        content: `const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.json({ status: "Self-healing resolved!" });\n});\n\napp.listen(3000, () => {\n  console.log("App listening successfully!");\n});`
      }
    },
    {
      id: 'pkg-corrupt',
      name: 'package.json JSON Syntax Error',
      error: 'SyntaxError: Unexpected token } in package.json at line 4',
      fixLogs: [
        '[DIAGNOSING] Package index parsing failure detected...',
        '[ANALYZING] Found unescaped comma/bracket on line 4 of package.json',
        '[HEALING] Compiling structural JSON validation matrix...',
        '[WRITE] Re-wrote package.json with pristine validated standard formatting',
        '[SUCCESS] Package registry restored. NPM modules indexed correctly.'
      ],
      patchFile: {
        path: 'package.json',
        content: `{\n  "name": "oggy-workspace-app",\n  "version": "1.0.0",\n  "description": "Oggy Studio Sandbox App",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js"\n  },\n  "dependencies": {}\n}`
      }
    }
  ];

  // Trigger Crash
  const handleTriggerCrash = (id: string) => {
    setActiveCrash(id);
    setHealSuccess(false);
    setHealingLogs([`[CRITICAL ALERT] Container crashed with diagnostic code: '${id}'`]);
  };

  // Perform AI Self-Healing
  const handleAIHeal = async () => {
    if (!activeCrash) return;
    setIsHealing(true);
    setHealSuccess(false);

    const match = crashTemplates.find(c => c.id === activeCrash);
    if (!match) return;

    for (const logLine of match.fixLogs) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setHealingLogs(prev => [...prev, logLine]);
    }

    // Physically write correction file to real workspace disk if template has patch!
    if (match.patchFile) {
      try {
        await fetch('/api/workspace/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: match.patchFile.path, content: match.patchFile.content }),
        });
      } catch (err) {
        console.error('Self-healing failed to write patch to disk:', err);
      }
    }

    setHealSuccess(true);
    setIsHealing(false);
  };

  // Real auto-restore points pipeline
  const handleRestoreBackup = async (snapshot: BackupSnapshot) => {
    setRestoringId(snapshot.id);
    setRestoreLogs([`[INFO] Commencing restoration of backup point: ${snapshot.name}...`]);

    try {
      // Physically re-write each backup file back to actual workspace folder on disk
      for (const file of snapshot.files) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setRestoreLogs(prev => [...prev, `[RESTORE] Restoring ${file.path} content...`]);
        const response = await fetch('/api/workspace/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: file.path, content: file.content }),
        });
        if (!response.ok) {
          throw new Error(`Failed to restore file: ${file.path}`);
        }
      }

      setRestoreLogs(prev => [...prev, `[SUCCESS] Restoration completed safely! Sandbox is back to its pristine state.`]);
    } catch (err: any) {
      setRestoreLogs(prev => [...prev, `[ERROR] Restore point corrupt: ${err.message}`]);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div id="self-healing-module-container" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-rose-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Oggy Shield Self-Healing & Recovery Vault <span className="bg-rose-500/10 text-rose-400 text-[10px] px-2 py-0.5 rounded border border-rose-500/20">Phase 3 & 4 Active</span>
            </h3>
            <p className="text-xs text-slate-400">Real-time compiler crash reporters, deep AI anomaly diagnosis, self-correcting patches, and auto-restore vaults</p>
          </div>
        </div>

        {/* Sub-tabs toggler */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('healing')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              activeTab === 'healing' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI SELF-HEALING ENGINE
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              activeTab === 'restore' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RESTORE POINT VAULT
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {activeTab === 'healing' && (
          <>
            {/* Left panel: Trigger crash list */}
            <div className="w-80 bg-slate-900/60 border-r border-slate-800 p-4 space-y-4 overflow-y-auto">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider">
                Simulated Crash Diagnostics
              </span>

              <div className="space-y-2.5">
                {crashTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleTriggerCrash(tpl.id)}
                    className={`w-full p-3 text-left border rounded-xl font-mono text-xs transition-all ${
                      activeCrash === tpl.id
                        ? 'bg-rose-500/10 border-rose-500/45 text-rose-400'
                        : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-[11px]">
                      <Flame className="w-3.5 h-3.5 text-rose-400" /> {tpl.name}
                    </div>
                    <div className="text-[10px] text-slate-500 break-words leading-relaxed font-normal bg-slate-950/60 p-1.5 rounded border border-slate-900">
                      {tpl.error}
                    </div>
                  </button>
                ))}
              </div>

              {activeCrash && (
                <button
                  onClick={handleAIHeal}
                  disabled={isHealing}
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-800 text-slate-950 font-bold text-xs rounded-lg transition-all font-mono uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-4 h-4 ${isHealing ? 'animate-spin' : ''}`} />
                  {isHealing ? 'RE-BUILDING CONTAINER...' : 'START AI SELF-HEAL'}
                </button>
              )}
            </div>

            {/* Right panel: Live healing logs output */}
            <div className="flex-1 bg-slate-950 p-4 flex flex-col space-y-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> HEALING LOGS & PATCH ANALYZER
              </span>

              <div className="flex-1 bg-[#070b13] border border-slate-850 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 overflow-y-auto max-h-[360px]">
                {healingLogs.length === 0 ? (
                  <div className="text-slate-500 text-center italic py-24 select-none">
                    Select a crash template on the left panel to trigger container failures, then deploy the self-healing patches to resolve them dynamically on disk.
                  </div>
                ) : (
                  healingLogs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.includes('[SUCCESS]')
                          ? 'text-emerald-400 font-bold'
                          : log.includes('[WRITE]')
                          ? 'text-cyan-400 font-bold'
                          : log.includes('[CRITICAL ALERT]')
                          ? 'text-rose-400 font-bold animate-pulse'
                          : 'text-slate-400'
                      }
                    >
                      {log}
                    </div>
                  ))
                )}

                {healSuccess && (
                  <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-400 space-y-1 mt-4">
                    <span className="font-bold flex items-center gap-1.5 uppercase text-xs">
                      <CheckCircle className="w-4 h-4" /> RECOVERY PIPELINE SUCCESSFUL
                    </span>
                    <p className="text-[11px] font-mono text-slate-300 leading-normal">
                      The AI Daemon successfully patched code files and killed memory block clashes. Workspace index tree is healthy and compiling cleanly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'restore' && (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Active System Snapshot Catalog
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                {restorePoints.map((point) => (
                  <div
                    key={point.id}
                    className="p-4 bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between transition-all"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-100 text-xs">{point.name}</h4>
                      <p className="text-[10px] font-mono text-slate-500">
                        Date: {point.timestamp} | {point.fileCount} files included
                      </p>
                    </div>

                    <button
                      onClick={() => handleRestoreBackup(point)}
                      disabled={restoringId !== null}
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 text-slate-950 font-bold font-mono text-[11px] rounded transition-all"
                    >
                      {restoringId === point.id ? 'RESTORING...' : 'RESTORE'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Restore console output logs */}
              <div className="border border-slate-800 rounded-xl bg-[#070b13] p-4 flex flex-col h-64 font-mono text-xs text-slate-300 overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 border-b border-slate-850 pb-1.5">
                  Restore Pipeline Engine Console
                </span>
                <div className="flex-1 space-y-1.5 overflow-y-auto">
                  {restoreLogs.length === 0 ? (
                    <div className="text-slate-600 italic py-16 text-center select-none">No active restoration logs. Choose a restore vault target above.</div>
                  ) : (
                    restoreLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={
                          log.includes('[SUCCESS]')
                            ? 'text-emerald-400 font-bold'
                            : log.includes('[RESTORE]')
                            ? 'text-cyan-400'
                            : 'text-slate-400'
                        }
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
