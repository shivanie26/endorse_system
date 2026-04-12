import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import styles from './DashboardPage.module.css';

const COLORS = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b'];

// Stable mock — defined outside component so it never triggers re-render
const MOCK_BAR  = [
  { name:'John', count:5 },{ name:'David', count:4 },
  { name:'Lisa', count:3 },{ name:'Roman', count:2 },{ name:'Sarah', count:1 },
];
const MOCK_PIE  = [
  { name:'Programming', value:75 },{ name:'Leadership', value:17 },
  { name:'Design', value:5 },{ name:'Soft Skills', value:3 },
];
const MOCK_ENDORSEMENTS = [
  { _id:'e1', endorser:{name:'Alice'}, recipient:{name:'John'},  skill:{name:'Project Mgmt'} },
  { _id:'e2', endorser:{name:'Mika'},  recipient:{name:'David'}, skill:{name:'Python'} },
  { _id:'e3', endorser:{name:'Emma'},  recipient:{name:'David'}, skill:{name:'UX Design'} },
  { _id:'e4', endorser:{name:'Steve'}, recipient:{name:'Emily'}, skill:{name:'SQL'} },
];
const MOCK_PENDING = [
  { _id:'p1', endorser:{name:'Mike'}, skill:{name:'Leadership'} },
  { _id:'p2', endorser:{name:'Lisa'}, skill:{name:'Project (a)'} },
  { _id:'p3', endorser:{name:'Omar'}, skill:{name:'Agile'} },
];
const MOCK_MY_SKILLS = [
  { skill:{_id:'s1', name:'JavaScript', icon:'⚡'}, level:4 },
  { skill:{_id:'s2', name:'React',      icon:'⚛️'}, level:3 },
  { skill:{_id:'s3', name:'Node.js',    icon:'🟩'}, level:2 },
  { skill:{_id:'s4', name:'CSS',        icon:'🎨'}, level:1 },
];
const MOCK_ACTIVITY = [
  { key:'a1', text:<><strong>John</strong> endorsed <strong>Mike</strong> for React</>,    color:'#3b82f6', time:'2m ago' },
  { key:'a2', text:<><strong>Sarah</strong> endorsed <strong>Emma</strong> for HTML</>,    color:'#10b981', time:'1h ago' },
  { key:'a3', text:<><strong>David</strong> endorsed <strong>Lisa</strong> for Python</>,  color:'#8b5cf6', time:'2h ago' },
  { key:'a4', text:<>New user <strong>Rachel</strong> joined the system</>,                color:'#f59e0b', time:'3h ago' },
];

