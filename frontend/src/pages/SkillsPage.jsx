import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import styles from './SkillsPage.module.css';

const CATEGORY_COLORS = {
  Programming:  { bg: 'rgba(59,130,246,0.1)',  color: '#60a5fa' },
  Leadership:   { bg: 'rgba(139,92,246,0.1)',  color: '#c4b5fd' },
  Design:       { bg: 'rgba(236,72,153,0.1)',  color: '#f9a8d4' },
  'Soft Skills':{ bg: 'rgba(16,185,129,0.1)',  color: '#34d399' },
};

// ── Mock seed data shown when DB is empty ──
const MOCK_SKILLS = [
  { _id:'m1', name:'JavaScript',        category:'Programming',  icon:'⚡', endorsementCount:50, growth:860, status:'Active' },
  { _id:'m2', name:'React',             category:'Programming',  icon:'⚛️', endorsementCount:40, growth:700, status:'Active' },
  { _id:'m3', name:'Python',            category:'Programming',  icon:'🐍', endorsementCount:32, growth:620, status:'Active' },
  { _id:'m4', name:'Node.js',           category:'Programming',  icon:'🟩', endorsementCount:45, growth:450, status:'Active' },
  { _id:'m5', name:'Project Management',category:'Leadership',   icon:'📋', endorsementCount:40, growth:400, status:'Active' },
  { _id:'m6', name:'Leadership',        category:'Leadership',   icon:'🏆', endorsementCount:28, growth:360, status:'Active' },
  { _id:'m7', name:'UX Design',         category:'Design',       icon:'🎨', endorsementCount:22, growth:290, status:'Active' },
  { _id:'m8', name:'SQL',               category:'Programming',  icon:'🗄️', endorsementCount:18, growth:230, status:'Active' },
  { _id:'m9', name:'Agile',             category:'Leadership',   icon:'🔄', endorsementCount:15, growth:190, status:'Active' },
  { _id:'m10',name:'CSS',               category:'Design',       icon:'💅', endorsementCount:12, growth:160, status:'Active' },
];

