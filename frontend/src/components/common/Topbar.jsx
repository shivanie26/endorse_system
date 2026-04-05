import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Topbar.module.css';

const NAV = [
  { to: '/dashboard',  label: 'Dashboard',    icon: '📊' },
  { to: '/users',      label: 'Find Users',   icon: '👥' },
  { to: '/skills',     label: 'Manage Skills', icon: '⚙️' },
  { to: '/profile',    label: 'Edit Profile', icon: '✏️' },
];

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.topbar}>
      <NavLink to="/dashboard" className={styles.logo}>
        <span className={styles.logoIcon}>⚡</span>
        Skill<span className={styles.logoAccent}>Forge</span>
      </NavLink>

      <nav className={styles.nav}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`
            }
          >
            <span className={styles.navIcon}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.right}>
        <span className={`${styles.roleBadge} ${user?.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
          {user?.role?.toUpperCase()}
        </span>
        <div className={styles.avatar} title={user?.name} onClick={() => navigate('/profile')}>
          {initials}
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
          🚪
        </button>
      </div>
    </header>
  );
};

export default Topbar;
