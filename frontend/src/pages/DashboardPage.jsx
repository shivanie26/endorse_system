import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import styles from './DashboardPage.module.css';

const COLORS = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b'];

const StatCard = ({ num, label, icon, accent, change, up }) => (
  <div className={styles.statCard} style={{ '--accent': accent }}>
    <div className={styles.statTop}>
      <div>
        <div className={styles.statNum}>{num}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
      <div className={styles.statIcon} style={{ background: accent + '22' }}>{icon}</div>
    </div>
    <span className={`${styles.statChange} ${up ? styles.changeUp : styles.changeDown}`}>{change}</span>
  </div>
);

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [stats,       setStats]      = useState(null);
  const [endorsements,setEndorsements] = useState([]);
  const [pending,     setPending]    = useState([]);
  const [loadingStats,setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/endorsements/stats'),
      api.get('/endorsements'),
      isAdmin ? api.get('/endorsements/pending') : Promise.resolve({ data: [] }),
    ]).then(([s, e, p]) => {
      setStats(s.data);
      setEndorsements(e.data.slice(0, 5));
      setPending(p.data);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoadingStats(false));
  }, [isAdmin]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/endorsements/${id}/status`, { status: 'approved' });
      setPending(p => p.filter(x => x._id !== id));
      setStats(s => s ? { ...s, pendingCount: Math.max(0, (s.pendingCount||0)-1), totalEndorsements: (s.totalEndorsements||0)+1 } : s);
      toast.success('Endorsement approved!');
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/endorsements/${id}/status`, { status: 'rejected' });
      setPending(p => p.filter(x => x._id !== id));
      setStats(s => s ? { ...s, pendingCount: Math.max(0, (s.pendingCount||0)-1) } : s);
      toast.success('Endorsement rejected.');
    } catch { toast.error('Failed to reject'); }
  };

  const barData = stats?.topUsers?.map(u => ({ name: u.name?.split(' ')[0], count: u.count })) || [];

  const pieData = stats?.catBreakdown?.map(c => ({ name: c._id, value: c.count })) || [];

  return (
    <div className={styles.page}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard num={stats?.totalUsers ?? '—'}        label="Total Users"         icon="👤" accent="#3b82f6" change="↑ +2 this week"   up />
        <StatCard num={stats?.totalEndorsements ?? '—'} label="Endorsements Given"  icon="✅" accent="#10b981" change="↑ +3 today"         up />
        <StatCard num={stats?.skillCount ?? '—'}        label="Skills Endorsed"     icon="⭐" accent="#f59e0b" change="↑ +5 this month"    up />
        <StatCard num={stats?.pendingCount ?? '—'}      label="Pending Approvals"   icon="⏳" accent="#ef4444" change={`${stats?.pendingCount ?? 0} need action`} />
      </div>

      <div className={styles.row3}>
        {/* My Skills */}
        <div className={styles.widget}>
          <div className={styles.widgetTitle}>My Skills</div>
          {user?.skills?.length ? user.skills.map((s, i) => (
            <div key={i} className={styles.skillRow}>
              <div className={styles.skillIcon}>{s.skill?.icon || '⭐'}</div>
              <div className={styles.skillName}>{s.skill?.name || '—'}</div>
              <div className={styles.skillBar}>
                <div className={styles.skillBarFill} style={{ width: `${s.level * 20}%` }} />
              </div>
              <div className={styles.skillLevel}>Lv {s.level}</div>
            </div>
          )) : (
            <p style={{ color:'var(--text2)', fontSize:13, padding:'12px 0' }}>No skills added yet. Edit your profile!</p>
          )}
        </div>

        {/* Recent Endorsements */}
        <div className={styles.widget}>
          <div className={styles.widgetTitle}>Recent Endorsements</div>
          {endorsements.length ? endorsements.map((e) => (
            <div key={e._id} className={styles.endorseItem}>
              <div className={styles.endorseAvatar}
                style={{ background: 'linear-gradient(135deg,var(--accent),var(--purple))' }}>
                {e.endorser?.name?.[0] || '?'}
              </div>
              <div className={styles.endorseText}>
                <strong>{e.endorser?.name}</strong> endorsed <strong>{e.recipient?.name}</strong>
              </div>
              <span className={styles.endorseBadge}>{e.skill?.name}</span>
            </div>
          )) : <p style={{ color:'var(--text2)', fontSize:13 }}>No endorsements yet.</p>}
        </div>

        {/* Pending Approvals (admin only) */}
        {isAdmin && (
          <div className={styles.widget}>
            <div className={styles.widgetTitle}>Approvals Pending</div>
            {pending.length ? pending.map(p => (
              <div key={p._id} className={styles.approvalItem}>
                <div className={styles.endorseAvatar}
                  style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', width:28, height:28, fontSize:10 }}>
                  {p.endorser?.name?.[0]}
                </div>
                <div style={{ flex:1, fontSize:'12.5px', color:'var(--text2)' }}>
                  <strong style={{ color:'var(--text)' }}>{p.endorser?.name}</strong> → <strong style={{ color:'var(--text)' }}>{p.skill?.name}</strong>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className={styles.btnApprove} onClick={() => handleApprove(p._id)}>Approve</button>
                  <button className={styles.btnReject}  onClick={() => handleReject(p._id)}>✕</button>
                </div>
              </div>
            )) : <p style={{ color:'var(--text2)', fontSize:13 }}>No pending approvals 🎉</p>}
          </div>
        )}
      </div>

      <div className={styles.row3} style={{ marginTop: 16 }}>
        {/* Bar chart */}
        <div className={styles.widget}>
          <div className={styles.widgetTitle}>Top Endorsed Users</div>
          {barData.length ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={barData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill:'var(--text2)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background:'var(--card2)', border:'1px solid var(--border2)', borderRadius:8, color:'var(--text)', fontSize:12 }}
                  cursor={{ fill:'rgba(59,130,246,0.06)' }}
                />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[4,4,0,0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color:'var(--text2)', fontSize:13 }}>No data yet.</p>}
        </div>

        {/* Pie chart */}
        <div className={styles.widget}>
          <div className={styles.widgetTitle}>Skill Endorsement Report</div>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={pieData} cx="35%" cy="50%" innerRadius={42} outerRadius={66}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend
                  layout="vertical" align="right" verticalAlign="middle"
                  iconType="circle" iconSize={9}
                  formatter={(v) => <span style={{ color:'var(--text2)', fontSize:12 }}>{v}</span>}
                />
                <Tooltip contentStyle={{ background:'var(--card2)', border:'1px solid var(--border2)', borderRadius:8, color:'var(--text)', fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color:'var(--text2)', fontSize:13 }}>No data yet.</p>}
        </div>

        {/* Activity feed */}
        <div className={styles.widget}>
          <div className={styles.widgetTitle}>Activity Feed</div>
          {endorsements.slice(0,4).map((e, i) => (
            <div key={i} className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: COLORS[i % COLORS.length] }} />
              <div className={styles.activityText}>
                <strong>{e.endorser?.name}</strong> endorsed <strong>{e.recipient?.name}</strong> for {e.skill?.name}
              </div>
              <div className={styles.activityTime}>just now</div>
            </div>
          ))}
          {!endorsements.length && <p style={{ color:'var(--text2)', fontSize:13 }}>No activity yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
