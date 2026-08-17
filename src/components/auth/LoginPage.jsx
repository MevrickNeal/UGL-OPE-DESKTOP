import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');

  const { signIn, signUp, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setInfoMsg('');

    if (!email || !password) return;

    setLoading(true);
    if (isSignUp) {
      const res = await signUp(email, password, fullName);
      if (res.success) {
        if (!res.session) {
          setInfoMsg('Account created successfully! Check your email to confirm registration or sign in.');
        } else {
          setInfoMsg('Account created & logged in!');
        }
      }
    } else {
      await signIn(email, password);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] flex flex-col justify-between items-center p-4 font-inter overflow-y-auto">
      <div className="max-w-md w-full my-auto space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-block p-4 rounded-3xl bg-white shadow-xl border border-slate-100">
            <img 
              src="/logo-square.png" 
              alt="Urban Gaz Logo" 
              className="w-16 h-16 object-contain mx-auto"
            />
          </div>
          <div>
            <h1 className="font-outfit text-3xl font-black tracking-tight text-slate-800 uppercase">
              URBAN GAZ LIMITED
            </h1>
            <p className="text-xs font-bold text-[#F15A24] tracking-widest uppercase mt-1">
              Commissioning & Field Testing Platform
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-outfit text-xl font-bold text-slate-800">
                {isSignUp ? 'Inspector Registration' : 'Inspector Login'}
              </h2>
              <p className="text-xs text-slate-500">
                {isSignUp ? 'Create credentials to access cloud sync' : 'Enter your email & password to sign in'}
              </p>
            </div>
            <div className="p-2 bg-teal-50 text-[#0D6B6E] rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-bold">{error}</p>
                {error.toLowerCase().includes('email not confirmed') && (
                  <p className="mt-1.5 text-[11px] text-red-600 leading-relaxed">
                    <strong>Resolution:</strong> In your Supabase Dashboard, go to <em>Authentication → Providers → Email</em> and turn off <strong>Confirm email</strong>, or run <code>UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;</code> in SQL Editor.
                  </p>
                )}
              </div>
            </div>
          )}

          {infoMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3.5 rounded-2xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
              <span>{infoMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lian Mollick"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-[#F15A24] outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="inspector@urbangaz.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-[#F15A24] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-[#F15A24] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#F15A24] hover:bg-[#d4491a] text-white font-outfit font-bold rounded-2xl shadow-lg shadow-[#F15A24]/20 flex items-center justify-center gap-2 text-sm transition-all btn-press cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                clearError();
                setInfoMsg('');
              }}
              className="text-xs font-semibold text-[#0D6B6E] hover:underline cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an inspector account? Register'}
            </button>
          </div>
        </div>

      </div>

      <footer className="text-center text-xs text-slate-400 py-4">
        Urban Gaz Limited · Secure Cloud Commissioning System
      </footer>
    </div>
  );
};

export default LoginPage;
