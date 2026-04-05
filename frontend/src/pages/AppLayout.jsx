import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from '../components/common/Topbar';
import styles from './AppLayout.module.css';

const AppLayout = () => (
  <div className={styles.shell}>
    <Topbar />
    <main className={styles.main}>
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
