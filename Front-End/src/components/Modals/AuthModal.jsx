import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export default function AuthModal() {
  const { modalOpen, modalMode, closeModal, setModalMode, login, signup } = useAuth();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null); // { message, type }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      setBanner(null);
      setErrors({});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  useEffect(() => {
    function onKeydown(e) { if (e.key === 'Escape' && modalOpen) closeModal(); }
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [modalOpen, closeModal]);

  if (!modalOpen) return null;
  const isLogin = modalMode === 'login';

  async function handleLogin(e) {
    e.preventDefault();
    const newErrors = {};
    if (!loginForm.email || !isValidEmail(loginForm.email)) newErrors.loginEmail = 'Enter a valid email address.';
    if (!loginForm.password) newErrors.loginPassword = 'Password is required.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setLoading(true);
    try {
      const data = await login(loginForm.email, loginForm.password);
      if (data.success) {
        setBanner({ message: 'Login successful — welcome back!', type: 'success' });
        setTimeout(closeModal, 700);
      } else {
        setBanner({ message: data.message || 'Invalid email or password.', type: 'error' });
      }
    } catch {
      setBanner({ message: 'Network error. Please check your connection and try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    const newErrors = {};
    if (!signupForm.name) newErrors.signupName = 'Full name is required.';
    if (!signupForm.email || !isValidEmail(signupForm.email)) newErrors.signupEmail = 'Enter a valid email address.';
    if (!signupForm.password || signupForm.password.length < 8) newErrors.signupPassword = 'At least 8 characters, with letters and numbers.';
    if (signupForm.password !== signupForm.confirmPassword) newErrors.signupConfirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setLoading(true);
    try {
      const data = await signup(signupForm.name, signupForm.email, signupForm.password, signupForm.confirmPassword);
      if (data.success) {
        setBanner({ message: "Account created — you're all set!", type: 'success' });
        setTimeout(closeModal, 800);
      } else {
        setBanner({ message: data.message || 'Could not create account.', type: 'error' });
      }
    } catch {
      setBanner({ message: 'Network error. Please check your connection and try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function googleComingSoon() {
    setBanner({ message: 'Google login is coming soon — please use email and password for now.', type: 'error' });
  }

  return (
    <div className="auth-modal-overlay visible" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className="auth-modal" role="dialog" aria-modal="true">
        <div className="auth-modal-head">
          <h3>{isLogin ? 'Welcome back' : 'Create your account'}</h3>
          <button className="auth-modal-close" aria-label="Close" onClick={closeModal}><i className="ti ti-x" /></button>
        </div>
        <p className="auth-modal-sub">
          {isLogin ? 'Log in to save businesses and track your journey.' : 'Takes less than a minute — free forever.'}
        </p>

        <div className="auth-tabs">
          <button className={`auth-tab${isLogin ? ' active' : ''}`} type="button" onClick={() => setModalMode('login')}>Log In</button>
          <button className={`auth-tab${!isLogin ? ' active' : ''}`} type="button" onClick={() => setModalMode('signup')}>Sign Up</button>
        </div>

        <div className="auth-modal-body">
          {banner && <div className={`auth-banner visible ${banner.type}`}>{banner.message}</div>}

          {isLogin ? (
            <form className="auth-form" onSubmit={handleLogin} noValidate>
              <div className="auth-field">
                <label htmlFor="loginEmail">Email</label>
                <input
                  id="loginEmail" type="email" autoComplete="email" placeholder="you@example.com"
                  className={errors.loginEmail ? 'field-error' : ''}
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
                <div className="auth-field-msg">{errors.loginEmail}</div>
              </div>
              <div className="auth-field">
                <label htmlFor="loginPassword">Password</label>
                <input
                  id="loginPassword" type="password" autoComplete="current-password" placeholder="••••••••"
                  className={errors.loginPassword ? 'field-error' : ''}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
                <div className="auth-field-msg">{errors.loginPassword}</div>
              </div>
              <a href="#" className="auth-forgot" onClick={(e) => { e.preventDefault(); setBanner({ message: "Password reset isn't available yet — contact support for help.", type: 'error' }); }}>
                Forgot password?
              </a>
              <button type="submit" className={`auth-submit${loading ? ' loading' : ''}`} disabled={loading}>
                <span className="auth-submit-label">Log In</span>
              </button>

              <div className="auth-divider">or</div>
              <button type="button" className="auth-google-btn" onClick={googleComingSoon}>
                <i className="ti ti-brand-google auth-google-icon" /> Continue with Google
                <span className="auth-google-badge">Coming soon</span>
              </button>

              <div className="auth-switch-line">
                Don't have an account? <a onClick={() => setModalMode('signup')}>Sign up</a>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignup} noValidate>
              <div className="auth-field">
                <label htmlFor="signupName">Full name</label>
                <input
                  id="signupName" type="text" autoComplete="name" placeholder="Jane Doe"
                  className={errors.signupName ? 'field-error' : ''}
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                />
                <div className="auth-field-msg">{errors.signupName}</div>
              </div>
              <div className="auth-field">
                <label htmlFor="signupEmail">Email</label>
                <input
                  id="signupEmail" type="email" autoComplete="email" placeholder="you@example.com"
                  className={errors.signupEmail ? 'field-error' : ''}
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                />
                <div className="auth-field-msg">{errors.signupEmail}</div>
              </div>
              <div className="auth-field">
                <label htmlFor="signupPassword">Password</label>
                <input
                  id="signupPassword" type="password" autoComplete="new-password" placeholder="At least 8 characters"
                  className={errors.signupPassword ? 'field-error' : ''}
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                />
                <div className="auth-field-msg">{errors.signupPassword}</div>
              </div>
              <div className="auth-field">
                <label htmlFor="signupConfirmPassword">Confirm password</label>
                <input
                  id="signupConfirmPassword" type="password" autoComplete="new-password" placeholder="••••••••"
                  className={errors.signupConfirmPassword ? 'field-error' : ''}
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                />
                <div className="auth-field-msg">{errors.signupConfirmPassword}</div>
              </div>
              <button type="submit" className={`auth-submit${loading ? ' loading' : ''}`} disabled={loading}>
                <span className="auth-submit-label">Create Account</span>
              </button>

              <div className="auth-divider">or</div>
              <button type="button" className="auth-google-btn" onClick={googleComingSoon}>
                <i className="ti ti-brand-google auth-google-icon" /> Continue with Google
                <span className="auth-google-badge">Coming soon</span>
              </button>

              <div className="auth-switch-line">
                Already have an account? <a onClick={() => setModalMode('login')}>Log in</a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
