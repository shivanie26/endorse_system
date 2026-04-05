import React from 'react';
import styles from './UI.module.css';

/* ── Button ── */
export const Button = ({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) => (
  <button
    className={`${styles.btn} ${styles[`btn_${variant}`]} ${styles[`btn_${size}`]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <span className={styles.spinner} /> : children}
  </button>
);

/* ── Input ── */
export const Input = ({ label, error, className = '', ...props }) => (
  <div className={styles.formGroup}>
    {label && <label className={styles.label}>{label}</label>}
    <input className={`${styles.input} ${error ? styles.inputError : ''} ${className}`} {...props} />
    {error && <span className={styles.errorMsg}>{error}</span>}
  </div>
);

/* ── Select ── */
export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className={styles.formGroup}>
    {label && <label className={styles.label}>{label}</label>}
    <select className={`${styles.select} ${error ? styles.inputError : ''} ${className}`} {...props}>
      {children}
    </select>
    {error && <span className={styles.errorMsg}>{error}</span>}
  </div>
);

/* ── Textarea ── */
export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className={styles.formGroup}>
    {label && <label className={styles.label}>{label}</label>}
    <textarea className={`${styles.input} ${styles.textarea} ${error ? styles.inputError : ''} ${className}`} {...props} />
    {error && <span className={styles.errorMsg}>{error}</span>}
  </div>
);

/* ── Card ── */
export const Card = ({ children, className = '', accent, ...props }) => (
  <div className={`${styles.card} ${className}`} style={accent ? { '--card-accent': accent } : {}} {...props}>
    {children}
  </div>
);

/* ── Badge ── */
export const Badge = ({ children, color = 'blue', className = '' }) => (
  <span className={`${styles.badge} ${styles[`badge_${color}`]} ${className}`}>{children}</span>
);

/* ── Avatar ── */
export const Avatar = ({ name = '', gradient, size = 44, fontSize = 16 }) => {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: gradient || 'linear-gradient(135deg, var(--accent), var(--purple))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, flexShrink: 0, color: '#fff',
    }}>
      {initials}
    </div>
  );
};

/* ── Toggle ── */
export const Toggle = ({ checked, onChange }) => (
  <div className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`} onClick={() => onChange(!checked)}>
    <div className={styles.toggleKnob} />
  </div>
);

/* ── Skeleton ── */
export const Skeleton = ({ width = '100%', height = 16, radius = 6, style = {} }) => (
  <div style={{ width, height, borderRadius: radius, background: 'var(--border)', animation: 'pulse 1.5s ease infinite', ...style }} />
);

/* ── Empty State ── */
export const EmptyState = ({ icon = '🔍', title = 'Nothing here', desc = '' }) => (
  <div style={{ textAlign:'center', padding:'48px 24px', color:'var(--text2)' }}>
    <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'var(--text)', marginBottom:6 }}>{title}</div>
    {desc && <div style={{ fontSize:13 }}>{desc}</div>}
  </div>
);
