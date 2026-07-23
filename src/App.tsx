import React, { useState, useEffect } from 'react';
import { Bot, Code2, Database, Server, Activity, Shield, Cpu, Clock, Terminal, Globe, Layers, Box, ShieldCheck, Users, RefreshCw, Download, Menu, X, Monitor, Crown, Github } from 'lucide-react';
import AIModule from './components/AIModule';
import IDEModule from './components/IDEModule';
import DatabaseModule from './components/DatabaseModule';
import HostingModule from './components/HostingModule';
import DashboardModule from './components/DashboardModule';
import SecurityModule from './components/SecurityModule';
import ToolboxModule from './components/ToolboxModule';
import ProjectModule from './components/ProjectModule';
import ExtensionModule from './components/ExtensionModule';
import SelfHealingModule from './components/SelfHealingModule';
import CIModule from './components/CIModule';
import CollaborationModule from './components/CollaborationModule';
import GatewayModule from './components/GatewayModule';
import OrchestratorModule from './components/OrchestratorModule';
import OwnerControlCenter from './components/OwnerControlCenter';
import AuthScreen from './components/AuthScreen';
import GitHubExportModal from './components/GitHubExportModal';

type ModuleType = 'ai' | 'ide' | 'db' | 'hosting' | 'dashboard' | 'security' | 'toolbox' | 'project' | 'extensions' | 'healing' | 'ci' | 'collaboration' | 'gateway' | 'orchestrator' | 'owner';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('ide');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);

  // Authentication States - Initialize immediately from storage for instant load on refresh
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('oggy_auth_token') || sessionStorage.getItem('oggy_auth_token') || null;
  });
  const [user, setUser] = useState<any | null>(() => {
    const cachedUser = localStorage.getItem('oggy_auth_user') || sessionStorage.getItem('oggy_auth_user');
    if (cachedUser) {
      try { return JSON.parse(cachedUser); } catch (e) { return null; }
    }
    return null;
  });
  const [authChecking, setAuthChecking] = useState<boolean>(false);

  // Re-verify session in background on boot
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('oggy_auth_token') || sessionStorage.getItem('oggy_auth_token');
      if (!storedToken) {
        return;
      }

      try {
        const res = await fetch('/api/auth/session', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
            localStorage.setItem('oggy_auth_user', JSON.stringify(data.user));
          }
        } else if (res.status === 401) {
          // Explicitly unauthorized - clear saved credentials
          localStorage.removeItem('oggy_auth_token');
          sessionStorage.removeItem('oggy_auth_token');
          localStorage.removeItem('oggy_auth_user');
          sessionStorage.removeItem('oggy_auth_user');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('Session verification network warning (using cached session):', err);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (e) {}
    localStorage.removeItem('oggy_auth_token');
    localStorage.removeItem('oggy_auth_user');
    sessionStorage.removeItem('oggy_auth_token');
    sessionStorage.removeItem('oggy_auth_user');
    sessionStorage.removeItem('oggy_owner_token');
    setUser(null);
    setToken(null);
    setActiveModule('ide');
  };

  // PWA & Local Time clock updater
  useEffect(() => {
    // Clock updater
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('ServiceWorker registered:', reg.scope))
          .catch((err) => console.error('ServiceWorker failed:', err));
      });
    }

    // PWA beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install Oggy Studio as a standalone app, click the Install / Add to Home Screen option in your browser address bar or settings menu.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const selectModule = (module: ModuleType) => {
    setActiveModule(module);
    setIsSidebarOpen(false);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen cyber-grid-bg text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl animate-cyber-pulse pointer-events-none" />
        <div className="text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-tr from-cyan-500 via-teal-400 to-violet-600 p-5 rounded-3xl shadow-2xl shadow-cyan-500/30 animate-spin border border-cyan-300/30">
            <Cpu className="w-10 h-10 text-slate-950" />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-black tracking-widest text-2xl bg-gradient-to-r from-cyan-300 via-slate-100 to-violet-400 bg-clip-text text-transparent">
              OGGY STUDIO
            </h3>
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>INITIALIZING QUANTUM KERNEL...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLoginSuccess={(usr, tkn) => { setUser(usr); setToken(tkn); }} />;
  }

  return (
    <div id="oggy-studio-root" className="min-h-screen cyber-grid-bg text-slate-100 flex overflow-hidden relative font-sans">
      
      {/* Scanline overlay for futuristic CRT/HUD feel */}
      <div className="fixed inset-0 scanline-overlay z-50 pointer-events-none" />

      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 1. Left Platform Navigation Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-68 bg-[#070d1e]/90 backdrop-blur-2xl border-r border-cyan-500/20 flex flex-col shrink-0 transition-transform duration-300 lg:static lg:translate-x-0 shadow-2xl shadow-cyan-950/40 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Branding Logo Header */}
        <div className="p-4 border-b border-cyan-500/15 flex items-center justify-between bg-slate-950/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          <div className="flex items-center gap-3">
            <div className="relative bg-gradient-to-tr from-cyan-400 via-teal-300 to-violet-500 p-2.5 rounded-2xl text-slate-950 shadow-lg shadow-cyan-500/25 border border-cyan-200/40">
              <Cpu className="w-5 h-5 text-slate-950" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="font-black tracking-wider text-slate-50 text-base leading-none bg-gradient-to-r from-cyan-300 via-slate-100 to-violet-300 bg-clip-text text-transparent">
                OGGY STUDIO
              </h1>
              <span className="text-[9px] font-mono font-extrabold text-cyan-400 tracking-widest mt-1 block uppercase">
                ⚡ CYBER ENGINE v4.0
              </span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-cyan-300 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-cyan-500/20 transition-all"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 p-3 space-y-4 overflow-y-auto">
          
          {/* Phase 1 & 2 section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[9px] font-mono font-bold text-cyan-400/80 tracking-widest uppercase">CORE PLATFORM</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>
            
            <button
              onClick={() => selectModule('project')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'project'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-violet-500/10 to-transparent border border-cyan-400/40 text-cyan-300 font-extrabold shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-cyan-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>PROJECT MANAGER</span>
              </div>
              {activeModule === 'project' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />}
            </button>

            <button
              onClick={() => selectModule('ide')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'ide'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-violet-500/10 to-transparent border border-cyan-400/40 text-cyan-300 font-extrabold shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-cyan-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>DEVELOPER IDE</span>
              </div>
              {activeModule === 'ide' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />}
            </button>

            <button
              onClick={() => selectModule('ai')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'ai'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-violet-500/10 to-transparent border border-cyan-400/40 text-cyan-300 font-extrabold shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-cyan-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>AI ASSISTANT</span>
              </div>
              {activeModule === 'ai' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />}
            </button>

            <button
              onClick={() => selectModule('db')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'db'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-violet-500/10 to-transparent border border-cyan-400/40 text-cyan-300 font-extrabold shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-cyan-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>SQL DATABASE</span>
              </div>
              {activeModule === 'db' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />}
            </button>

            <button
              onClick={() => selectModule('hosting')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'hosting'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-violet-500/10 to-transparent border border-cyan-400/40 text-cyan-300 font-extrabold shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-cyan-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>CLOUD HOSTING</span>
              </div>
              {activeModule === 'hosting' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />}
            </button>
          </div>

          {/* Phase 3 & 4 Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[9px] font-mono font-bold text-violet-400/80 tracking-widest uppercase">ADVANCED ENGINE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            </div>

            <button
              onClick={() => selectModule('extensions')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'extensions'
                  ? 'bg-gradient-to-r from-violet-500/20 via-cyan-500/10 to-transparent border border-violet-400/40 text-violet-300 font-extrabold shadow-md shadow-violet-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-violet-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4 text-violet-400 shrink-0" />
                <span>PLUGINS & MARKET</span>
              </div>
              {activeModule === 'extensions' && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />}
            </button>

            <button
              onClick={() => selectModule('healing')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'healing'
                  ? 'bg-gradient-to-r from-violet-500/20 via-cyan-500/10 to-transparent border border-violet-400/40 text-violet-300 font-extrabold shadow-md shadow-violet-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-violet-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
                <span>AI SELF-HEALING</span>
              </div>
              {activeModule === 'healing' && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />}
            </button>

            <button
              onClick={() => selectModule('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'dashboard'
                  ? 'bg-gradient-to-r from-violet-500/20 via-cyan-500/10 to-transparent border border-violet-400/40 text-violet-300 font-extrabold shadow-md shadow-violet-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-violet-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-violet-400 shrink-0" />
                <span>DIAGNOSTICS STATS</span>
              </div>
              {activeModule === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />}
            </button>

            <button
              onClick={() => selectModule('security')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'security'
                  ? 'bg-gradient-to-r from-violet-500/20 via-cyan-500/10 to-transparent border border-violet-400/40 text-violet-300 font-extrabold shadow-md shadow-violet-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-violet-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-violet-400 shrink-0" />
                <span>SHIELD SECURITY</span>
              </div>
              {activeModule === 'security' && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />}
            </button>

            <button
              onClick={() => selectModule('toolbox')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'toolbox'
                  ? 'bg-gradient-to-r from-violet-500/20 via-cyan-500/10 to-transparent border border-violet-400/40 text-violet-300 font-extrabold shadow-md shadow-violet-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-violet-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-violet-400 shrink-0" />
                <span>DEVELOPER TOOLS</span>
              </div>
              {activeModule === 'toolbox' && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />}
            </button>
          </div>

          {/* Phase 5-8 Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[9px] font-mono font-bold text-emerald-400/80 tracking-widest uppercase">PRODUCTION ENGINE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            <button
              onClick={() => selectModule('ci')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'ci'
                  ? 'bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-400/40 text-emerald-300 font-extrabold shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-emerald-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>CI/CD PIPELINES</span>
              </div>
              {activeModule === 'ci' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />}
            </button>

            <button
              onClick={() => selectModule('collaboration')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'collaboration'
                  ? 'bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-400/40 text-emerald-300 font-extrabold shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-emerald-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>PAIR TEAM ROOM</span>
              </div>
              {activeModule === 'collaboration' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />}
            </button>

            <button
              onClick={() => selectModule('gateway')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'gateway'
                  ? 'bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-400/40 text-emerald-300 font-extrabold shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-emerald-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SERVERLESS GATEWAY</span>
              </div>
              {activeModule === 'gateway' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />}
            </button>

            <button
              onClick={() => selectModule('orchestrator')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                activeModule === 'orchestrator'
                  ? 'bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-400/40 text-emerald-300 font-extrabold shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-emerald-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>K8S ORCHESTRATOR</span>
              </div>
              {activeModule === 'orchestrator' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />}
            </button>
          </div>

          {/* Owner Section */}
          {user && user.role === 'Owner' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[9px] font-mono font-bold text-amber-400/80 tracking-widest uppercase">RESTRICTED COMMAND</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>

              <button
                onClick={() => selectModule('owner')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                  activeModule === 'owner'
                    ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/10 border border-amber-400/50 text-amber-300 font-extrabold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-amber-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>OWNER CONTROL CENTER</span>
                </div>
                {activeModule === 'owner' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />}
              </button>
            </div>
          )}

        </div>

        {/* Global operational node metadata panel footer */}
        <div className="p-3.5 bg-slate-950/80 backdrop-blur-md border-t border-cyan-500/15 text-[11px] font-mono text-slate-400 space-y-1.5 select-none">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">SYSTEM NODE:</span>
            <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> CYBER ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">HOST PORT:</span>
            <span className="text-cyan-300 font-semibold">0.0.0.0:3000</span>
          </div>
        </div>
      </div>

      {/* 2. Main content platform Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header Panel */}
        <header className="h-16 border-b border-cyan-500/15 bg-[#070c1c]/80 backdrop-blur-2xl px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg shadow-black/40 z-20">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button for Mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-cyan-300 p-2 rounded-xl hover:bg-slate-900/80 border border-transparent hover:border-cyan-500/20 transition-all flex items-center justify-center"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">HUD CONTEXT:</span>
            <span className="text-xs bg-slate-900/90 px-3 py-1 rounded-lg border border-cyan-500/30 text-cyan-300 font-mono tracking-wider font-extrabold uppercase shadow-inner shadow-cyan-500/10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {activeModule === 'ai' && '🤖 AI Assistant'}
              {activeModule === 'ide' && '💻 Coding IDE'}
              {activeModule === 'db' && '🗄️ Relational Database'}
              {activeModule === 'hosting' && '☁️ 1-Click Hosting'}
              {activeModule === 'dashboard' && '📊 Diagnostics Monitor'}
              {activeModule === 'security' && '🛡️ System Shield'}
              {activeModule === 'toolbox' && '🧩 Dev Utilities'}
              {activeModule === 'project' && '📦 Project Manager'}
              {activeModule === 'extensions' && '🔌 Plugin Marketplace'}
              {activeModule === 'healing' && '🩹 Self-Healing'}
              {activeModule === 'ci' && '⚙️ CI/CD Pipelines'}
              {activeModule === 'collaboration' && '👥 Pair Team Room'}
              {activeModule === 'gateway' && '🌐 Ingress API Gateway'}
              {activeModule === 'orchestrator' && '☸️ Kubernetes Cluster'}
              {activeModule === 'owner' && '👑 Owner Console'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Export Code to GitHub Button */}
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold text-slate-100 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:brightness-110 px-3 sm:px-4 py-2 rounded-xl border border-cyan-400/40 select-none shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Push or Export full codebase directly to your GitHub repository!"
            >
              <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />
              <span className="hidden xs:inline">EXPORT TO GITHUB</span>
              <span className="xs:hidden">GITHUB</span>
            </button>

            {/* Install Oggy Studio Desktop/Mobile App Button */}
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:brightness-110 px-3 sm:px-4 py-2 rounded-xl border border-cyan-300/40 select-none shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Install Oggy Studio as a standalone desktop/mobile application!"
            >
              <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
              <span className="hidden xs:inline">INSTALL APP</span>
              <span className="xs:hidden">INSTALL</span>
            </button>

            {/* Download Workspace ZIP Anchor Button */}
            <a
              href="/api/workspace/download"
              download="oggy-workspace.zip"
              className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 px-3 sm:px-4 py-2 rounded-xl border border-amber-300/40 select-none shadow-lg shadow-amber-500/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Download your active sandbox IDE files as a ZIP package!"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
              <span className="hidden xs:inline">DOWNLOAD WORKSPACE</span>
              <span className="xs:hidden">WORKSPACE</span>
            </a>

            {/* Download Full Application Source ZIP Button */}
            <a
              href="/api/codebase/download"
              download="oggy-studio-full-app.zip"
              className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold text-slate-100 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:brightness-110 px-3 sm:px-4 py-2 rounded-xl border border-violet-400/30 select-none shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Download the entire Oggy Studio React + Express application source code!"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-100" />
              <span className="hidden xs:inline">DOWNLOAD FULL APP</span>
              <span className="xs:hidden">FULL APP</span>
            </a>

            {/* Local Clock Widget */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-cyan-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-cyan-500/20 select-none">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime}</span>
            </div>

            {/* User operational role */}
            {user && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center font-bold text-xs text-slate-950 font-sans shadow-lg shadow-cyan-500/20 border border-cyan-200/40 uppercase">
                  {user.username.charAt(0)}
                </div>
                <div className="text-left font-sans hidden sm:block select-none leading-none">
                  <span className="text-xs font-bold text-slate-100 block">{user.username}</span>
                  <span className="text-[9px] text-cyan-400 font-mono uppercase tracking-wider mt-1 block">
                    {user.role} ROLE
                  </span>
                </div>
                
                {/* Session Logout Control */}
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-mono font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                  title="Close secure workspace session"
                >
                  LOGOUT
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Viewport component wrapper */}
        <main className="flex-1 p-4 sm:p-6 overflow-hidden min-h-0 relative z-10">
          {activeModule === 'ai' && <AIModule />}
          {activeModule === 'ide' && <IDEModule />}
          {activeModule === 'db' && <DatabaseModule />}
          {activeModule === 'hosting' && <HostingModule />}
          {activeModule === 'dashboard' && <DashboardModule />}
          {activeModule === 'security' && <SecurityModule />}
          {activeModule === 'toolbox' && <ToolboxModule />}
          {activeModule === 'project' && <ProjectModule />}
          {activeModule === 'extensions' && <ExtensionModule />}
          {activeModule === 'healing' && <SelfHealingModule />}
          {activeModule === 'ci' && <CIModule />}
          {activeModule === 'collaboration' && <CollaborationModule />}
          {activeModule === 'gateway' && <GatewayModule />}
          {activeModule === 'orchestrator' && <OrchestratorModule />}
          {activeModule === 'owner' && <OwnerControlCenter />}
        </main>
      </div>

      {/* GitHub Export Modal */}
      <GitHubExportModal 
        isOpen={isGitHubModalOpen} 
        onClose={() => setIsGitHubModalOpen(false)} 
      />

    </div>
  );
}
