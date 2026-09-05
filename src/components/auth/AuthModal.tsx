import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { AuthMode } from '../../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signInWithEmail, signUpWithEmail, signInAsGuest, signInWithGoogle, sendPasswordReset } =
    useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (mode === 'forgot_password') {
      try {
        setLoading(true);
        await sendPasswordReset(email.trim());
        setSuccessMessage('Password reset link sent to your email. Check your inbox!');
      } catch (err: any) {
        setErrorMessage(getFriendlyErrorMessage(err.code));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try {
      setLoading(true);
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMessage('Google Sign-In is not enabled yet in your Firebase Console. Email/Password is currently active.');
      } else {
        setErrorMessage(getFriendlyErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setErrorMessage(null);
    try {
      setLoading(true);
      await signInAsGuest();
      onClose();
    } catch (err: any) {
      setErrorMessage('Guest mode failed to connect. Continuing in demo view.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  function getFriendlyErrorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please verify your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a few moments or reset your password.';
      default:
        return 'Authentication failed. Please check your network and Firebase Console rules.';
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-obsidian-surface border border-obsidian-highlight rounded-2xl w-full max-w-md shadow-command overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-5 border-b border-obsidian-border bg-obsidian-base flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-obsidian-highlight bg-obsidian-surface p-0.5">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-white text-base">
                Tradestory Cloud Command
              </h3>
              <p className="text-[11px] font-mono text-obsidian-slate">
                Sync trades, charts & autopsies across devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-obsidian-slate hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot_password' && (
          <div className="grid grid-cols-2 p-1.5 m-4 mb-2 bg-obsidian-base rounded-xl border border-obsidian-border">
            <button
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-trade-emerald text-obsidian-base shadow-sm'
                  : 'text-obsidian-slate hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-trade-emerald text-obsidian-base shadow-sm'
                  : 'text-obsidian-slate hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleAuthSubmit} className="p-5 pt-3 space-y-4 font-mono text-xs">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-trade-crimson/15 border border-trade-crimson/40 rounded-xl text-trade-crimson text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-trade-emerald/15 border border-trade-emerald/40 rounded-xl text-trade-emerald text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="text-[11px] text-obsidian-slate block mb-1">Trader Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@tradingfirm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-obsidian-base border border-obsidian-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-obsidian-slate/40 focus:border-trade-emerald outline-none transition-colors"
              />
              <Mail className="w-4 h-4 text-obsidian-slate absolute left-3 top-3" />
            </div>
          </div>

          {/* Password Field (for Sign In & Sign Up) */}
          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-obsidian-slate">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorMessage(null);
                    }}
                    className="text-[10px] text-trade-emerald hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-obsidian-base border border-obsidian-border rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-obsidian-slate/40 focus:border-trade-emerald outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-obsidian-slate absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-obsidian-slate hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-trade-emerald hover:bg-emerald-400 text-obsidian-base font-bold rounded-xl shadow-glow-emerald transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-obsidian-base border-t-transparent" />
            ) : mode === 'signin' ? (
              <>
                <span>Sign In to Tradestory</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'signup' ? (
              <>
                <span>Create Trader Account</span>
                <UserCheck className="w-4 h-4" />
              </>
            ) : (
              <span>Send Reset Email</span>
            )}
          </button>

          {/* Back to Sign In from Forgot Password */}
          {mode === 'forgot_password' && (
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className="w-full text-center text-xs text-obsidian-slate hover:text-white py-1"
            >
              ← Back to Sign In
            </button>
          )}

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-obsidian-highlight"></div>
            <span className="flex-shrink mx-3 text-[10px] text-obsidian-slate uppercase">or</span>
            <div className="flex-grow border-t border-obsidian-highlight"></div>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2 bg-obsidian-base hover:bg-obsidian-highlight border border-obsidian-border text-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>

          {/* Guest Demo Mode */}
          <button
            type="button"
            onClick={handleGuestSignIn}
            disabled={loading}
            className="w-full py-2 bg-obsidian-base hover:bg-obsidian-highlight border border-obsidian-border text-obsidian-slate hover:text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 text-[11px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-trade-amber" />
            <span>Continue as Demo Trader (Instant Preview)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
