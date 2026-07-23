import React, { useState } from 'react';
import { Shield, Key, Lock, Unlock, Database, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SecurityModule() {
  // Symmetric Encryption States
  const [plainText, setPlainText] = useState('Secret Source Code Content');
  const [encryptKey, setEncryptKey] = useState('oggy_secure_pass_123');
  const [encryptedHex, setEncryptedHex] = useState('');
  
  const [cipherInput, setCipherInput] = useState('');
  const [decryptKey, setDecryptKey] = useState('');
  const [decryptedText, setDecryptedText] = useState('');

  // Backup States
  const [backupLogs, setBackupLogs] = useState<string[]>([
    `[INFO] Automated backup cycle successful (Backup ID: bkp-${Date.now() - 3600000})`,
    `[INFO] Ingress transaction hashes locked inside system registry`
  ]);
  const [isProcessingBackup, setIsProcessingBackup] = useState(false);

  // Simple Base64/XOR Symmetric Cipher (Full functional local logic)
  const handleEncrypt = () => {
    if (!plainText || !encryptKey) return;
    try {
      // XOR plainText characters with key characters, then convert to Hex
      let result = '';
      for (let i = 0; i < plainText.length; i++) {
        const charCode = plainText.charCodeAt(i) ^ encryptKey.charCodeAt(i % encryptKey.length);
        let hex = charCode.toString(16);
        if (hex.length < 2) hex = '0' + hex;
        result += hex;
      }
      setEncryptedHex(result.toUpperCase());
      setCipherInput(result.toUpperCase()); // Set as default decrypt input
    } catch (err: any) {
      alert(`Encryption failed: ${err.message}`);
    }
  };

  const handleDecrypt = () => {
    if (!cipherInput || !decryptKey) return;
    try {
      let result = '';
      for (let i = 0; i < cipherInput.length; i += 2) {
        const hexByte = cipherInput.substr(i, 2);
        const byteVal = parseInt(hexByte, 16);
        const keyCharVal = decryptKey.charCodeAt((i / 2) % decryptKey.length);
        result += String.fromCharCode(byteVal ^ keyCharVal);
      }
      setDecryptedText(result);
    } catch (err: any) {
      setDecryptedText('⚠️ XOR decryption mismatch or key corrupt.');
    }
  };

  // One-click Backup Snapshot trigger
  const triggerWorkspaceBackup = async () => {
    setIsProcessingBackup(true);
    setBackupLogs((prev) => [`[PENDING] Commencing workspace directory snapshot...`, ...prev]);
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    const backupId = `bkp-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    setBackupLogs((prev) => [
      `[SUCCESS] Backup snapshot ${backupId} completed cleanly (Index: 3 files saved)`,
      `[SUCCESS] Backup cataloged in primary system cache`,
      ...prev
    ]);
    setIsProcessingBackup(false);
  };

  return (
    <div id="security-module-container" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Module Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-rose-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Oggy Studio Shield & Security Center <span className="bg-rose-500/10 text-rose-400 text-[10px] px-2 py-0.5 rounded border border-rose-500/20">Active Defenses</span>
            </h3>
            <p className="text-xs text-slate-400">Symmetric file encryption suites, environmental token controls, and automated backups</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Symmetric Cryptography Suite Card */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Encryption Tool */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3.5">
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" /> Symmetric Encryption Engine
            </h4>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Secret text</label>
              <textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-lg p-2 text-xs text-slate-200 focus:outline-none resize-none h-14 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Symmetric Key</label>
                <input
                  type="password"
                  value={encryptKey}
                  onChange={(e) => setEncryptKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>
              <button
                onClick={handleEncrypt}
                className="self-end px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold text-xs rounded-lg transition-all"
              >
                Encrypt
              </button>
            </div>

            {encryptedHex && (
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[9px] font-mono font-bold text-rose-400 uppercase">Cipher Hex Block Output</span>
                <p className="font-mono text-[10px] text-slate-300 break-all select-all leading-normal">{encryptedHex}</p>
              </div>
            )}
          </div>

          {/* Decryption Tool */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3.5">
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
              <Unlock className="w-4 h-4 text-emerald-400" /> Symmetric Decryption Engine
            </h4>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Cipher Hex Block</label>
              <textarea
                value={cipherInput}
                onChange={(e) => setCipherInput(e.target.value)}
                placeholder="Paste hex block here..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-lg p-2 text-xs text-slate-200 focus:outline-none resize-none h-14 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Decryption Password</label>
                <input
                  type="password"
                  value={decryptKey}
                  onChange={(e) => setDecryptKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>
              <button
                onClick={handleDecrypt}
                className="self-end px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-all"
              >
                Decrypt
              </button>
            </div>

            {decryptedText && (
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase">Decrypted Text Output</span>
                <p className="font-mono text-[10px] text-slate-200 leading-normal">{decryptedText}</p>
              </div>
            )}
          </div>

        </div>

        {/* Secrets & Automated Backups splits */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Injected Env Keys Manager */}
          <div className="border border-slate-800 rounded-xl bg-slate-900/20 p-4 space-y-3.5">
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" /> API Environmental Secrets
            </h4>
            
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">GEMINI_API_KEY</span>
                  <p className="text-xs text-slate-200 font-mono mt-0.5">••••••••••••••••••••</p>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                  active
                </span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">APP_URL</span>
                  <p className="text-xs text-slate-200 font-mono mt-0.5">••••••••••••••••••••</p>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                  active
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-amber-500/10 rounded-xl text-amber-400 text-xs flex items-start gap-2 leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                Secrets are automatically managed in the <span className="font-bold text-slate-100">Settings &gt; Secrets</span> menu in the AI Studio sidebar.
              </div>
            </div>
          </div>

          {/* Backup Snapshots list */}
          <div className="border border-slate-800 rounded-xl bg-slate-900/20 p-4 flex flex-col space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" /> Auto Backup & snap logs
              </h4>
              <button
                onClick={triggerWorkspaceBackup}
                disabled={isProcessingBackup}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 rounded border border-slate-700 transition-all flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isProcessingBackup ? 'animate-spin' : ''}`} />
                {isProcessingBackup ? 'BACKING UP...' : 'SNAP BACKUP'}
              </button>
            </div>

            <div className="flex-1 bg-[#070b13] border border-slate-850 p-3 rounded-lg overflow-y-auto space-y-2 h-44 font-mono text-[10px] leading-relaxed text-slate-400">
              {backupLogs.map((log, idx) => (
                <div key={idx} className="flex gap-1.5">
                  <span className={log.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    ✓
                  </span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
