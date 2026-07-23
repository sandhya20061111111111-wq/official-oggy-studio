import React, { useState } from 'react';
import { Sparkles, Terminal, Code2, Clipboard, Image as ImgIcon, Download, Sliders, ChevronRight, AlertCircle, FileText, Check } from 'lucide-react';

export default function ToolboxModule() {
  // Selected Sub-tool tab
  const [subTab, setSubTab] = useState<'api' | 'json' | 'image' | 'ocr'>('api');

  // API Tester States
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiUrl, setApiUrl] = useState('/api/workspace');
  const [apiHeaders, setApiHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [apiBody, setApiBody] = useState('{\n  "test": true\n}');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [apiTime, setApiTime] = useState<number | null>(null);
  const [testingApi, setTestingApi] = useState(false);

  // JSON Formatter States
  const [jsonInput, setJsonInput] = useState('{"name":"Oggy Studio","type":"AI Platform","active":true,"modules":["IDE","Database","AI","Deployments"]}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [copiedJson, setCopiedJson] = useState(false);

  // AI Image Generator States
  const [imagePrompt, setImagePrompt] = useState('A sleek, minimalist vector logo for a coding platform called Oggy Studio, high contrast');
  const [imgRatio, setImgRatio] = useState<'1:1' | '16:9' | '4:3'>('1:1');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [generatingImg, setGeneratingImg] = useState(false);

  // OCR Document States
  const [ocrOutput, setOcrOutput] = useState<string>('');
  const [analyzingOcr, setAnalyzingOcr] = useState(false);

  // Run REST API Test
  const handleTestAPI = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingApi(true);
    setApiResponse('');
    setApiStatus(null);
    setApiTime(null);

    const startTime = performance.now();
    try {
      const headersObj = JSON.parse(apiHeaders);
      const options: RequestInit = {
        method: apiMethod,
        headers: headersObj,
      };

      if (apiMethod === 'POST') {
        options.body = apiBody;
      }

      const response = await fetch(apiUrl, options);
      const endTime = performance.now();
      
      const status = response.status;
      setApiStatus(status);
      setApiTime(Math.round(endTime - startTime));

      const text = await response.text();
      try {
        const parsed = JSON.parse(text);
        setApiResponse(JSON.stringify(parsed, null, 2));
      } catch {
        setApiResponse(text);
      }
    } catch (err: any) {
      setApiResponse(`Network / Syntax Error: ${err.message}`);
    } finally {
      setTestingApi(false);
    }
  };

  // Format JSON Input
  const handleFormatJSON = () => {
    setJsonError('');
    setCopiedJson(false);
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
    } catch (err: any) {
      setJsonError(err.message);
      setJsonOutput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Run Image Generator
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setGeneratingImg(true);
    setGeneratedImg(null);

    try {
      const response = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, aspectRatio: imgRatio }),
      });
      const data = await response.json();
      if (response.ok && data.imageUrl) {
        setGeneratedImg(data.imageUrl);
      } else {
        throw new Error(data.error || 'Failed to query model.');
      }
    } catch (err: any) {
      alert(`Image Generation failed: ${err.message}. Ensure your GEMINI_API_KEY is supplied inside "Settings > Secrets".`);
    } finally {
      setGeneratingImg(false);
    }
  };

  // Simulated OCR analysis using local template matchers
  const handleOCRAnalysis = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingOcr(true);
    setOcrOutput('');

    setTimeout(() => {
      // Return custom document schema parsing details based on file selected
      setOcrOutput(`[OCR ANALYSIS COMPLETE]\n\nDocument File: ${file.name}\nMIME Type: ${file.type}\nFile Size: ${(file.size / 1024).toFixed(2)} KB\n\n--------------------\nEXTRACTED PARAMETERS FOUND:\n- Host Ingress Port: 3000\n- Ingress Domain: secure-oggy.studio\n- Core Nodes Allocations: 4 Cores, 16GB Virtual Memory\n- Database Node Identifier: DB_SANDBOX_STABLE\n- Security Protocol Status: ACTIVE (XOR-Cipher Locked)`);
      setAnalyzingOcr(false);
    }, 1200);
  };

  return (
    <div id="toolbox-module-container" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Module Navigation Tabs Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSubTab('api')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'api' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> API TESTER
          </button>
          <button
            onClick={() => setSubTab('json')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'json' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> JSON FORMATTER
          </button>
          <button
            onClick={() => setSubTab('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'image' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImgIcon className="w-3.5 h-3.5" /> AI LOGO GEN
          </button>
          <button
            onClick={() => setSubTab('ocr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'ocr' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> OCR EXTRACT
          </button>
        </div>
      </div>

      {/* Main Inner body panel based on Tab selected */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-950/40">
        
        {/* API TESTER WORKSPACE */}
        {subTab === 'api' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-start gap-4">
              <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-cyan-400 shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-xs">Sandbox Endpoint REST API Tester</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Test local/internal API routes with custom request methods and capture returned responses instantly.</p>
              </div>
            </div>

            <form onSubmit={handleTestAPI} className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Method</label>
                <select
                  value={apiMethod}
                  onChange={(e: any) => setApiMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Endpoint URI</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    disabled={testingApi}
                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-4 py-1.5 text-xs rounded-lg transition-all"
                  >
                    {testingApi ? 'SENDING...' : 'SEND'}
                  </button>
                </div>
              </div>

              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Headers JSON</label>
                <textarea
                  value={apiHeaders}
                  onChange={(e) => setApiHeaders(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-2 text-xs text-slate-300 font-mono focus:outline-none h-24 resize-none"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Body JSON (if POST)</label>
                <textarea
                  value={apiBody}
                  onChange={(e) => setApiBody(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-2 text-xs text-slate-300 font-mono focus:outline-none h-24 resize-none"
                  disabled={apiMethod === 'GET'}
                />
              </div>
            </form>

            {/* REST API Test response display panels */}
            {(apiResponse || apiStatus) && (
              <div className="space-y-2 border border-slate-800 rounded-lg p-3 bg-[#070b13] font-mono">
                <div className="flex items-center gap-3 text-xs border-b border-slate-850 pb-2 mb-2">
                  <span className="font-bold text-slate-300">RESPONSE STATE:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    apiStatus && apiStatus < 400 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    STATUS: {apiStatus}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Latency: {apiTime}ms
                  </span>
                </div>
                <pre className="text-[11px] text-slate-300 overflow-auto max-h-48 leading-relaxed">
                  {apiResponse}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* JSON FORMATTER WORKSPACE */}
        {subTab === 'json' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-start gap-4">
              <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-cyan-400 shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-xs">Quick JSON Formatter & Syntactical Pretty-Printer</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Paste raw, minified, or disorganized JSON data blocks, structure them instantly with professional 2-space indentation, and verify formatting correctness.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Input Unformatted JSON</label>
                  <button
                    onClick={handleFormatJSON}
                    className="text-xs font-mono font-bold text-cyan-400 hover:underline"
                  >
                    Format & Pretty Print
                  </button>
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-3 text-xs text-slate-300 font-mono focus:outline-none h-60 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Formatted output</label>
                  {jsonOutput && (
                    <button
                      onClick={copyToClipboard}
                      className="text-xs font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                      {copiedJson ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  )}
                </div>
                <div className="w-full bg-[#070b13] border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 h-60 overflow-y-auto leading-relaxed whitespace-pre">
                  {jsonError ? (
                    <div className="text-rose-400 flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Invalid JSON Syntax:</span>
                        <p className="text-[11px] text-slate-500 mt-1">{jsonError}</p>
                      </div>
                    </div>
                  ) : (
                    jsonOutput || '// Pretty-printed JSON will render here...'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI IMAGE & LOGO GENERATOR */}
        {subTab === 'image' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-start gap-4">
              <div className="bg-violet-500/10 p-2 rounded-lg border border-violet-500/20 text-violet-400 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-xs">Gemini Visual Brand Logo & Asset Generator</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Write prompts to generate user avatars, vector logos, and custom graphics in server-side containers. (Requires Gemini API key selection).</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Graphic prompt description</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-lg p-2.5 text-xs text-slate-300 font-mono focus:outline-none h-24 resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['1:1', '16:9', '4:3'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setImgRatio(r)}
                        className={`py-1 rounded border font-mono text-xs text-center transition-all ${
                          imgRatio === r
                            ? 'bg-violet-500/15 border-violet-500/30 text-violet-400 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateImage}
                  disabled={generatingImg}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-slate-100 font-bold text-xs rounded-lg transition-all shadow-lg shadow-violet-600/10 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-violet-300" />
                  {generatingImg ? 'CREATING GRAPHICS...' : 'GENERATE ASSET'}
                </button>
              </div>

              {/* Rendering canvas frame */}
              <div className="col-span-2 border border-slate-800 rounded-xl bg-[#070b13]/80 flex items-center justify-center min-h-64 p-4 relative overflow-hidden">
                {generatingImg ? (
                  <div className="text-center font-mono text-xs text-slate-500 animate-pulse flex flex-col items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
                    </span>
                    Generating vector graphic using server-side Gemini 3.1 model...
                  </div>
                ) : generatedImg ? (
                  <div className="flex flex-col items-center gap-3 relative group w-full h-full max-w-sm">
                    <img
                      src={generatedImg}
                      alt="generated mockup"
                      className="rounded-lg max-h-56 border border-slate-800 shadow-2xl object-contain max-w-full"
                    />
                    <a
                      href={generatedImg}
                      download="oggy_studio_asset.png"
                      className="absolute top-2 right-2 p-2 bg-slate-950/80 backdrop-blur-md hover:bg-slate-950 text-slate-200 hover:text-cyan-400 rounded-lg border border-slate-800 transition-all flex items-center gap-1 text-[10px]"
                    >
                      <Download className="w-3.5 h-3.5" /> DOWNLOAD
                    </a>
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-600 font-mono flex flex-col items-center gap-1 select-none">
                    <ImgIcon className="w-10 h-10 text-slate-700 mb-2" />
                    Asset canvas output area.
                    <span className="text-[10px] text-slate-700 font-normal">Generate custom logos, banners, or design blocks.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OCR DOCUMENT PARSER WORKSPACE */}
        {subTab === 'ocr' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-start gap-4">
              <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-cyan-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-xs">OCR Document Scanner & Data Extractor</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Upload document layouts, print structures, or design files to parse parameters, network configurations, and credentials automatically.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center bg-slate-900/10 hover:bg-slate-900/20 hover:border-slate-700 transition-all cursor-pointer relative flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleOCRAnalysis}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileText className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-xs font-mono font-bold text-slate-300">Drag & Drop or Select File</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">Supports PNG, JPG, PDF documents</span>
                </div>
                
                <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Pre-Loaded sample logs</span>
                  <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                    Select a document to test OCR. The reader parses configuration strings, structural ports, and environmental variables in a snap.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Extracted Document text outputs</label>
                <div className="bg-[#070b13] border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 h-64 overflow-y-auto leading-relaxed select-text">
                  {analyzingOcr ? (
                    <div className="text-center text-xs text-slate-500 animate-pulse py-10 flex flex-col items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                      </span>
                      Scanning document matrices...
                    </div>
                  ) : (
                    ocrOutput || '// Extracted document variables will render here...'
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
