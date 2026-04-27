// Auth Page — Login / Signup with Firebase Auth

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Map, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode]             = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);

  const { signup, login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect already-logged-in users
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  // Switch mode resets form
  function switchMode(newMode) {
    setMode(newMode);
    setName('');
    setEmail('');
    setPassword('');
    setErrors({});
  }

  // Validation
  function validate() {
    const errs = {};
    if (mode === 'signup' && !name.trim()) {
      errs.name = 'Full name is required.';
    }
    if (!email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signup(name.trim(), email.trim(), password);
        toast.success(`Welcome, ${name.split(' ')[0]}! 🎉`);
      } else {
        await login(email.trim(), password);
        toast.success('Welcome back!');
      }
      navigate('/dashboard');
    } catch (err) {
      // Map Firebase error codes to user-friendly messages
      const code = err.code || '';
      let message = 'Something went wrong. Please try again.';
      if (code === 'auth/email-already-in-use')   message = 'An account with this email already exists.';
      if (code === 'auth/user-not-found')          message = 'No account found with this email.';
      if (code === 'auth/wrong-password')          message = 'Incorrect password. Please try again.';
      if (code === 'auth/invalid-credential')      message = 'Invalid email or password.';
      if (code === 'auth/too-many-requests')       message = 'Too many failed attempts. Please try later.';
      if (code === 'auth/network-request-failed')  message = 'Network error. Check your connection.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">

      {/* Back to home */}
      <Link
        to="/"
        id="btn-auth-back"
        className="absolute top-6 left-6 btn-ghost text-sm"
      >
        <ArrowLeft size={16} /> Back to home
      </Link>

      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-900/50">
            <Map size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {mode === 'login'
              ? 'Sign in to continue reporting civic issues'
              : 'Join thousands making their cities better'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">

          {/* Mode toggle */}
          <div className="flex rounded-xl bg-dark-900 p-1 mb-6">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                id={`btn-tab-${m}`}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                  ${mode === m
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-dark-400 hover:text-dark-200'
                  }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Name — signup only */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="field-name" className="form-label">Full Name</label>
                <input
                  id="field-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Jane Doe"
                  autoComplete="name"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="field-email" className="form-label">Email Address</label>
              <input
                id="field-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="field-password" className="form-label">Password</label>
              <div className="relative">
                <input
                  id="field-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input-field pr-11 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 justify-center"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 text-center text-dark-500 text-sm">
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}
                <button id="btn-switch-signup" onClick={() => switchMode('signup')} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button id="btn-switch-login" onClick={() => switchMode('login')} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
