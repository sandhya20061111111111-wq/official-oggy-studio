import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Image, Mic, MicOff, Volume2, HelpCircle, MemoryStick, Trash2, Copy, Check, Code } from 'lucide-react';
import { ChatMessage } from '../types';

function CodeBlock({ lang, code }: { lang: string; code: string; key?: React.Key }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-slate-800 bg-[#060913] text-xs font-mono shadow-xl">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[11px]">
        <div className="flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[10px]">{lang || 'CODE'}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-slate-100 transition-colors px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[10px] font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">Copy Code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono selection:bg-cyan-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderFormattedInline(text: string) {
  const parts = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-cyan-200">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="bg-slate-800/80 text-cyan-300 font-mono text-[12px] px-1.5 py-0.5 rounded border border-slate-700/60">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

function ProseText({ content }: { content: string; key?: React.Key }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed text-sm">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} className="h-1.5" />;

        if (trimmed.startsWith('### ')) {
          return <h4 key={lIdx} className="font-bold text-cyan-300 text-base mt-2 mb-1">{trimmed.slice(4)}</h4>;
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={lIdx} className="font-extrabold text-cyan-400 text-base mt-3 mb-1">{trimmed.slice(3)}</h3>;
        }
        if (trimmed.startsWith('# ')) {
          return <h2 key={lIdx} className="font-black text-slate-100 text-lg mt-3 mb-1">{trimmed.slice(2)}</h2>;
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.slice(2);
          return (
            <div key={lIdx} className="flex items-start gap-2 ml-1 my-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <div className="flex-1">{renderFormattedInline(itemText)}</div>
            </div>
          );
        }

        return <div key={lIdx}>{renderFormattedInline(line)}</div>;
      })}
    </div>
  );
}

function FormattedMessage({ text }: { text: string }) {
  let clean = text || '';
  // Clean up trailing orphaned parenthesis or broken asterisks
  clean = clean.replace(/\)\)\s*$/, ')').replace(/\)\)\s*([.,!?])/g, ')$1');

  const codeBlockRegex = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g;
  const parts: Array<{ type: 'text' | 'code'; content: string; lang?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(clean)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: clean.slice(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'code',
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < clean.length) {
    parts.push({ type: 'text', content: clean.slice(lastIndex) });
  }

  return (
    <div className="space-y-2 text-slate-200">
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return <CodeBlock key={idx} lang={part.lang || 'code'} code={part.content} />;
        }
        return <ProseText key={idx} content={part.content} />;
      })}
    </div>
  );
}

