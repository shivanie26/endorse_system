import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import styles from './UsersPage.module.css';

/* ── User Profile Modal ── */
const UserModal = ({ user: u, onClose, onEndorse, isAdmin }) => {
  if (!u) return null;
  const initials = u.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const [selectedSkill, setSelectedSkill] = useState('');

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <div className={styles.modalHeader}>
          <div className={styles.modalAvatar} style={{ background: u.gradient || 'linear-gradient(135deg,var(--accent),var(--purple))' }}>
            {initials}
          </div>
          <div>
            <div className={styles.modalName}>{u.name}</div>
            <div className={styles.modalMeta}>{u.jobTitle || u.role} · {u.skills?.length || 0} skills</div>
            <div className={styles.modalLinks}>
              {u.linkedin && <a href={`https://${u.linkedin}`} target="_blank" rel="noreferrer" className={`${styles.link} ${styles.linkLinkedin}`}>💼 LinkedIn</a>}
              {u.leetcode && <a href={`https://leetcode.com/u/${u.leetcode}`} target="_blank" rel="noreferrer" className={`${styles.link} ${styles.linkLeetcode}`}>🧩 LeetCode</a>}
              {u.github   && <a href={`https://github.com/${u.github}`}      target="_blank" rel="noreferrer" className={`${styles.link} ${styles.linkGithub}`}>🐙 GitHub</a>}
            </div>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.sectionTitle}>Skills & Endorsements</div>
          {u.endorsements?.length ? u.endorsements.reduce((acc, e) => {
            const key = e.skill?._id;
            if (!acc.find(x => x.skillId === key)) acc.push({ skillId: key, name: e.skill?.name, icon: e.skill?.icon, count: u.endorsements.filter(x => x.skill?._id === key).length });
            return acc;
          }, []).map((s, i) => (
            <div key={i} className={styles.skillBar}>
              <span className={styles.skillBarIcon}>{s.icon}</span>
              <span className={styles.skillBarName}>{s.name}</span>
              <div className={styles.skillBarTrack}>
                <div className={styles.skillBarFill} style={{ width: `${Math.min(100, s.count * 8)}%` }} />
              </div>
              <span className={styles.skillBarCount}>{s.count} endorsements</span>
            </div>
          )) : (
            u.skills?.map((s, i) => (
              <div key={i} className={styles.skillBar}>
                <span className={styles.skillBarIcon}>{s.skill?.icon || '⭐'}</span>
                <span className={styles.skillBarName}>{s.skill?.name}</span>
                <div className={styles.skillBarTrack}>
                  <div className={styles.skillBarFill} style={{ width: `${s.level * 20}%` }} />
                </div>
                <span className={styles.skillBarCount}>Lv {s.level}</span>
              </div>
            ))
          )}

          {isAdmin && u.skills?.length > 0 && (
            <>
              <div className={styles.sectionTitle} style={{ marginTop: 20 }}>Give Endorsement</div>
              <div style={{ display:'flex', gap:10 }}>
                <select className={styles.endorseSelect} value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)}>
                  <option value="">Select a skill…</option>
                  {u.skills.map((s, i) => <option key={i} value={s.skill?._id}>{s.skill?.name}</option>)}
                </select>
                <button className={styles.endorseBtn} onClick={() => { if (!selectedSkill) { toast.error('Pick a skill first'); return; } onEndorse(u._id, selectedSkill); onClose(); }}>
                  ⚡ Endorse
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── User Card ── */
const GRADIENTS = [
  'linear-gradient(135deg,#3b82f6,#8b5cf6)',
  'linear-gradient(135deg,#10b981,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
  'linear-gradient(135deg,#8b5cf6,#3b82f6)',
  'linear-gradient(135deg,#06b6d4,#10b981)',
];

const UserCard = ({ user: u, index, onView, onEndorse, isAdmin }) => {
  const initials = u.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.cardAvatar} style={{ background: gradient }}>{initials}</div>
        <div>
          <div className={styles.cardName}>{u.name}</div>
          <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
            {u.role.toUpperCase()}
          </span>
        </div>
      </div>

      <div className={styles.cardSkills}>
        {u.skills?.slice(0, 4).map((s, i) => (
          <span key={i} className={styles.skillTag}>{s.skill?.name || s}</span>
        ))}
        {u.skills?.length > 4 && <span className={styles.skillTagMore}>+{u.skills.length - 4}</span>}
      </div>

      <div className={styles.cardStats}>
        <span className={styles.cardStat}>⭐ {u.endorsementCount || 0} endorsements</span>
      </div>

      <div className={styles.cardFooter}>
        <button className={styles.btnView} onClick={() => onView(u, gradient)}>View Profile</button>
        {isAdmin
          ? <button className={styles.btnEndorse} onClick={() => onView(u, gradient)}>⚡ Endorse</button>
          : <button className={styles.btnEndorseDisabled} disabled title="Only admins can endorse">⚡ Endorse</button>
        }
      </div>
    </div>
  );
};

/* ── Users Page ── */
const UsersPage = () => {
  const { isAdmin } = useAuth();
  const [users,        setUsers]       = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [search,       setSearch]      = useState('');
  const [roleFilter,   setRoleFilter]  = useState('');
  const [skillFilter,  setSkillFilter] = useState('');
  const [modalUser,    setModalUser]   = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)     params.search = search;
      if (roleFilter) params.role   = roleFilter;
      if (skillFilter)params.skill  = skillFilter;
      const { data } = await api.get('/users', { params });
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [search, roleFilter, skillFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openModal = async (u, gradient) => {
    try {
      const { data } = await api.get(`/users/${u._id}`);
      setModalUser({ ...data.user, endorsements: data.endorsements, gradient });
    } catch { setModalUser({ ...u, gradient }); }
  };

  const handleEndorse = async (recipientId, skillId) => {
    try {
      await api.post('/endorsements', { recipientId, skillId });
      toast.success('Endorsement sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to endorse');
    }
  };

  const allSkills = [...new Set(users.flatMap(u => u.skills?.map(s => s.skill?.name).filter(Boolean) || []))];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Find Users</h2>
        <p className={styles.headerSub}>Browse team members, explore their skills and endorsements</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search by name or skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className={styles.filterSelect} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select className={styles.filterSelect} value={skillFilter} onChange={e => setSkillFilter(e.target.value)}>
          <option value="">All Skills</option>
          {allSkills.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className={styles.loadingGrid}>
          {[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text2)' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'var(--text)' }}>No users found</div>
          <div style={{ fontSize:13, marginTop:6 }}>Try adjusting your filters</div>
        </div>
      ) : (
        <div className={styles.grid}>
          {users.map((u, i) => (
            <UserCard key={u._id} user={u} index={i}
              onView={openModal} onEndorse={handleEndorse} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {modalUser && (
        <UserModal
          user={modalUser}
          onClose={() => setModalUser(null)}
          onEndorse={handleEndorse}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default UsersPage;
