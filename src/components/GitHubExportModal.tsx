import React, { useState } from 'react';
import { 
  Github, Download, ArrowRight, CheckCircle2, AlertCircle, Copy, Check, 
  ExternalLink, Sparkles, RefreshCw, Lock, Globe, Code2, Terminal, FolderArchive, Shield
} from 'lucide-react';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GitHubExportModal({ isOpen, onClose }: GitHubExportModalProps) {
  const [activeTab, setActiveTab] = useState<'auto' | 'zip' | 'manual'>('auto');
  
  // Auto Push Form State
  const [githubToken, setGithubToken] = useState('');
  const [repoName, setRepoName] = useState('official-oggy-studio');
  const [isPrivate, setIsPrivate] = useState(false);
  const [commitMessage, setCommitMessage] = useState('Initial release from Oggy Studio AI Developer Platform');
  
  // Progress State
  const [isPushing, setIsPushing] = useState(false);
  const [pushLogs, setPushLogs] = useState<string[]>([]);
  const [pushSuccessUrl, setPushSuccessUrl] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const handleAutoPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken.trim()) {
      setPushError('Please enter your GitHub Personal Access Token (PAT).');
      return;
    }
    if (!repoName.trim()) {
      setPushError('Please enter a repository name.');
      return;
    }

    setIsPushing(true);
    setPushError(null);
    setPushSuccessUrl(null);
    setPushLogs([
      '⚡ [1/5] Initializing Oggy Studio GitHub Integration Daemon...',
      '🔑 [2/5] Authenticating with GitHub API...',
    ]);

    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubToken: githubToken.trim(),
          repoName: repoName.trim(),
          isPrivate,
          commitMessage
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to push to GitHub');
      }

      setPushLogs(prev => [
        ...prev,
        `📦 [3/5] Collected workspace files & dependencies`,
        `🚀 [4/5] Committing & pushing files to GitHub '${data.repoFullName}'...`,
        `🎉 [5/5] Success! Repository published to GitHub!`
      ]);
      setPushSuccessUrl(data.repoUrl);
    } catch (err: any) {
      setPushError(err.message || 'An error occurred while pushing to GitHub.');
      setPushLogs(prev => [...prev, `❌ [ERROR] ${err.message || 'Push failed.'}`]);
    } finally {
      setIsPushing(false);
    }
  };

  const copyGitCommands = () => {
    const gitCmds = `git init\ngit add .\ngit commit -m "${commitMessage}"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/${repoName}.git\ngit push -u origin main`;
    navigator.clipboard.writeText(gitCmds);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl w-full max-w-3xl shadow-2xl shadow-cyan-950/80 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-400/30 text-cyan-400 shadow-md shadow-cyan-500/20">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide bg-gradient-to-r from-cyan-300 via-slate-100 to-violet-300 bg-clip-text text-transparent">
                EXPORT CODEBASE TO GITHUB
              </h2>
              <p className="text-xs font-mono text-slate-400">
                1-Click Push or Package your entire Oggy Studio project to GitHub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-2 rounded-xl hover:bg-slate-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-cyan-500/15 bg-slate-950/40 p-2 gap-2">
          <button
            onClick={() => setActiveTab('auto')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'auto'
                ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>1-CLICK AUTO PUSH</span>
          </button>

          <button
            onClick={() => setActiveTab('zip')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'zip'
                ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-amber-400" />
            <span>GITHUB ZIP PACKAGE</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'manual'
                ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-violet-400" />
            <span>WEB & CLI GUIDE</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: Auto Push via GitHub API */}
          {activeTab === 'auto' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-cyan-300 font-mono">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>DIRECT GITHUB REPOSITORY DEPLOYER</span>
                </div>
                <p>
                  This tool will connect to GitHub via REST API, automatically create the repository on your GitHub account, and upload all full-stack project files seamlessly.
                </p>
              </div>

              <form onSubmit={handleAutoPush} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>GITHUB PERSONAL ACCESS TOKEN (PAT) *</span>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo&description=OggyStudioExporter"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-sans"
                    >
                      Get Token on GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Requires 'repo' scope permission to create repository and upload code.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                      REPOSITORY NAME *
                    </label>
                    <input
                      type="text"
                      placeholder="official-oggy-studio"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                      REPOSITORY VISIBILITY
                    </label>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsPrivate(false)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                          !isPrivate
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Public</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPrivate(true)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isPrivate
                            ? 'bg-violet-500/20 border-violet-400 text-violet-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Private</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                    COMMIT MESSAGE
                  </label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                {pushError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pushError}</span>
                  </div>
                )}

                {pushSuccessUrl && (
                  <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-xs font-mono">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>REPOSITORY PUBLISHED TO GITHUB SUCCESSFULLY!</span>
                    </div>
                    <a
                      href={pushSuccessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-xl hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <Github className="w-4 h-4" />
                      <span>OPEN REPOSITORY ON GITHUB</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Progress Logs */}
                {pushLogs.length > 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-cyan-300 space-y-1 max-h-40 overflow-y-auto">
                    {pushLogs.map((log, i) => (
                      <div key={i} className="leading-relaxed">{log}</div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPushing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-500 text-slate-950 font-mono font-bold text-xs shadow-xl shadow-cyan-500/25 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPushing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>PUSHING FILES TO GITHUB...</span>
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4 text-slate-950" />
                      <span>EXPORT & PUSH TO GITHUB NOW</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Download ZIP for GitHub */}
          {activeTab === 'zip' && (
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <FolderArchive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-amber-300 font-mono">
                      GITHUB-READY APPLICATION ZIP
                    </h3>
                    <p className="text-xs text-slate-400">
                      Contains all React components, Express server, package.json, tsconfig, and deploy configs.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Download this pre-packaged zip archive to your device. You can directly extract it or upload all files to GitHub web interface (<code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">github.com/new</code>).
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href="/api/codebase/download"
                    download="oggy-studio-full-app.zip"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>DOWNLOAD FULL APP ZIP</span>
                  </a>

                  <a
                    href="/api/workspace/download"
                    download="oggy-workspace.zip"
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>DOWNLOAD WORKSPACE ZIP</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Web & CLI Instructions */}
          {activeTab === 'manual' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-violet-500/30 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-violet-300 font-mono">
                  <Globe className="w-4 h-4 text-violet-400" />
                  <span>METHOD A: GITHUB WEB INTERFACE (EASIEST FOR MOBILE & BROWSER)</span>
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed pl-1">
                  <li>
                    Open <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-mono">github.com/new</a> in your browser and name your repository (e.g., <code className="bg-slate-900 px-1 text-cyan-300 rounded font-mono">official-oggy-studio</code>).
                  </li>
                  <li>Click <strong>Create repository</strong>.</li>
                  <li>
                    On the repository page, click <strong className="text-cyan-300 font-mono">"uploading an existing file"</strong> link.
                  </li>
                  <li>
                    Download the <button onClick={() => setActiveTab('zip')} className="text-amber-400 underline font-mono">GitHub ZIP Package</button>, extract it, select all files (<code className="text-slate-300 font-mono">package.json</code>, <code className="text-slate-300 font-mono">index.html</code>, <code className="text-slate-300 font-mono">server.ts</code>, <code className="text-slate-300 font-mono">src/</code>), and drag or upload them.
                  </li>
                  <li>Click <strong>Commit changes</strong>. Done! 🎉</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-cyan-300 font-mono">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>METHOD B: GIT COMMAND LINE (CLI)</span>
                  </div>
                  <button
                    onClick={copyGitCommands}
                    className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono transition-colors"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd ? 'COPIED!' : 'COPY COMMANDS'}</span>
                  </button>
                </div>

                <pre className="p-3 bg-[#050914] rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
{`git init
git add .
git commit -m "${commitMessage}"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/${repoName}.git
git push -u origin main`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/15 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>OGGY STUDIO GITHUB EXPORTER READY</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