export default function AIModule() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('oggy_chat_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        role: 'model',
        text: 'Hello! I am Oggy, your Senior Principal AI Coding Architect. I am connected directly to Gemini 3.5. Ask me anything about coding, system architectures, or request code modifications in your local workspace.',
        timestamp: new Date().toLocaleTimeString(),
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [systemInstruction, setSystemInstruction] = useState('You are Oggy, the Principal AI Coding Assistant for Oggy Studio. You help with code, visual designs, file management, and system tasks.');
  const [useMemory, setUseMemory] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('oggy_chat_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !attachedImage) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString(),
      image: attachedImage || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          systemInstruction,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: data.text,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        throw new Error(data.error || 'Failed to generate AI response.');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: `⚠️ API Connection Error: ${err.message}. Please verify your GEMINI_API_KEY inside "Settings > Secrets" panel in the main menu.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis not supported in this browser.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate speech-to-text input
      const simulatedTexts = [
        "Explain how the current system metrics monitor works.",
        "Generate a full-stack database schema for a todo application.",
        "Check index.js file in workspace and write a backup script.",
        "Explain standard Docker container parameters for node projects."
      ];
      setInput(simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)]);
    } else {
      setIsRecording(true);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'model',
        text: 'Chat history cleared. How can I help you today?',
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
  };

  return (
    <div id="ai-assistant-container" className="h-full flex flex-col bg-[#070e24]/80 backdrop-blur-2xl border border-cyan-500/25 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-950/50 relative">
      
      {/* Futuristic Glow Orb Background */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* Module Header */}
      <div className="bg-slate-950/80 border-b border-cyan-500/20 p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative bg-gradient-to-tr from-cyan-500 via-teal-400 to-violet-600 p-2.5 rounded-xl text-slate-950 shadow-lg shadow-cyan-500/20 border border-cyan-300/30">
            <Bot className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 flex items-center gap-2 text-sm">
              <span>OGGY CYBER AI</span>
              <span className="bg-cyan-500/15 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-cyan-400/30 tracking-wider">
                GEMINI 3.5 FLASH
              </span>
            </h3>
            <p className="text-[11px] font-mono text-cyan-400/80 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Workspace Neural Kernel Active</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseMemory(!useMemory)}
            className={`p-2 rounded-xl border font-mono text-xs transition-all flex items-center gap-1.5 ${
              useMemory 
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30 shadow-sm shadow-emerald-500/10' 
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
            title="Toggle Memory Mode"
          >
            <MemoryStick className="w-4 h-4" />
            <span className="hidden sm:inline font-bold text-[10px] uppercase">{useMemory ? 'MEMORY ON' : 'MEMORY OFF'}</span>
          </button>
          <button
            onClick={clearChat}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40 relative z-10">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[88%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border text-xs shrink-0 select-none shadow-md ${
                msg.role === 'user'
                  ? 'bg-violet-500/20 text-violet-300 border-violet-400/30 shadow-violet-500/10'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30 shadow-cyan-500/10'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div className="space-y-1">
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed border transition-all ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-violet-950/60 to-indigo-950/80 text-slate-100 border-violet-500/30 rounded-tr-none shadow-lg shadow-violet-950/30'
                    : 'bg-gradient-to-br from-[#0b132b]/90 to-[#070d1e]/90 text-slate-200 border-cyan-500/20 rounded-tl-none shadow-lg shadow-cyan-950/30'
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="attachment"
                    className="max-h-48 rounded-xl mb-3 border border-cyan-500/30 object-cover shadow-md"
                  />
                )}
                <FormattedMessage text={msg.text} />
                {msg.role === 'model' && (
                  <button
                    onClick={() => speakText(msg.text)}
                    className="mt-3 flex items-center gap-1.5 text-[10px] text-cyan-400/90 hover:text-cyan-300 transition-all font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-2.5 py-1 rounded-lg"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> VOICE SYNTHESIS
                  </button>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-mono block px-1.5">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="p-4 bg-slate-950/80 text-cyan-300 border border-cyan-500/30 rounded-2xl rounded-tl-none text-xs flex items-center gap-2.5 font-mono shadow-lg shadow-cyan-500/10">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                </span>
                <span>Synthesizing neural workspace response...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-cyan-500/15 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none relative z-10">
        <span className="text-[10px] text-cyan-400 font-mono font-bold">CYBER DIRECTIVES:</span>
        <button
          onClick={() => setInput("Optimize code and fix syntax error in server.ts")}
          className="bg-slate-900/80 hover:bg-cyan-950/60 text-xs text-slate-300 hover:text-cyan-200 border border-cyan-500/20 hover:border-cyan-400/50 px-3 py-1 rounded-lg transition-all shrink-0 font-mono"
        >
          ⚡ Fix & Optimize Server
        </button>
        <button
          onClick={() => setInput("Build a full-stack REST API endpoint for user profile data")}
          className="bg-slate-900/80 hover:bg-cyan-950/60 text-xs text-slate-300 hover:text-cyan-200 border border-cyan-500/20 hover:border-cyan-400/50 px-3 py-1 rounded-lg transition-all shrink-0 font-mono"
        >
          🌐 Create REST API
        </button>
        <button
          onClick={() => setInput("Analyze workspace security and check database integrity")}
          className="bg-slate-900/80 hover:bg-cyan-950/60 text-xs text-slate-300 hover:text-cyan-200 border border-cyan-500/20 hover:border-cyan-400/50 px-3 py-1 rounded-lg transition-all shrink-0 font-mono"
        >
          🛡️ Audit System Security
        </button>
      </div>

      {/* Custom System Instruction Settings */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 relative z-10">
        <details className="text-xs text-slate-400">
          <summary className="cursor-pointer select-none font-mono text-[10px] text-cyan-400/80 hover:text-cyan-300">
            ⚙️ AI System Instructions & Prompt Tuning
          </summary>
          <textarea
            value={systemInstruction}
            onChange={(e) => setSystemInstruction(e.target.value)}
            className="w-full mt-2 bg-slate-900/90 border border-cyan-500/30 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-400 text-xs resize-none h-14 font-mono"
          />
        </details>
      </div>

      {/* Chat Input form */}
      <form onSubmit={handleSend} className="bg-slate-950 border-t border-cyan-500/20 p-4 flex flex-col gap-2 relative z-10">
        {attachedImage && (
          <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 rounded-xl p-2 max-w-xs relative shadow-lg">
            <img src={attachedImage} alt="uploaded" className="h-10 w-10 object-cover rounded-lg border border-cyan-500/30" />
            <span className="text-xs text-cyan-300 font-mono truncate flex-1">Image Payload Loaded</span>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="text-xs text-slate-400 hover:text-rose-400 font-bold px-2"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <label className="p-3 bg-slate-900/90 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/50 rounded-xl cursor-pointer transition-all shrink-0 shadow-md">
            <Image className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 border rounded-xl transition-all shrink-0 shadow-md ${
              isRecording
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border-cyan-500/20 hover:border-cyan-400/50'
            }`}
            title="Voice Assistant Mode"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening to mic audio..." : "Type your code directive or ask Cyber AI..."}
            className="flex-1 bg-slate-900/90 border border-cyan-500/25 focus:border-cyan-400 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder-slate-500 font-sans shadow-inner"
            disabled={isRecording}
          />
          <button
            type="submit"
            className="p-3 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:brightness-110 text-slate-950 rounded-xl transition-all shadow-lg shadow-cyan-500/20 font-bold shrink-0 flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
