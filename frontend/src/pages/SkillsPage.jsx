import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import styles from './SkillsPage.module.css';

const CATEGORY_COLORS = {
  Programming: { bg: 'rgba(59,130,246,0.1)',  color: '#60a5fa' },
  Leadership:  { bg: 'rgba(139,92,246,0.1)',  color: '#c4b5fd' },
  Design:      { bg: 'rgba(236,72,153,0.1)',  color: '#f9a8d4' },
  'Soft Skills':{ bg: 'rgba(16,185,129,0.1)', color: '#34d399' },
};

const SkillModal = ({ skill, onClose, onSave }) => {
  const [form, setForm] = useState(
    skill
      ? { name: skill.name, category: skill.category, icon: skill.icon, status: skill.status }
      : { name: '', category: 'Programming', icon: '⭐', status: 'Active' }
  );
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Skill name is required'); return; }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <h3 className={styles.modalTitle}>{skill ? 'Edit Skill' : 'Add New Skill'}</h3>

        <div className={styles.modalForm}>
          <div className={styles.field}>
            <label className={styles.label}>Skill Name</label>
            <input className={styles.input} value={form.name} onChange={set('name')} placeholder="e.g. TypeScript" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <select className={styles.input} value={form.category} onChange={set('category')}>
              <option>Programming</option>
              <option>Leadership</option>
              <option>Design</option>
              <option>Soft Skills</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Icon (emoji)</label>
            <input className={styles.input} value={form.icon} onChange={set('icon')} placeholder="⭐" maxLength={2} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <select className={styles.input} value={form.status} onChange={set('status')}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : skill ? 'Save Changes' : 'Add Skill'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SkillsPage = () => {
  const { isAdmin } = useAuth();
  const [skills,       setSkills]     = useState([]);
  const [loading,      setLoading]    = useState(true);
  const [search,       setSearch]     = useState('');
  const [catFilter,    setCatFilter]  = useState('');
  const [sortKey,      setSortKey]    = useState('name');
  const [sortDir,      setSortDir]    = useState(1);
  const [editSkill,    setEditSkill]  = useState(null);  // null=closed, false=new, obj=edit
  const [showModal,    setShowModal]  = useState(false);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)    params.search   = search;
      if (catFilter) params.category = catFilter;
      const { data } = await api.get('/skills', { params });
      setSkills(data);
    } catch { toast.error('Failed to load skills'); }
    finally { setLoading(false); }
  }, [search, catFilter]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d * -1);
    else { setSortKey(key); setSortDir(1); }
  };

  const sorted = [...skills].sort((a, b) => {
    if (sortKey === 'name')             return sortDir * a.name.localeCompare(b.name);
    if (sortKey === 'category')         return sortDir * a.category.localeCompare(b.category);
    if (sortKey === 'endorsementCount') return sortDir * ((b.endorsementCount || 0) - (a.endorsementCount || 0));
    if (sortKey === 'growth')           return sortDir * ((b.growth || 0) - (a.growth || 0));
    return 0;
  });

  const openAdd  = () => { setEditSkill(null); setShowModal(true); };
  const openEdit = (s) => { setEditSkill(s);   setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditSkill(null); };

  const handleSave = async (form) => {
    try {
      if (editSkill) {
        await api.put(`/skills/${editSkill._id}`, form);
        toast.success('Skill updated!');
      } else {
        await api.post('/skills', form);
        toast.success('Skill added!');
      }
      fetchSkills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save skill');
      throw err;
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete skill "${name}"?`)) return;
    try {
      await api.delete(`/skills/${id}`);
      toast.success('Skill deleted');
      setSkills(s => s.filter(x => x._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const SortIcon = ({ k }) => (
    <span style={{ marginLeft: 4, opacity: sortKey === k ? 1 : 0.3 }}>
      {sortKey === k ? (sortDir === 1 ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>Manage Skills</h2>
          <p className={styles.headerSub}>Track all registered skills, endorsement counts and growth metrics</p>
        </div>
       <button className={styles.addBtn} onClick={openAdd}>
  + Add Skill
</button>
      </div>

      <div className={styles.tableWrap}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input className={styles.searchInput} placeholder="Search by skill…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={styles.filterSelect} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option>Programming</option>
            <option>Leadership</option>
            <option>Design</option>
            <option>Soft Skills</option>
          </select>
        </div>

        {/* Table */}
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className={styles.th}>
                  Skill <SortIcon k="name" />
                </th>
                <th onClick={() => handleSort('category')} className={styles.th}>
                  Category <SortIcon k="category" />
                </th>
                <th onClick={() => handleSort('endorsementCount')} className={styles.th}>
                  Endorsements <SortIcon k="endorsementCount" />
                </th>
                <th onClick={() => handleSort('growth')} className={styles.th}>
                  % Growth <SortIcon k="growth" />
                </th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((__, j) => (
                        <td key={j} className={styles.td}>
                          <div style={{ height: 14, borderRadius: 4, background: 'var(--border)', animation: 'pulse 1.5s ease infinite', width: j === 0 ? 140 : 80 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : sorted.map(s => {
                    const catStyle = CATEGORY_COLORS[s.category] || CATEGORY_COLORS.Programming;
                    const barW = Math.min(100, Math.round((s.endorsementCount || 0) / 50 * 100));
                    return (
                      <tr key={s._id} className={styles.tr}>
                        <td className={styles.td}>
                          <div className={styles.skillCell}>
                            <div className={styles.skillCellIcon}>{s.icon}</div>
                            <div>
                              <div className={styles.skillCellName}>{s.name}</div>
                              <div className={styles.skillCellSub}>{s.endorsementCount || 0} endorsements</div>
                            </div>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.catBadge} style={{ background: catStyle.bg, color: catStyle.color }}>
                            {s.category}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.barWrap}>
                            <div className={styles.barTrack}>
                              <div className={styles.barFill} style={{ width: `${barW}%` }} />
                            </div>
                            <span className={styles.barNum}>{s.endorsementCount || 0}</span>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.growthPct}>+{s.growth || 0}%</span>
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.statusBadge} ${s.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                            ● {s.status}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {isAdmin ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className={styles.btnEdit} onClick={() => openEdit(s)}>Edit</button>
                              <button className={styles.btnDel} onClick={() => handleDelete(s._id, s.name)}>Delete</button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text3)', fontSize: 12 }}>View only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        <div className={styles.tableFooter}>
          Showing {sorted.length} of {skills.length} entries
        </div>
      </div>

      {showModal && (
        <SkillModal skill={editSkill} onClose={closeModal} onSave={handleSave} />
      )}
    </div>
  );
};

export default SkillsPage;
