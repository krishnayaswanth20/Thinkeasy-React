import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/Buttons/Button';
import SEO from '../../components/SEO/SEO';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './login.css';

const REMEMBER_KEY = 'te_remember_email';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login, signup, isLoggedIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isLogin = mode === 'login';
  const redirectTo = location.state?.from?.pathname || '/';

  const {
    register, handleSubmit, watch, reset, formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur', defaultValues: { email: localStorage.getItem(REMEMBER_KEY) || '', remember: !!localStorage.getItem(REMEMBER_KEY) } });

  useEffect(() => {
    if (isLoggedIn) navigate(redirectTo, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    setServerError('');
    reset({ email: watch('remember') ? localStorage.getItem(REMEMBER_KEY) || '' : '', remember: !!localStorage.getItem(REMEMBER_KEY) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const password = watch('password');

  async function onSubmit(values) {
    setServerError('');
    try {
      if (values.remember) localStorage.setItem(REMEMBER_KEY, values.email);
      else localStorage.removeItem(REMEMBER_KEY);

      if (isLogin) {
        const data = await login(values.email, values.password);
        if (data.success) {
          toast.success('Welcome back!');
          navigate(redirectTo, { replace: true });
        } else {
          setServerError(data.message || 'Invalid email or password.');
          toast.error(data.message || 'Invalid email or password.');
        }
      } else {
        const data = await signup(values.name, values.email, values.password, values.confirmPassword);
        if (data.success) {
          toast.success("Account created — you're all set!");
          navigate(redirectTo, { replace: true });
        } else {
          setServerError(data.message || 'Could not create account.');
          toast.error(data.message || 'Could not create account.');
        }
      }
    } catch {
      const msg = 'Network error. Please check your connection and try again.';
      setServerError(msg);
      toast.error(msg);
    }
  }

  function forgotPassword() {
    toast.info("Password reset isn't available yet — contact support for help.");
  }

  return (
    <>
      <SEO title="Log In" path="/login" noIndex />
      <Navbar active="login" showBack />
      <div className="login-page">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="login-brand">
            <div className="login-logo-mark"><i className="ti ti-bolt" /></div>
            <span>Think<span className="accent">Easy</span></span>
          </div>

          <div className="login-tabs">
            <button type="button" className={`login-tab${isLogin ? ' active' : ''}`} onClick={() => setMode('login')}>Log In</button>
            <button type="button" className={`login-tab${!isLogin ? ' active' : ''}`} onClick={() => setMode('signup')}>Sign Up</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              initial={{ opacity: 0, x: isLogin ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 12 : -12 }}
              transition={{ duration: 0.2 }}
            >
              {!isLogin && (
                <div className="login-field">
                  <label htmlFor="name">Full name</label>
                  <input id="name" type="text" placeholder="Jane Doe" className={errors.name ? 'field-error' : ''}
                    {...register('name', { required: 'Full name is required.' })} />
                  {errors.name && <div className="login-field-msg">{errors.name.message}</div>}
                </div>
              )}

              <div className="login-field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="you@example.com" className={errors.email ? 'field-error' : ''}
                  {...register('email', {
                    required: 'Email is required.',
                    pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Enter a valid email address.' },
                  })} />
                {errors.email && <div className="login-field-msg">{errors.email.message}</div>}
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>
                <div className="login-pw-wrap">
                  <input
                    id="password" type={showPassword ? 'text' : 'password'}
                    placeholder={isLogin ? '••••••••' : 'At least 8 characters'}
                    className={errors.password ? 'field-error' : ''}
                    {...register('password', {
                      required: 'Password is required.',
                      minLength: !isLogin ? { value: 8, message: 'At least 8 characters.' } : undefined,
                    })}
                  />
                  <button type="button" className="login-pw-toggle" aria-label="Toggle password visibility" onClick={() => setShowPassword((v) => !v)}>
                    <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} />
                  </button>
                </div>
                {errors.password && <div className="login-field-msg">{errors.password.message}</div>}
              </div>

              {!isLogin && (
                <div className="login-field">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <div className="login-pw-wrap">
                    <input
                      id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                      className={errors.confirmPassword ? 'field-error' : ''}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password.',
                        validate: (v) => v === password || 'Passwords do not match.',
                      })}
                    />
                    <button type="button" className="login-pw-toggle" aria-label="Toggle password visibility" onClick={() => setShowConfirm((v) => !v)}>
                      <i className={`ti ${showConfirm ? 'ti-eye-off' : 'ti-eye'}`} />
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="login-field-msg">{errors.confirmPassword.message}</div>}
                </div>
              )}

              <div className="login-row-between">
                <label className="login-remember">
                  <input type="checkbox" {...register('remember')} /> Remember my email
                </label>
                {isLogin && <button type="button" className="login-forgot" onClick={forgotPassword}>Forgot password?</button>}
              </div>

              {serverError && <div className="login-error">{serverError}</div>}

              <Button type="submit" variant="primary" loading={isSubmitting} className="login-submit">
                {isLogin ? 'Log In' : 'Create Account'}
              </Button>

              <div className="login-switch-line">
                {isLogin ? (
                  <>Don't have an account? <a onClick={() => setMode('signup')}>Sign up</a></>
                ) : (
                  <>Already have an account? <a onClick={() => setMode('login')}>Log in</a></>
                )}
              </div>
            </motion.form>
          </AnimatePresence>

          <div className="login-back-home"><Link to="/">← Back to Home</Link></div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
