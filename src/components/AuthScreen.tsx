import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Mail, User, Shield, Eye, EyeOff, Key, Crown, 
  ArrowRight, CheckCircle2, AlertTriangle, Moon, Sun, 
  RefreshCw, Info, Check, ShieldAlert, Sparkles
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<string>('User');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  
  // UI States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Password Strength Checker
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
    bars: boolean[];
  }>({ score: 0, label: 'Very Weak', color: 'bg-rose-500', bars: [false, false, false, false] });

  // Forgot Password modal
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotUsername, setForgotUsername] = useState<string>('');
  const [forgotMsg, setForgotMsg] = useState<string>('');
  const [forgotError, setForgotError] = useState<string>('');

  // Password strength logic
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: 'Very Weak', color: 'bg-rose-500', bars: [false, false, false, false] });
      return;
    }
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    let label = 'Very Weak';
    let color = 'bg-rose-500';
    let bars = [true, false, false, false];

    if (score === 2) {
      label = 'Weak';
      color = 'bg-orange-500';
      bars = [true, true, false, false];
    } else if (score === 3) {
      label = 'Moderate';
      color = 'bg-amber-500';
      bars = [true, true, true, false];
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
      bars = [true, true, true, true];
    }

    setPasswordStrength({ score, label, color, bars });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!isLogin) {
      // Validate Registration
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, role })
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Registration failed.');
        } else {
          setSuccessMsg('Account created! Logging in...');
          // Auto log in after register
          setTimeout(async () => {
            await triggerLogin(username, password);
          }, 1200);
        }
      } catch (err: any) {
        console.error('Registration error details:', err);
        setErrorMsg(`Cannot establish connection to authorization server: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Handle Login
      await triggerLogin(username, password);
    }
  };

  const triggerLogin = async (userOrEmail: string, pass: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: userOrEmail, password: pass, rememberMe })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || data.error || 'Authentication failed.');
        setLoading(false);
      } else {
        setSuccessMsg(`Welcome back, ${data.user.username}! Connecting...`);
        // Always persist to localStorage for continuous login across refreshes
        localStorage.setItem('oggy_auth_token', data.token);
        localStorage.setItem('oggy_auth_user', JSON.stringify(data.user));
        sessionStorage.setItem('oggy_auth_token', data.token);
        sessionStorage.setItem('oggy_auth_user', JSON.stringify(data.user));
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 800);
      }
    } catch (err: any) {
      console.error('Login error details:', err);
      setErrorMsg(`Cannot establish secure connection to login gateway: ${err.message || err}`);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg('');
    setForgotError('');
    if (!forgotUsername) {
      setForgotError('Please enter your username or registered email.');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: forgotUsername, newPassword: 'OCGAMINGKING' })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg('Passcode Reset! In this local sandbox mode, your password was restored to the standard template format: "OCGAMINGKING". Please log in.');
      } else {
        setForgotError(data.error || 'Account recovery failed.');
      }
    } catch (err) {
      setForgotError('Connection error during recovery request.');
    }
  };

  // Seed default credential fields for demo
  const fillOwnerDemo = () => {
    setUsername('LORDxOGGY');
    setPassword('OCGAMINGKING');
    setRememberMe(true);
    setIsLogin(true);
    setSuccessMsg('Seeding Root Owner credentials. Click login to access absolute control!');
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-all duration-300 relative overflow-hidden ${
      theme === 'dark' 
        ? 'bg-[#070b13] text-slate-100' 
        : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

      {/* Outer wrapper */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Upper Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 bg-gradient-to-tr from-cyan-500 to-violet-600 p-2.5 rounded-2xl shadow-xl shadow-cyan-500/10 mb-4">
            <Crown className="w-7 h-7 text-slate-950 animate-pulse" />
          </div>
          <h2 className={`text-2xl font-sans font-black tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>
            OGGY STUDIO
          </h2>
          <p className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-500 mt-1">
            Enterprise Cloud Kernel Console
          </p>
        </div>

        {/* Main Authenticator Card */}
        <motion.div 
          layout
          className={`rounded-2xl border transition-all duration-300 shadow-2xl overflow-hidden relative ${
            theme === 'dark'
              ? 'bg-[#0a0f1d]/90 border-slate-800/80'
              : 'bg-white border-slate-200/85'
          }`}
        >
          {/* Accent border bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-500 to-violet-600" />

          {/* Card Upper Header */}
          <div className={`px-6 pt-6 pb-4 flex items-center justify-between border-b ${
            theme === 'dark' ? 'border-slate-800/60 bg-slate-950/20' : 'border-slate-100 bg-slate-50/50'
          }`}>
            <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
              {isLogin ? 'SECURE ACCOUNT SIGN IN' : 'DAEMON NODE REGISTRATION'}
            </span>
            
            {/* Theme & demo seeds */}
            <div className="flex items-center gap-2">
              <button 
                onClick={fillOwnerDemo}
                title="Fill LORDxOGGY Credentials"
                className="text-[9px] font-mono font-bold tracking-wider px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                OWNER DEMO
              </button>
              
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-1.5 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'border-slate-800 hover:bg-slate-800 text-amber-400' 
                    : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
                title="Switch Theme Theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Notifications */}
              <AnimatePresence mode="wait">
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-2.5 p-3.5 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-400 text-xs font-sans leading-relaxed"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="flex-1">{errorMsg}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-2.5 p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs font-sans leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="flex-1 font-semibold">{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username field */}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                  theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Username {isLogin && 'or Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={isLogin ? "LORDxOGGY or email" : "Enter username"}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-mono transition-all focus:outline-none focus:ring-1 ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100 placeholder:text-slate-700'
                        : 'bg-slate-50 border-slate-200 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-800 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Registration Email field */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. sandhya@studio.ai"
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-mono transition-all focus:outline-none focus:ring-1 ${
                        theme === 'dark'
                          ? 'bg-slate-950 border-slate-800 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100 placeholder:text-slate-700'
                          : 'bg-slate-50 border-slate-200 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-800 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => { setShowForgotModal(true); setForgotMsg(''); setForgotError(''); }}
                      className="text-[10px] font-mono font-bold text-cyan-500 hover:text-cyan-400"
                    >
                      FORGOT PASSWORD?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••••••"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl text-xs font-mono transition-all focus:outline-none focus:ring-1 ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100 placeholder:text-slate-700'
                        : 'bg-slate-50 border-slate-200 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-800 placeholder:text-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password Strength display for registration */}
                {!isLogin && password && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>Password Strength:</span>
                      <span className={`font-bold uppercase ${
                        passwordStrength.score <= 1 ? 'text-rose-400' :
                        passwordStrength.score === 2 ? 'text-orange-400' :
                        passwordStrength.score === 3 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{passwordStrength.label}</span>
                    </div>
                    <div className="flex gap-1">
                      {passwordStrength.bars.map((filled, i) => (
                        <div 
                          key={i} 
                          className={`h-1.5 flex-1 rounded transition-all duration-300 ${
                            filled ? passwordStrength.color : (theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200')
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password field for registration */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••••••••••"
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-mono transition-all focus:outline-none focus:ring-1 ${
                        theme === 'dark'
                          ? 'bg-slate-950 border-slate-800 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100 placeholder:text-slate-700'
                          : 'bg-slate-50 border-slate-200 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-800 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Roles Selector for registration */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Choose Developer Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all focus:outline-none focus:ring-1 ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100'
                        : 'bg-slate-50 border-slate-200 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-800'
                    }`}
                  >
                    <option value="User">User (Standard Access)</option>
                    <option value="Admin">Admin (Core Developer)</option>
                    <option value="Moderator">Moderator (System Operator)</option>
                    <option value="Guest">Guest (Read Only Reviewer)</option>
                    <option value="Owner" disabled>Owner (LORDxOGGY only - Blocked)</option>
                  </select>
                  <p className="text-[10px] font-mono text-slate-500">
                    * The "Owner" role is restricted. Root owner account <code className="text-amber-500 font-bold">LORDxOGGY</code> is pre-established on system kernel.
                  </p>
                </div>
              )}

              {/* Remember me box for login */}
              {isLogin && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs font-sans cursor-pointer select-none text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Remember My Device Session</span>
                  </label>
                </div>
              )}

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 text-slate-950 font-mono font-bold text-xs py-3 rounded-xl transition-all shadow-xl shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <span>{isLogin ? 'AUTHENTICATE SIGN IN' : 'EXECUTE NODE REGISTRATION'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Registration toggle link */}
            <div className={`mt-5 pt-4 text-center border-t text-xs font-sans ${
              theme === 'dark' ? 'border-slate-800/40 text-slate-500' : 'border-slate-100 text-slate-400'
            }`}>
              {isLogin ? (
                <span>
                  New node operator?{' '}
                  <button
                    onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-cyan-500 hover:text-cyan-400 font-bold transition-all"
                  >
                    Create Sandbox Account
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-cyan-500 hover:text-cyan-400 font-bold transition-all"
                  >
                    Authenticate Account
                  </button>
                </span>
              )}
            </div>

            {/* Note on first launch */}
            <div className={`mt-4 p-3 rounded-xl border flex gap-2 items-start ${
              theme === 'dark' ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
            }`}>
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-cyan-500" />
              <div className="text-[10px] font-mono leading-normal">
                <span className="font-bold text-slate-300">Root Node Alert:</span> All operations are securely logged. Owner status is locked to the unique username: <code className="text-amber-500 font-bold bg-slate-950 px-1 py-0.5 rounded">LORDxOGGY</code>.
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Forgot Password Recovery Sandbox Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0f1d] border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-sky-500" />
              
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
                  <Key className="w-5 h-5 animate-bounce" />
                </div>
                
                <div className="text-center space-y-1">
                  <h4 className="font-sans font-extrabold text-slate-100">RECOVERY GATEWAY</h4>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">SANDBOX RECOVERY SYSTEM</p>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal font-sans text-center">
                  Due to the local sandbox environment limits, password recovery resets your target username's passcode to the development template standard: <code className="text-cyan-400 font-bold">OCGAMINGKING</code>.
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 font-bold uppercase">ENTER USERNAME OR EMAIL</label>
                    <input
                      type="text"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      placeholder="e.g. LORDxOGGY"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-center"
                      required
                    />
                  </div>

                  {forgotError && (
                    <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono">
                      {forgotError}
                    </div>
                  )}

                  {forgotMsg && (
                    <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono leading-normal">
                      {forgotMsg}
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 border border-slate-800 hover:bg-slate-900 text-slate-400 font-mono text-xs py-2 rounded-lg"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-mono font-bold text-xs py-2 rounded-lg"
                    >
                      RESET PASSCODE
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
