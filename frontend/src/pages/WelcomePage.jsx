import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './WelcomePage.module.css';

const WelcomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.name?.split(' ')[0] || 'Champion';
  const isAdmin   = user?.role === 'admin';

  return (
    <div className={styles.page}>
      <div className={styles.bgGrid} />
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.content}>
        <div className={styles.avatarRing}>{isAdmin ? '🛡️' : '🚀'}</div>

        <h1 className={styles.title}>
          Welcome, <span className={styles.nameHighlight}>{firstName}</span>!
        </h1>

        <p className={styles.subtitle}>
          {isAdmin
            ? 'You have admin powers — manage skills and endorse your team!'
            : 'Explore colleagues\' skills and build your professional profile!'}
        </p>

        <div className={styles.stats}>
          {[
            { num: '247', label: 'Total Users' },
            { num: '1.4K', label: 'Endorsements' },
            { num: '89',   label: 'Skills Listed' },
            { num: '32',   label: 'Top Experts' },
          ].map(({ num, label }) => (
            <div key={label} className={styles.statCard}>
              <div className={styles.statNum}>{num}</div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        <button className={styles.enterBtn} onClick={() => navigate('/dashboard')}>
          Enter Dashboard →
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
