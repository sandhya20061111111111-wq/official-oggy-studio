import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, Play, Terminal, Server, BarChart3, Database, Sparkles, Zap, ArrowRight, RefreshCw, Layers } from 'lucide-react';

interface GatewayRoute {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: string;
  active: boolean;
}

interface RequestLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  latency: string;
}

export default function GatewayModule() {
  const [activeSubTab, setActiveSubTab] = useState<'routes' | 'analytics'>('routes');
  const [routes, setRoutes] = useState<GatewayRoute[]>([
    { id: 'r1', path: '/api/v1/health', method: 'GET', handler: 'index.js', active: true },
    { id: 'r2', path: '/api/v1/users', method: 'GET', handler: 'index.js', active: true },
    { id: 'r3', path: '/api/v1/projects', method: 'GET', handler: 'index.js', active: true },
    { id: 'r4', path: '/api/v1/auth/session', method: 'POST', handler: 'auth.js', active: false },
  ]);

  // Route creator state
  const [newPath, setNewPath] = useState('');
  const [newMethod, setNewMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [newHandler, setNewHandler] = useState('index.js');
  const [statusMsg, setStatusMsg] = useState('');

  // Live analytics state
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([
    { id: 'l1', timestamp: '12:15:30', method: 'GET', path: '/api/v1/health', status: 200, latency: '12ms' },
    { id: 'l2', timestamp: '12:15:32', method: 'GET', path: '/api/v1/users', status: 200, latency: '24ms' },
    { id: 'l3', timestamp: '12:15:35', method: 'POST', path: '/api/v1/auth/session', status: 201, latency: '45ms' },
  ]);

  const [totalRequests, setTotalRequests] = useState(1480);
  const [avgLatency, setAvgLatency] = useState(18);
  const [bandwidth, setBandwidth] = useState(4.2);

  // SVG Chart points representation
  const [chartData, setChartData] = useState<number[]>([15, 24, 18, 35, 42, 28, 45, 52, 60, 48, 55, 68]);

  // Simulate incoming live endpoint requests
  useEffect(() => {
    const timer = setInterval(() => {
      const activeRoutes = routes.filter(r => r.active);
      if (activeRoutes.length === 0) return;

      const randomRoute = activeRoutes[Math.floor(Math.random() * activeRoutes.length)];
      const randomLatency = Math.round(10 + Math.random() * 40);
      const isOk = Math.random() > 0.05; // 95% pass rate
      const status = isOk ? (randomRoute.method === 'POST' ? 201 : 200) : 500;

      const newLog: RequestLog = {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        method: randomRoute.method,
        path: randomRoute.path,
        status,
        latency: `${randomLatency}ms`,
      };

      setRequestLogs(prev => [newLog, ...prev.slice(0, 15)]);
      setTotalRequests(prev => prev + 1);
      setAvgLatency(prev => Math.round((prev * 9 + randomLatency) / 10));
      setBandwidth(prev => parseFloat((prev + 0.02).toFixed(2)));

      // Add point to chart data
      setChartData(prev => [...prev.slice(1), randomLatency]);
    }, 3000);

    return () => clearInterval(timer);
  }, [routes]);

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath.trim()) return;

    const formattedPath = newPath.startsWith('/') ? newPath : `/${newPath}`;
    const duplicate = routes.find(r => r.path === formattedPath && r.method === newMethod);
    if (duplicate) {
      alert('A route with this path and HTTP Method already exists.');
      return;
    }

    const created: GatewayRoute = {
      id: `r-${Date.now()}`,
      path: formattedPath,
      method: newMethod,
      handler: newHandler,
      active: true,
    };

    setRoutes([...routes, created]);
    setNewPath('');
    setStatusMsg(`Route '${formattedPath}' added and proxy ingress established!`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleToggleRoute = (id: string) => {
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleDeleteRoute = (id: string) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  // Convert chartData to SVG Polyline points
  const getSvgPoints = () => {
    const width = 500;
    const height = 120;
    const padding = 10;
    const stepX = (width - padding * 2) / (chartData.length - 1);
    
    return chartData.map((val, idx) => {
      const x = padding + idx * stepX;
      // Map latency (10 - 100) to height bounds
      const normalizedY = ((val - 10) / (90 - 10)) * (height - padding * 2);
      const y = height - padding - normalizedY;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div id="gateway-module-container" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Module Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Oggy Serverless API Ingress Gateway <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/20">Phase 7 Active</span>
            </h3>
            <p className="text-xs text-slate-400">Manage proxy endpoints routes mapping, stream microservices files, and audit traffic latency metrics</p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveSubTab('routes')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              activeSubTab === 'routes' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ROUTES CONFIG
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              activeSubTab === 'analytics' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LIVE ANALYTICS
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-950/20 border-b border-emerald-500/20 text-emerald-400 text-xs px-4 py-2 font-mono">
          ✓ {statusMsg}
        </div>
      )}

      {activeSubTab === 'routes' && (
        <div className="flex-1 flex min-h-0">
          {/* Left panel: Add Route form */}
          <div className="w-80 bg-slate-900/60 border-r border-slate-800 p-4 space-y-4 overflow-y-auto">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Create New Ingress Route
            </span>

            <form onSubmit={handleAddRoute} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-500 block">HTTP Request Method</label>
                <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg">
                  {['GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNewMethod(m as any)}
                      className={`py-1 text-[10px] font-bold font-mono rounded ${
                        newMethod === m ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-500 block">Routing Ingress Path</label>
                <input
                  type="text"
                  placeholder="/api/v1/products..."
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-500 block">Target Sandbox Handler</label>
                <select
                  value={newHandler}
                  onChange={(e) => setNewHandler(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500/50 font-mono"
                >
                  <option value="index.js">index.js</option>
                  <option value="auth.js">auth.js</option>
                  <option value="api.js">api.js</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-all font-mono"
              >
                + Register Route Endpoint
              </button>
            </form>

            <div className="border border-slate-800 bg-slate-950 rounded-xl p-3 text-xs text-slate-400 font-mono space-y-1 leading-normal">
              <span className="font-bold text-[10px] text-slate-300 uppercase block tracking-wider">Gateway Rules</span>
              <div>• Active proxies route incoming queries straight to designated sandbox scripts.</div>
              <div>• Simulators trigger artificial hits periodically.</div>
            </div>
          </div>

          {/* Right panel: Registered routes list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Registered API Ingress Proxies ({routes.length})
            </span>

            <div className="space-y-2.5">
              {routes.map((route) => (
                <div key={route.id} className="p-3 bg-slate-900/30 border border-slate-850 hover:border-slate-800 rounded-xl flex items-center justify-between transition-all">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      route.method === 'GET' ? 'bg-cyan-950/20 text-cyan-400 border-cyan-500/20' :
                      route.method === 'POST' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' :
                      route.method === 'PUT' ? 'bg-amber-950/20 text-amber-400 border-amber-500/20' :
                      'bg-rose-950/20 text-rose-400 border-rose-500/20'
                    }`}>
                      {route.method}
                    </span>
                    <span className="text-xs text-slate-100 font-mono font-bold">{route.path}</span>
                    <span className="text-slate-600 font-mono text-[10px]">|</span>
                    <span className="text-[10px] font-mono text-slate-500">Target: {route.handler}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleRoute(route.id)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border transition-all ${
                        route.active
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      {route.active ? 'LIVE' : 'DISABLED'}
                    </button>

                    <button
                      onClick={() => handleDeleteRoute(route.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'analytics' && (
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Total Request Hits</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">{totalRequests}</span>
              </div>
              <Zap className="w-8 h-8 text-emerald-500/20 animate-pulse" />
            </div>

            <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Avg Latency Time</span>
                <span className="text-2xl font-bold text-cyan-400 font-mono mt-1 block">{avgLatency}ms</span>
              </div>
              <Zap className="w-8 h-8 text-cyan-500/20" />
            </div>

            <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Network Bandwidth</span>
                <span className="text-2xl font-bold text-violet-400 font-mono mt-1 block">{bandwidth} MB</span>
              </div>
              <Server className="w-8 h-8 text-violet-500/20" />
            </div>
          </div>

          {/* SVG Real-time Latency Chart */}
          <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Incoming API Traffic Latency (Real-time Stream)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Status: MONITORING ACTIVE</span>
            </div>

            <div className="bg-slate-950 rounded-xl p-2 border border-slate-850 h-36 flex items-center justify-center relative overflow-hidden">
              <svg viewBox="0 0 500 120" className="w-full h-full">
                {/* Horizontal grid lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeDasharray="3,3" />

                {/* Polyline line graph */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  points={getSvgPoints()}
                />
              </svg>
            </div>
          </div>

          {/* Live Request logs stream list */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" /> Incoming Ingress Request Stream Logs
            </span>

            <div className="bg-[#070b13] border border-slate-850 rounded-xl p-3 h-48 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 text-slate-300">
              {requestLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between hover:bg-slate-900/50 p-1 rounded transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{log.timestamp}</span>
                    <span className={`font-bold ${
                      log.method === 'GET' ? 'text-cyan-400' : 'text-emerald-400'
                    }`}>{log.method}</span>
                    <span className="text-slate-100 font-bold">{log.path}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">Latency: {log.latency}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      log.status === 200 || log.status === 201 ? 'bg-emerald-950/20 text-emerald-400' : 'bg-rose-950/20 text-rose-400'
                    }`}>{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
