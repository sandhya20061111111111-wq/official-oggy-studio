import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, MessageSquare, Code, User, UserPlus, GitCommit, Play, Plus, Volume2, Shield, Sparkles, Check } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'idle' | 'offline';
  typing?: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
  avatar: string;
}

export default function CollaborationModule() {
  const [roomName, setRoomName] = useState('oggy-hackathon-2026');
  const [activeSession, setActiveSession] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([
    { name: 'Oggy (You)', role: 'CTO & Architect', avatar: '🐱', status: 'online' },
    { name: 'Jack', role: 'DevOps Lead', avatar: '🐕', status: 'online' },
    { name: 'Olivia', role: 'UI/UX Lead', avatar: '💅', status: 'online' },
    { name: 'Gemini AI Assistant', role: 'Autonomous Pair Coder', avatar: '🤖', status: 'online' },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Jack', role: 'DevOps Lead', text: 'Hey guys! Docker container ports are mapped on node 1420. Is index.js ready?', timestamp: '12:05 PM', isSelf: false, avatar: '🐕' },
    { id: '2', sender: 'Olivia', role: 'UI/UX Lead', text: 'Yes, I just finished styling the core dashboard module. The spacing is incredibly crisp now!', timestamp: '12:06 PM', isSelf: false, avatar: '💅' },
    { id: '3', sender: 'Gemini AI Assistant', role: 'Autonomous Pair Coder', text: 'I completed scanning of port 3000. It is fully ready for traffic routing. I can begin writing unit checks if you want.', timestamp: '12:07 PM', isSelf: false, avatar: '🤖' },
  ]);

  const [inputText, setInputText] = useState('');
  const [newRoomInput, setNewRoomInput] = useState('');
  const [shareStatus, setShareStatus] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [timeline, setTimeline] = useState([
    { user: 'Jack', action: 'committed "chore: scale cluster node instances"', date: 'Just now' },
    { user: 'Olivia', action: 'edited "/src/components/ProjectModule.tsx" spacing', date: '3 mins ago' },
    { user: 'Gemini AI Assistant', action: 'patched compiler ReferenceError automatically', date: '12 mins ago' },
  ]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate remote team talking and typing
  useEffect(() => {
    const timer = setTimeout(() => {
      // Set Gemini typing
      setMembers(prev => prev.map(m => m.name === 'Gemini AI Assistant' ? { ...m, typing: true } : m));

      const replyTimer = setTimeout(() => {
        setMembers(prev => prev.map(m => m.name === 'Gemini AI Assistant' ? { ...m, typing: false } : m));
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now()),
            sender: 'Gemini AI Assistant',
            role: 'Autonomous Pair Coder',
            text: 'I am monitoring the active workspace. Let me know if you would like me to generate code scaffolding or write self-healing scripts!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: false,
            avatar: '🤖',
          },
        ]);
        setTimeline(prev => [
          { user: 'Gemini AI Assistant', action: 'joined active pair programming session', date: 'Just now' },
          ...prev,
        ]);
      }, 2500);

      return () => clearTimeout(replyTimer);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'Oggy (You)',
      role: 'CTO & Architect',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      avatar: '🐱',
    };

    setMessages([...messages, newMsg]);
    setInputText('');

    // Simulate Jack replying
    setTimeout(() => {
      setMembers(prev => prev.map(m => m.name === 'Jack' ? { ...m, typing: true } : m));
      setTimeout(() => {
        setMembers(prev => prev.map(m => m.name === 'Jack' ? { ...m, typing: false } : m));
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now()),
            sender: 'Jack',
            role: 'DevOps Lead',
            text: 'Acknowledged! I will monitor the container live ingress and sync with the main pipeline branch.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: false,
            avatar: '🐕',
          },
        ]);
      }, 2000);
    }, 1500);
  };

  const handleShareRoom = () => {
    setShareStatus(true);
    setTimeout(() => setShareStatus(false), 2000);
  };

  return (
    <div id="collaboration-module-container" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-violet-500/10 p-2 rounded-lg border border-violet-500/20 text-violet-400">
            <Users className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Oggy Collaborative Team Spaces & Pair Room <span className="bg-violet-500/10 text-violet-400 text-[10px] px-2 py-0.5 rounded border border-violet-500/20">Phase 6 Active</span>
            </h3>
            <p className="text-xs text-slate-400">Collaborate with remote agents in shared terminal channels, run team debugging boards, and share live code links</p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleShareRoom}
          className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-slate-100 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5"
        >
          {shareStatus ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
          {shareStatus ? 'LINK COPIED' : 'SHARE PAIR ROOM'}
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left column: active members and rooms list */}
        <div className="w-72 bg-slate-900/60 border-r border-slate-800 p-4 space-y-4 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Active Room Name
              </span>
              <div className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs font-mono font-bold text-violet-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                #{roomName}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Active Members ({members.length})
              </span>
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.name} className="flex items-center gap-2.5 p-1.5 hover:bg-slate-950/40 rounded-lg transition-all">
                    <span className="text-lg bg-slate-950 p-1 border border-slate-850 rounded-lg">{m.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{m.name}</h4>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 truncate">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats list */}
          <div className="border border-slate-800 bg-slate-950 rounded-xl p-3 text-xs text-slate-400 font-mono space-y-1.5 leading-normal">
            <span className="font-bold text-[10px] text-slate-300 uppercase block tracking-wider">Pair Room Guard</span>
            <div>• Ingress Channel: <span className="text-violet-400">WebRTC Encrypted</span></div>
            <div>• Code-sharing: <span className="text-emerald-400">Active</span></div>
          </div>
        </div>

        {/* Center column: Team Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-950 min-h-0">
          <div className="p-3 bg-slate-900/30 border-b border-slate-850/80 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>🔴 Room session live</span>
            <span>Ref: {roomName}-terminal</span>
          </div>

          {/* Chat scrolling feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3.5 ${msg.isSelf ? 'justify-end' : ''}`}>
                {!msg.isSelf && (
                  <span className="text-xl bg-slate-900 p-1.5 border border-slate-800 rounded-xl h-9.5 w-9.5 flex items-center justify-center shrink-0">
                    {msg.avatar}
                  </span>
                )}
                
                <div className="space-y-1 max-w-[70%]">
                  <div className={`flex items-center gap-2 font-mono text-[10px] text-slate-500 ${msg.isSelf ? 'justify-end' : ''}`}>
                    <span className="font-bold text-slate-400">{msg.sender}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.isSelf
                      ? 'bg-violet-600 text-slate-100 rounded-tr-none shadow-lg shadow-violet-600/10'
                      : 'bg-slate-900 border border-slate-850 text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>

                {msg.isSelf && (
                  <span className="text-xl bg-slate-900 p-1.5 border border-slate-800 rounded-xl h-9.5 w-9.5 flex items-center justify-center shrink-0">
                    {msg.avatar}
                  </span>
                )}
              </div>
            ))}

            {/* Typing indicators */}
            {members.some(m => m.typing) && (
              <div className="flex gap-3.5">
                <span className="text-xl bg-slate-900 p-1.5 border border-slate-800 rounded-xl h-9.5 w-9.5 flex items-center justify-center shrink-0">
                  {members.find(m => m.typing)?.avatar}
                </span>
                <div className="bg-slate-900 border border-slate-850 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef}></div>
          </div>

          {/* Form sender */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Send message to #${roomName}...`}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl text-xs px-4 py-2.5 text-slate-200 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 bg-violet-600 hover:bg-violet-700 text-slate-100 rounded-xl transition-all flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right column: live room events timeline feed */}
        <div className="w-64 bg-slate-900/40 border-l border-slate-800 p-4 space-y-4 overflow-y-auto">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Workspace Activity Log
          </span>

          <div className="space-y-4 relative">
            {/* vertical connector */}
            <div className="absolute left-2 top-2 bottom-4 w-0.5 bg-slate-800"></div>

            {timeline.map((item, index) => (
              <div key={index} className="relative pl-5 flex gap-1 flex-col">
                <span className="absolute left-0.5 top-1.5 w-3 h-3 rounded-full bg-violet-500/20 border border-violet-500 flex items-center justify-center">
                  <span className="w-1 h-1 bg-violet-400 rounded-full"></span>
                </span>
                <span className="text-xs font-bold text-slate-200 leading-normal">
                  {item.user} <span className="font-normal text-slate-400">{item.action}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