// ── Add / Edit Modal ──────────────────────────────────────────────
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
    } catch {
      // error already toasted
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
        <div style={{ display:'flex', gap:10, marginTop:24 }}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : skill ? 'Save Changes' : 'Add Skill'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Skills Page ───────────────────────────────────────────────────
const SkillsPage = () => {
  const { isAdmin } = useAuth();
  const [skills,    setSkills]    = useState(MOCK_SKILLS);
  const [usingMock, setUsingMock] = useState(true);
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [sortKey,   setSortKey]   = useState('name');
  const [sortDir,   setSortDir]   = useState(1);
  const [editSkill, setEditSkill] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      const params = {};
      if (search)    params.search   = search;
      if (catFilter) params.category = catFilter;
      const { data } = await api.get('/skills', { params });
      if (data && data.length > 0) {
        setSkills(data);
        setUsingMock(false);
      } else {
        // DB empty — keep mock but apply local filters
        let filtered = MOCK_SKILLS;
        if (search)    filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
        if (catFilter) filtered = filtered.filter(s => s.category === catFilter);
        setSkills(filtered);
        setUsingMock(true);
      }
    } catch {
      // On error keep mock
      let filtered = MOCK_SKILLS;
      if (search)    filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
      if (catFilter) filtered = filtered.filter(s => s.category === catFilter);
      setSkills(filtered);
      setUsingMock(true);
    }
  }, [search, catFilter]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d * -1);
    else { setSortKey(key); setSortDir(1); }
  };

  const sorted = [...skills].sort((a, b) => {
    if (sortKey === 'name')             return sortDir * a.name.localeCompare(b.name);
    if (sortKey === 'category')         return sortDir * a.category.localeCompare(b.category);
    if (sortKey === 'endorsementCount') return sortDir * ((b.endorsementCount||0) - (a.endorsementCount||0));
    if (sortKey === 'growth')           return sortDir * ((b.growth||0) - (a.growth||0));
    return 0;
  });

  const openAdd  = () => { setEditSkill(null);  setShowModal(true); };
  const openEdit = (s) => { setEditSkill(s);    setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditSkill(null); };

  const handleSave = async (form) => {
    try {
      if (editSkill && !usingMock) {
        // Real edit
        const { data } = await api.put(`/skills/${editSkill._id}`, form);
        setSkills(prev => prev.map(s => s._id === editSkill._id ? { ...s, ...data } : s));
        toast.success('Skill updated!');
      } else if (!editSkill && !usingMock) {
        // Real add
        const { data } = await api.post('/skills', form);
        setSkills(prev => [{ ...data, endorsementCount: 0, growth: 0 }, ...prev]);
        toast.success('Skill added!');
      } else {
        // Mock mode — add/edit locally
        if (editSkill) {
          setSkills(prev => prev.map(s =>
            s._id === editSkill._id ? { ...s, ...form } : s
          ));
          toast.success('Skill updated!');
        } else {
          const newSkill = {
            _id: 'm' + Date.now(),
            ...form,
            endorsementCount: 0,
            growth: 0,
          };
          setSkills(prev => [newSkill, ...prev]);
          toast.success('Skill added!');
          // Also try real API in background
          api.post('/skills', form).catch(() => {});
        }
      }
    } catch (err) {
      // If real API fails, still add locally
      if (!editSkill) {
        const newSkill = { _id:'m'+Date.now(), ...form, endorsementCount:0, growth:0 };
        setSkills(prev => [newSkill, ...prev]);
        toast.success('Skill added locally!');
      } else {
        toast.error(err.response?.data?.message || 'Failed to save');
        throw err;
      }
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete skill "${name}"?`)) return;
    if (id.startsWith('m')) {
      setSkills(prev => prev.filter(s => s._id !== id));
      toast.success('Skill removed');
      return;
    }
    try {
      await api.delete(`/skills/${id}`);
      setSkills(prev => prev.filter(s => s._id !== id));
      toast.success('Skill deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const SortIcon = ({ k }) => (
    <span style={{ marginLeft:4, opacity: sortKey===k ? 1 : 0.3 }}>
      {sortKey===k ? (sortDir===1 ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>Manage Skills</h2>
          <p className={styles.headerSub}>Track all registered skills, endorsement counts and growth metrics</p>
        </div>
        {isAdmin && (
          <button className={styles.addBtn} onClick={openAdd}>＋ Add Skill</button>
        )}
      </div>

      <div className={styles.tableWrap}>
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

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}             className={styles.th}>Skill <SortIcon k="name" /></th>
                <th onClick={() => handleSort('category')}         className={styles.th}>Category <SortIcon k="category" /></th>
                <th onClick={() => handleSort('endorsementCount')} className={styles.th}>Endorsements <SortIcon k="endorsementCount" /></th>
                <th onClick={() => handleSort('growth')}           className={styles.th}>% Growth <SortIcon k="growth" /></th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(s => {
                const catStyle = CATEGORY_COLORS[s.category] || CATEGORY_COLORS.Programming;
                const barW = Math.min(100, Math.round((s.endorsementCount||0) / 50 * 100));
                return (
                  <tr key={s._id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.skillCell}>
                        <div className={styles.skillCellIcon}>{s.icon}</div>
                        <div>
                          <div className={styles.skillCellName}>{s.name}</div>
                          <div className={styles.skillCellSub}>{s.endorsementCount||0} endorsements</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.catBadge} style={{ background:catStyle.bg, color:catStyle.color }}>
                        {s.category}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.barWrap}>
                        <div className={styles.barTrack}>
                          <div className={styles.barFill} style={{ width:`${barW}%` }} />
                        </div>
                        <span className={styles.barNum}>{s.endorsementCount||0}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.growthPct}>+{s.growth||0}%</span>
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.statusBadge} ${s.status==='Active' ? styles.statusActive : styles.statusInactive}`}>
                        ● {s.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {isAdmin ? (
                        <div style={{ display:'flex', gap:6 }}>
                          <button className={styles.btnEdit} onClick={() => openEdit(s)}>Edit</button>
                          <button className={styles.btnDel}  onClick={() => handleDelete(s._id, s.name)}>Delete</button>
                        </div>
                      ) : (
                        <span style={{ color:'var(--text3)', fontSize:12 }}>View only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign:'center', padding:'32px', color:'var(--text2)', fontSize:14 }}>
                    No skills found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.tableFooter}>
          Showing {sorted.length} of {skills.length} entries
          {usingMock && <span style={{ color:'var(--text3)', marginLeft:12, fontSize:11 }}>(demo data — add real skills via + Add Skill)</span>}
        </div>
      </div>

      {showModal && (
        <SkillModal skill={editSkill} onClose={closeModal} onSave={handleSave} />
      )}
    </div>
  );
};

export default SkillsPage;
