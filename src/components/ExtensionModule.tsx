import React, { useState } from 'react';
import { Cpu, Box, Check, Star, Settings, Terminal, Search, Info, Trash2, Shield, HelpCircle, Download } from 'lucide-react';

interface PluginItem {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  downloads: string;
  rating: number;
  category: 'Linter' | 'AI Assistance' | 'Database' | 'Themes';
  installed: boolean;
  active: boolean;
}

export default function ExtensionModule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [plugins, setPlugins] = useState<PluginItem[]>([
    {
      id: 'ext-gemini-pro',
      name: 'Gemini Advanced Refactoring Agent',
      version: '1.4.0',
      description: 'Injects professional, deep code reviews, optimization loops, and secure key scanning capabilities into the editor.',
      author: 'Google AI Studio',
      downloads: '124,500',
      rating: 4.9,
      category: 'AI Assistance',
      installed: true,
      active: true,
    },
    {
      id: 'ext-tailwind-sense',
      name: 'Tailwind CSS Intelligent Auto-complete',
      version: '2.0.1',
      description: 'Intelligent CSS classes matcher with visual preview of colors, padding, and layout bounds inside JSX strings.',
      author: 'TailwindLabs',
      downloads: '82,100',
      rating: 4.8,
      category: 'Themes',
      installed: true,
      active: false,
    },
    {
      id: 'ext-sql-format',
      name: 'SQL Query Assistant & Linter',
      version: '1.2.0',
      description: 'Formats raw database queries, alerts you of syntax anomalies, and formats SQLite statements automatically.',
      author: 'SQLite Core Team',
      downloads: '45,200',
      rating: 4.7,
      category: 'Database',
      installed: false,
      active: false,
    },
    {
      id: 'ext-log-colors',
      name: 'Dracula Log Beautifier',
      version: '1.0.4',
      description: 'Color-codes build logs, filters errors and warning parameters, and structures Express requests.',
      author: 'Dracula Theme',
      downloads: '31,800',
      rating: 4.6,
      category: 'Linter',
      installed: false,
      active: false,
    },
    {
      id: 'ext-jest-runner',
      name: 'Sandboxed Testing Framework',
      version: '3.1.2',
      description: 'Integrated testing suite pipeline. Displays interactive testing progress and code coverage circles.',
      author: 'Oggy Studio Labs',
      downloads: '18,500',
      rating: 4.9,
      category: 'Linter',
      installed: true,
      active: true,
    }
  ]);

  const toggleInstall = (id: string) => {
    setPlugins(prev =>
      prev.map(p => {
        if (p.id === id) {
          const isInstalling = !p.installed;
          return {
            ...p,
            installed: isInstalling,
            active: isInstalling ? true : false,
          };
        }
        return p;
      })
    );
  };

  const toggleActive = (id: string) => {
    setPlugins(prev =>
      prev.map(p => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const filteredPlugins = plugins.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="extension-module-container" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-violet-500/10 p-2 rounded-lg border border-violet-500/20 text-violet-400">
            <Box className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Oggy Plugin & Extension Marketplace <span className="bg-violet-500/10 text-violet-400 text-[10px] px-2 py-0.5 rounded border border-violet-500/20">Phase 3 Active</span>
            </h3>
            <p className="text-xs text-slate-400">Extend editor intelligence, query utilities, terminal decorators, and AI helpers instantly</p>
          </div>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="flex-1 flex min-h-0">
        {/* Left Side: Filter and search bar */}
        <div className="w-64 bg-slate-900/60 border-r border-slate-800 p-4 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider">
              Search Marketplace
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find extensions..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 text-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider">
              Filter by Category
            </label>
            <div className="space-y-1">
              {['All', 'AI Assistance', 'Linter', 'Database', 'Themes'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full text-left px-3 py-2 text-xs font-mono rounded-lg border transition-all ${
                    categoryFilter === cat
                      ? 'bg-violet-500/15 border-violet-500/30 text-violet-400 font-bold'
                      : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats info card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
            <span className="font-bold text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Sandboxed Execution
            </span>
            <div className="text-[10px] text-slate-500 leading-relaxed space-y-1">
              <div>• Active Extensions: <span className="text-slate-300">{plugins.filter(p => p.installed && p.active).length}</span></div>
              <div>• Linter check: <span className="text-emerald-400">compliant</span></div>
              <div>• Security scanning: <span className="text-emerald-400">passed</span></div>
            </div>
          </div>
        </div>

        {/* Right Side: Plugins Grid list */}
        <div className="flex-1 bg-slate-950 p-4 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Available Extensions ({filteredPlugins.length})
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredPlugins.map((plug) => (
              <div
                key={plug.id}
                className="bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-slate-100 text-sm">{plug.name}</h5>
                      <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                        v{plug.version} • {plug.author}
                      </span>
                    </div>
                    <span className="bg-slate-950 px-2 py-0.5 text-[9px] font-mono text-violet-400 font-bold rounded border border-slate-800">
                      {plug.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-normal">{plug.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-850 pt-3 text-xs font-mono select-none">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                    <Download className="w-3 h-3 text-slate-400" /> {plug.downloads}
                    <span className="text-slate-600">|</span>
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {plug.rating}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {plug.installed && (
                      <button
                        onClick={() => toggleActive(plug.id)}
                        className={`px-2 py-1 text-[10px] rounded border font-bold transition-all ${
                          plug.active
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {plug.active ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    )}

                    <button
                      onClick={() => toggleInstall(plug.id)}
                      className={`px-3 py-1 text-[11px] font-bold rounded transition-all flex items-center gap-1 ${
                        plug.installed
                          ? 'bg-slate-800 text-rose-400 hover:bg-slate-700 hover:text-rose-300'
                          : 'bg-violet-600 hover:bg-violet-700 text-slate-100'
                      }`}
                    >
                      {plug.installed ? (
                        <>Uninstall</>
                      ) : (
                        <>Install</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
