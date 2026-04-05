import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'', role:'user' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const pwStrength = (v) => {
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
  };

  const strength   = pwStrength(form.password);
  const strengthW  = form.password ? `${strength * 25}%` : '0%';
  const strengthC  = ['#ef4444','#f97316','#f59e0b','#10b981'][strength - 1] || '#ef4444';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) { toast.error('Fill all fields'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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

        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Join SkillForge and showcase your expertise</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input className={styles.input} type="text" placeholder="John Doe"
                value={form.name} onChange={set('name')} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input className={styles.input} type="email" placeholder="you@company.com"
                value={form.email} onChange={set('email')} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" placeholder="Min 8 characters"
              value={form.password} onChange={set('password')} />
            <div className={styles.pwBar}>
              <div style={{ width: strengthW, background: strengthC, height: '100%', borderRadius: 4, transition: 'all .3s' }} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <input className={styles.input} type="password" placeholder="Repeat password"
              value={form.confirm} onChange={set('confirm')} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Role</label>
            <div className={styles.rolePicker}>
              <button type="button"
                className={`${styles.roleBtn} ${form.role==='user' ? styles.roleBtnActive : ''}`}
                onClick={() => setForm(f => ({...f, role:'user'}))}>👤 User</button>
              <button type="button"
                className={`${styles.roleBtn} ${form.role==='admin' ? styles.roleBtnActive : ''}`}
                onClick={() => setForm(f => ({...f, role:'admin'}))}>🛡️ Admin</button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p className={styles.switch}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
