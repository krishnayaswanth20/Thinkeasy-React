import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/Buttons/Button';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useToast } from '../../contexts/ToastContext';
import './admin.css';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login, isAdmin } = useAdminAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/admin';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ mode: 'onBlur' });

  useEffect(() => {
    if (isAdmin) navigate(redirectTo, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function onSubmit(values) {
    setServerError('');
    try {
      const data = await login(values.username, values.password);
      if (data.username) {
        toast.success(`Welcome back, ${data.username}`);
        navigate(redirectTo, { replace: true });
      } else {
        setServerError(data.error || 'Invalid username or password.');
        toast.error(data.error || 'Invalid username or password.');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Network error. Please try again.';
      setServerError(msg);
      toast.error(msg);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <motion.div
        className="admin-modal"
        style={{ maxWidth: 380, width: '100%' }}
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#4f46e5,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 10px', fontSize: 20 }}>
            <i className="ti ti-shield-lock" />
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>Admin Sign In</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>ThinkEasy management panel</div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="admin-field">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" placeholder="admin" {...register('username', { required: 'Username is required.' })} />
            {errors.username && <div className="admin-field-hint" style={{ color: '#ef4444' }}>{errors.username.message}</div>}
          </div>
          <div className="admin-field">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                style={{ paddingRight: 38 }}
                {...register('password', { required: 'Password is required.' })}
              />
              <button
                type="button" onClick={() => setShowPassword((v) => !v)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
              >
                <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} />
              </button>
            </div>
            {errors.password && <div className="admin-field-hint" style={{ color: '#ef4444' }}>{errors.password.message}</div>}
          </div>

          {serverError && (
            <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#ef4444', borderRadius: 10, padding: '9px 12px', fontSize: 12.5, fontWeight: 600, marginBottom: 14 }}>
              {serverError}
            </div>
          )}

          <Button type="submit" variant="primary" loading={isSubmitting} style={{ width: '100%', padding: '11px 0' }}>
            Sign In
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="/" style={{ fontSize: 12.5, color: 'var(--muted)' }}>← Back to site</a>
        </div>
      </motion.div>
    </div>
  );
}
