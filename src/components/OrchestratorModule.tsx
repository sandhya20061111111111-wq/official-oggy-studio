import React, { useState, useEffect } from 'react';
import { Layers, Terminal, Server, Cpu, Play, Trash2, RefreshCw, Sparkles, CheckCircle2, AlertOctagon, HelpCircle, HardDrive } from 'lucide-react';

interface KubernetesPod {
  id: string;
  name: string;
  status: 'Running' | 'Pending' | 'Terminated';
  cpu: string;
  ram: string;
  restarts: number;
  age: string;
}

export default function OrchestratorModule() {
  const [activeTab, setActiveTab] = useState<'cluster' | 'dockerfile'>('cluster');
  const [pods, setPods] = useState<KubernetesPod[]>([
    { id: 'p1', name: 'oggy-ingress-gateway-6d8b94f-a82f', status: 'Running', cpu: '0.4%', ram: '42 MB', restarts: 0, age: '3d' },
    { id: 'p2', name: 'sqlite-sandbox-daemon-758fa2-bc4e', status: 'Running', cpu: '0.1%', ram: '16 MB', restarts: 1, age: '12h' },
    { id: 'p3', name: 'gemini-ai-streamer-5f75e11-12f3', status: 'Running', cpu: '0.0%', ram: '24 MB', restarts: 0, age: '3d' },
    { id: 'p4', name: 'oggy-background-worker-91bca4-d892', status: 'Pending', cpu: '0.0%', ram: '0 MB', restarts: 0, age: '2m' },
  ]);

  const [dockerfileContent, setDockerfileContent] = useState(`FROM node:20-alpine

# Set up Workspace Ingress
WORKDIR /usr/src/app

# Install package dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle production sandbox scripts
COPY . .

# Expose environmental routing port
EXPOSE 3000

# Start server node daemon
CMD [ "node", "index.js" ]
`);

  const [logs, setLogs] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildSuccess, setBuildSuccess] = useState(false);

  // Auto stabilize pods
  useEffect(() => {
    const timer = setInterval(() => {
      setPods(prev => prev.map(pod => {
        if (pod.status === 'Pending' && Math.random() > 0.6) {
          return { ...pod, status: 'Running', cpu: '0.2%', ram: '32 MB' };
        }
        return pod;
      }));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleRestartPod = (id: string) => {
    setPods(prev => prev.map(pod => {
      if (pod.id === id) {
        return {
          ...pod,
          status: 'Pending',
          restarts: pod.restarts + 1,
          cpu: '0.0%',
          ram: '0 MB'
        };
      }
      return pod;
    }));
  };

  const handleTerminatePod = (id: string) => {
    setPods(prev => prev.filter(p => p.id !== id));
  };

  const handleAddPod = () => {
    const newId = `p-${Date.now()}`;
    const name = `oggy-microservice-pod-${Math.random().toString(16).substring(2, 6)}`;
    const newPod: KubernetesPod = {
      id: newId,
      name,
      status: 'Pending',
      cpu: '0.0%',
      ram: '0 MB',
      restarts: 0,
      age: '1s'
    };
    setPods([...pods, newPod]);
  };

  const handleBuildDocker = async () => {
    setIsBuilding(true);
    setBuildSuccess(false);
    setLogs([
      '[INFO] Initializing sandboxed Docker daemon...',
      '[DOCKER] Sending build context to Docker daemon 42.1 MB',
      'Step 1/6 : FROM node:20-alpine',
      ' ---> 231f4e5a2c1b',
      'Step 2/6 : WORKDIR /usr/src/app',
      ' ---> Using cache',
      ' ---> e9bc12f45ea2',
      'Step 3/6 : COPY package*.json ./',
      ' ---> d4f89ac35f12',
      'Step 4/6 : RUN npm ci --only=production',
      ' ---> Running in 798e4f1a23bc',
      'added 42 packages, audited 43 packages in 0.82s',
      ' ---> Removed intermediate container 798e4f1a23bc',
      ' ---> a4f89bc45de1',
      'Step 5/6 : COPY . .',
      ' ---> c1428fa5b6de',
      'Step 6/6 : EXPOSE 3000',
      ' ---> Running in b12a4f5c6e8d',
      ' ---> Removed intermediate container b12a4f5c6e8d',
      ' ---> e31248facb92',
      'Successfully built image oggy-app:latest',
      'Successfully tagged oggy-app:latest'
    ]);

    // Stagger display output
    const rawLogs = [...logs];
    setIsBuilding(true);
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    setBuildSuccess(true);
    setIsBuilding(false);
  };

  return (
    <div id="orchestrator-module-container" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Module Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-cyan-400">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Oggy Docker Containerizer & Kubernetes Clusters <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-0.5 rounded border border-cyan-500/20">Phase 8 Active</span>
            </h3>
            <p className="text-xs text-slate-400">Manage clustered pod states, orchestrate container lifecycles, and edit Docker configuration templates</p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('cluster')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              activeTab === 'cluster' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            K8S CLUSTER MONITOR
          </button>
          <button
            onClick={() => setActiveTab('dockerfile')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              activeTab === 'dockerfile' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DOCKERFILE BUILDER
          </button>
        </div>
      </div>

      {activeTab === 'cluster' && (
        <div className="flex-1 flex min-h-0">
          {/* Left panel: Active Pods list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Kubernetes Pods Instance Registry ({pods.length})
              </span>
              <button
                onClick={handleAddPod}
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-[11px] font-mono rounded transition-all uppercase tracking-wider"
              >
                + Deploy Pod
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {pods.map((pod) => (
                <div
                  key={pod.id}
                  className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200 font-mono text-xs truncate max-w-[80%]">{pod.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        pod.status === 'Running' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20' :
                        pod.status === 'Pending' ? 'bg-amber-950/20 text-amber-400 border border-amber-500/20 animate-pulse' :
                        'bg-slate-950 text-slate-500 border border-slate-850'
                      }`}>
                        {pod.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/50 p-2 rounded-lg border border-slate-900">
                      <div>CPU: <span className="text-slate-300">{pod.cpu}</span></div>
                      <div>RAM: <span className="text-slate-300">{pod.ram}</span></div>
                      <div>Restarts: <span className="text-slate-300">{pod.restarts}</span></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-850 pt-2 text-[10px] font-mono text-slate-500">
                    <span>Age: {pod.age}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestartPod(pod.id)}
                        className="text-cyan-400 font-bold hover:underline"
                      >
                        Restart
                      </button>
                      <button
                        onClick={() => handleTerminatePod(pod.id)}
                        className="text-rose-400 hover:text-rose-300 font-bold"
                      >
                        Terminate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Visual Node Topology Map */}
          <div className="w-80 bg-slate-900/60 border-l border-slate-800 p-4 space-y-4 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Cluster Node Topology Map
              </span>

              {/* Topology diagrams */}
              <div className="space-y-4 p-4 bg-slate-950 border border-slate-850 rounded-xl flex flex-col items-center">
                
                {/* Node box: Load Balancer */}
                <div className="px-4 py-2 bg-violet-500/10 border border-violet-500/40 text-violet-400 font-mono text-xs font-bold rounded-lg text-center w-48 relative shadow-lg shadow-violet-500/5">
                  Load Balancer Gateway
                  <span className="absolute -bottom-2 left-24 w-0.5 h-2 bg-slate-850"></span>
                </div>

                {/* Vertical lines and connector */}
                <div className="w-1 h-2 bg-slate-800"></div>

                {/* Node box: Kubernetes Master Node */}
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold rounded-lg text-center w-48 relative shadow-lg shadow-emerald-500/5">
                  K8S Control Plane
                  <span className="absolute -bottom-2 left-24 w-0.5 h-2 bg-slate-850"></span>
                  <div className="absolute -left-1.5 -right-1.5 top-3 flex justify-between">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>
                </div>

                <div className="w-32 h-0.5 bg-slate-800"></div>

                {/* Split rows for worker nodes */}
                <div className="flex gap-4 w-full justify-between">
                  <div className="flex-1 p-2 bg-slate-900 border border-slate-800 text-[10px] text-center rounded-lg font-mono text-slate-300">
                    <HardDrive className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
                    Node-Alpha
                    <span className="text-[9px] text-emerald-400 block mt-0.5">● Active</span>
                  </div>

                  <div className="flex-1 p-2 bg-slate-900 border border-slate-800 text-[10px] text-center rounded-lg font-mono text-slate-300">
                    <HardDrive className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
                    Node-Beta
                    <span className="text-[9px] text-emerald-400 block mt-0.5">● Active</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl text-xs text-slate-400 space-y-1 font-mono leading-normal">
              <span className="font-bold text-[10px] text-slate-300 uppercase block tracking-wider">Cluster Ingress Specs</span>
              <div>• Control plane distributes container replications seamlessly.</div>
              <div>• Automated load balancer maps incoming requests dynamically.</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dockerfile' && (
        <div className="flex-1 p-4 flex flex-col space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 flex-1">
            
            {/* Left side: Dockerfile Code editor */}
            <div className="flex flex-col space-y-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Docker Configuration File (Dockerfile)
              </span>
              <textarea
                value={dockerfileContent}
                onChange={(e) => setDockerfileContent(e.target.value)}
                className="flex-1 bg-[#070b13] border border-slate-850 p-4 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 leading-relaxed resize-none h-80 min-h-[300px]"
              />
              <button
                onClick={handleBuildDocker}
                disabled={isBuilding}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-lg transition-all font-mono"
              >
                {isBuilding ? 'BUILDING DOCKER CONTAINER...' : 'BUILD CONTAINER IMAGE'}
              </button>
            </div>

            {/* Right side: Docker terminal console outputs */}
            <div className="flex flex-col space-y-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Docker Daemon Output Terminal
              </span>
              <div className="flex-1 bg-[#070b13] border border-slate-850 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-1.5 overflow-y-auto max-h-[360px]">
                {logs.length === 0 ? (
                  <div className="text-slate-500 italic text-center py-24 select-none">
                    Edit the Dockerfile on the left pane and press "Build Container Image" to compile the microservices bundle.
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.includes('Successfully built') || log.includes('✓')
                          ? 'text-emerald-400 font-bold'
                          : log.includes('Step')
                          ? 'text-cyan-400 font-bold'
                          : 'text-slate-400'
                      }
                    >
                      {log}
                    </div>
                  ))
                )}

                {buildSuccess && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-400 space-y-1 mt-4">
                    <span className="font-bold flex items-center gap-1.5 uppercase text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> DOCKER BUNDLE GENERATED
                    </span>
                    <p className="text-[11px] font-mono text-slate-300 leading-normal">
                      Container binary built, tagged as oggy-app:latest, and loaded into internal Kubernetes pod controller.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