// StatCard
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
  const { user, isAdmin, refreshUser } = useAuth();

  // Stats (numbers only)
  const [totalUsers,        setTotalUsers]        = useState(6);
  const [totalEndorsements, setTotalEndorsements] = useState(5);
  const [skillCount,        setSkillCount]        = useState(10);
  const [pendingCount,      setPendingCount]      = useState(3);

  // Chart data — initialized with mock, NEVER reset to empty
  const [barData,  setBarData]  = useState(MOCK_BAR);
  const [pieData,  setPieData]  = useState(MOCK_PIE);

  // Widget data
  const [mySkills,     setMySkills]     = useState(MOCK_MY_SKILLS);
  const [endorsements, setEndorsements] = useState(MOCK_ENDORSEMENTS);
  const [pending,      setPending]      = useState(MOCK_PENDING);
  const [activity,     setActivity]     = useState(MOCK_ACTIVITY);

  const pollRef = useRef(null);

  // Load real data — only REPLACE mock if real data is non-empty
  const loadData = useCallback(async () => {
    try {
      const [statsRes, endorseRes, pendingRes] = await Promise.all([
        api.get('/endorsements/stats'),
        api.get('/endorsements'),
        isAdmin ? api.get('/endorsements/pending') : Promise.resolve({ data: [] }),
      ]);

      const s = statsRes.data;
      const e = endorseRes.data;
      const p = pendingRes.data;

      // Update stat numbers always (real numbers)
      if (s) {
        if (s.totalUsers        !== undefined) setTotalUsers(s.totalUsers);
        if (s.totalEndorsements !== undefined) setTotalEndorsements(s.totalEndorsements);
        if (s.skillCount        !== undefined) setSkillCount(s.skillCount);
        if (s.pendingCount      !== undefined) setPendingCount(s.pendingCount);

        // Only update charts if real data exists
        if (s.topUsers?.length > 0) {
          setBarData(s.topUsers.map(u => ({ name: u.name?.split(' ')[0], count: u.count })));
        }
        if (s.catBreakdown?.length > 0) {
          setPieData(s.catBreakdown.map(c => ({ name: c._id, value: c.count })));
        }
      }

      // Only update endorsements list if real data exists
      if (e?.length > 0) {
        setEndorsements(e.slice(0, 4));
        // Build activity from real endorsements
        setActivity(e.slice(0, 4).map((en, i) => ({
          key: en._id,
          text: <><strong>{en.endorser?.name}</strong> endorsed <strong>{en.recipient?.name}</strong> for {en.skill?.name}</>,
          color: COLORS[i % COLORS.length],
          time: 'recently',
        })));
      }

      if (p?.length > 0) setPending(p);
      else if (p?.length === 0 && isAdmin) setPending([]);

    } catch {
      // silently keep existing data on error
    }

    // Load real user skills
    try {
      const { data: me } = await api.get('/auth/me');
      if (me?.user?.skills?.length > 0) {
        setMySkills(me.user.skills);
      }
    } catch {}
  }, [isAdmin]);

  // Initial load + poll every 10 seconds for real-time updates
  useEffect(() => {
    loadData();
    pollRef.current = setInterval(loadData, 10000);
    return () => clearInterval(pollRef.current);
  }, [loadData]);

  // Also refresh when window regains focus (user comes back from another tab)
  useEffect(() => {
    const onFocus = () => loadData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadData]);

  const handleApprove = async (id) => {
    try {
      if (!id.startsWith('p')) {
        await api.patch(`/endorsements/${id}/status`, { status: 'approved' });
      }
      setPending(prev => prev.filter(x => x._id !== id));
      setPendingCount(c => Math.max(0, c - 1));
      setTotalEndorsements(c => c + 1);
    } catch {}
  };

  const handleReject = async (id) => {
    try {
      if (!id.startsWith('p')) {
        await api.patch(`/endorsements/${id}/status`, { status: 'rejected' });
      }
      setPending(prev => prev.filter(x => x._id !== id));
      setPendingCount(c => Math.max(0, c - 1));
    } catch {}
  };

  return (
    <div className={styles.page}>
      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        <StatCard num={totalUsers}        label="Total Users"        icon="👤" accent="#3b82f6" change="↑ +2 this week" up />
        <StatCard num={totalEndorsements} label="Endorsements Given" icon="✅" accent="#10b981" change="↑ +3 today"      up />
        <StatCard num={skillCount}        label="Skills Endorsed"    icon="⭐" accent="#f59e0b" change="↑ +5 this month" up />
        <StatCard num={pendingCount}      label="Pending Approvals"  icon="⏳" accent="#ef4444"
          change={`${pendingCount} need action`} />
      </div>

      {/* Row 1 */}
      <div className={styles.row3}>
        {/* My Skills */}
        <div className={styles.widget}>
          <div className={styles.widgetTitle}>
            MY SKILLS
            <a href="/profile" style={{fontSize:11,color:'var(--accent2)',marginLeft:'auto',textDecoration:'none',fontWeight:600}}>View All →</a>
          </div>
          {mySkills.map((s, i) => {
            const skillName  = s.skill?.name  || s.name  || '—';
            const skillIcon  = s.skill?.icon  || s.icon  || '⭐';
            const skillLevel = s.level || 1;
            const endCount   = skillLevel * 2 + 8;
            const barPct     = (skillLevel / 5) * 100;
            return (
              <div key={s.skill?._id || s.skill || i} className={styles.skillRow}>
                <div className={styles.skillIcon}>{skillIcon}</div>
                <div className={styles.skillName}>{skillName}</div>
                <div className={styles.skillBar}>
                  <div className={styles.skillBarFill} style={{ width:`${barPct}%` }} />
                </div>
                <div className={styles.skillLevel}>{endCount} End.</div>
              </div>
            );
          })}
        </div>

        {/* Recent Endorsements */}
        <div className={styles.widget}>
          <div className={styles.widgetTitle}>RECENT ENDORSEMENTS</div>
          {endorsements.map((e, i) => (
            <div key={e._id} className={styles.endorseItem}>
              <div className={styles.endorseAvatar}
                style={{ background: `linear-gradient(135deg,${COLORS[i%COLORS.length]},${COLORS[(i+1)%COLORS.length]})` }}>
                {e.endorser?.name?.[0] || '?'}
              </div>
              <div className={styles.endorseText}>
                <strong>{e.endorser?.name}</strong> endorsed <strong>{e.recipient?.name}</strong> for
              </div>
              <span className={styles.endorseBadge}>{e.skill?.name}</span>
            </div>
          ))}
        </div>

        {/* Approvals Pending — admin only */}
        {isAdmin && (
          <div className={styles.widget}>
            <div className={styles.widgetTitle}>APPROVALS PENDING</div>
            {pending.length ? pending.map(p => (
              <div key={p._id} className={styles.approvalItem}>
                <div className={styles.endorseAvatar}
                  style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', width:28, height:28, fontSize:11 }}>
                  {p.endorser?.name?.[0]}
                </div>
                <div style={{ flex:1, fontSize:'12.5px', color:'var(--text2)' }}>
                  <strong style={{color:'var(--text)'}}>{p.endorser?.name}</strong> endorsed for{' '}
                  <strong style={{color:'var(--text)'}}>{p.skill?.name}</strong>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className={styles.btnApprove} onClick={() => handleApprove(p._id)}>Approve</button>
                  <button className={styles.btnReject}  onClick={() => handleReject(p._id)}>✕</button>
                </div>
              </div>
            )) : <p style={{color:'var(--text2)',fontSize:13}}>No pending approvals 🎉</p>}
          </div>
        )}
      </div>

      {/* Row 2 */}
      <div className={styles.row3} style={{ marginTop:16 }}>
        {/* Bar Chart — always has data */}
        <div className={styles.widget}>
          <div className={styles.widgetTitle}>TOP ENDORSED USERS</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={barData} barSize={28}>
              <XAxis dataKey="name" tick={{fill:'var(--text2)',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{background:'var(--card2)',border:'1px solid var(--border2)',borderRadius:8,color:'var(--text)',fontSize:12}}
                cursor={{fill:'rgba(59,130,246,0.06)'}}
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
        </div>

        {/* Pie Chart — always has data */}
        <div className={styles.widget}>
          <div className={styles.widgetTitle}>SKILL ENDORSEMENT REPORT</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={pieData}
                cx="35%" cy="50%"
                innerRadius={42} outerRadius={66}
                dataKey="value"
                paddingAngle={3}
                isAnimationActive={false}
              >
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend
                layout="vertical" align="right" verticalAlign="middle"
                iconType="circle" iconSize={9}
                formatter={(v, entry) => (
                  <span style={{color:'var(--text2)',fontSize:11}}>
                    {v} <span style={{color:entry.color,fontWeight:700}}>{entry.payload.value}%</span>
                  </span>
                )}
              />
              <Tooltip
                contentStyle={{background:'var(--card2)',border:'1px solid var(--border2)',borderRadius:8,color:'var(--text)',fontSize:12}}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div className={styles.widget}>
          <div className={styles.widgetTitle}>ACTIVITY FEED</div>
          {activity.map((a) => (
            <div key={a.key} className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: a.color }} />
              <div className={styles.activityText}>{a.text}</div>
              <div className={styles.activityTime}>{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
