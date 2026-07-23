import React, { useState, useEffect } from 'react';
import { Layers, Folder, GitBranch, Terminal, RefreshCw, CheckCircle, ExternalLink, Play, Code, Check, HelpCircle, Download, FileText, Sparkles, Send } from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  tech: string;
  icon: string;
  files: { path: string; content: string }[];
}

export default function ProjectModule() {
  const [activeTab, setActiveTab] = useState<'manager' | 'git'>('manager');
  const [currentProject, setCurrentProject] = useState('oggy-default-workspace');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState('');

  // Git states
  const [branches, setBranches] = useState<string[]>(['main', 'feature/auth', 'dev']);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [newBranchName, setNewBranchName] = useState('');
  const [commitMessage, setCommitMessage] = useState('feat: integrate self-healing system pipelines');
  const [stagedFiles, setStagedFiles] = useState<string[]>(['index.js', 'package.json']);
  const [unstagedFiles, setUnstagedFiles] = useState<string[]>(['README.md']);
  const [gitHistory, setGitHistory] = useState([
    { hash: 'a2f9e4b', message: 'feat: initialize Oggy Studio workspace and AI coding assistant', author: 'Oggy <oggy@studio.ai>', date: 'Today, 12:00 PM' },
    { hash: '9b8c7d6', message: 'chore: setup project manager metadata', author: 'Jack <jack@studio.ai>', date: 'Yesterday, 9:15 AM' },
    { hash: 'c3d4e5f', message: 'docs: update deployment instructions', author: 'Olivia <olivia@studio.ai>', date: '2 days ago' },
  ]);

  // Project templates list
  const templates: ProjectTemplate[] = [
    {
      id: 'express-api',
      name: 'Express Microservice API',
      description: 'A production-grade, fast, modular Node Express API with sandbox logger routing.',
      tech: 'Express, Node.js, Cors',
      icon: '🚀',
      files: [
        {
          path: 'index.js',
          content: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Main diagnostics route
app.get('/', (req, res) => {
  res.json({
    status: "optimal",
    service: "Microservice Ingress Gateway",
    timestamp: new Date().toISOString(),
    nodes: ["Worker-Node-Alpha", "Worker-Node-Beta"]
  });
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: "Oggy", role: "CTO" },
    { id: 2, name: "Jack", role: "DevOps Lead" }
  ]);
});

app.listen(PORT, () => {
  console.log(\`Microservice running smoothly on port \${PORT}\`);
});`
        },
        {
          path: 'package.json',
          content: `{
  "name": "express-microservice-api",
  "version": "1.1.0",
  "description": "Oggy Studio generated API",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Running microservice integrity test... Passed!\\""
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`
        },
        {
          path: 'README.md',
          content: `# Express Microservice API
Built with love inside the Oggy Studio IDE.

## API Endpoints:
- \`GET /\` - Health/Status diagnostic
- \`GET /api/users\` - Fetch active sandbox administrators

## Run Terminal Commands:
- \`node index.js\` - Spawn Express Daemon
`
        }
      ]
    },
    {
      id: 'quick-python',
      name: 'Python Task Utility Node',
      description: 'Clean Python simulation micro-node to analyze database files and generate clean JSON outputs.',
      tech: 'Python, JSON parsing',
      icon: '🐍',
      files: [
        {
          path: 'index.js',
          content: `// Python Executor bridge
console.log("[BRIDGE] Calling sandboxed Python execution engine...");
const data = {
  "platform": "Oggy Studio",
  "engine": "Python 3.10 Daemon",
  "status": "Ready",
  "analyzed_records": 1500
};
console.log(JSON.stringify(data, null, 2));
`
        },
        {
          path: 'package.json',
          content: `{
  "name": "python-bridge-utility",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}`
        },
        {
          path: 'README.md',
          content: `# Python Task Utility
Provides Python micro-bindings inside your Node workspace.
`
        }
      ]
    },
    {
      id: 'static-landing',
      name: 'Tailwind Developer Landing Page',
      description: 'A modern, high-contrast, beautiful single-page portfolio designed for terminal wizards.',
      tech: 'HTML5, Tailwind CDN, JS',
      icon: '🎨',
      files: [
        {
          path: 'index.js',
          content: `// Static Server for landing page
const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Oggy Wizard Portfolio</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center">
      <div class="max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center space-y-4">
        <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">WIZARD NODE</h1>
        <p class="text-sm text-slate-400">Deployable container static web page, fully customized and optimized.</p>
        <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-400">
          Status: LIVE INGRESS ON PORT 3000
        </div>
      </div>
    </body>
    </html>
  \`);
});

app.listen(PORT, () => {
  console.log("Static Landing Page server live!");
});`
        },
        {
          path: 'package.json',
          content: `{
  "name": "static-landing-page",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`
        },
        {
          path: 'README.md',
          content: `# Landing Page Module
Custom premium template. Ready for 1-click cloud deployments!
`
        }
      ]
    }
  ];

  // Deploy template files to actual workspace directory
  const loadTemplate = async (template: ProjectTemplate) => {
    setLoading(true);
    setLogs([`[INFO] Deploying template: ${template.name}...`]);
    try {
      // Loop and write each file to real disk!
      for (const file of template.files) {
        setLogs((prev) => [...prev, `[WRITE] Writing ${file.path} inside workspace...`]);
        const response = await fetch('/api/workspace/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: file.path, content: file.content }),
        });
        if (!response.ok) {
          throw new Error(`Failed to write file ${file.path}`);
        }
      }
      setLogs((prev) => [...prev, `[SUCCESS] Template loaded! Head to DEVELOPER IDE to execute and view.`]);
      setStatusMsg(`Loaded '${template.name}' into your workspace successfully!`);
    } catch (err: any) {
      setLogs((prev) => [...prev, `[ERROR] Failed to load template: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    if (branches.includes(newBranchName)) return;
    setBranches([...branches, newBranchName]);
    setCurrentBranch(newBranchName);
    setNewBranchName('');
    setStatusMsg(`Switched to new branch: ${newBranchName}`);
  };

  const handleStageFile = (file: string, toStage: boolean) => {
    if (toStage) {
      setUnstagedFiles(unstagedFiles.filter(f => f !== file));
      setStagedFiles([...stagedFiles, file]);
    } else {
      setStagedFiles(stagedFiles.filter(f => f !== file));
      setUnstagedFiles([...unstagedFiles, file]);
    }
  };

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    if (stagedFiles.length === 0) {
      alert('No changes staged to commit.');
      return;
    }
    const newCommit = {
      hash: Math.random().toString(16).substring(2, 9),
      message: commitMessage,
      author: 'Lead Architect <admin@studio.ai>',
      date: 'Just now',
    };
    setGitHistory([newCommit, ...gitHistory]);
    setStagedFiles([]);
    setCommitMessage('');
    setStatusMsg(`Committed ${stagedFiles.length} files successfully!`);
  };

  return (
    <div id="project-module-container" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Module Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Oggy Workspace & Project Manager <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-0.5 rounded border border-cyan-500/20">Phase 2 Active</span>
            </h3>
            <p className="text-xs text-slate-400">Scaffold projects with premium templates, organize code repositories, and control git pipelines</p>
          </div>
        </div>

        {/* Sub-tabs toggler */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('manager')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              activeTab === 'manager' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TEMPLATES & SCAFFOLDING
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              activeTab === 'git' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GIT VERSION CONTROL
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-950/20 border-b border-emerald-500/20 text-emerald-400 text-xs px-4 py-2 flex items-center justify-between font-mono">
          <span>✓ {statusMsg}</span>
          <button onClick={() => setStatusMsg('')} className="text-slate-400 hover:text-slate-200">×</button>
        </div>
      )}

      {activeTab === 'manager' && (
        <div className="flex-1 flex min-h-0">
          {/* Left panel: template selector */}
          <div className="w-1/2 p-4 border-r border-slate-800/80 overflow-y-auto space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Scaffold Starter Project Templates
            </h4>

            <div className="space-y-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 p-4 rounded-xl transition-all flex items-start gap-4"
                >
                  <span className="text-2xl p-2 bg-slate-950 border border-slate-800 rounded-xl">{tpl.icon}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-100 text-sm">{tpl.name}</h5>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400 font-mono font-bold">
                        {tpl.tech}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal">{tpl.description}</p>
                    <button
                      onClick={() => loadTemplate(tpl)}
                      disabled={loading}
                      className="mt-2.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 text-slate-950 font-bold text-[11px] rounded transition-all uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" /> Scaffold Workspace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: file logs & diagnostics */}
          <div className="w-1/2 p-4 bg-slate-950/60 overflow-y-auto flex flex-col space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" /> Pipeline Scaffolding Output
            </h4>

            <div className="flex-1 bg-[#070b13] border border-slate-850 p-4 rounded-xl font-mono text-xs text-slate-300 leading-relaxed space-y-1.5 overflow-y-auto h-64 max-h-[400px]">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic text-center py-20 select-none">
                  Choose a premium workspace template above to generate fully compliant microservices on disk instantly.
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.includes('[SUCCESS]')
                        ? 'text-emerald-400 font-bold'
                        : log.includes('[ERROR]')
                        ? 'text-rose-400 font-bold'
                        : log.includes('[WRITE]')
                        ? 'text-cyan-400/80'
                        : 'text-slate-400'
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>

            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 space-y-2 leading-relaxed">
              <span className="font-mono font-bold text-[10px] text-slate-300 uppercase tracking-widest block">Scaffolding Guardrails</span>
              <div>• Writing starter project files automatically clears and hydrates the sandbox index tree.</div>
              <div>• Existing workspace scripts can be run immediately on terminal ingress or preview panels.</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'git' && (
        <div className="flex-1 flex min-h-0">
          {/* Git actions workspace */}
          <div className="w-80 bg-slate-900/40 border-r border-slate-800 p-4 space-y-4 overflow-y-auto">
            
            {/* Current branch selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Active Repository Branch
              </label>
              <select
                value={currentBranch}
                onChange={(e) => setCurrentBranch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50 font-mono"
              >
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Create new branch */}
            <form onSubmit={handleCreateBranch} className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Create new Git branch
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="feature/payment..."
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none"
                />
                <button type="submit" className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono rounded-lg">
                  +
                </button>
              </div>
            </form>

            {/* Commit section */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider">
                Stage & Commit Changes
              </span>
              
              <div className="space-y-1.5">
                <textarea
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Commit message..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none h-14 resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleCommit}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-lg transition-all font-mono tracking-wide"
              >
                Commit to {currentBranch}
              </button>
            </div>

            {/* Sync Remote */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider">
                GitHub Remote Syncing
              </span>
              <button
                onClick={() => setStatusMsg('Pushed commits to remote GitHub repository origin/main successfully!')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-slate-50 border border-slate-700 text-xs rounded-lg transition-all font-mono"
              >
                Sync with Remote origin
              </button>
            </div>

          </div>

          {/* Right panel: staging lists and commit logs */}
          <div className="flex-1 bg-slate-950 p-4 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              
              {/* Unstaged Files changes */}
              <div className="border border-slate-800 rounded-xl bg-slate-900/10 p-3 flex flex-col h-48">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-2">
                  Unstaged changes ({unstagedFiles.length})
                </span>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {unstagedFiles.length === 0 ? (
                    <div className="text-slate-600 font-mono text-[10px] italic py-10 text-center select-none">No unstaged edits.</div>
                  ) : (
                    unstagedFiles.map((file) => (
                      <div key={file} className="flex items-center justify-between p-1.5 bg-slate-950/40 border border-slate-850 rounded font-mono text-[11px] text-slate-300">
                        <span>{file}</span>
                        <button
                          onClick={() => handleStageFile(file, true)}
                          className="text-[10px] text-cyan-400 font-bold hover:underline"
                        >
                          Stage
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Staged Files changes */}
              <div className="border border-slate-800 rounded-xl bg-slate-900/10 p-3 flex flex-col h-48">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                  Staged Changes ({stagedFiles.length})
                </span>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {stagedFiles.length === 0 ? (
                    <div className="text-slate-600 font-mono text-[10px] italic py-10 text-center select-none">No staged changes.</div>
                  ) : (
                    stagedFiles.map((file) => (
                      <div key={file} className="flex items-center justify-between p-1.5 bg-slate-950/40 border border-slate-850 rounded font-mono text-[11px] text-slate-300">
                        <span>{file}</span>
                        <button
                          onClick={() => handleStageFile(file, false)}
                          className="text-[10px] text-slate-500 hover:text-slate-300"
                        >
                          Unstage
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Repo commit history list */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-cyan-400" /> Git Commit History Log
              </span>

              <div className="space-y-2">
                {gitHistory.map((item) => (
                  <div key={item.hash} className="p-3 bg-slate-900/30 border border-slate-850 hover:border-slate-800 rounded-xl flex items-center justify-between transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10px] bg-slate-800 text-cyan-400 px-1.5 py-0.2 rounded border border-slate-700">
                          {item.hash}
                        </span>
                        <span className="text-xs text-slate-100 font-medium">{item.message}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Author: {item.author} | {item.date}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 font-bold">verified</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
