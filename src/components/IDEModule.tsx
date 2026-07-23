import React, { useState, useEffect, useRef } from 'react';
import { Folder, File, FilePlus, FolderPlus, Save, Terminal as TermIcon, Play, RefreshCw, GitBranch, ArrowRight, Sparkles, HelpCircle, AlertCircle, X, ChevronRight, ChevronDown } from 'lucide-react';
import { WorkspaceFile, TerminalLine } from '../types';

export default function IDEModule() {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('index.js');
  const [editorContent, setEditorContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // File Creation States
  const [newFileName, setNewFileName] = useState('');
  const [newDirName, setNewDirName] = useState('');
  const [showFileForm, setShowFileForm] = useState(false);
  const [showDirForm, setShowDirForm] = useState(false);

  // Terminal States
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([
    {
      text: 'Oggy Studio Sandbox OS v1.0.0 (Type "help" or execute your scripts)',
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // AI Code Completion States
  const [aiWorking, setAiWorking] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  // Fetch all workspace files
  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch('/api/workspace');
      const data = await response.json();
      if (response.ok && data.files) {
        setFiles(data.files);
        // Set editor state initially
        const currentFile = data.files.find((f: any) => f.path === selectedPath);
        if (currentFile) {
          setEditorContent(currentFile.content);
        }
      }
    } catch (err) {
      console.error('Error fetching workspace files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Update editor content when switching files
  useEffect(() => {
    const file = files.find((f) => f.path === selectedPath);
    if (file) {
      setEditorContent(file.content);
      setAiSuggestion('');
    }
  }, [selectedPath, files]);

  // Save Current File
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/workspace/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: selectedPath, content: editorContent }),
      });
      if (response.ok) {
        // Refresh file tree to update local state
        await fetchFiles();
        addToTerminal(`Successfully saved file: ${selectedPath}`, 'success');
      }
    } catch (err: any) {
      addToTerminal(`Error saving file: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Create File
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName) return;
    try {
      const response = await fetch('/api/workspace/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: newFileName, content: `// Created new file: ${newFileName}\n` }),
      });
      if (response.ok) {
        setNewFileName('');
        setShowFileForm(false);
        await fetchFiles();
        setSelectedPath(newFileName);
        addToTerminal(`Created file: ${newFileName}`, 'success');
      }
    } catch (err: any) {
      addToTerminal(`Error creating file: ${err.message}`, 'error');
    }
  };

  // Create Directory
  const handleCreateDir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirName) return;
    try {
      const response = await fetch('/api/workspace/create-dir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dirPath: newDirName }),
      });
      if (response.ok) {
        setNewDirName('');
        setShowDirForm(false);
        await fetchFiles();
        addToTerminal(`Created directory: ${newDirName}`, 'success');
      }
    } catch (err: any) {
      addToTerminal(`Error creating directory: ${err.message}`, 'error');
    }
  };

  // Delete Selected File
  const handleDeleteFile = async (pathToDelete: string) => {
    if (!confirm(`Are you sure you want to delete ${pathToDelete}?`)) return;
    try {
      const response = await fetch('/api/workspace/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: pathToDelete }),
      });
      if (response.ok) {
        addToTerminal(`Deleted ${pathToDelete}`, 'info');
        await fetchFiles();
        if (selectedPath === pathToDelete) {
          setSelectedPath('index.js');
        }
      }
    } catch (err: any) {
      addToTerminal(`Error deleting file: ${err.message}`, 'error');
    }
  };

  // Execute terminal command
  const runTerminalCommand = async (e?: React.FormEvent, directCmd?: string) => {
    if (e) e.preventDefault();
    const cmd = directCmd || terminalInput;
    if (!cmd.trim()) return;

    const inputLine: TerminalLine = {
      text: `$ ${cmd}`,
      type: 'input',
      timestamp: new Date().toLocaleTimeString(),
    };

    setTerminalHistory((prev) => [...prev, inputLine]);
    if (!directCmd) setTerminalInput('');

    try {
      const response = await fetch('/api/terminal/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.output === '__CLEAR__') {
          setTerminalHistory([]);
        } else {
          setTerminalHistory((prev) => [
            ...prev,
            {
              text: data.output,
              type: data.success ? 'output' : 'error',
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setTerminalHistory((prev) => [
        ...prev,
        {
          text: `Error executing command: ${err.message}`,
          type: 'error',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const addToTerminal = (text: string, type: 'input' | 'output' | 'error' | 'success' | 'info') => {
    setTerminalHistory((prev) => [
      ...prev,
      { text, type, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  // AI Autocomplete Integration
  const handleAIAutocomplete = async () => {
    setAiWorking(true);
    setAiSuggestion('');
    try {
      const response = await fetch('/api/gemini/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeContext: editorContent, fileName: selectedPath }),
      });
      const data = await response.json();
      if (data.suggestion) {
        setAiSuggestion(data.suggestion);
        addToTerminal(`AI Autocomplete suggestion ready for ${selectedPath}`, 'success');
      }
    } catch (err: any) {
      addToTerminal(`AI completion error: ${err.message}`, 'error');
    } finally {
      setAiWorking(false);
    }
  };

  const acceptSuggestion = () => {
    setEditorContent((prev) => prev + aiSuggestion);
    setAiSuggestion('');
  };

  // Code explainer via main chat injector
  const handleAIExplain = async () => {
    addToTerminal(`Requesting AI architectural explanation for ${selectedPath}...`, 'info');
    try {
      const prompt = `Please review this code for file "${selectedPath}" and explain how it operates, identifying any bugs or improvements:\n\n${editorContent}`;
      // Inject to chat logic
      const saved = localStorage.getItem('oggy_chat_messages');
      const messages = saved ? JSON.parse(saved) : [];
      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        text: prompt,
        timestamp: new Date().toLocaleTimeString(),
      };
      localStorage.setItem('oggy_chat_messages', JSON.stringify([...messages, userMsg]));
      // Trigger event or simply notify
      addToTerminal(`Explanation request sent to Oggy AI Assistant. Check the AI Chat tab!`, 'success');
      alert(`Sent analysis prompt for '${selectedPath}' to Oggy AI Assistant. Switch to the AI tab to view the live feedback!`);
    } catch (err: any) {
      addToTerminal(`Failed to send code review: ${err.message}`, 'error');
    }
  };

  // Auto-scroll terminal
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  // Line numbers calculation
  const lineCount = editorContent.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  return (
    <div id="ide-module-container" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Upper Module Panel - File Tree & Main Editor */}
      <div className="flex-1 flex min-h-0">
        
        {/* Workspace Sidebar - File explorer */}
        <div className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-400 flex items-center gap-2 uppercase">
              <Folder className="w-3.5 h-3.5 text-cyan-400" /> workspace explorer
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setShowFileForm(!showFileForm); setShowDirForm(false); }}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded transition-all"
                title="Create New File"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setShowDirForm(!showDirForm); setShowFileForm(false); }}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded transition-all"
                title="Create New Directory"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={fetchFiles}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-all"
                title="Refresh File Explorer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Creation Forms */}
          {showFileForm && (
            <form onSubmit={handleCreateFile} className="p-3 border-b border-slate-800 bg-slate-950/20 flex gap-1">
              <input
                type="text"
                placeholder="filename.js..."
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                autoFocus
              />
              <button type="submit" className="px-2 py-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded text-xs">
                +
              </button>
            </form>
          )}

          {showDirForm && (
            <form onSubmit={handleCreateDir} className="p-3 border-b border-slate-800 bg-slate-950/20 flex gap-1">
              <input
                type="text"
                placeholder="folder_name..."
                value={newDirName}
                onChange={(e) => setNewDirName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                autoFocus
              />
              <button type="submit" className="px-2 py-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded text-xs">
                +
              </button>
            </form>
          )}

          {/* Directory Tree rendering */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoadingFiles ? (
              <div className="text-center py-4 text-xs text-slate-500 font-mono animate-pulse">
                Scanning disk tree...
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500 font-mono px-2">
                Workspace directory empty. Create your first file above.
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.path}
                  onClick={() => !file.isDir && setSelectedPath(file.path)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all select-none text-xs font-mono ${
                    selectedPath === file.path && !file.isDir
                      ? 'bg-slate-800 text-cyan-400 font-bold border border-cyan-500/10'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {file.isDir ? (
                      <Folder className="w-4 h-4 text-amber-500/80 shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{file.path}</span>
                  </div>
                  {!file.isDir && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.path);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded"
                      title="Delete file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Simulated Git integration line */}
          <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1 text-emerald-400">
              <GitBranch className="w-3 h-3" /> main
            </span>
            <span>sync status: ok</span>
          </div>
        </div>

        {/* Core Code Editor */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {/* Editor Header Panel */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono border border-slate-700/50">
                EDITING
              </span>
              <span className="text-xs font-mono font-bold text-slate-100">{selectedPath}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAIAutocomplete}
                disabled={aiWorking}
                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-violet-600 hover:bg-violet-700 text-slate-100 rounded-md transition-all font-mono font-semibold"
                title="Suggest lines of code via Gemini model"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                {aiWorking ? 'COMPLETING...' : 'AI AUTOCOMPLETE'}
              </button>
              <button
                onClick={handleAIExplain}
                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700 rounded-md transition-all font-mono"
                title="Analyze and explain code structure"
              >
                <HelpCircle className="w-3.5 h-3.5" /> EXPLAIN
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1 text-xs bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-md font-bold transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'SAVING...' : 'SAVE'}
              </button>
            </div>
          </div>

          {/* Code Workspace Editor Layout */}
          <div className="flex-1 flex font-mono text-sm relative overflow-hidden bg-[#0a0f1d]">
            {/* Left side line numbers counter */}
            <div className="w-12 bg-slate-950/40 text-right pr-3 select-none py-3 border-r border-slate-800/40 text-slate-600 leading-6">
              {lineNumbers.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>

            {/* Editing Box */}
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="flex-1 bg-transparent text-slate-200 outline-none p-3 resize-none leading-6 overflow-y-auto font-mono text-xs focus:ring-0 placeholder-slate-700"
              spellCheck={false}
              placeholder="// Write your code or execute script outputs here..."
            />

            {/* AI Floating Autocomplete suggestions card */}
            {aiSuggestion && (
              <div className="absolute bottom-4 right-4 max-w-md bg-slate-900 border border-violet-500/40 shadow-2xl rounded-lg p-3 z-20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-violet-400 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-pulse" /> Gemini code Suggestion
                  </span>
                  <button onClick={() => setAiSuggestion('')} className="text-slate-400 hover:text-rose-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <pre className="bg-slate-950 p-2 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800 mb-2 leading-relaxed">
                  {aiSuggestion}
                </pre>
                <button
                  onClick={acceptSuggestion}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-slate-100 font-bold text-[11px] py-1 rounded-md transition-all uppercase tracking-wider"
                >
                  Accept & Insert
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Lower Terminal and Preview Bar */}
      <div className="h-64 border-t border-slate-800 flex">
        
        {/* Terminal Side */}
        <div className="flex-1 flex flex-col bg-slate-950">
          <div className="p-2 border-b border-slate-800/80 bg-slate-900 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <TermIcon className="w-4 h-4 text-cyan-400" /> SYSTEM OS TERMINAL
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono">QUICK RUNS:</span>
              <button
                onClick={(e) => runTerminalCommand(e, 'node index.js')}
                className="bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded border border-slate-700 transition-all"
              >
                node index.js
              </button>
              <button
                onClick={(e) => runTerminalCommand(e, 'npm run test')}
                className="bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 px-2 py-0.5 rounded border border-slate-700 transition-all"
              >
                run tests
              </button>
              <button
                onClick={(e) => runTerminalCommand(e, 'git status')}
                className="bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 px-2 py-0.5 rounded border border-slate-700 transition-all"
              >
                git status
              </button>
            </div>
          </div>

          {/* Console Logger lines */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 bg-[#070b13] text-slate-300 select-text">
            {terminalHistory.map((line, idx) => (
              <div
                key={idx}
                className={`whitespace-pre-wrap leading-relaxed ${
                  line.type === 'input'
                    ? 'text-cyan-400'
                    : line.type === 'error'
                    ? 'text-rose-400'
                    : line.type === 'success'
                    ? 'text-emerald-400 font-bold'
                    : line.type === 'info'
                    ? 'text-violet-400'
                    : 'text-slate-300'
                }`}
              >
                {line.text}
              </div>
            ))}
            <div ref={terminalBottomRef} />
          </div>

          {/* Terminal input line */}
          <form onSubmit={(e) => runTerminalCommand(e)} className="flex items-center border-t border-slate-800/60 bg-slate-950 p-2 gap-2">
            <span className="text-cyan-400 text-xs font-mono font-bold select-none pl-1">$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="Execute command e.g. node index.js or type help..."
              className="flex-1 bg-transparent text-slate-200 outline-none font-mono text-xs"
            />
            <button type="submit" className="text-slate-500 hover:text-cyan-400 transition-all">
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Live Simulator Preview Side */}
        <div className="w-80 border-l border-slate-800 bg-slate-900/40 flex flex-col">
          <div className="p-2 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Play className="w-4 h-4 text-emerald-400" /> BROWSER PREVIEW
            </span>
          </div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center bg-[#070b13]/60 relative">
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="bg-slate-850 p-4 border border-slate-800 rounded-xl max-w-xs shadow-xl">
              <h5 className="text-xs font-bold text-slate-200 font-mono mb-1">Sandbox Live Ingress</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Your workspace app compiles on the fly. Ingress binds to local container port 3000.
              </p>
              <button
                onClick={(e) => runTerminalCommand(e, 'node index.js')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs transition-all uppercase tracking-wider"
              >
                Compile & Run
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
