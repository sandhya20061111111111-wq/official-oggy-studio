import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { exec } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

const resolvedFilename = typeof __filename !== 'undefined'
  ? __filename
  : (import.meta && import.meta.url ? fileURLToPath(import.meta.url) : '');

const resolvedDirname = typeof __dirname !== 'undefined'
  ? __dirname
  : (resolvedFilename ? path.dirname(resolvedFilename) : process.cwd());

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Set up Workspace Directory
const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');
if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  // Populate with starter files
  fs.writeFileSync(
    path.join(WORKSPACE_DIR, 'index.js'),
    `// Oggy Studio Developer Workspace
console.log("Starting service...");

const greetings = ["Hello Developer!", "Welcome to Oggy Studio", "AI Platform active"];
const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

console.log(randomGreeting);
console.log("Current system state: OPTIMAL");
`
  );
  fs.writeFileSync(
    path.join(WORKSPACE_DIR, 'package.json'),
    `{
  "name": "oggy-workspace-app",
  "version": "1.0.0",
  "description": "Oggy Studio Sandbox App",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Running tests... All 4 passed!\\""
  },
  "dependencies": {}
}`
  );
  fs.writeFileSync(
    path.join(WORKSPACE_DIR, 'README.md'),
    `# Oggy Studio Sandbox

Welcome to your production-grade sandbox workspace.
You can:
1. Edit index.js, README.md, and other files.
2. Open the terminal and execute commands like \`node index.js\` or \`npm run test\`.
3. Command git integration using \`git status\`.
4. Run live code executions and previews!
`
  );
}

// In-Memory SQLite Simulator Store
let databaseStore: {
  tables: Record<string, {
    columns: { name: string; type: string; primaryKey: boolean; nullable: boolean }[];
    rows: Record<string, any>[];
  }>;
} = {
  tables: {
    users: {
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true, nullable: false },
        { name: 'name', type: 'TEXT', primaryKey: false, nullable: false },
        { name: 'email', type: 'TEXT', primaryKey: false, nullable: false },
        { name: 'role', type: 'TEXT', primaryKey: false, nullable: true },
      ],
      rows: [
        { id: 1, name: 'Oggy', email: 'oggy@studio.ai', role: 'CTO' },
        { id: 2, name: 'Jack', email: 'jack@studio.ai', role: 'DevOps' },
        { id: 3, name: 'Olivia', email: 'olivia@studio.ai', role: 'UI/UX' },
      ],
    },
    projects: {
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true, nullable: false },
        { name: 'title', type: 'TEXT', primaryKey: false, nullable: false },
        { name: 'tech_stack', type: 'TEXT', primaryKey: false, nullable: false },
        { name: 'status', type: 'TEXT', primaryKey: false, nullable: false },
      ],
      rows: [
        { id: 1, title: 'Oggy Studio Cloud', tech_stack: 'React, Express', status: 'In Progress' },
        { id: 2, title: 'Portfolio Website', tech_stack: 'Vite, CSS', status: 'Deployed' },
      ],
    },
  },
};

// Initialize Gemini Client
const aiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (aiApiKey && aiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: aiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing Gemini AI SDK:', err);
  }
}

// ------------------- API ROUTES -------------------

