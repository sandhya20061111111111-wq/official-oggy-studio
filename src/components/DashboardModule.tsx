import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Terminal, RefreshCw, Layers, CheckCircle } from 'lucide-react';
import { SystemMetric } from '../types';

export default function DashboardModule() {
  const [metrics, setMetrics] = useState<{
    cpu: number;
    ram: number;
    storage: number;
    activeProjects: number;
    requestCount: number;
    processes: any[];
  }>({
    cpu: 12,
    ram: 42,
    storage: 68,
    activeProjects: 3,
    requestCount: 412,
    processes: [],
  });

  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] System booted successfully`,
    `[${new Date().toLocaleTimeString()}] Ingress reverse proxy routing established on port 3000`,
    `[${new Date().toLocaleTimeString()}] SQLite sandboxed instance initialized and seeding complete`,
    `[${new Date().toLocaleTimeString()}] AI daemon connected successfully to Gemini 3.5 model`,
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system/metrics');
      const data = await response.json();
      if (response.ok) {
        setMetrics(data);
        // Add random server-level log lines to simulate active usage
        const activities = [
          `File index.js changed in workspace - reloading watchers`,
          `API query submitted to sqlite-sandbox-instance`,
          `Ingress proxy metrics flushed successfully`,
          `Gemini auto-complete query generated (tokens: 142)`,
          `Cleaned memory cache threads successfully`
        ];
        const randomAct = activities[Math.floor(Math.random() * activities.length)];
        setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${randomAct}`, ...prev.slice(0, 15)]);
      }
    } catch (err) {
      console.error('Error fetching dashboard system metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="dashboard-module-container" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Module Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Oggy System Performance Dashboard <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-0.5 rounded border border-cyan-500/20">Operational</span>
            </h3>
            <p className="text-xs text-slate-400">Real-time container loads, metrics trackers, active processes, and system logs</p>
          </div>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Stats metrics grids */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Real-time SVG Circular Progress Metrics */}
        <div className="grid grid-cols-3 gap-4">
          
          {/* CPU Card */}
          <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-all">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-95">
                <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#22d3ee"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="175"
                  strokeDashoffset={175 - (175 * metrics.cpu) / 100}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute font-mono text-xs font-bold text-slate-100">{metrics.cpu}%</div>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU load
              </span>
              <p className="text-xs text-slate-300 font-bold mt-0.5">Sandboxed VM Threads</p>
              <span className="text-[10px] text-emerald-400 font-mono">Core Load: Stable</span>
            </div>
          </div>

          {/* RAM Card */}
          <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-all">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-95">
                <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#a78bfa"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="175"
                  strokeDashoffset={175 - (175 * metrics.ram) / 100}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute font-mono text-xs font-bold text-slate-100">{metrics.ram}%</div>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-violet-400" /> Memory allocation
              </span>
              <p className="text-xs text-slate-300 font-bold mt-0.5">Active NodeJS Heap</p>
              <span className="text-[10px] text-slate-400 font-mono">Limit: 1.5 GB Max</span>
            </div>
          </div>

          {/* Disk Card */}
          <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-all">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-95">
                <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#10b981"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="175"
                  strokeDashoffset={175 - (175 * metrics.storage) / 100}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute font-mono text-xs font-bold text-slate-100">{metrics.storage}%</div>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Container disk
              </span>
              <p className="text-xs text-slate-300 font-bold mt-0.5">Workspace Files</p>
              <span className="text-[10px] text-slate-400 font-mono">Ingress Cap: 10 GB</span>
            </div>
          </div>

        </div>

        {/* Process list table and Log Monitor Split layouts */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Interactive Process list */}
          <div className="border border-slate-800 rounded-xl bg-slate-900/20 overflow-hidden flex flex-col">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" /> Active Sandbox Threading Pools
              </span>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400">
                    <th className="p-2.5 text-[10px]">PID</th>
                    <th className="p-2.5 text-[10px]">PROCESS</th>
                    <th className="p-2.5 text-[10px] text-right">CPU</th>
                    <th className="p-2.5 text-[10px] text-right">MEM</th>
                    <th className="p-2.5 text-[10px] text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.processes.map((p) => (
                    <tr key={p.pid} className="border-b border-slate-850 hover:bg-slate-900/40 last:border-none">
                      <td className="p-2.5 text-slate-400">{p.pid}</td>
                      <td className="p-2.5 text-slate-200 font-bold">{p.name}</td>
                      <td className="p-2.5 text-slate-300 text-right">{p.cpu}%</td>
                      <td className="p-2.5 text-slate-300 text-right">{p.ram}</td>
                      <td className="p-2.5 text-center">
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-mono">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System event logs Monitor terminal */}
          <div className="border border-slate-800 rounded-xl bg-slate-900/20 overflow-hidden flex flex-col">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" /> LIVE CONTAINER EVENT LOGGER
              </span>
            </div>
            <div className="flex-1 p-3 font-mono text-[10px] leading-relaxed text-slate-400 bg-[#070b13] overflow-y-auto space-y-1.5 h-64 max-h-64 select-text">
              {logs.map((log, idx) => (
                <div key={idx} className="hover:text-slate-100 flex gap-2">
                  <span className="text-emerald-500/70 shrink-0">►</span>
                  <span className="whitespace-pre-wrap">{log}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
