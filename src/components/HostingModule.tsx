import React, { useState } from 'react';
import { 
  Server, Globe, Cpu, Terminal as Term, ExternalLink, Play, CheckCircle, RefreshCw, Layers,
  Database, ShieldCheck, Cloud, Network, Check, Eye, Activity, Workflow, HardDrive, Lock, Mail, Bell, MessageSquare, Flame, TrendingUp, Cpu as AiIcon, CreditCard, Box
} from 'lucide-react';

// Infrastructure Categories Types (29 total categories)
interface InfrastructureState {
  cloudPlatform: string;
  deploymentTarget: string;
  containerTech: string;
  orchestration: string;
  loadBalancer: string;
  webServer: string;
  reverseProxy: string;
  database: string;
  cache: string;
  messageQueue: string;
  storage: string;
  cdn: string;
  secretManagement: string;
  monitoring: string;
  logging: string;
  errorTracking: string;
  cicd: string;
  dns: string;
  securityWaf: string;
  // 10 New Enterprise additions
  serviceMesh: string;
  serverless: string;
  search: string;
  email: string;
  pushNotifications: string;
  realtime: string;
  analytics: string;
  localAi: string;
  payments: string;
  packageRegistry: string;
}

export default function HostingModule() {
  const [activeTab, setActiveTab] = useState<'designer' | 'deployments'>('designer');
  const [configTab, setConfigTab] = useState<'compute' | 'data' | 'networking' | 'ops' | 'services'>('compute');
  
  // Custom Preset selection
  const [selectedPreset, setSelectedPreset] = useState<string>('aws-ha');

  // Interactive 29-Category Infrastructure Stack State
  const [stack, setStack] = useState<InfrastructureState>({
    cloudPlatform: 'AWS',
    deploymentTarget: 'Cloud Run',
    containerTech: 'Docker',
    orchestration: 'Kubernetes (K8s)',
    loadBalancer: 'AWS ALB',
    webServer: 'Nginx',
    reverseProxy: 'Nginx',
    database: 'PostgreSQL',
    cache: 'Redis',
    messageQueue: 'Apache Kafka',
    storage: 'AWS S3',
    cdn: 'AWS CloudFront',
    secretManagement: 'AWS Secrets Manager',
    monitoring: 'Prometheus',
    logging: 'Loki',
    errorTracking: 'Sentry',
    cicd: 'GitHub Actions',
    dns: 'Route53',
    securityWaf: 'Web Application Firewall (WAF)',
    // 10 New Enterprise additions
    serviceMesh: 'Istio',
    serverless: 'AWS Lambda',
    search: 'Meilisearch',
    email: 'Resend',
    pushNotifications: 'Firebase Cloud Messaging (FCM)',
    realtime: 'Socket.IO',
    analytics: 'PostHog',
    localAi: 'Ollama',
    payments: 'Stripe',
    packageRegistry: 'npm'
  });

  // Track deployed stacks list
  const [deployments, setDeployments] = useState<any[]>([
    {
      id: 'dep-enterprise-1',
      projectName: 'oggy-core-ingress-production',
      preset: 'AWS Enterprise High-Availability',
      status: 'live',
      url: 'https://oggy-prod.aws-cluster.internal',
      createdAt: new Date(Date.now() - 5 * 86400000).toLocaleDateString(),
      stack: {
        cloudPlatform: 'AWS',
        deploymentTarget: 'Kubernetes (K8s)',
        database: 'PostgreSQL',
        cache: 'Redis',
        cdn: 'AWS CloudFront',
        monitoring: 'Prometheus',
        cicd: 'GitHub Actions',
        serviceMesh: 'Istio',
        serverless: 'AWS Lambda',
        search: 'Meilisearch',
        email: 'SendGrid',
        pushNotifications: 'Firebase Cloud Messaging (FCM)',
        realtime: 'Socket.IO',
        analytics: 'PostHog',
        localAi: 'Ollama',
        payments: 'Stripe',
        packageRegistry: 'npm'
      },
      uptime: '99.98%',
      cpuLoad: '14.2%',
      ramLoad: '38.5%',
    },
    {
      id: 'dep-serverless-2',
      projectName: 'oggy-landing-page-v3',
      preset: 'Vercel + Supabase Serverless',
      status: 'live',
      url: 'https://oggy-landing.vercel.app',
      createdAt: new Date(Date.now() - 1 * 86400000).toLocaleDateString(),
      stack: {
        cloudPlatform: 'Cloudflare',
        deploymentTarget: 'Vercel',
        database: 'PostgreSQL',
        cache: 'Redis',
        cdn: 'Cloudflare CDN',
        monitoring: 'Uptime Kuma',
        cicd: 'GitHub Actions',
        serviceMesh: 'Linkerd',
        serverless: 'Google Cloud Functions',
        search: 'Typesense',
        email: 'Resend',
        pushNotifications: 'OneSignal',
        realtime: 'Live Collaboration',
        analytics: 'Plausible',
        localAi: 'Local Model Manager',
        payments: 'PayPal',
        packageRegistry: 'npm'
      },
      uptime: '100.00%',
      cpuLoad: '2.1%',
      ramLoad: '5.4%',
    }
  ]);

  const [projectName, setProjectName] = useState('oggy-enterprise-service');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [activeDeploymentDetails, setActiveDeploymentDetails] = useState<any | null>(null);

  // Apply Presets
  const applyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    if (presetKey === 'aws-ha') {
      setStack({
        cloudPlatform: 'AWS',
        deploymentTarget: 'Cloud Run',
        containerTech: 'Docker',
        orchestration: 'Kubernetes (K8s)',
        loadBalancer: 'AWS ALB',
        webServer: 'Nginx',
        reverseProxy: 'Nginx',
        database: 'PostgreSQL',
        cache: 'Redis',
        messageQueue: 'Apache Kafka',
        storage: 'AWS S3',
        cdn: 'AWS CloudFront',
        secretManagement: 'AWS Secrets Manager',
        monitoring: 'Prometheus',
        logging: 'Loki',
        errorTracking: 'Sentry',
        cicd: 'GitHub Actions',
        dns: 'Route53',
        securityWaf: 'Web Application Firewall (WAF)',
        serviceMesh: 'Istio',
        serverless: 'AWS Lambda',
        search: 'Meilisearch',
        email: 'SendGrid',
        pushNotifications: 'Firebase Cloud Messaging (FCM)',
        realtime: 'Socket.IO',
        analytics: 'PostHog',
        localAi: 'Ollama',
        payments: 'Stripe',
        packageRegistry: 'npm'
      });
    } else if (presetKey === 'vercel-serverless') {
      setStack({
        cloudPlatform: 'Cloudflare',
        deploymentTarget: 'Vercel',
        containerTech: 'Multi-stage Builds',
        orchestration: 'ArgoCD',
        loadBalancer: 'Cloudflare Load Balancer',
        webServer: 'Caddy',
        reverseProxy: 'Caddy',
        database: 'PostgreSQL',
        cache: 'Redis',
        messageQueue: 'Redis Streams',
        storage: 'Cloudflare R2',
        cdn: 'Cloudflare CDN',
        secretManagement: 'GCP Secret Manager',
        monitoring: 'Uptime Kuma',
        logging: 'ELK Stack',
        errorTracking: 'Sentry',
        cicd: 'GitHub Actions',
        dns: 'Cloudflare DNS',
        securityWaf: 'DDoS Protection',
        serviceMesh: 'Linkerd',
        serverless: 'Google Cloud Functions',
        search: 'Typesense',
        email: 'Resend',
        pushNotifications: 'OneSignal',
        realtime: 'Live Collaboration',
        analytics: 'Plausible',
        localAi: 'Local Model Manager',
        payments: 'PayPal',
        packageRegistry: 'PyPI'
      });
    } else if (presetKey === 'gcp-run') {
      setStack({
        cloudPlatform: 'Google Cloud Platform (GCP)',
        deploymentTarget: 'Cloud Run',
        containerTech: 'Container Registry',
        orchestration: 'Kubernetes (K8s)',
        loadBalancer: 'Traefik',
        webServer: 'Nginx',
        reverseProxy: 'Traefik',
        database: 'MongoDB',
        cache: 'Memcached',
        messageQueue: 'NATS',
        storage: 'Google Cloud Storage',
        cdn: 'Fastly',
        secretManagement: 'GCP Secret Manager',
        monitoring: 'Grafana',
        logging: 'OpenSearch',
        errorTracking: 'Rollbar',
        cicd: 'GitHub Actions',
        dns: 'Google Cloud DNS',
        securityWaf: 'IP Whitelist',
        serviceMesh: 'Istio',
        serverless: 'Google Cloud Functions',
        search: 'Meilisearch',
        email: 'SMTP',
        pushNotifications: 'Firebase Cloud Messaging (FCM)',
        realtime: 'WebRTC',
        analytics: 'Google Analytics',
        localAi: 'llama.cpp',
        payments: 'Razorpay',
        packageRegistry: 'Maven'
      });
    } else if (presetKey === 'self-hosted') {
      setStack({
        cloudPlatform: 'Hetzner',
        deploymentTarget: 'Render',
        containerTech: 'Docker Compose',
        orchestration: 'Minikube',
        loadBalancer: 'HAProxy',
        webServer: 'Apache',
        reverseProxy: 'Caddy',
        database: 'SQLite',
        cache: 'Memcached',
        messageQueue: 'RabbitMQ',
        storage: 'MinIO',
        cdn: 'BunnyCDN',
        secretManagement: 'HashiCorp Vault',
        monitoring: 'Zabbix',
        logging: 'Graylog',
        errorTracking: 'Rollbar',
        cicd: 'GitLab CI/CD',
        dns: 'Cloudflare DNS',
        securityWaf: 'IP Blacklist',
        serviceMesh: 'Linkerd',
        serverless: 'Azure Functions',
        search: 'Typesense',
        email: 'SMTP',
        pushNotifications: 'OneSignal',
        realtime: 'Socket.IO',
        analytics: 'Plausible',
        localAi: 'Ollama',
        payments: 'Stripe',
        packageRegistry: 'npm'
      });
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployLogs([
      `[INIT] Validating 29-Category Enterprise configuration matrix for project [${projectName}]...`,
      `[MATRIX] Selected Cloud: ${stack.cloudPlatform} | Orchestration: ${stack.orchestration}`,
      `[MATRIX] Data Cluster: ${stack.database} | Cache Node: ${stack.cache}`,
    ]);

    const generatedLogs = [
      `[SECURITY] Initializing ${stack.secretManagement} module...`,
      `[SECURITY] Binding ${stack.securityWaf} parameters globally...`,
      `[MESH] Deploying high-throughput Service Mesh layer [${stack.serviceMesh}]...`,
      `[SERVERLESS] Bootstrapping [${stack.serverless}] cold-start profiles...`,
      `[SEARCH] Spinning up real-time search instance [${stack.search}]...`,
      `[INTEGRATIONS] Configuring Mail SMTP via [${stack.email}] gateway...`,
      `[INTEGRATIONS] Linking real-time [${stack.realtime}] state channels...`,
      `[INTEGRATIONS] Validating secure payment gateway [${stack.payments}]...`,
      `[INTEGRATIONS] Linking Firebase/OneSignal push gateway [${stack.pushNotifications}]...`,
      `[INFRA] Allocating private virtual networking (VPC subnets) inside ${stack.cloudPlatform} regions...`,
      `[CI/CD] Compiling GitHub workflow templates for ${stack.cicd} pipeline...`,
      `[CONTAINER] Invoking local daemon to construct ${stack.containerTech} layer...`,
      `[ORCHESTRATOR] Scaling worker replication nodes inside ${stack.orchestration}...`,
      `[STORAGE] Deploying cloud asset containers via ${stack.storage} with TLS policies...`,
      `[DB-PROV] Spinning up high-availability ${stack.database} replicas...`,
      `[DB-PROV] Establishing connection pooler and loading database seeds...`,
      `[CACHE] Deploying high-throughput ${stack.cache} cache instances...`,
      `[MQ] Registering ${stack.messageQueue} messaging brokers...`,
      `[NETWORKING] Binding incoming traffic through ${stack.loadBalancer} gateway...`,
      `[INGRESS] Constructing ${stack.webServer} server configuration endpoints...`,
      `[DNS] Injecting target Record bindings to ${stack.dns}...`,
      `[CDN] Configuring global edge CDN cache rules with ${stack.cdn}...`,
      `[OPS] Activating ${stack.monitoring} metrics endpoints...`,
      `[OPS] Binding Local AI runtime engine [${stack.localAi}]...`,
      `[OPS] Registering Package artifacts with [${stack.packageRegistry}]...`,
      `[OPS] Directing telemetry log streams to [${stack.logging}] and error track to [${stack.errorTracking}]...`,
      `[SUCCESS] 29-Tier Enterprise Architecture fully virtualized and deployed!`,
      `[SUCCESS] Public Ingress Gateway: https://${projectName}.${stack.cloudPlatform.toLowerCase().replace(/[^a-z0-9]/g, '')}.oggy-ingress.net`
    ];

    // Roll logs across screen in typical developer style
    for (let i = 0; i < generatedLogs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      setDeployLogs((prev) => [...prev, generatedLogs[i]]);
    }

    const platformKey = stack.cloudPlatform;
    const finalUrl = `https://${projectName}.${platformKey.toLowerCase().replace(/[^a-z0-9]/g, '')}.oggy-ingress.net`;

    const newDep = {
      id: `dep-custom-${Date.now()}`,
      projectName,
      preset: selectedPreset === 'aws-ha' ? 'AWS High-Availability Cluster' :
              selectedPreset === 'vercel-serverless' ? 'Vercel Serverless Architecture' :
              selectedPreset === 'gcp-run' ? 'GCP Managed Cloud Run' : 'Self-Hosted Solid Core',
      status: 'live',
      url: finalUrl,
      createdAt: new Date().toLocaleDateString(),
      stack: { ...stack },
      uptime: '100.00%',
      cpuLoad: '4.8%',
      ramLoad: '12.9%'
    };

    setDeployments((prev) => [newDep, ...prev]);
    setIsDeploying(false);
  };

  const handleRemoveDeployment = (id: string) => {
    setDeployments(prev => prev.filter(d => d.id !== id));
    if (activeDeploymentDetails?.id === id) {
      setActiveDeploymentDetails(null);
    }
  };

  return (
    <div id="hosting-module-root" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Module Navigation Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Cloud className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans font-black tracking-wider text-slate-100 flex items-center gap-2 text-sm">
              OGGY ENTERPRISE CLOUD ARCHITECT <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-widest font-mono">PRO SUITE</span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">Build, orchestrate, and visualize high-availability multi-region enterprise server matrices</p>
          </div>
        </div>

        {/* View Selection tabs */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg self-start sm:self-center">
          <button
            onClick={() => { setActiveTab('designer'); setActiveDeploymentDetails(null); }}
            className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
              activeTab === 'designer' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ARCHITECTURE BUILDER
          </button>
          <button
            onClick={() => setActiveTab('deployments')}
            className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'deployments' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ACTIVE ENGINES ({deployments.length})
          </button>
        </div>
      </div>

      {activeTab === 'designer' ? (
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          
          {/* Left panel: Expandable configuration accordion / categories tabs */}
          <div className="w-full lg:w-96 bg-slate-900/40 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 space-y-4 overflow-y-auto shrink-0 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Presets Manager */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  1. select target stack preset
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyPreset('aws-ha')}
                    className={`p-2.5 rounded-xl border font-mono text-left transition-all ${
                      selectedPreset === 'aws-ha'
                        ? 'bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 border-emerald-500/40 text-emerald-400 font-bold shadow-lg shadow-emerald-500/5'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wider">AWS Multi-Region</div>
                    <span className="text-[9px] text-slate-500 font-normal block mt-1">High-Availability</span>
                  </button>
                  <button
                    onClick={() => applyPreset('vercel-serverless')}
                    className={`p-2.5 rounded-xl border font-mono text-left transition-all ${
                      selectedPreset === 'vercel-serverless'
                        ? 'bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 border-emerald-500/40 text-emerald-400 font-bold shadow-lg shadow-emerald-500/5'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wider">Vercel + Supabase</div>
                    <span className="text-[9px] text-slate-500 font-normal block mt-1">Scale-To-Zero Serverless</span>
                  </button>
                  <button
                    onClick={() => applyPreset('gcp-run')}
                    className={`p-2.5 rounded-xl border font-mono text-left transition-all ${
                      selectedPreset === 'gcp-run'
                        ? 'bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 border-emerald-500/40 text-emerald-400 font-bold shadow-lg shadow-emerald-500/5'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wider">GCP Cloud Run</div>
                    <span className="text-[9px] text-slate-500 font-normal block mt-1">Managed Containers</span>
                  </button>
                  <button
                    onClick={() => applyPreset('self-hosted')}
                    className={`p-2.5 rounded-xl border font-mono text-left transition-all ${
                      selectedPreset === 'self-hosted'
                        ? 'bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 border-emerald-500/40 text-emerald-400 font-bold shadow-lg shadow-emerald-500/5'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wider">Self-Hosted Core</div>
                    <span className="text-[9px] text-slate-500 font-normal block mt-1">Hetzner + Docker Compose</span>
                  </button>
                </div>
              </div>

              {/* Stack Category Selection Hub */}
              <div className="space-y-3">
                <div className="flex border-b border-slate-850">
                  {(['compute', 'data', 'networking', 'ops', 'services'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setConfigTab(t)}
                      className={`flex-1 pb-2 text-[10px] font-mono font-bold uppercase text-center border-b-2 transition-all ${
                        configTab === t
                          ? 'border-emerald-500 text-emerald-400'
                          : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 pt-1">
                  {configTab === 'compute' && (
                    <>
                      {/* Cloud Platform */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">☁ Cloud Platform</label>
                        <select
                          value={stack.cloudPlatform}
                          onChange={(e) => setStack({ ...stack, cloudPlatform: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['AWS', 'Google Cloud Platform (GCP)', 'Microsoft Azure', 'Oracle Cloud', 'DigitalOcean', 'Linode', 'Vultr', 'Hetzner', 'Cloudflare', 'Firebase', 'Supabase'].map(plat => (
                            <option key={plat} value={plat}>{plat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Deployment Target */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🚀 Deployment Target</label>
                        <select
                          value={stack.deploymentTarget}
                          onChange={(e) => setStack({ ...stack, deploymentTarget: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Railway', 'Render', 'Fly.io', 'Koyeb', 'Vercel', 'Netlify', 'Heroku', 'Replit Deployments', 'Cloud Run', 'App Engine'].map(targ => (
                            <option key={targ} value={targ}>{targ}</option>
                          ))}
                        </select>
                      </div>

                      {/* Container Technology */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🐳 Container Tech</label>
                        <select
                          value={stack.containerTech}
                          onChange={(e) => setStack({ ...stack, containerTech: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Docker', 'Docker Compose', 'Container Registry', 'Image Builder', 'Multi-stage Builds'].map(cont => (
                            <option key={cont} value={cont}>{cont}</option>
                          ))}
                        </select>
                      </div>

                      {/* Container Orchestration */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">☸ Orchestration</label>
                        <select
                          value={stack.orchestration}
                          onChange={(e) => setStack({ ...stack, orchestration: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Kubernetes (K8s)', 'Minikube', 'K3s', 'Helm', 'ArgoCD'].map(orch => (
                            <option key={orch} value={orch}>{orch}</option>
                          ))}
                        </select>
                      </div>

                      {/* Serverless Engine */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">⚡ Serverless</label>
                        <select
                          value={stack.serverless}
                          onChange={(e) => setStack({ ...stack, serverless: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['AWS Lambda', 'Google Cloud Functions', 'Azure Functions'].map(srv => (
                            <option key={srv} value={srv}>{srv}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {configTab === 'data' && (
                    <>
                      {/* Database */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🗄 Primary Database</label>
                        <select
                          value={stack.database}
                          onChange={(e) => setStack({ ...stack, database: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['PostgreSQL', 'MySQL', 'MariaDB', 'SQLite', 'MongoDB', 'Redis', 'Elasticsearch'].map(db => (
                            <option key={db} value={db}>{db}</option>
                          ))}
                        </select>
                      </div>

                      {/* Distributed Cache */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">⚡ Distributed Cache</label>
                        <select
                          value={stack.cache}
                          onChange={(e) => setStack({ ...stack, cache: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Redis', 'Memcached'].map(cach => (
                            <option key={cach} value={cach}>{cach}</option>
                          ))}
                        </select>
                      </div>

                      {/* Message Queue */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">📨 Message Queue</label>
                        <select
                          value={stack.messageQueue}
                          onChange={(e) => setStack({ ...stack, messageQueue: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['RabbitMQ', 'Apache Kafka', 'NATS', 'Redis Streams'].map(mq => (
                            <option key={mq} value={mq}>{mq}</option>
                          ))}
                        </select>
                      </div>

                      {/* Storage */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">💾 Cloud Storage</label>
                        <select
                          value={stack.storage}
                          onChange={(e) => setStack({ ...stack, storage: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['AWS S3', 'Cloudflare R2', 'Google Cloud Storage', 'Azure Blob Storage', 'MinIO'].map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      {/* Full-text Search Engine */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🔍 Search Engine</label>
                        <select
                          value={stack.search}
                          onChange={(e) => setStack({ ...stack, search: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Meilisearch', 'Typesense'].map(srch => (
                            <option key={srch} value={srch}>{srch}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {configTab === 'networking' && (
                    <>
                      {/* Load Balancer */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">⚖ Load Balancer</label>
                        <select
                          value={stack.loadBalancer}
                          onChange={(e) => setStack({ ...stack, loadBalancer: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Nginx', 'HAProxy', 'Traefik', 'Envoy', 'AWS ALB', 'AWS NLB', 'Cloudflare Load Balancer'].map(lb => (
                            <option key={lb} value={lb}>{lb}</option>
                          ))}
                        </select>
                      </div>

                      {/* Web Server */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🖥 Web Server</label>
                        <select
                          value={stack.webServer}
                          onChange={(e) => setStack({ ...stack, webServer: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Nginx', 'Apache', 'Caddy'].map(ws => (
                            <option key={ws} value={ws}>{ws}</option>
                          ))}
                        </select>
                      </div>

                      {/* Reverse Proxy */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🔄 Reverse Proxy</label>
                        <select
                          value={stack.reverseProxy}
                          onChange={(e) => setStack({ ...stack, reverseProxy: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Nginx', 'Traefik', 'Caddy'].map(rp => (
                            <option key={rp} value={rp}>{rp}</option>
                          ))}
                        </select>
                      </div>

                      {/* CDN */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">📡 Edge CDN</label>
                        <select
                          value={stack.cdn}
                          onChange={(e) => setStack({ ...stack, cdn: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Cloudflare CDN', 'AWS CloudFront', 'BunnyCDN', 'Fastly'].map(cd => (
                            <option key={cd} value={cd}>{cd}</option>
                          ))}
                        </select>
                      </div>

                      {/* DNS */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🌍 DNS Provider</label>
                        <select
                          value={stack.dns}
                          onChange={(e) => setStack({ ...stack, dns: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Cloudflare DNS', 'Route53', 'Google Cloud DNS'].map(dn => (
                            <option key={dn} value={dn}>{dn}</option>
                          ))}
                        </select>
                      </div>

                      {/* Service Mesh */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🌍 Service Mesh</label>
                        <select
                          value={stack.serviceMesh}
                          onChange={(e) => setStack({ ...stack, serviceMesh: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Istio', 'Linkerd'].map(msh => (
                            <option key={msh} value={msh}>{msh}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {configTab === 'ops' && (
                    <>
                      {/* Secret Management */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🔐 Secret Vault</label>
                        <select
                          value={stack.secretManagement}
                          onChange={(e) => setStack({ ...stack, secretManagement: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['HashiCorp Vault', 'AWS Secrets Manager', 'GCP Secret Manager', 'Azure Key Vault'].map(sm => (
                            <option key={sm} value={sm}>{sm}</option>
                          ))}
                        </select>
                      </div>

                      {/* Monitoring */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">📊 Live Monitoring</label>
                        <select
                          value={stack.monitoring}
                          onChange={(e) => setStack({ ...stack, monitoring: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Prometheus', 'Grafana', 'Uptime Kuma', 'Zabbix'].map(mo => (
                            <option key={mo} value={mo}>{mo}</option>
                          ))}
                        </select>
                      </div>

                      {/* Logging */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">📜 Centralized Logs</label>
                        <select
                          value={stack.logging}
                          onChange={(e) => setStack({ ...stack, logging: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Loki', 'ELK Stack', 'OpenSearch', 'Graylog'].map(lo => (
                            <option key={lo} value={lo}>{lo}</option>
                          ))}
                        </select>
                      </div>

                      {/* Error Tracking */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🚨 Error telemetry</label>
                        <select
                          value={stack.errorTracking}
                          onChange={(e) => setStack({ ...stack, errorTracking: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Sentry', 'Rollbar'].map(er => (
                            <option key={er} value={er}>{er}</option>
                          ))}
                        </select>
                      </div>

                      {/* CI/CD */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🧪 CI/CD Pipeline</label>
                        <select
                          value={stack.cicd}
                          onChange={(e) => setStack({ ...stack, cicd: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['GitHub Actions', 'GitLab CI/CD', 'CircleCI', 'Azure DevOps'].map(ci => (
                            <option key={ci} value={ci}>{ci}</option>
                          ))}
                        </select>
                      </div>

                      {/* Security Firewalls */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🛡 Security Shield (WAF)</label>
                        <select
                          value={stack.securityWaf}
                          onChange={(e) => setStack({ ...stack, securityWaf: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Web Application Firewall (WAF)', 'IP Blacklist', 'IP Whitelist', 'Geo Blocking', 'DDoS Protection'].map(sc => (
                            <option key={sc} value={sc}>{sc}</option>
                          ))}
                        </select>
                      </div>

                      {/* Package Registry */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">📦 Package Registry</label>
                        <select
                          value={stack.packageRegistry}
                          onChange={(e) => setStack({ ...stack, packageRegistry: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['npm', 'PyPI', 'Maven'].map(reg => (
                            <option key={reg} value={reg}>{reg}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {configTab === 'services' && (
                    <>
                      {/* Email SMTP / Service */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">📧 Email Service</label>
                        <select
                          value={stack.email}
                          onChange={(e) => setStack({ ...stack, email: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['SMTP', 'Resend', 'SendGrid'].map(eml => (
                            <option key={eml} value={eml}>{eml}</option>
                          ))}
                        </select>
                      </div>

                      {/* Push Notifications Gateway */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">📱 Push Notifications</label>
                        <select
                          value={stack.pushNotifications}
                          onChange={(e) => setStack({ ...stack, pushNotifications: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Firebase Cloud Messaging (FCM)', 'OneSignal'].map(psh => (
                            <option key={psh} value={psh}>{psh}</option>
                          ))}
                        </select>
                      </div>

                      {/* Real-time sync engine */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🎥 Real-Time Engine</label>
                        <select
                          value={stack.realtime}
                          onChange={(e) => setStack({ ...stack, realtime: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['WebRTC', 'Socket.IO', 'Live Collaboration'].map(rtm => (
                            <option key={rtm} value={rtm}>{rtm}</option>
                          ))}
                        </select>
                      </div>

                      {/* Payment Integrations */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">💳 Payments Provider</label>
                        <select
                          value={stack.payments}
                          onChange={(e) => setStack({ ...stack, payments: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Stripe', 'Razorpay', 'PayPal'].map(pay => (
                            <option key={pay} value={pay}>{pay}</option>
                          ))}
                        </select>
                      </div>

                      {/* Analytics Engine */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">📈 Analytics Tracker</label>
                        <select
                          value={stack.analytics}
                          onChange={(e) => setStack({ ...stack, analytics: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['PostHog', 'Plausible', 'Google Analytics'].map(anl => (
                            <option key={anl} value={anl}>{anl}</option>
                          ))}
                        </select>
                      </div>

                      {/* Local AI Engine */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">🤖 Local AI Engine</label>
                        <select
                          value={stack.localAi}
                          onChange={(e) => setStack({ ...stack, localAi: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Ollama', 'llama.cpp', 'Local Model Manager'].map(lai => (
                            <option key={lai} value={lai}>{lai}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Launch trigger at the bottom of the config column */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Service/Host Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value.replace(/\s+/g, '-'))}
                  placeholder="enter host/ingress..."
                  className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                />
              </div>

              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/10 uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                {isDeploying ? 'PROVISIONING MATRIX...' : 'PROVISION ENTERPRISE CLUSTER'}
              </button>
            </div>
          </div>

          {/* Right main workspace: Dynamic system flow chart topology and interactive compiler logs */}
          <div className="flex-1 bg-slate-950 p-4 min-h-0 overflow-y-auto flex flex-col space-y-4">
            
            {/* Interactive System Architecture Topology visualizer */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Interactive 6-Tier Enterprise Mesh Topology
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">Real-time dependency chart</span>
              </div>

              {/* Graphical Network Flow chart of exact choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                
                {/* 1. EDGE INGRESS TIER */}
                <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-black text-slate-500 tracking-wider">TIER 1: DNS & CDN</span>
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-slate-200">{stack.dns}</div>
                    <div className="text-[10px] font-mono text-emerald-400/80">{stack.cdn}</div>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-1.5 flex justify-between">
                    <span>Edge Ingress: Active</span>
                    <span className="text-emerald-400 font-bold">12ms edge</span>
                  </div>
                </div>

                {/* 2. SECURITY & PROXY TIER */}
                <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-black text-slate-500 tracking-wider">TIER 2: SECURITY & PROXY</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-slate-200 truncate">{stack.loadBalancer}</div>
                    <div className="text-[10px] font-mono text-cyan-400 truncate">{stack.reverseProxy} + {stack.serviceMesh}</div>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-1.5 truncate">
                    WAF: {stack.securityWaf}
                  </div>
                </div>

                {/* 3. COMPUTE & ORCHESTRATION */}
                <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-black text-slate-500 tracking-wider">TIER 3: CORE COMPUTE</span>
                    <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-slate-200 truncate">{stack.orchestration}</div>
                    <div className="text-[10px] font-mono text-violet-400/85 truncate">Host: {stack.deploymentTarget} ({stack.serverless})</div>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-1.5 flex justify-between">
                    <span>Replicas: Auto</span>
                    <span className="text-violet-400 font-bold">{stack.containerTech}</span>
                  </div>
                </div>

                {/* 4. PERSISTENT STORAGE & DATA */}
                <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-black text-slate-500 tracking-wider">TIER 4: DATABASES & SEARCH</span>
                    <Database className="w-3.5 h-3.5 text-yellow-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-slate-200 truncate">{stack.database} ({stack.search})</div>
                    <div className="text-[10px] font-mono text-amber-500/80 truncate">Cache: {stack.cache} | {stack.storage}</div>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-1.5 truncate">
                    Queue: {stack.messageQueue}
                  </div>
                </div>

                {/* 5. MULTI-TIER SERVICES & COMMERCE */}
                <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-black text-slate-500 tracking-wider">TIER 5: INTEGRATION GATEWAYS</span>
                    <Workflow className="w-3.5 h-3.5 text-pink-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-slate-200 truncate">Mail: {stack.email} | Realtime: {stack.realtime}</div>
                    <div className="text-[10px] font-mono text-pink-400/85 truncate">Pay: {stack.payments} | Push: {stack.pushNotifications}</div>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-1.5 flex justify-between">
                    <span>APIs: Connected</span>
                    <span className="text-pink-400 font-bold">Secure TLS</span>
                  </div>
                </div>

                {/* 6. ADVANCED ANALYTICS & LOCAL AI */}
                <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-black text-slate-500 tracking-wider">TIER 6: OPS & INTELLIGENCE</span>
                    <Activity className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-slate-200 truncate">Local AI: {stack.localAi}</div>
                    <div className="text-[10px] font-mono text-teal-400/85 truncate">Telemetry: {stack.monitoring} ({stack.analytics})</div>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-1.5 flex justify-between">
                    <span>Artifacts: {stack.packageRegistry}</span>
                    <span className="text-teal-400 font-bold">{stack.errorTracking}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Live Pipeline Terminal Console Stream output */}
            {(deployLogs.length > 0 || isDeploying) && (
              <div className="border border-slate-850 rounded-xl overflow-hidden bg-[#070b13] flex flex-col">
                <div className="p-3 border-b border-slate-850 bg-slate-900/60 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                    <Term className="w-4 h-4 text-emerald-400" /> REAL-TIME BUNDLE PROVISIONING TERMINAL
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-widest font-mono animate-pulse">
                    {isDeploying ? 'PIPELINE ACTIVE' : 'PROVISION COMPLETE'}
                  </span>
                </div>
                
                <div className="p-4 font-mono text-[10px] sm:text-xs space-y-2 overflow-y-auto max-h-[340px] leading-relaxed text-slate-300">
                  {deployLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.includes('[SUCCESS]')
                          ? 'text-emerald-400 font-bold border-l-2 border-emerald-500 pl-2'
                          : log.includes('[SECURITY]') || log.includes('[INTEGRATIONS]')
                          ? 'text-cyan-400'
                          : log.includes('[INIT]') || log.includes('[MATRIX]')
                          ? 'text-slate-500'
                          : 'text-slate-300'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>

                {!isDeploying && (
                  <div className="p-3.5 bg-emerald-950/10 border-t border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono text-emerald-400">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                      <CheckCircle className="w-4 h-4 text-emerald-400" /> Infrastructure Provisioning complete
                    </span>
                    <a
                      href={`https://${projectName}.${stack.cloudPlatform.toLowerCase().replace(/[^a-z0-9]/g, '')}.oggy-ingress.net`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:underline text-cyan-400 font-bold"
                    >
                      OPEN INGRESS GATEWAY <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Overview checklist of the total technology stack scope */}
            <div className="bg-slate-900/10 border border-slate-850 p-4 rounded-xl space-y-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Total Enterprise Integrations Scope
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                <div className="p-2.5 bg-slate-900/30 rounded-lg border border-slate-900 flex flex-col justify-between h-14">
                  <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1"><Cpu className="w-3 h-3 text-emerald-400" /> COMPUTE</div>
                  <div className="text-xs font-mono font-bold text-slate-300 truncate">{stack.deploymentTarget} ({stack.serverless})</div>
                </div>
                <div className="p-2.5 bg-slate-900/30 rounded-lg border border-slate-900 flex flex-col justify-between h-14">
                  <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1"><Database className="w-3 h-3 text-yellow-500" /> DATA / SEARCH</div>
                  <div className="text-xs font-mono font-bold text-slate-300 truncate">{stack.database} + {stack.search}</div>
                </div>
                <div className="p-2.5 bg-slate-900/30 rounded-lg border border-slate-900 flex flex-col justify-between h-14">
                  <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3 text-cyan-400" /> COMMUNICATIONS</div>
                  <div className="text-xs font-mono font-bold text-slate-300 truncate">{stack.email} + {stack.pushNotifications}</div>
                </div>
                <div className="p-2.5 bg-slate-900/30 rounded-lg border border-slate-900 flex flex-col justify-between h-14">
                  <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1"><CreditCard className="w-3 h-3 text-pink-400" /> PAYMENTS & SYNC</div>
                  <div className="text-xs font-mono font-bold text-slate-300 truncate">{stack.payments} + {stack.realtime}</div>
                </div>
                <div className="p-2.5 bg-slate-900/30 rounded-lg border border-slate-900 flex flex-col justify-between h-14">
                  <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1"><AiIcon className="w-3 h-3 text-purple-400" /> AI & METRICS</div>
                  <div className="text-xs font-mono font-bold text-slate-300 truncate">{stack.localAi} / {stack.analytics}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Active Deployments view pane */
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          
          {activeDeploymentDetails ? (
            /* Immersive Infrastructure Dashboard Mode for selected deployment */
            <div className="space-y-4">
              <button
                onClick={() => setActiveDeploymentDetails(null)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                ← Back to engines registry
              </button>

              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="font-sans font-black tracking-wider text-slate-100 uppercase text-base">
                      {activeDeploymentDetails.projectName}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Host Node: <span className="text-slate-300">{activeDeploymentDetails.url}</span>
                    </p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1.5 rounded-xl border border-emerald-500/20 font-bold font-mono">
                    ● ACTIVE INGRESS
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                  <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">SYSTEM UPTIME</span>
                    <span className="text-lg font-mono font-bold text-emerald-400 mt-0.5 block">{activeDeploymentDetails.uptime}</span>
                  </div>
                  <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">CPU MATRIX LOAD</span>
                    <span className="text-lg font-mono font-bold text-cyan-400 mt-0.5 block">{activeDeploymentDetails.cpuLoad}</span>
                  </div>
                  <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">RAM CLUSTER METRIC</span>
                    <span className="text-lg font-mono font-bold text-violet-400 mt-0.5 block">{activeDeploymentDetails.ramLoad}</span>
                  </div>
                  <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">DATA REPLICAS STATUS</span>
                    <span className="text-lg font-mono font-bold text-yellow-500 mt-0.5 block">HA ACTIVE</span>
                  </div>
                </div>

                {/* Sub-components configured details */}
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Active 29-Category Enterprise Suite
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {Object.entries(activeDeploymentDetails.stack).map(([key, val]: any) => (
                      <div key={key} className="p-2.5 bg-slate-950/50 border border-slate-850 rounded-lg flex items-center justify-between font-mono text-[11px]">
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase tracking-wider truncate max-w-[120px]" title={key}>{key.replace(/([A-Z])/g, ' $1')}</div>
                          <div className="text-slate-200 font-bold mt-0.5 truncate max-w-[130px]" title={val}>{val}</div>
                        </div>
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Deployment List view */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Active Provisioned Ingress Engines ({deployments.length})
                </span>
              </div>

              {deployments.length === 0 ? (
                <div className="text-center py-24 bg-slate-900/10 border border-slate-850 rounded-xl">
                  <div className="text-slate-500 font-mono text-xs italic">
                    No active infrastructure clusters provisioned. Use the "ARCHITECTURE BUILDER" tab to launch one.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {deployments.map((dep) => (
                    <div
                      key={dep.id}
                      className="p-4 bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-100">{dep.projectName}</span>
                          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono font-bold uppercase">
                            {dep.status}
                          </span>
                          <span className="bg-slate-800 text-[9px] text-slate-400 px-1.5 py-0.2 rounded font-mono uppercase">
                            {dep.stack?.cloudPlatform || 'Cloud'}
                          </span>
                        </div>
                        <a
                          href={dep.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-mono text-cyan-400/80 hover:text-cyan-400 flex items-center gap-1 hover:underline"
                        >
                          {dep.url} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono self-start md:self-center">
                        <div className="text-left hidden lg:block">
                          <span className="text-[9px] text-slate-500 block uppercase">DATABASES</span>
                          <span className="text-slate-300 font-bold">{dep.stack?.database || 'None'}</span>
                        </div>
                        <div className="text-left hidden sm:block">
                          <span className="text-[9px] text-slate-500 block uppercase">MONITORING</span>
                          <span className="text-slate-300 font-bold">{dep.stack?.monitoring || 'Uptime'}</span>
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] text-slate-500 block uppercase">UPTIME</span>
                          <span className="text-emerald-400 font-bold">{dep.uptime}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center">
                        <button
                          onClick={() => setActiveDeploymentDetails(dep)}
                          className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/25 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> INSPECT DASHBOARD
                        </button>
                        <button
                          onClick={() => handleRemoveDeployment(dep.id)}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 border border-rose-500/15 hover:border-rose-500/35 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          TEARDOWN
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