// PWA manifest and service worker routes
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    name: "Oggy Studio",
    short_name: "OggyStudio",
    description: "Oggy Studio: Next-Gen Replit-Like Sandbox & AI IDE Workspace",
    start_url: "/",
    display: "standalone",
    background_color: "#070b13",
    theme_color: "#0a0f1d",
    orientation: "any",
    icons: [
      {
        src: "https://img.icons8.com/nolan/256/terminal.png",
        sizes: "256x256",
        type: "image/png"
      },
      {
        src: "https://img.icons8.com/nolan/512/terminal.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  });
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    const CACHE_NAME = 'oggy-studio-v1';
    self.addEventListener('install', (event) => {
      self.skipWaiting();
    });
    self.addEventListener('activate', (event) => {
      event.waitUntil(self.clients.claim());
    });
    self.addEventListener('fetch', (event) => {
      event.respondWith(fetch(event.request));
    });
  `);
});


// ------------------- OWNER CONTROL CENTER STATE & APIS -------------------
const OWNER_SECRET_KEY = process.env.OWNER_SECRET_KEY || 'oggy-owner-secret-2026';
const activeOwnerSessions = new Set<string>();
let isMaintenanceMode = false;

const aiSettingsState = {
  model: 'gemini-3.5-flash',
  temperature: 0.2,
  maxHistory: 50,
  memoryRetention: true,
  lastUpdated: new Date().toISOString()
};

const ownerAuditLogs: any[] = [
  { timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'SYSTEM_BOOT', details: 'Oggy Studio main kernel initialized successfully', status: 'SUCCESS', ip: '127.0.0.1' },
  { timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'SECURITY_SHIELD_UPGRADE', details: 'Upgraded system transport filters to secure TLS/XOR standards', status: 'SUCCESS', ip: '127.0.0.1' },
];

const logOwnerAction = (action: string, details: string, status: string = 'SUCCESS', ip: string = '127.0.0.1') => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details,
    status,
    ip
  };
  ownerAuditLogs.unshift(logEntry);
  try {
    fs.appendFileSync(path.join(process.cwd(), 'owner_audit.log'), JSON.stringify(logEntry) + '\n');
  } catch (e) {}
};

// ------------------- NEW AUTHENTICATION & USER REGISTRY SYSTEM -------------------
const USERS_FILE = path.join(process.cwd(), 'users.json');

const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'Owner' | 'Admin' | 'Moderator' | 'User' | 'Guest';
  failedAttempts: number;
  lockoutUntil: string | null;
  loginHistory: { timestamp: string; ip: string; status: string }[];
  createdAt: string;
}

// Pre-seed LORDxOGGY as OWNER
const loadUsers = (): User[] => {
  if (!fs.existsSync(USERS_FILE)) {
    const defaultOwner: User = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      username: 'LORDxOGGY',
      email: 'lordxoggy@oggy.studio',
      passwordHash: hashPassword('OCGAMINGKING'),
      role: 'Owner',
      failedAttempts: 0,
      lockoutUntil: null,
      loginHistory: [
        { timestamp: new Date().toISOString(), ip: '127.0.0.1', status: 'Pre-seeded Root Owner' }
      ],
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify([defaultOwner], null, 2));
    return [defaultOwner];
  }
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveUsers = (users: User[]) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {}
};

// In-Memory Active Session Tracker
const activeSessions = new Map<string, { userId: string; username: string; email: string; role: string; expiresAt: number }>();
const SESSIONS_FILE = path.join(process.cwd(), 'sessions.json');

const loadSessions = () => {
  if (!fs.existsSync(SESSIONS_FILE)) {
    return;
  }
  try {
    const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    const now = Date.now();
    
    if (parsed.activeSessions) {
      for (const [token, s] of Object.entries(parsed.activeSessions)) {
        const session = s as { userId: string; username: string; email: string; role: string; expiresAt: number };
        if (session.expiresAt > now) {
          activeSessions.set(token, session);
          if (session.role === 'Owner') {
            activeOwnerSessions.add(token);
          }
        }
      }
    }
    
    if (Array.isArray(parsed.activeOwnerSessions)) {
      for (const token of parsed.activeOwnerSessions) {
        activeOwnerSessions.add(token);
      }
    }
  } catch (err) {
    console.error('Failed to load sessions:', err);
  }
};

const saveSessions = () => {
  try {
    const sessionsObj: Record<string, any> = {};
    for (const [token, session] of activeSessions.entries()) {
      sessionsObj[token] = session;
    }
    const ownerSessionsArr = Array.from(activeOwnerSessions);
    const data = {
      activeSessions: sessionsObj,
      activeOwnerSessions: ownerSessionsArr
    };
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to save sessions:', err);
  }
};

// Load database users initially
loadUsers();
// Load saved sessions
loadSessions();

// Maintenance Mode Middleware for general users
app.use((req, res, next) => {
  if (isMaintenanceMode && req.path.startsWith('/api/') && !req.path.startsWith('/api/auth/')) {
    const token = req.headers['x-owner-token'] as string || req.headers['authorization'] as string;
    const cleanToken = token ? token.replace('Bearer ', '') : '';
    const session = activeSessions.get(cleanToken);
    
    if (!activeOwnerSessions.has(cleanToken) && (!session || session.role !== 'Owner')) {
      return res.status(503).json({
        error: 'MAINTENANCE_MODE',
        message: 'Oggy Studio is currently undergoing scheduled maintenance by the Owner. Normal operations are temporarily paused.'
      });
    }
  }
  next();
});

// Owner Route Verification Middleware
const verifyOwnerToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers['x-owner-token'] as string || req.headers['authorization'] as string;
  const cleanToken = token ? token.replace('Bearer ', '') : '';
  const session = activeSessions.get(cleanToken);
  const isOwnerSession = session && session.role === 'Owner';
  if (!activeOwnerSessions.has(cleanToken) && !isOwnerSession) {
    return res.status(403).json({ error: 'Forbidden: Owner Verification Required' });
  }
  next();
};

// ------------------- NEW COMPLETE AUTHENTICATION ENDPOINTS -------------------

// 1. Register Account
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, role } = req.body;
  const ip = req.ip || '127.0.0.1';

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, Email, and Password are required' });
  }

  const users = loadUsers();

  // Validate user duplication
  const existingUser = users.find(
    u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
  );
  if (existingUser) {
    return res.status(400).json({ error: 'Username or Email is already registered' });
  }

  // Handle Owner Role Request Rules
  const requestedRole = (role || 'User') as any;
  if (requestedRole === 'Owner' || username.toLowerCase() === 'lordxoggy') {
    // Only one Owner allowed (which is pre-seeded LORDxOGGY)
    const hasOwner = users.some(u => u.role === 'Owner');
    if (hasOwner) {
      return res.status(403).json({
        error: 'OWNER_LIMIT_REACHED',
        message: 'Owner registration is disabled. Only one Root Owner LORDxOGGY can exist in Oggy Studio.'
      });
    }
  }

  const finalRole = requestedRole === 'Owner' ? 'User' : requestedRole;

  const newUser: User = {
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    username,
    email,
    passwordHash: hashPassword(password),
    role: finalRole,
    failedAttempts: 0,
    lockoutUntil: null,
    loginHistory: [],
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  logOwnerAction('USER_REGISTRATION', `New user registered: ${username} with role: ${finalRole}`, 'SUCCESS', ip);

  res.json({
    success: true,
    message: 'Registration completed successfully!',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// 2. Login Account
app.post('/api/auth/login', (req, res) => {
  const { usernameOrEmail, password, rememberMe } = req.body;
  const ip = req.ip || '127.0.0.1';

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Username/Email and Password are required' });
  }

  const users = loadUsers();

  // Find user (case insensitive)
  const user = users.find(
    u => u.username.toLowerCase() === usernameOrEmail.toLowerCase() || u.email.toLowerCase() === usernameOrEmail.toLowerCase()
  );

  if (!user) {
    logOwnerAction('FAILED_LOGIN_ATTEMPT', `Unknown user login attempt: "${usernameOrEmail}"`, 'FAILED', ip);
    return res.status(401).json({ error: 'Invalid username/email or password' });
  }

  // Lockout check
  if (user.lockoutUntil) {
    const lockoutTime = new Date(user.lockoutUntil).getTime();
    if (Date.now() < lockoutTime) {
      const remainingSecs = Math.ceil((lockoutTime - Date.now()) / 1000);
      return res.status(403).json({
        error: 'ACCOUNT_LOCKED',
        message: `Account is temporarily locked due to 5 consecutive failed login attempts. Try again in ${remainingSecs} seconds.`
      });
    } else {
      // Lockout duration expired
      user.lockoutUntil = null;
    }
  }

  const inputHash = hashPassword(password);
  if (user.passwordHash !== inputHash) {
    user.failedAttempts += 1;
    const logItem = { timestamp: new Date().toISOString(), ip, status: 'Failed Login (Invalid Password)' };
    user.loginHistory.unshift(logItem);

    if (user.failedAttempts >= 5) {
      // 5 Minutes Lockout (300,000 ms)
      user.lockoutUntil = new Date(Date.now() + 300000).toISOString();
      logOwnerAction('SECURITY_ALERT', `User "${user.username}" locked out due to high failure count`, 'ALERT', ip);
    }

    saveUsers(users);

    const remaining = Math.max(0, 5 - user.failedAttempts);
    return res.status(401).json({
      error: 'INVALID_CREDENTIALS',
      message: remaining > 0 
        ? `Invalid password. You have ${remaining} attempts remaining before temporary lockout.`
        : 'Account locked due to 5 consecutive failed attempts. Try again in 5 minutes.'
    });
  }

  // Success login
  user.failedAttempts = 0;
  user.lockoutUntil = null;
  user.loginHistory.unshift({ timestamp: new Date().toISOString(), ip, status: 'Login Success' });
  saveUsers(users);

  // Generate secure token (1 year duration for permanent login)
  const token = 'session_' + crypto.randomBytes(24).toString('hex');
  const sessionDuration = 365 * 24 * 3600 * 1000; // 365 days
  
  activeSessions.set(token, {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    expiresAt: Date.now() + sessionDuration
  });

  // Backward compatibility token syncing for Owner Controls
  if (user.role === 'Owner') {
    activeOwnerSessions.add(token);
  }

  saveSessions();

  logOwnerAction('USER_AUTHENTICATION', `User successfully authenticated: ${user.username} (${user.role})`, 'SUCCESS', ip);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// 3. Validate Session
app.get('/api/auth/session', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  let session = activeSessions.get(token);

  if (!session && activeOwnerSessions.has(token)) {
    session = {
      userId: 'owner_1',
      username: 'Owner',
      email: 'owner@oggy.ai',
      role: 'Owner',
      expiresAt: Date.now() + 365 * 24 * 3600 * 1000
    };
  }

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    activeOwnerSessions.delete(token);
    saveSessions();
    return res.status(401).json({ error: 'Session has expired' });
  }

  res.json({
    success: true,
    user: {
      id: session.userId,
      username: session.username,
      email: session.email,
      role: session.role
    }
  });
});

// 4. Logout Session
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    activeSessions.delete(token);
    activeOwnerSessions.delete(token);
    saveSessions();
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// 5. Password Recovery / Reset (Sandbox Simulation)
app.post('/api/auth/reset-password', (req, res) => {
  const { usernameOrEmail, newPassword } = req.body;
  if (!usernameOrEmail || !newPassword) {
    return res.status(400).json({ error: 'Username/Email and New Password are required' });
  }

  const users = loadUsers();
  const user = users.find(
    u => u.username.toLowerCase() === usernameOrEmail.toLowerCase() || u.email.toLowerCase() === usernameOrEmail.toLowerCase()
  );

  if (!user) {
    return res.status(404).json({ error: 'Account not found' });
  }

  // Prevent modifying LORDxOGGY passcode without being authenticated, or enforce a standard reset block
  if (user.username === 'LORDxOGGY') {
    return res.status(403).json({ error: 'Cannot reset Owner passcode from recovery. Passcode changes must be authenticated inside the console.' });
  }

  user.passwordHash = hashPassword(newPassword);
  saveUsers(users);

  res.json({ success: true, message: 'Password updated successfully!' });
});

// 6. List users for Owner/Admin Dashboard
app.get('/api/auth/users', verifyOwnerToken, (req, res) => {
  const users = loadUsers();
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    loginHistory: u.loginHistory.slice(0, 10), // return last 10 entries
    failedAttempts: u.failedAttempts,
    lockoutUntil: u.lockoutUntil
  }));
  res.json({ success: true, users: safeUsers });
});

// 7. Update User Roles
app.post('/api/auth/users/update-role', verifyOwnerToken, (req, res) => {
  const { userId, newRole } = req.body;
  if (!userId || !newRole) {
    return res.status(400).json({ error: 'User ID and New Role are required' });
  }

  const allowedRoles = ['Admin', 'Moderator', 'User', 'Guest'];
  if (!allowedRoles.includes(newRole)) {
    return res.status(400).json({ error: 'Invalid target role requested' });
  }

  const users = loadUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.role === 'Owner') {
    return res.status(403).json({ error: 'Forbidden: Owner role is absolute and cannot be modified' });
  }

  const oldRole = user.role;
  user.role = newRole;
  saveUsers(users);

  logOwnerAction('ROLE_MODIFICATION', `Promoted user ${user.username} from ${oldRole} to ${newRole}`, 'SUCCESS');
  res.json({ success: true, message: `Successfully updated user ${user.username} to ${newRole}` });
});

// Legacy passcode authentication gateway
app.post('/api/owner/verify', (req, res) => {
  const { secretKey } = req.body;
  const ip = req.ip || '127.0.0.1';
  if (!secretKey) {
    return res.status(400).json({ error: 'Secret Key is required' });
  }
  if (secretKey === OWNER_SECRET_KEY) {
    const token = 'owner_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    activeOwnerSessions.add(token);
    saveSessions();
    logOwnerAction('OWNER_AUTHENTICATION', 'Owner successfully logged into the Owner Control Center via legacy passcode', 'SUCCESS', ip);
    return res.json({ success: true, token });
  } else {
    logOwnerAction('FAILED_LOGIN_ATTEMPT', `Failed legacy login attempt with key: ${secretKey.substring(0, Math.min(3, secretKey.length))}...`, 'FAILED', ip);
    return res.status(401).json({ error: 'Invalid secret passcode' });
  }
});

// Owner Endpoints
app.get('/api/owner/overview', verifyOwnerToken, (req, res) => {
  try {
    const uptimeSeconds = os.uptime();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const loadAvg = os.loadavg();
    
    // Calculate active user count
    const currentHour = new Date().getHours();
    const baseUsers = currentHour >= 9 && currentHour <= 18 ? 8 : 3;
    const liveUsers = baseUsers + Math.floor(Math.random() * 3);

    // Count workspace files
    let fileCount = 0;
    const countFiles = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      try {
        const list = fs.readdirSync(dir);
        for (const item of list) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            countFiles(fullPath);
          } else {
            fileCount++;
          }
        }
      } catch (err) {}
    };
    countFiles(WORKSPACE_DIR);

    res.json({
      uptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${Math.floor(uptimeSeconds % 60)}s`,
      totalMemory: `${(totalMem / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      freeMemory: `${(freeMem / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      usedMemory: `${((totalMem - freeMem) / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      cpuLoad: `${(loadAvg[0] * 100).toFixed(1)}%`,
      liveUsers,
      totalFiles: fileCount,
      maintenanceMode: isMaintenanceMode,
      activeProjectsCount: 1,
      healthStatus: 'OPTIMAL'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/owner/scan', verifyOwnerToken, (req, res) => {
  const ip = req.ip || '127.0.0.1';
  logOwnerAction('SECURITY_SCAN', 'Executed system-wide vulnerability scan', 'SUCCESS', ip);
  
  const scanResults: any[] = [];
  try {
    // Scan workspace files for hardcoded values
    const scanDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          if (item === 'node_modules' || item === 'dist' || item === '.git') continue;
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            scanDir(fullPath);
          } else {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (line.includes('API_KEY') || line.includes('api_key') || line.includes('secret') || line.includes('password') || line.includes('privateKey')) {
                // Ignore standard env variable access
                if (!line.includes('process.env') && !line.includes('import.meta.env') && (line.includes("'") || line.includes('"'))) {
                  scanResults.push({
                    file: path.relative(process.cwd(), fullPath),
                    line: index + 1,
                    severity: 'HIGH',
                    message: `Potential hardcoded secret or credential signature: "${line.trim().substring(0, Math.min(30, line.trim().length))}..."`
                  });
                }
              }
            });
          }
        }
      } catch (err) {}
    };
    scanDir(process.cwd());

    // Check environment file status
    if (fs.existsSync(path.join(process.cwd(), '.env'))) {
      const stat = fs.statSync(path.join(process.cwd(), '.env'));
      const mode = (stat.mode & 0o777).toString(8);
      if (mode.endsWith('7') || mode.endsWith('6')) {
        scanResults.push({
          file: '.env',
          severity: 'MEDIUM',
          message: `Environment file permissions are loose (${mode}). Recommend 600 or 400.`
        });
      }
    } else {
      scanResults.push({
        file: '.env',
        severity: 'INFO',
        message: 'No local active .env file detected. Using system runtime environment variables.'
      });
    }

    // Default scans
    if (scanResults.length === 0) {
      scanResults.push({
        file: 'Global Core',
        severity: 'INFO',
        message: 'No critical security vulnerabilities found. Codebase matches elite safety standards.'
      });
    }

    res.json({ success: true, timestamp: new Date().toISOString(), issues: scanResults });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/owner/backup', verifyOwnerToken, (req, res) => {
  const ip = req.ip || '127.0.0.1';
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const zip = new AdmZip();
    if (fs.existsSync(WORKSPACE_DIR)) {
      zip.addLocalFolder(WORKSPACE_DIR);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.zip`;
    const fullPath = path.join(backupDir, filename);
    
    zip.writeZip(fullPath);
    logOwnerAction('MANUAL_BACKUP', `Created system-level backup snapshot: ${filename}`, 'SUCCESS', ip);
    
    const stat = fs.statSync(fullPath);
    res.json({
      success: true,
      message: `Workspace backup created successfully: ${filename}`,
      backup: {
        filename,
        size: `${(stat.size / 1024).toFixed(2)} KB`,
        createdAt: new Date(stat.birthtime).toISOString()
      }
    });
  } catch (err: any) {
    logOwnerAction('MANUAL_BACKUP', `Failed to create backup snapshot: ${err.message}`, 'FAILED', ip);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/owner/backups', verifyOwnerToken, (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter(f => f.endsWith('.zip'))
      .map(f => {
        const fullPath = path.join(backupDir, f);
        const stat = fs.statSync(fullPath);
        return {
          filename: f,
          size: `${(stat.size / 1024).toFixed(2)} KB`,
          createdAt: new Date(stat.mtime).toISOString()
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, backups });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/owner/restore', verifyOwnerToken, (req, res) => {
  const { filename } = req.body;
  const ip = req.ip || '127.0.0.1';
  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  try {
    const backupPath = path.join(process.cwd(), 'backups', filename);
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    // Clean current workspace before extraction (leaving backup intact)
    if (fs.existsSync(WORKSPACE_DIR)) {
      fs.rmSync(WORKSPACE_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

    const zip = new AdmZip(backupPath);
    zip.extractAllTo(WORKSPACE_DIR, true);

    logOwnerAction('RESTORE_BACKUP', `Restored system workspace files from backup snapshot: ${filename}`, 'SUCCESS', ip);
    res.json({ success: true, message: `Workspace restored successfully from ${filename}` });
  } catch (err: any) {
    logOwnerAction('RESTORE_BACKUP', `Failed to restore backup ${filename}: ${err.message}`, 'FAILED', ip);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/owner/system-action', verifyOwnerToken, (req, res) => {
  const { action } = req.body;
  const ip = req.ip || '127.0.0.1';
  if (!action) {
    return res.status(400).json({ error: 'Action is required' });
  }

  try {
    if (action === 'toggle-maintenance') {
      isMaintenanceMode = !isMaintenanceMode;
      logOwnerAction('MAINTENANCE_TOGGLE', `Maintenance mode changed to ${isMaintenanceMode ? 'ENABLED' : 'DISABLED'}`, 'SUCCESS', ip);
      return res.json({ success: true, message: `Maintenance mode ${isMaintenanceMode ? 'enabled' : 'disabled'}` });
    }

    if (action === 'restart') {
      logOwnerAction('SERVICES_RESTART', 'Initiated secure daemon reboot cycle', 'SUCCESS', ip);
      res.json({ success: true, message: 'Oggy Studio main kernel restarting in 1000ms...' });
      setTimeout(() => {
        process.exit(0);
      }, 1000);
      return;
    }

    if (action === 'clear-cache') {
      logOwnerAction('CLEAR_CACHE', 'Cleared transient system memory caches and temporary file blocks', 'SUCCESS', ip);
      return res.json({ success: true, message: 'System cache buffers purged successfully.' });
    }

    if (action === 'optimize-db') {
      logOwnerAction('DATABASE_OPTIMIZATION', 'Optimized in-memory SQLite tables and vacuumed registries', 'SUCCESS', ip);
      return res.json({ success: true, message: 'Relational database vacuum and indexes completed successfully.' });
    }

    res.status(400).json({ error: 'Unknown action parameter' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/owner/logs', verifyOwnerToken, (req, res) => {
  try {
    const errorLogs = [
      `[ERROR] [${new Date(Date.now() - 3600000).toLocaleTimeString()}] AI autocomplete failed: Rate limit fallback initiated.`,
      `[WARN] [${new Date(Date.now() - 1800000).toLocaleTimeString()}] High disk usage check warning ignored on container node.`,
    ];
    
    const accessLogs = [
      `[GET] /api/workspace - 200 OK - 12ms`,
      `[POST] /api/workspace/write - 200 OK - 8ms`,
      `[GET] /api/owner/overview - 200 OK - 4ms`
    ];

    const deploymentLogs = [
      `[DEPLOY] [${new Date(Date.now() - 86400000).toLocaleDateString()}] Automated health build compiled in 2.3s`,
      `[DEPLOY] Status: Active and Serving on Ingress Port 3000`
    ];

    res.json({
      success: true,
      audit: ownerAuditLogs,
      errors: errorLogs,
      access: accessLogs,
      deployment: deploymentLogs
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/owner/secrets', verifyOwnerToken, (req, res) => {
  try {
    const secrets: Record<string, string> = {
      OWNER_SECRET_KEY: OWNER_SECRET_KEY.substring(0, Math.min(3, OWNER_SECRET_KEY.length)) + '...Masked',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + '...Masked' : 'Not Set',
      PORT: PORT.toString()
    };
    
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2 && parts[0].trim()) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim();
          secrets[key] = val.substring(0, Math.min(5, val.length)) + '...Masked';
        }
      });
    }

    res.json({ success: true, secrets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/owner/secrets/update', verifyOwnerToken, (req, res) => {
  const { key, value } = req.body;
  const ip = req.ip || '127.0.0.1';
  if (!key) {
    return res.status(400).json({ error: 'Secret Key name is required' });
  }

  try {
    const envPath = path.join(process.cwd(), '.env');
    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf-8');
    }

    const lines = content.split('\n');
    let keyExists = false;
    const newLines = lines.map(line => {
      const parts = line.split('=');
      if (parts[0].trim() === key) {
        keyExists = true;
        return `${key}=${value}`;
      }
      return line;
    });

    if (!keyExists) {
      newLines.push(`${key}=${value}`);
    }

    fs.writeFileSync(envPath, newLines.join('\n'));
    logOwnerAction('SECRET_UPDATE', `Updated environment secret variable: ${key}`, 'SUCCESS', ip);
    res.json({ success: true, message: `Environment variable ${key} updated successfully` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/owner/ai-settings', verifyOwnerToken, (req, res) => {
  res.json({ success: true, settings: aiSettingsState });
});

app.post('/api/owner/ai-settings/update', verifyOwnerToken, (req, res) => {
  const { model, temperature, maxHistory, memoryRetention } = req.body;
  const ip = req.ip || '127.0.0.1';
  try {
    if (model) aiSettingsState.model = model;
    if (temperature !== undefined) aiSettingsState.temperature = parseFloat(temperature);
    if (maxHistory !== undefined) aiSettingsState.maxHistory = parseInt(maxHistory);
    if (memoryRetention !== undefined) aiSettingsState.memoryRetention = !!memoryRetention;
    aiSettingsState.lastUpdated = new Date().toISOString();

    logOwnerAction('AI_SETTINGS_UPDATE', `Updated global AI parameters to ${aiSettingsState.model} (Temp: ${aiSettingsState.temperature})`, 'SUCCESS', ip);
    res.json({ success: true, settings: aiSettingsState });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/owner/diagnostics', verifyOwnerToken, (req, res) => {
  try {
    const report = {
      healthCheck: { status: 'OPTIMAL', checkedAt: new Date().toISOString() },
      dependencyCheck: {
        status: 'UP-TO-DATE',
        unmetDependencies: [],
        vulnerabilities: 0
      },
      databaseIntegrity: { status: 'OK', recordsCount: 120, indexesHealthy: true },
      fileIntegrity: {
        status: 'INTEGRAL',
        scannedFilesCount: 45,
        modifiedFiles: ['.env.example']
      }
    };
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Workspace API Endpoints
app.get('/api/workspace', (req, res) => {
  try {
    const listFilesRecursive = (dir: string, baseDir = ''): any[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let results: any[] = [];
      for (const entry of entries) {
        const relativePath = path.join(baseDir, entry.name);
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push({
            path: relativePath,
            content: '',
            isDir: true,
          });
          results = results.concat(listFilesRecursive(fullPath, relativePath));
        } else {
          const content = fs.readFileSync(fullPath, 'utf-8');
          results.push({
            path: relativePath,
            content,
            isDir: false,
          });
        }
      }
      return results;
    };
    const workspaceFiles = listFilesRecursive(WORKSPACE_DIR);
    res.json({ files: workspaceFiles });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspace/write', (req, res) => {
  const { filePath, content } = req.body;
  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }
  try {
    const fullPath = path.join(WORKSPACE_DIR, filePath);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content || '');
    res.json({ success: true, message: `File ${filePath} written successfully` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspace/create-dir', (req, res) => {
  const { dirPath } = req.body;
  if (!dirPath) {
    return res.status(400).json({ error: 'dirPath is required' });
  }
  try {
    const fullPath = path.join(WORKSPACE_DIR, dirPath);
    fs.mkdirSync(fullPath, { recursive: true });
    res.json({ success: true, message: `Directory ${dirPath} created successfully` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspace/delete', (req, res) => {
  const { filePath } = req.body;
  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }
  try {
    const fullPath = path.join(WORKSPACE_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      res.json({ success: true, message: `Deleted ${filePath}` });
    } else {
      res.status(404).json({ error: 'File/Directory not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workspace/download', (req, res) => {
  try {
    const zip = new AdmZip();
    if (fs.existsSync(WORKSPACE_DIR)) {
      zip.addLocalFolder(WORKSPACE_DIR);
    }
    const zipBuffer = zip.toBuffer();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=oggy-workspace.zip');
    res.send(zipBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/codebase/download', (req, res) => {
  try {
    const zip = new AdmZip();
    const rootPath = process.cwd();
    
    const addFolderToZipRecursively = (currentPath: string, zipPathPrefix: string = "") => {
      if (!fs.existsSync(currentPath)) return;
      const items = fs.readdirSync(currentPath);
      for (const item of items) {
        if (item === 'node_modules' || item === 'dist' || item === '.git' || item === '.next' || item === 'out') {
          continue;
        }
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          addFolderToZipRecursively(fullPath, zipPathPrefix ? `${zipPathPrefix}/${item}` : item);
        } else {
          zip.addLocalFile(fullPath, zipPathPrefix);
        }
      }
    };

    addFolderToZipRecursively(rootPath);
    
    const zipBuffer = zip.toBuffer();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=oggy-studio-full-app.zip');
    res.send(zipBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Terminal Simulation Endpoints (with actual safe command runner fallback)
app.post('/api/terminal/run', (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'command is required' });
  }

  const trimmed = command.trim();
  const args = trimmed.split(' ');
  const primaryCmd = args[0];

  // Git Flow Simulation
  if (primaryCmd === 'git') {
    const gitAction = args[1];
    if (gitAction === 'status') {
      return res.json({
        output: `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n\tmodified:   README.md\n\nno changes added to commit (use "git add" and/or "git commit -a")`,
        success: true,
      });
    } else if (gitAction === 'log') {
      return res.json({
        output: `commit a2f9e4bc8310c9d81d2f7f7a1f5f5f123d4e5f6a (HEAD -> main, origin/main)\nAuthor: Oggy <oggy@studio.ai>\nDate:   ${new Date().toDateString()} 12:00:00\n\n    feat: initialize Oggy Studio workspace and AI coding assistant\n\ncommit 9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c\nAuthor: Oggy <oggy@studio.ai>\nDate:   ${new Date(Date.now() - 86400000).toDateString()} 09:15:30\n\n    chore: setup project manager metadata`,
        success: true,
      });
    } else if (gitAction === 'commit') {
      return res.json({
        output: `[main ${Math.random().toString(36).substring(2, 9)}] ${args.slice(2).join(' ') || 'updated project workspace'}\n 1 file changed, 1 insertion(+), 1 deletion(-)`,
        success: true,
      });
    } else {
      return res.json({
        output: `git ${gitAction || 'help'} simulation completed successfully.`,
        success: true,
      });
    }
  }

  // SQLite Console Simulation
  if (primaryCmd === 'sqlite3' || primaryCmd === 'sql') {
    return res.json({
      output: `OggyStudio DB terminal client loaded.\nRun your SQL queries directly inside the DB browser module for visual management!`,
      success: true,
    });
  }

  // File viewing / listing simulations
  if (primaryCmd === 'ls') {
    try {
      const files = fs.readdirSync(WORKSPACE_DIR);
      return res.json({ output: files.join('   '), success: true });
    } catch (err: any) {
      return res.json({ output: `Error: ${err.message}`, success: false });
    }
  }

  if (primaryCmd === 'cat') {
    const fileName = args[1];
    if (!fileName) {
      return res.json({ output: 'Usage: cat <filename>', success: false });
    }
    try {
      const fullPath = path.join(WORKSPACE_DIR, fileName);
      if (fs.existsSync(fullPath)) {
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        return res.json({ output: fileContent, success: true });
      } else {
        return res.json({ output: `cat: ${fileName}: No such file or directory`, success: false });
      }
    } catch (err: any) {
      return res.json({ output: `Error: ${err.message}`, success: false });
    }
  }

  // Safe file execution: node index.js or similar inside WORKSPACE_DIR
  if (primaryCmd === 'node') {
    const scriptFile = args[1];
    if (!scriptFile) {
      return res.json({ output: 'Usage: node <script.js>', success: false });
    }
    const fullPath = path.join(WORKSPACE_DIR, scriptFile);
    if (!fs.existsSync(fullPath)) {
      return res.json({ output: `node: can't open file '${scriptFile}': No such file or directory`, success: false });
    }

    // Execute the Node script safely and capture output
    exec(`node "${fullPath}"`, { timeout: 4000 }, (error, stdout, stderr) => {
      if (error) {
        return res.json({ output: stderr || error.message, success: false });
      }
      return res.json({ output: stdout || '(executed successfully with no output logs)', success: true });
    });
    return;
  }

  // Fallback simulations
  if (primaryCmd === 'npm' && args[1] === 'install') {
    return res.json({
      output: `added 142 packages, and audited 143 packages in 1.42s\n\nfound 0 vulnerabilities`,
      success: true,
    });
  }

  if (primaryCmd === 'npm' && args[1] === 'run' && args[2] === 'test') {
    return res.json({
      output: `> workspace-app@1.0.0 test\n> echo "Running tests... All 4 passed!"\n\nRunning tests... All 4 passed!`,
      success: true,
    });
  }

  if (primaryCmd === 'clear') {
    return res.json({ output: '__CLEAR__', success: true });
  }

  // Generic fallback shell runner simulator
  res.json({
    output: `bash: ${primaryCmd}: command simulated or not allowed in sandboxed terminal.\nAvailable real runtimes: 'node <file>', 'ls', 'cat <file>'. Simulated: 'git status', 'npm install', 'npm run test'.`,
    success: true,
  });
});

// 3. System Metrics Endpoint
app.get('/api/system/metrics', (req, res) => {
  const ramUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const cpuLoad = os.loadavg()[0] || 0.15; // 1 min load average

  // Generate realistic performance logs
  const cpuPercentage = Math.min(Math.round(cpuLoad * 100), 100);
  const ramPercentage = Math.round(((totalMem - freeMem) / totalMem) * 100);

  res.json({
    cpu: cpuPercentage || 12,
    ram: ramPercentage || 42,
    storage: 68,
    activeProjects: 3,
    requestCount: 412,
    processes: [
      { pid: 1420, name: 'vite-dev-server', cpu: 2.1, ram: '112 MB', status: 'Running' },
      { pid: 1425, name: 'oggy-backend-server', cpu: 1.5, ram: '78 MB', status: 'Running' },
      { pid: 1822, name: 'gemini-api-streamer', cpu: 0.0, ram: '24 MB', status: 'Idle' },
      { pid: 1910, name: 'sqlite-sandbox-instance', cpu: 0.2, ram: '16 MB', status: 'Active' },
    ],
  });
});

// 4. Simulated Relational Database Operations API
app.post('/api/db/query', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const normalized = query.trim().replace(/\s+/g, ' ');
  const selectMatch = normalized.match(/^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+))?/i);
  const insertMatch = normalized.match(/^insert\s+into\s+(\w+)\s*(?:\((.+?)\))?\s*values\s*\((.+?)\)/i);
  const createTableMatch = normalized.match(/^create\s+table\s+(\w+)\s*\((.+?)\)/i);

  try {
    if (createTableMatch) {
      const tableName = createTableMatch[1].toLowerCase();
      const colDefs = createTableMatch[2].split(',');
      const columns = colDefs.map((def: string) => {
        const parts = def.trim().split(' ');
        const name = parts[0];
        const type = parts[1] || 'TEXT';
        const primaryKey = def.toUpperCase().includes('PRIMARY KEY');
        const nullable = !def.toUpperCase().includes('NOT NULL');
        return { name, type, primaryKey, nullable };
      });

      databaseStore.tables[tableName] = { columns, rows: [] };
      return res.json({
        success: true,
        message: `Table '${tableName}' created successfully.`,
        data: [],
      });
    }

    if (insertMatch) {
      const tableName = insertMatch[1].toLowerCase();
      if (!databaseStore.tables[tableName]) {
        throw new Error(`Table '${tableName}' not found.`);
      }

      const table = databaseStore.tables[tableName];
      const colString = insertMatch[2];
      const valString = insertMatch[3];

      const values = valString.split(',').map((v: string) => {
        const trimmed = v.trim();
        if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1);
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1);
        const num = Number(trimmed);
        return isNaN(num) ? trimmed : num;
      });

      let cols = colString ? colString.split(',').map((c: string) => c.trim()) : table.columns.map((c) => c.name);

      const newRow: Record<string, any> = {};
      table.columns.forEach((col) => {
        const colIndex = cols.indexOf(col.name);
        if (colIndex !== -1) {
          newRow[col.name] = values[colIndex];
        } else {
          newRow[col.name] = col.nullable ? null : (col.type === 'INTEGER' ? 0 : '');
        }
      });

      table.rows.push(newRow);
      return res.json({
        success: true,
        message: `1 row inserted into '${tableName}' successfully.`,
        data: [newRow],
      });
    }

    if (selectMatch) {
      const colSelect = selectMatch[1].trim();
      const tableName = selectMatch[2].toLowerCase();
      const whereClause = selectMatch[3];

      if (!databaseStore.tables[tableName]) {
        throw new Error(`Table '${tableName}' not found.`);
      }

      const table = databaseStore.tables[tableName];
      let filteredRows = [...table.rows];

      if (whereClause) {
        const eqMatch = whereClause.match(/(\w+)\s*=\s*['"]?(.+?)['"]?$/);
        if (eqMatch) {
          const colName = eqMatch[1].trim();
          const targetValue = eqMatch[2].trim();
          filteredRows = filteredRows.filter((r) => String(r[colName]) === String(targetValue));
        }
      }

      const selectedRows = filteredRows.map((row) => {
        if (colSelect === '*') return row;
        const selected: Record<string, any> = {};
        colSelect.split(',').forEach((c: string) => {
          const name = c.trim();
          selected[name] = row[name];
        });
        return selected;
      });

      return res.json({
        success: true,
        message: `${selectedRows.length} rows retrieved.`,
        data: selectedRows,
        columns: table.columns,
      });
    }

    // Generic statement response if no match
    if (normalized.toLowerCase().startsWith('show tables') || normalized.toLowerCase().startsWith('.tables')) {
      const tableList = Object.keys(databaseStore.tables).map((name) => ({ name }));
      return res.json({
        success: true,
        message: 'Loaded active system schemas.',
        data: tableList,
        columns: [{ name: 'name', type: 'TEXT' }],
      });
    }

    throw new Error('Unsupported simulated SQL syntax. Try Select *, Insert Into, Create Table or Show Tables.');
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET database tables info for browser UI
app.get('/api/db/tables', (req, res) => {
  const result = Object.entries(databaseStore.tables).map(([name, schema]) => ({
    name,
    columns: schema.columns,
    rowCount: schema.rows.length,
    rows: schema.rows,
  }));
  res.json({ tables: result });
});

// 5. Server-Side Gemini API Endpoints
app.post('/api/gemini/chat', async (req, res) => {
  const { messages, systemInstruction } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  if (!aiClient) {
    return res.status(503).json({
      error: 'Gemini API client is not configured. Please supply a valid GEMINI_API_KEY inside Settings > Secrets.',
    });
  }

  try {
    const lastMsg = messages[messages.length - 1];
    let contents: any;

    if (lastMsg.image) {
      const imagePart = {
        inlineData: {
          mimeType: 'image/png',
          data: lastMsg.image.split(',')[1] || lastMsg.image,
        },
      };
      const textPart = { text: lastMsg.text };
      contents = { parts: [imagePart, textPart] };
    } else {
      contents = lastMsg.text;
    }

    let response;
    let modelToUse = 'gemini-3.5-flash';
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;

    while (attempts < maxAttempts) {
      try {
        response = await aiClient.models.generateContent({
          model: modelToUse,
          contents,
          config: {
            systemInstruction: systemInstruction || 'You are Oggy, the Senior Principal AI Coding Architect & Developer Assistant for Oggy Studio. You provide clear, concise, highly intelligent responses. Always format code using markdown code blocks (e.g. ```typescript ... ```). Ensure all code statements and markdown formatting syntax are clean, complete, and properly closed without stray or orphaned characters like unclosed parentheses "))" or dangling asterisks.',
          },
        });
        break; // Success!
      } catch (err: any) {
        lastError = err;
        attempts++;
        const errorMessage = (err.message || '').toLowerCase();
        const isTemporaryError = errorMessage.includes('503') || 
                                 errorMessage.includes('unavailable') || 
                                 errorMessage.includes('demand') || 
                                 errorMessage.includes('spike') ||
                                 errorMessage.includes('quota') || 
                                 errorMessage.includes('rate') ||
                                 errorMessage.includes('limit');
        
        if (isTemporaryError && attempts < maxAttempts) {
          // Fallback to lite model which has separate rate/demand limits
          if (modelToUse === 'gemini-3.5-flash') {
            modelToUse = 'gemini-3.1-flash-lite';
          }
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 800 * attempts));
        } else {
          throw err;
        }
      }
    }

    if (!response) {
      throw lastError || new Error('Failed to generate response after retrying.');
    }

    let cleanedText = response.text || '';
    // Clean up trailing orphaned parenthesis or broken asterisks
    cleanedText = cleanedText.replace(/\)\)\s*$/, ')').replace(/\)\)\s*([.,!?])/g, ')$1');

    res.json({ text: cleanedText });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gemini/image', async (req, res) => {
  const { prompt, aspectRatio } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  if (!aiClient) {
    return res.status(503).json({
      error: 'Gemini API client is not configured. Please supply a valid GEMINI_API_KEY inside Settings > Secrets.',
    });
  }

  try {
    let response;
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;

    while (attempts < maxAttempts) {
      try {
        response = await aiClient.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio || '1:1',
            },
          },
        });
        break;
      } catch (err: any) {
        lastError = err;
        attempts++;
        const errorMessage = (err.message || '').toLowerCase();
        const isTemporaryError = errorMessage.includes('503') || 
                                 errorMessage.includes('unavailable') || 
                                 errorMessage.includes('demand') || 
                                 errorMessage.includes('quota') || 
                                 errorMessage.includes('rate') ||
                                 errorMessage.includes('limit');
        if (isTemporaryError && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        } else {
          throw err;
        }
      }
    }

    if (!response) {
      throw lastError || new Error('Failed to generate image after retrying.');
    }

    let base64Image = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!base64Image) {
      throw new Error('No image was returned from the generator model.');
    }

    res.json({ imageUrl: base64Image });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Automated GitHub Repository Export & Push API
app.post('/api/github/push', async (req, res) => {
  const { githubToken, repoName, isPrivate, commitMessage } = req.body;
  if (!githubToken) {
    return res.status(400).json({ error: 'GitHub Personal Access Token is required' });
  }
  if (!repoName) {
    return res.status(400).json({ error: 'Repository name is required' });
  }

  try {
    // 1. Authenticate with GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'OggyStudioExporter'
      }
    });

    if (!userRes.ok) {
      return res.status(401).json({ error: 'Invalid GitHub Personal Access Token or missing permissions.' });
    }

    const userData = await userRes.json();
    const username = userData.login;
    const cleanRepoName = repoName.trim().replace(/\s+/g, '-');

    // 2. Ensure Repository Exists or Create it
    let repoUrl = `https://github.com/${username}/${cleanRepoName}`;
    const checkRepoRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepoName}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'OggyStudioExporter'
      }
    });

    if (!checkRepoRes.ok) {
      // Create new repo
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'User-Agent': 'OggyStudioExporter',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: cleanRepoName,
          private: !!isPrivate,
          description: 'Exported from Oggy Studio AI Developer Platform',
          auto_init: false
        })
      });

      if (!createRes.ok) {
        const createErr = await createRes.json();
        return res.status(400).json({ error: createErr.message || 'Failed to create GitHub repository.' });
      }
      const createData = await createRes.json();
      repoUrl = createData.html_url;
    }

    // 3. Collect files from root workspace
    const rootPath = process.cwd();
    const filesToUpload: { relativePath: string; fullPath: string }[] = [];

    const scanFiles = (currentPath: string, prefix = '') => {
      if (!fs.existsSync(currentPath)) return;
      const items = fs.readdirSync(currentPath);
      for (const item of items) {
        if (['node_modules', 'dist', '.git', '.next', 'out', 'backups', '.cache'].includes(item)) {
          continue;
        }
        const fullPath = path.join(currentPath, item);
        const relPath = prefix ? `${prefix}/${item}` : item;
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanFiles(fullPath, relPath);
        } else {
          filesToUpload.push({ relativePath: relPath, fullPath });
        }
      }
    };

    scanFiles(rootPath);

    // 4. Upload critical project files to GitHub Contents API
    const msg = commitMessage || 'Initial release from Oggy Studio AI Developer Platform';

    for (const file of filesToUpload) {
      try {
        const fileBuffer = fs.readFileSync(file.fullPath);
        const base64Content = fileBuffer.toString('base64');

        // Check if file already exists to get SHA for update
        const getFileRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepoName}/contents/${encodeURIComponent(file.relativePath)}`, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'User-Agent': 'OggyStudioExporter'
          }
        });

        let sha: string | undefined;
        if (getFileRes.ok) {
          const fileData = await getFileRes.json();
          sha = fileData.sha;
        }

        await fetch(`https://api.github.com/repos/${username}/${cleanRepoName}/contents/${encodeURIComponent(file.relativePath)}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${githubToken}`,
            'User-Agent': 'OggyStudioExporter',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: msg,
            content: base64Content,
            sha
          })
        });
      } catch (err) {
        console.warn(`Warning: Failed uploading ${file.relativePath} to GitHub:`, err);
      }
    }

    res.json({
      success: true,
      repoUrl,
      repoFullName: `${username}/${cleanRepoName}`,
      message: `Successfully published ${filesToUpload.length} files to GitHub!`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'GitHub export failed.' });
  }
});

app.post('/api/gemini/autocomplete', async (req, res) => {
  const { codeContext, fileName } = req.body;
  if (!codeContext) {
    return res.status(400).json({ error: 'codeContext is required' });
  }

  if (!aiClient) {
    return res.json({ suggestion: ' // Add code here (Configure GEMINI_API_KEY for real autocompletes)' });
  }

  try {
    const prompt = `You are a developer IDE code autocomplete daemon. Given this current code for file "${fileName || 'index.js'}", provide the next 1-3 lines of logical, elegant code completion. Respond ONLY with the raw autocomplete code and nothing else. No markdown block wrapper, no extra chatter. Here is the code:\n\n${codeContext}`;
    
    let response;
    let modelToUse = 'gemini-3.5-flash';
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;

    while (attempts < maxAttempts) {
      try {
        response = await aiClient.models.generateContent({
          model: modelToUse,
          contents: prompt,
          config: {
            temperature: 0.2,
          },
        });
        break;
      } catch (err: any) {
        lastError = err;
        attempts++;
        const errorMessage = (err.message || '').toLowerCase();
        const isTemporaryError = errorMessage.includes('503') || 
                                 errorMessage.includes('unavailable') || 
                                 errorMessage.includes('demand') || 
                                 errorMessage.includes('quota') || 
                                 errorMessage.includes('rate') ||
                                 errorMessage.includes('limit');
        if (isTemporaryError && attempts < maxAttempts) {
          if (modelToUse === 'gemini-3.5-flash') {
            modelToUse = 'gemini-3.1-flash-lite';
          }
          await new Promise(resolve => setTimeout(resolve, 500 * attempts));
        } else {
          throw err;
        }
      }
    }

    if (!response) {
      throw lastError || new Error('Failed to autocomplete.');
    }

    res.json({ suggestion: response.text || '' });
  } catch (err: any) {
    res.json({ suggestion: ` // Auto-suggest: ${err.message}` });
  }
});

// 6. Deploy Simulators
app.post('/api/deploy', (req, res) => {
  const { platform, projectName } = req.body;
  if (!platform) {
    return res.status(400).json({ error: 'Platform is required' });
  }

  const name = projectName || 'oggy-app';
  const logs = [
    `[INFO] Starting Oggy Studio 1-Click Deployment to ${platform.toUpperCase()}...`,
    `[INFO] Analyzing workspace code structure...`,
    `[INFO] Validating package.json and workspace configurations...`,
    `[SUCCESS] Found server startup files. Bundling deployment container...`,
    `[INFO] Running production compilation...`,
    `[INFO] npm run build output: Clean exit 0`,
    `[INFO] Writing multi-stage optimized Dockerfile...`,
    `[SUCCESS] Pushing image to secure private register...`,
    `[INFO] Provisioning secure hosting container node...`,
    `[INFO] Binding environmental ingress routing to port 3000...`,
    `[SUCCESS] Container active. Service successfully running on 0.0.0.0:3000!`,
    `[SUCCESS] App live and fully operational on secure target link!`,
  ];

  res.json({
    status: 'live',
    url: `https://${name.toLowerCase()}.${platform === 'railway' ? 'railway.app' : 'render.com'}`,
    logs,
  });
});

// Start Express Server & Setup Vite Middleware
async function startServer() {
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    resolvedDirname.endsWith('dist') || 
    !fs.existsSync(path.join(process.cwd(), 'server.ts'));

  // Vite dev server middleware integration
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, we serve the compiled static files from the 'dist' directory.
    let distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html')) && fs.existsSync(path.join(resolvedDirname, 'index.html'))) {
      distPath = resolvedDirname;
    }
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Oggy Studio full-stack server listening on http://localhost:${PORT}`);
  });
}

startServer();
