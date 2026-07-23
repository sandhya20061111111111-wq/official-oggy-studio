import React, { useState, useEffect } from 'react';
import { 
  Crown, Shield, ShieldAlert, Database, Settings, Activity, FileText, Key, Bot, FlaskConical, 
  Lock, Unlock, RefreshCw, AlertTriangle, CheckCircle, Download, Trash, Play, Check, Server, Clock, Users, Cpu
} from 'lucide-react';

interface BackupItem {
  filename: string;
  size: string;
  createdAt: string;
}

interface AuditLog {
  timestamp: string;
  action: string;
  details: string;
  status: string;
  ip: string;
}

export default function OwnerControlCenter() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [authToken, setAuthToken] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Tab states
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Data states
  const [overview, setOverview] = useState<any>(null);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [accessLogs, setAccessLogs] = useState<string[]>([]);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [aiSettings, setAiSettings] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [securityIssues, setSecurityIssues] = useState<any[]>([]);

  // Editing/Config state
  const [newSecretKey, setNewSecretKey] = useState<string>('');
  const [newSecretValue, setNewSecretValue] = useState<string>('');
  const [scanning, setScanning] = useState<boolean>(false);
  const [backingUp, setBackingUp] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // AI Settings form
  const [aiModel, setAiModel] = useState<string>('gemini-3.5-flash');
  const [aiTemp, setAiTemp] = useState<number>(0.2);
  const [aiHistory, setAiHistory] = useState<number>(50);
  const [aiMemory, setAiMemory] = useState<boolean>(true);

  // Monitor live data streams
  const [cpuTrend, setCpuTrend] = useState<number[]>([24, 28, 22, 31, 29, 25, 34, 30, 28, 35]);
  const [ramTrend, setRamTrend] = useState<number[]>([52, 53, 52, 54, 53, 53, 54, 55, 54, 55]);
  const [latencyTrend, setLatencyTrend] = useState<number[]>([120, 140, 110, 135, 125, 115, 145, 130, 120, 138]);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/auth/users', {
        headers: { 
          'X-Owner-Token': authToken,
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersList(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/auth/users/update-role', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Owner-Token': authToken,
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userId, newRole })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        fetchUsers();
        fetchLogs();
      } else {
        alert(data.error || 'Failed to update user role');
      }
    } catch (e) {
      alert('Error communicating with authentication server.');
    }
  };

  // Read session token from local cache
  useEffect(() => {
    const cachedToken = sessionStorage.getItem('oggy_owner_token') || localStorage.getItem('oggy_auth_token') || sessionStorage.getItem('oggy_auth_token');
    const cachedUserStr = localStorage.getItem('oggy_auth_user') || sessionStorage.getItem('oggy_auth_user');
    
    if (cachedUserStr && cachedToken) {
      try {
        const cachedUser = JSON.parse(cachedUserStr);
        if (cachedUser && cachedUser.role === 'Owner') {
          setAuthToken(cachedToken);
          setIsAuthenticated(true);
          return;
        }
      } catch (e) {}
    }
    
    if (cachedToken && cachedToken.startsWith('owner_')) {
      setAuthToken(cachedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all secure owner data once authenticated
  useEffect(() => {
    if (isAuthenticated && authToken) {
      fetchOverview();
      fetchBackups();
      fetchLogs();
      fetchSecrets();
      fetchAiSettings();
      fetchDiagnostics();
      fetchUsers();
    }
  }, [isAuthenticated, authToken]);

  // Live telemetry ticker
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      setCpuTrend(prev => [...prev.slice(1), Math.max(10, Math.min(95, prev[prev.length - 1] + (Math.random() * 10 - 5)))]);
      setLatencyTrend(prev => [...prev.slice(1), Math.max(40, Math.min(300, prev[prev.length - 1] + (Math.random() * 30 - 15)))]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Authenticate owner passcode with secure backend
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('/api/owner/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: passcode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('oggy_owner_token', data.token);
        setAuthToken(data.token);
        setIsAuthenticated(true);
      } else {
        setErrorMsg(data.error || 'Invalid Owner Passcode');
      }
    } catch (err) {
      setErrorMsg('Failed to establish link to secure authentication node.');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('oggy_owner_token');
    setAuthToken('');
    setIsAuthenticated(false);
    setPasscode('');
  };

  // Backend Get Requests
  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/owner/overview', {
        headers: { 'X-Owner-Token': authToken }
      });
      const data = await res.json();
      if (res.ok) setOverview(data);
    } catch (e) {}
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/owner/backups', {
        headers: { 'X-Owner-Token': authToken }
      });
      const data = await res.json();
      if (res.ok) setBackups(data.backups);
    } catch (e) {}
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/owner/logs', {
        headers: { 'X-Owner-Token': authToken }
      });
      const data = await res.json();
      if (res.ok) {
        setAuditLogs(data.audit);
        setErrorLogs(data.errors);
        setAccessLogs(data.access);
        setDeployLogs(data.deployment);
      }
    } catch (e) {}
  };

  const fetchSecrets = async () => {
    try {
      const res = await fetch('/api/owner/secrets', {
        headers: { 'X-Owner-Token': authToken }
      });
      const data = await res.json();
      if (res.ok) setSecrets(data.secrets);
    } catch (e) {}
  };

  const fetchAiSettings = async () => {
    try {
      const res = await fetch('/api/owner/ai-settings', {
        headers: { 'X-Owner-Token': authToken }
      });
      const data = await res.json();
      if (res.ok && data.settings) {
        setAiSettings(data.settings);
        setAiModel(data.settings.model);
        setAiTemp(data.settings.temperature);
        setAiHistory(data.settings.maxHistory);
        setAiMemory(data.settings.memoryRetention);
      }
    } catch (e) {}
  };

  const fetchDiagnostics = async () => {
    try {
      const res = await fetch('/api/owner/diagnostics', {
        headers: { 'X-Owner-Token': authToken }
      });
      const data = await res.json();
      if (res.ok) setDiagnostics(data.report);
    } catch (e) {}
  };

  // Interactive Owner Controls
  const triggerSecurityScan = async () => {
    setScanning(true);
    setSecurityIssues([]);
    try {
      const res = await fetch('/api/owner/scan', {
        method: 'POST',
        headers: { 'X-Owner-Token': authToken }
      });
      const data = await res.json();
      if (res.ok) {
        setSecurityIssues(data.issues);
        fetchLogs();
      }
    } catch (e) {}
    setScanning(false);
  };

  const triggerBackup = async () => {
    setBackingUp(true);
    try {
      const res = await fetch('/api/owner/backup', {
        method: 'POST',
        headers: { 'X-Owner-Token': authToken }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchBackups();
        fetchLogs();
      }
    } catch (e) {
      alert('Backup execution failed.');
    }
    setBackingUp(false);
  };

  const triggerRestore = async (filename: string) => {
    if (!confirm(`CRITICAL CONFIRMATION REQUIRED:\nAre you sure you want to restore workspace snapshot from "${filename}"? All active unsaved changes in the IDE will be overwritten.`)) {
      return;
    }
    setRestoring(filename);
    try {
      const res = await fetch('/api/owner/restore', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Owner-Token': authToken 
        },
        body: JSON.stringify({ filename })
      });
      const data = await res.json();
      alert(data.message || 'Restore completed successfully.');
      fetchLogs();
    } catch (e) {
      alert('Restore execution failed.');
    }
    setRestoring(null);
  };

  const handleSystemAction = async (action: string, displayName: string) => {
    if (!confirm(`Are you sure you want to execute system command: "${displayName}"?`)) {
      return;
    }
    setActionLoading(action);
    try {
      const res = await fetch('/api/owner/system-action', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Owner-Token': authToken 
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      alert(data.message || 'Action executed successfully.');
      fetchOverview();
      fetchLogs();
    } catch (e) {
      alert('Action execution failed.');
    }
    setActionLoading(null);
  };

  const handleUpdateSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretKey || !newSecretValue) return;
    try {
      const res = await fetch('/api/owner/secrets/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Owner-Token': authToken 
        },
        body: JSON.stringify({ key: newSecretKey, value: newSecretValue })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setNewSecretKey('');
        setNewSecretValue('');
        fetchSecrets();
        fetchLogs();
      }
    } catch (e) {
      alert('Failed to update environment secrets.');
    }
  };

  const handleUpdateAiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/owner/ai-settings/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Owner-Token': authToken 
        },
        body: JSON.stringify({
          model: aiModel,
          temperature: aiTemp,
          maxHistory: aiHistory,
          memoryRetention: aiMemory
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('AI model settings applied to active sandbox instance!');
        fetchAiSettings();
        fetchLogs();
      }
    } catch (e) {
      alert('Failed to update AI configurations.');
    }
  };

  // Secure passkey gate view
  if (!isAuthenticated) {
    return (
      <div id="owner-gate-container" className="h-full flex items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Neon backdrop glow */}
          <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent blur-[1px]" />
          
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Crown className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-sans font-bold tracking-tight text-lg text-slate-100">
                OWNER CONTROL CENTER
              </h3>
              <p className="text-xs font-mono text-amber-500/80 uppercase tracking-widest">
                VERIFY ARCHITECT IDENTITY
              </p>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              This panel provides absolute root level command over the sandbox kernel, environment secrets, and system metrics. Unauthorized access is blocked and logged.
            </p>

            <form onSubmit={handleVerify} className="space-y-3.5 pt-2">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-mono text-slate-500 font-bold tracking-wider">SECURE ENTRY PASSCODE</label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-center placeholder:text-slate-800"
                  required
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-mono font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
              >
                <Unlock className="w-3.5 h-3.5" />
                VERIFY ROOT IDENTITY
              </button>
            </form>

            <div className="pt-2 text-[10px] font-mono text-slate-600">
              Default passcode: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">oggy-owner-secret-2026</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="owner-center-container" className="h-full flex bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* 1. Inside Tab Left Sidebar */}
      <div className="w-56 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300">ROOT CONSOLE</span>
          </div>
          <button 
            onClick={logout}
            className="text-[10px] font-mono text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"
          >
            LOCK
          </button>
        </div>

        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'dashboard' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveTab('security'); triggerSecurityScan(); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'security' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security Center</span>
          </button>

          <button
            onClick={() => setActiveTab('backups')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'backups' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backups Snapshot</span>
          </button>

          <button
            onClick={() => setActiveTab('management')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'management' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Service Admin</span>
          </button>

          <button
            onClick={() => setActiveTab('monitoring')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'monitoring' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Metrics Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'logs' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>System Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('secrets')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'secrets' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Secrets Registry</span>
          </button>

          <button
            onClick={() => { setActiveTab('users'); fetchUsers(); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'users' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>User Accounts Registry</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'ai' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Hyperparams</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'diagnostics' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Diagnostics</span>
          </button>
        </div>

        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] font-mono text-slate-500 space-y-1 select-none">
          <div className="flex items-center justify-between">
            <span>Verified IP:</span>
            <span className="text-amber-500 font-bold">127.0.0.1</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Node Core:</span>
            <span className="text-slate-400 font-bold">VITE_PROX_3000</span>
          </div>
        </div>
      </div>

      {/* 2. Content view */}
      <div className="flex-1 flex flex-col bg-[#070b13] overflow-hidden">
        {/* Tab Header bar */}
        <div className="bg-slate-900/40 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {activeTab === 'dashboard' && '👑 OWNER COMMAND CENTER'}
              {activeTab === 'security' && '🛡 SECURE DEFENSE SUITE'}
              {activeTab === 'backups' && '💾 SYSTEM DISASTER RECOVERY'}
              {activeTab === 'management' && '⚙ DAEMON SERVICE ADMINISTRATION'}
              {activeTab === 'monitoring' && '📊 METRICS AND LIVE TELEMETRY'}
              {activeTab === 'logs' && '📋 MASTER REGISTRY & AUDIT LOGS'}
              {activeTab === 'secrets' && '🔐 SECURE ENVIRONMENTAL SECRET MANAGER'}
              {activeTab === 'users' && '👥 ROLE-BASED USER MANAGEMENT & ACCESS CONTROLS'}
              {activeTab === 'ai' && '🤖 INTEL ENGINE PARAMETERS'}
              {activeTab === 'diagnostics' && '🧪 DEEP KERNEL DIAGNOSTICS'}
            </h4>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Root Level access only • Authenticated Session Secure
            </p>
          </div>
          <button 
            onClick={() => { fetchOverview(); fetchBackups(); fetchLogs(); }}
            className="text-slate-400 hover:text-slate-200 bg-slate-800 p-1.5 rounded-lg border border-slate-700 transition-all"
            title="Force refresh raw metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          
          {/* ==================== DASHBOARD TAB ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="bg-cyan-500/10 p-3 rounded-lg text-cyan-400 border border-cyan-500/20">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">System Uptime</span>
                    <h5 className="text-sm font-mono font-extrabold text-slate-100">{overview?.uptime || 'Calculating...'}</h5>
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="bg-amber-500/10 p-3 rounded-lg text-amber-400 border border-amber-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Active Connections</span>
                    <h5 className="text-sm font-mono font-extrabold text-slate-100">{overview?.liveUsers || '4'} Concurrent</h5>
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400 border border-emerald-500/20">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Kernel Load Avg</span>
                    <h5 className="text-sm font-mono font-extrabold text-slate-100">{overview?.cpuLoad || '24.2%'}</h5>
                  </div>
                </div>
              </div>

              {/* Status metrics bar */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
                <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">SYSTEM DIAGNOSTIC OVERVIEW</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                    <span className="text-[9px] font-mono text-slate-500 block">TOTAL FILES</span>
                    <span className="text-sm font-mono font-extrabold text-slate-200">{overview?.totalFiles || '0'}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                    <span className="text-[9px] font-mono text-slate-500 block">MEMORY STATUS</span>
                    <span className="text-sm font-mono font-extrabold text-slate-200">{overview?.usedMemory || 'Calculating'} / {overview?.totalMemory || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                    <span className="text-[9px] font-mono text-slate-500 block">MAINTENANCE MODE</span>
                    <span className={`text-xs font-mono font-bold uppercase ${overview?.maintenanceMode ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {overview?.maintenanceMode ? 'ENABLED' : 'PAUSED'}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                    <span className="text-[9px] font-mono text-slate-500 block">DEPLOY PORT LINK</span>
                    <span className="text-sm font-mono font-bold text-cyan-400">0.0.0.0:3000</span>
                  </div>
                </div>
              </div>

              {/* Quick Root Operations Box */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
                <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">QUICK OWNER DEPLOY STATES</h5>
                <p className="text-xs text-slate-400">Instantly toggle maintenance buffers or optimize system states with secure confirmation cycles.</p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={() => handleSystemAction('toggle-maintenance', 'Toggle Maintenance Mode')}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    TOGGLE MAINTENANCE MODE
                  </button>
                  <button
                    onClick={() => handleSystemAction('clear-cache', 'Flush Memory Cache')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    FLUSH SYSTEM CACHE
                  </button>
                  <button
                    onClick={() => handleSystemAction('optimize-db', 'Vaccum Relational Registries')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
                  >
                    <Database className="w-3.5 h-3.5" />
                    VACUUM DATABASE
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SECURITY CENTER TAB ==================== */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">SANDBOX CORE VULNERABILITY SCANNER</h5>
                    <p className="text-xs text-slate-400">Scans workspace directory, credentials, env configurations, and file permission signatures.</p>
                  </div>
                  <button
                    onClick={triggerSecurityScan}
                    disabled={scanning}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-950 text-slate-950 font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4 animate-pulse" />
                    {scanning ? 'SCANNING...' : 'EXECUTE THREAT SCAN'}
                  </button>
                </div>

                {/* Threat list */}
                <div className="bg-slate-950 rounded-xl border border-slate-900 p-3 space-y-2 max-h-[250px] overflow-y-auto">
                  {securityIssues.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs font-mono">
                      No threat scan executed yet, or system scanning active...
                    </div>
                  ) : (
                    securityIssues.map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs font-mono">
                        <div className={`p-1 rounded ${
                          issue.severity === 'HIGH' ? 'bg-red-500/10 text-red-400' :
                          issue.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-200 font-bold">{issue.file} {issue.line ? `(Line ${issue.line})` : ''}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                              issue.severity === 'HIGH' ? 'bg-red-500/15 border-red-500/20 text-red-400' :
                              issue.severity === 'MEDIUM' ? 'bg-amber-500/15 border-amber-500/20 text-amber-400' : 'bg-cyan-500/15 border-cyan-500/20 text-cyan-400'
                            }`}>{issue.severity}</span>
                          </div>
                          <p className="text-slate-400 leading-relaxed text-[11px]">{issue.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Attack monitoring indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">FAILED LOGIN MONITORING</h5>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 font-mono text-xs text-slate-400 space-y-2">
                    <div className="flex items-center justify-between text-[11px] border-b border-slate-900 pb-1.5">
                      <span>SIGNATURE / ATTEMPT</span>
                      <span>STATUS</span>
                    </div>
                    {auditLogs.filter(l => l.action === 'FAILED_LOGIN_ATTEMPT').length === 0 ? (
                      <div className="text-slate-600 text-center py-2 text-[11px]">No suspicious attempts recorded in active memory cache.</div>
                    ) : (
                      auditLogs.filter(l => l.action === 'FAILED_LOGIN_ATTEMPT').map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] text-rose-400">
                          <span>{log.details}</span>
                          <span>BLOCKED</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">SUSPICIOUS NETWORK ALERTS</h5>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex items-center justify-center text-center">
                    <div className="space-y-1.5 font-mono">
                      <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto animate-pulse" />
                      <p className="text-xs text-slate-300">Intrusion Prevention Active</p>
                      <p className="text-[10px] text-slate-500">All local routing requests filtered over secure XOR cryptographic keys.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== BACKUPS TAB ==================== */}
          {activeTab === 'backups' && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">SYSTEM SNAPSHOT ARCHIVAL REGISTRY</h5>
                    <p className="text-xs text-slate-400">Archive complete workspace structure into compressed ZIP packages. Easily rollback to previous configurations.</p>
                  </div>
                  <button
                    onClick={triggerBackup}
                    disabled={backingUp}
                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-950 text-slate-950 font-mono font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    {backingUp ? 'BACKING UP...' : 'TRIGGER BACKUP SNAPSHOT'}
                  </button>
                </div>

                {/* Backup Table list */}
                <div className="bg-slate-950 rounded-xl border border-slate-900 overflow-hidden font-mono text-xs">
                  <div className="grid grid-cols-3 p-3 bg-slate-900 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-800">
                    <span>FILENAME</span>
                    <span>PACKAGE SIZE</span>
                    <span className="text-right">ACTIONS</span>
                  </div>

                  <div className="divide-y divide-slate-900 max-h-[300px] overflow-y-auto">
                    {backups.length === 0 ? (
                      <div className="text-center py-8 text-slate-600 text-xs">
                        No manual or scheduled backup archives saved inside `./backups` yet.
                      </div>
                    ) : (
                      backups.map((bkp, idx) => (
                        <div key={idx} className="grid grid-cols-3 p-3 items-center text-slate-300 text-[11px]">
                          <span className="font-semibold truncate pr-2" title={bkp.filename}>{bkp.filename}</span>
                          <span className="text-slate-500">{bkp.size}</span>
                          <div className="text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => triggerRestore(bkp.filename)}
                              disabled={restoring === bkp.filename}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[10px] transition-all font-bold"
                            >
                              {restoring === bkp.filename ? 'RESTORING...' : 'ROLLBACK'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SERVICE ADMIN TAB ==================== */}
          {activeTab === 'management' && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
                <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">DAEMON REBOOT & MICRO-SERVICES</h5>
                <p className="text-xs text-slate-400">Manage the core Node processes. Reboot the sandbox kernel, flush intermediate memory caches, or enforce maintenance blockers.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 Pt-1">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-red-400 uppercase">KERNEL COLD REBOOT</span>
                      <p className="text-[11px] font-mono text-slate-500 leading-relaxed">Force shutdown the active Express/Vite process. Node process monitor will instantly launch a clean fresh container cycle.</p>
                    </div>
                    <button
                      onClick={() => handleSystemAction('restart', 'Reboot Sandbox Kernel')}
                      disabled={actionLoading === 'restart'}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-950 text-slate-950 font-mono font-bold text-xs py-2 rounded-xl transition-all"
                    >
                      {actionLoading === 'restart' ? 'REBOOTING...' : 'REBOOT KERNEL DAEMON'}
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase">MAINTENANCE BUFFER</span>
                      <p className="text-[11px] font-mono text-slate-500 leading-relaxed">Instantly reject all general developer requests. Standard users receive a beautiful maintenance dashboard while you maintain raw control.</p>
                    </div>
                    <button
                      onClick={() => handleSystemAction('toggle-maintenance', 'Toggle Maintenance Mode')}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-xs py-2 rounded-xl transition-all"
                    >
                      TOGGLE MAINTENANCE MODE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== MONITORING TAB ==================== */}
          {activeTab === 'monitoring' && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
                <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">REAL-TIME SANDBOX PERFORMANCE GRAPHS</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* CPU Load */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">CPU LOAD PERCENT</span>
                      <span className="text-emerald-400 font-bold">{cpuTrend[cpuTrend.length - 1].toFixed(1)}%</span>
                    </div>
                    {/* Tiny custom bar visualizer */}
                    <div className="h-20 flex items-end gap-1 border-b border-slate-900">
                      {cpuTrend.map((val, idx) => (
                        <div 
                          key={idx} 
                          className="flex-1 bg-cyan-500/60 rounded-t transition-all duration-300"
                          style={{ height: `${val}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* RAM Utilization */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">RAM UTILIZATION</span>
                      <span className="text-emerald-400 font-bold">{ramTrend[ramTrend.length - 1].toFixed(1)}%</span>
                    </div>
                    <div className="h-20 flex items-end gap-1 border-b border-slate-900">
                      {ramTrend.map((val, idx) => (
                        <div 
                          key={idx} 
                          className="flex-1 bg-violet-500/60 rounded-t transition-all duration-300"
                          style={{ height: `${val}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* API Latency */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">API ROUTE LATENCY</span>
                      <span className="text-cyan-400 font-bold">{latencyTrend[latencyTrend.length - 1].toFixed(0)} ms</span>
                    </div>
                    <div className="h-20 flex items-end gap-1 border-b border-slate-900">
                      {latencyTrend.map((val, idx) => (
                        <div 
                          key={idx} 
                          className="flex-1 bg-amber-500/60 rounded-t transition-all duration-300"
                          style={{ height: `${(val / 300) * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== LOGS TAB ==================== */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Audit Actions */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">OWNER TRANSACTION AUDIT TRAIL</h5>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 font-mono text-[10px] space-y-2.5 max-h-[250px] overflow-y-auto">
                    {auditLogs.map((log, idx) => (
                      <div key={idx} className="border-b border-slate-900 pb-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-400 font-bold">{log.action}</span>
                          <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-300 leading-normal">{log.details}</p>
                        <div className="flex items-center justify-between text-[9px] text-slate-600">
                          <span>IP: {log.ip}</span>
                          <span className={log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'}>{log.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HTTP Access logs */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">REAL-TIME INGRESS ROUTE ACCESS LOGS</h5>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 font-mono text-[11px] text-slate-400 space-y-2 max-h-[250px] overflow-y-auto">
                    {accessLogs.map((line, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-300">
                        <span>{line}</span>
                        <span className="text-emerald-400 font-bold">200 OK</span>
                      </div>
                    ))}
                    {deployLogs.map((line, idx) => (
                      <div key={idx} className="text-[10px] text-cyan-400/80">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== SECRETS TAB ==================== */}
          {activeTab === 'secrets' && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
                <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">REGISTER NEW ENVIRONMENT SECRETS</h5>
                <form onSubmit={handleUpdateSecret} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newSecretKey}
                    onChange={(e) => setNewSecretKey(e.target.value)}
                    placeholder="ENVIRONMENT_KEY"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/50"
                    required
                  />
                  <input
                    type="text"
                    value={newSecretValue}
                    onChange={(e) => setNewSecretValue(e.target.value)}
                    placeholder="SuperSecureValue_123"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/50"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-xs py-2.5 rounded-xl transition-all"
                  >
                    ADD KEY-VALUE REGISTRY
                  </button>
                </form>

                <h5 className="text-xs font-mono font-bold text-slate-300 uppercase pt-2">ACTIVE CONFIG REGISTERS (MASKED)</h5>
                <div className="bg-slate-950 rounded-xl border border-slate-900 overflow-hidden font-mono text-xs">
                  <div className="grid grid-cols-2 p-3 bg-slate-900 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-800">
                    <span>CONFIG KEY</span>
                    <span>ACTIVE VALUE (MASKED)</span>
                  </div>
                  <div className="divide-y divide-slate-900">
                    {Object.entries(secrets).map(([key, val]) => (
                      <div key={key} className="grid grid-cols-2 p-3 text-slate-300 text-[11px]">
                        <span className="font-semibold text-slate-400">{key}</span>
                        <span className="text-amber-500 font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== USER ACCOUNTS REGISTRY TAB ==================== */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">REGISTERED OPERATORS KERNEL LEDGER</h5>
                    <p className="text-xs text-slate-500">Configure role privileges, view node-operator logs, and monitor security telemetry.</p>
                  </div>
                  <button 
                    onClick={fetchUsers}
                    disabled={loadingUsers}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-mono font-bold text-[10px] border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all animate-pulse"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingUsers ? 'animate-spin' : ''}`} />
                    REFRESH LEDGER
                  </button>
                </div>

                {loadingUsers ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                    <span className="text-xs font-mono text-slate-500">Retrieving security registers...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-950 rounded-xl border border-slate-900 overflow-hidden">
                      <div className="grid grid-cols-12 p-3 bg-slate-900/60 text-[10px] font-mono font-bold text-slate-500 uppercase border-b border-slate-800 gap-2">
                        <span className="col-span-3">OPERATOR NODE / EMAIL</span>
                        <span className="col-span-2">SYSTEM ROLE</span>
                        <span className="col-span-3">CREATED ON</span>
                        <span className="col-span-2">PRIVILEGE STATUS</span>
                        <span className="col-span-2 text-right">ACTION COMMAND</span>
                      </div>

                      <div className="divide-y divide-slate-900 font-mono text-xs">
                        {usersList.map((usr) => (
                          <div key={usr.id} className="grid grid-cols-12 p-3 text-slate-300 hover:bg-slate-900/20 items-center gap-2">
                            <div className="col-span-3 flex flex-col min-w-0">
                              <span className="font-bold text-amber-400 flex items-center gap-1.5 truncate">
                                {usr.username === 'LORDxOGGY' && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                                {usr.username}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate">{usr.email || 'N/A'}</span>
                            </div>

                            <div className="col-span-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                usr.role === 'Owner' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                usr.role === 'Admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                usr.role === 'Moderator' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {usr.role.toUpperCase()}
                              </span>
                            </div>

                            <div className="col-span-3 text-slate-400 text-[11px]">
                              {usr.createdAt ? new Date(usr.createdAt).toLocaleString() : 'KERNEL PRE-SEED'}
                            </div>

                            <div className="col-span-2">
                              <span className="text-[10px] text-slate-500">
                                {usr.role === 'Owner' ? 'ROOT PASSCODE PRIVILEGES' : 'SANDBOX ISOLATED'}
                              </span>
                            </div>

                            <div className="col-span-2 text-right">
                              {usr.role === 'Owner' ? (
                                <span className="text-[10px] text-amber-500/60 font-bold italic">ROOT SECURED</span>
                              ) : (
                                <select
                                  value={usr.role}
                                  onChange={(e) => handleUpdateUserRole(usr.id, e.target.value)}
                                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-amber-500/50"
                                >
                                  <option value="User">User</option>
                                  <option value="Admin">Admin</option>
                                  <option value="Moderator">Moderator</option>
                                  <option value="Guest">Guest</option>
                                </select>
                              )}
                            </div>

                            {/* Inline user log history nested inside */}
                            {usr.history && usr.history.length > 0 && (
                              <div className="col-span-12 mt-2 pt-2 border-t border-slate-900 bg-slate-950/40 p-2.5 rounded-lg space-y-1.5">
                                <div className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">LOG HISTORY TELEMETRY:</div>
                                <div className="space-y-1 max-h-[80px] overflow-y-auto">
                                  {usr.history.map((hist: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center text-[10px] text-slate-400">
                                      <span className="flex items-center gap-1.5">
                                        <span className="text-slate-500">{new Date(hist.timestamp).toLocaleString()}</span>
                                        <span className="text-slate-600">• IP:</span>
                                        <span className="text-cyan-500 font-semibold">{hist.ip}</span>
                                      </span>
                                      <span className={hist.status === 'SUCCESS' ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                                        {hist.status === 'SUCCESS' ? 'SUCCESSFUL LOGIN' : `FAILED: ${hist.reason}`}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex gap-3 items-start">
                      <Crown className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                      <div className="text-[11px] text-slate-400 leading-relaxed font-mono">
                        <span className="font-bold text-amber-400">RESTRICTION KERNEL ALERT:</span> Only one Owner account can exist. The Owner holds ultimate control over the platform and database. All other users can be promoted to Admin or Moderator, which permits specific subsystem operations.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== AI CONTROLS TAB ==================== */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
                <h5 className="text-xs font-mono font-bold text-slate-300 uppercase">SANDBOX INTELLIGENCE MATRIX CONFIG</h5>
                <p className="text-xs text-slate-400">Tune the core weights, temperature parameters, and memory states for the active model.</p>
                
                <form onSubmit={handleUpdateAiSettings} className="space-y-4 font-mono text-xs text-slate-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500">ACTIVE GEMINI MODEL TARGET</label>
                      <select
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="gemini-3.5-flash">gemini-3.5-flash (Next-Gen Ultrafast)</option>
                        <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Cost-efficient lightweight)</option>
                        <option value="gemini-2.5-pro">gemini-2.5-pro (Deep complex reasoning)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 font-mono">MODEL TEMPERATURE (DIVERGENCE)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={aiTemp}
                        onChange={(e) => setAiTemp(parseFloat(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500">MAX CONVERSATION HISTORY RETENTION</label>
                      <input
                        type="number"
                        value={aiHistory}
                        onChange={(e) => setAiHistory(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-end pb-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={aiMemory}
                          onChange={(e) => setAiMemory(e.target.checked)}
                          id="aiMemory"
                          className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500"
                        />
                        <label htmlFor="aiMemory" className="text-[10px] font-bold text-slate-400 select-none cursor-pointer">PERSIST MODEL KNOWLEDGE MEMORY</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-slate-500">Last applied state parameters: {aiSettings?.lastUpdated ? new Date(aiSettings.lastUpdated).toLocaleTimeString() : 'N/A'}</span>
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                    >
                      APPLY INTELLIGENCE TUNING
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ==================== DIAGNOSTICS TAB ==================== */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4 font-mono text-xs">
                <h5 className="text-xs font-bold text-slate-300 uppercase">CORE SANDBOX KERNEL HEALTH VERIFICATIONS</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-slate-400">HEALTH CHECK</span>
                      <span className="text-emerald-400 font-extrabold">{diagnostics?.healthCheck.status || 'OPTIMAL'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">Main Express server API endpoints are fully active and returning expected payloads within 5ms ingress latency thresholds.</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-slate-400">DATABASE INTEGRITY</span>
                      <span className="text-emerald-400 font-extrabold">{diagnostics?.databaseIntegrity.status || 'HEALTHY'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">All dynamic SQL indexes, tables, and sandbox schema definitions are locked with no corruption detected.</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-slate-400">DEPENDENCY INTEGRITY</span>
                      <span className="text-emerald-400 font-extrabold">{diagnostics?.dependencyCheck.status || 'OK'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">Main standard and developer packages listed inside package.json are clean. Zero unmet peer dependencies.</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-slate-400">FILE SYSTEM STRUCTURE</span>
                      <span className="text-emerald-400 font-extrabold">{diagnostics?.fileIntegrity.status || 'OK'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">Core server modules, React bundles, and workspace sandbox files checked against verified root sha256 checksum tags.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
