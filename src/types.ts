export interface WorkspaceFile {
  path: string;
  content: string;
  isDir: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
  image?: string; // Base64 representation for image understanding
  audio?: string; // Base64 PCM/WAV for voice
}

export interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  timestamp: string;
}

export interface DBColumn {
  name: string;
  type: string;
  primaryKey?: boolean;
  nullable?: boolean;
}

export interface DBTable {
  name: string;
  columns: DBColumn[];
  rows: Record<string, any>[];
}

export interface SystemMetric {
  timestamp: string;
  cpu: number;
  ram: number;
  storage: number;
  activeProjects: number;
  requestCount: number;
}

export interface DeploymentProject {
  id: string;
  name: string;
  status: 'idle' | 'deploying' | 'live' | 'failed';
  url?: string;
  platform: string;
  createdAt: string;
  logs: string[];
}

export interface APIRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: { key: string; value: string }[];
  body: string;
  responseStatus?: number;
  responseBody?: string;
  responseTime?: number;
}
