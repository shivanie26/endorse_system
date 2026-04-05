import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [role, setRole]     = useState('user');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/welcome');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.bgGrid} />
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>⚡</div>
          <span className={styles.logoText}>Skill<span>Forge</span></span>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email Address</label>
            <input className={styles.input} type="email" placeholder="you@company.com"
              value={form.email} onChange={set('email')} autoComplete="email" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" placeholder="••••••••"
              value={form.password} onChange={set('password')} autoComplete="current-password" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Sign in as</label>
            <div className={styles.rolePicker}>
              <button type="button" className={`${styles.roleBtn} ${role==='user' ? styles.roleBtnActive : ''}`}
                onClick={() => setRole('user')}>👤 User</button>
              <button type="button" className={`${styles.roleBtn} ${role==='admin' ? styles.roleBtnActive : ''}`}
                onClick={() => setRole('admin')}>🛡️ Admin</button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p className={styles.switch}>
          New to SkillForge? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
