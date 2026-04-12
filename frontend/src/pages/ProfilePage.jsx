import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import styles from './ProfilePage.module.css';

// Mock skills shown when DB has no skills yet
const MOCK_ALL_SKILLS = [
  { _id:'m1',  name:'JavaScript',         icon:'⚡', category:'Programming' },
  { _id:'m2',  name:'React',              icon:'⚛️', category:'Programming' },
  { _id:'m3',  name:'Python',             icon:'🐍', category:'Programming' },
  { _id:'m4',  name:'Node.js',            icon:'🟩', category:'Programming' },
  { _id:'m5',  name:'Project Management', icon:'📋', category:'Leadership'  },
  { _id:'m6',  name:'Leadership',         icon:'🏆', category:'Leadership'  },
  { _id:'m7',  name:'UX Design',          icon:'🎨', category:'Design'      },
  { _id:'m8',  name:'SQL',               icon:'🗄️', category:'Programming' },
  { _id:'m9',  name:'Agile',             icon:'🔄', category:'Leadership'  },
  { _id:'m10', name:'CSS',               icon:'💅', category:'Design'      },
  { _id:'m11', name:'TypeScript',        icon:'🔷', category:'Programming' },
  { _id:'m12', name:'Docker',            icon:'🐳', category:'Programming' },
  { _id:'m13', name:'AWS',               icon:'☁️', category:'Programming' },
  { _id:'m14', name:'Figma',             icon:'🖌️', category:'Design'      },
  { _id:'m15', name:'MongoDB',           icon:'🍃', category:'Programming' },
];

/* ── Level Dots ── */
const LevelDots = ({ level, onChange }) => (
  <div className={styles.levelDots}>
    {[1,2,3,4,5].map(n => (
      <div
        key={n}
        className={`${styles.dot} ${n <= level ? styles.dotActive : ''}`}
        onClick={() => onChange(n)}
        title={['Beginner','Elementary','Intermediate','Advanced','Expert'][n-1]}
      />
    ))}
  </div>
);

/* ── Toggle ── */
const Toggle = ({ checked, onChange }) => (
  <div className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`} onClick={() => onChange(!checked)}>
    <div className={styles.toggleKnob} />
  </div>
);

const ProfilePage = () => {
  const { user, logout, refreshUser, updateUserSkills } = useAuth();
  const navigate = useNavigate();

  const [basicForm, setBasicForm] = useState({ name:'', jobTitle:'', department:'', bio:'' });
  const [links,     setLinks]     = useState({ linkedin:'', leetcode:'', github:'', portfolio:'' });
  const [prefs,     setPrefs]     = useState({ publicProfile:true, emailNotifications:true, endorsementApproval:false, weeklyDigest:true });
  const [pwForm,    setPwForm]    = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [mySkills,  setMySkills]  = useState([]);
  const [allSkills, setAllSkills] = useState(MOCK_ALL_SKILLS);
  const [newSkillId, setNewSkillId] = useState('');

  const [savingBasic, setSavingBasic] = useState(false);
  const [savingLinks, setSavingLinks] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPw,    setSavingPw]    = useState(false);

  useEffect(() => {
    if (user) {
      setBasicForm({
        name:       user.name       || '',
        jobTitle:   user.jobTitle   || '',
        department: user.department || '',
        bio:        user.bio        || '',
      });
      setLinks({
        linkedin:  user.linkedin  || '',
        leetcode:  user.leetcode  || '',
        github:    user.github    || '',
        portfolio: user.portfolio || '',
      });
      if (user.preferences) setPrefs(user.preferences);
      if (user.skills?.length > 0) {
        setMySkills(user.skills.map(s => ({
          skill: s.skill?._id || s.skill,
          name:  s.skill?.name || '',
          icon:  s.skill?.icon || '⭐',
          level: s.level || 1,
        })));
      }
    }

    // Load real skills from DB, fall back to mock if empty
    api.get('/skills')
      .then(({ data }) => {
        if (data && data.length > 0) setAllSkills(data.map(s => ({ _id:s._id, name:s.name, icon:s.icon, category:s.category })));
        // else keep MOCK_ALL_SKILLS
      })
      .catch(() => {}); // keep mock on error
  }, [user]);

  const setBasic = k => e => setBasicForm(f => ({ ...f, [k]: e.target.value }));
  const setLink  = k => e => setLinks(f => ({ ...f, [k]: e.target.value }));

  const saveBasic = async () => {
    setSavingBasic(true);
    try {
      await api.put('/users/profile', basicForm);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSavingBasic(false); }
  };

  const saveLinks = async () => {
    setSavingLinks(true);
    try {
      await api.put('/users/profile', links);
      await refreshUser();
      toast.success('Links saved!');
    } catch { toast.error('Failed to save links'); }
    finally { setSavingLinks(false); }
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      await api.put('/users/profile', { preferences: prefs });
      await refreshUser();
      toast.success('Preferences saved!');
    } catch { toast.error('Failed to save preferences'); }
    finally { setSavingPrefs(false); }
  };

  const savePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) { toast.error('Fill all password fields'); return; }
    if (pwForm.newPassword.length < 8) { toast.error('Min 8 characters'); return; }
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await api.put('/users/password', { currentPassword:pwForm.currentPassword, newPassword:pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const saveSkills = async () => {
    try {
      await api.put('/users/skills', {
        skills: mySkills.map(s => ({ skill: s.skill, level: s.level })),
      });
      // Instantly update skills in context so Dashboard reflects immediately
      updateUserSkills(mySkills);
      await refreshUser();
      toast.success('Skills saved!');
    } catch { toast.error('Failed to save skills'); }
  };

  // Add skill from dropdown
  const handleAddSkill = () => {
    if (!newSkillId) { toast.error('Please select a skill'); return; }
    const found = allSkills.find(s => s._id === newSkillId);
    if (!found) return;
    if (mySkills.find(s => s.skill === newSkillId)) { toast.error('Skill already added'); return; }
    setMySkills(prev => [...prev, { skill: found._id, name: found.name, icon: found.icon, level: 1 }]);
    setNewSkillId('');
    toast.success(`${found.name} added!`);
  };

  const removeSkill = (skillId) => setMySkills(prev => prev.filter(s => s.skill !== skillId));
  const setLevel   = (skillId, level) => setMySkills(prev => prev.map(s => s.skill === skillId ? { ...s, level } : s));

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
  const availableSkills = allSkills.filter(s => !mySkills.find(ms => ms.skill === s._id));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Edit Profile</h2>
        <p className={styles.headerSub}>Manage your account, skills and preferences</p>
      </div>

      <div className={styles.layout}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sideAvatar}>{initials}</div>
          <div className={styles.sideName}>{user?.name}</div>
          <div className={styles.sideEmail}>{user?.email}</div>
          <span className={`${styles.sideRole} ${user?.role==='admin' ? styles.roleAdmin : styles.roleUser}`}>
            {user?.role?.toUpperCase()}
          </span>
          <div className={styles.sideStats}>
            {[
              { label:'Skills Added',          val: mySkills.length },
              { label:'Endorsements Received', val: user?.endorsementCount || 0 },
              { label:'Member Since',          val: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '—' },
            ].map(({ label, val }) => (
              <div key={label} className={styles.sideStat}>
                <span className={styles.sideStatLabel}>{label}</span>
                <span className={styles.sideStatVal}>{val}</span>
              </div>
            ))}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>🚪 Log Out</button>
        </aside>

        {/* ── Main ── */}
        <div className={styles.main}>

          {/* Basic Info */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}><span>👤</span> Basic Information</div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <input className={styles.input} value={basicForm.name} onChange={setBasic('name')} placeholder="John Doe" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} value={user?.email||''} readOnly style={{opacity:0.6}} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Job Title</label>
                <input className={styles.input} value={basicForm.jobTitle} onChange={setBasic('jobTitle')} placeholder="e.g. Senior Engineer" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Department</label>
                <input className={styles.input} value={basicForm.department} onChange={setBasic('department')} placeholder="e.g. Engineering" />
              </div>
              <div className={`${styles.field} ${styles.colSpan2}`}>
                <label className={styles.label}>Bio</label>
                <textarea className={`${styles.input} ${styles.textarea}`}
                  value={basicForm.bio} onChange={setBasic('bio')}
                  placeholder="Tell people about yourself…" rows={3} />
              </div>
            </div>
            <button className={styles.saveBtn} onClick={saveBasic} disabled={savingBasic}>
              {savingBasic ? 'Saving…' : 'Save Changes'}
            </button>
          </section>

          {/* My Skills */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}><span>⭐</span> My Skills</div>

            {/* Existing skills */}
            <div className={styles.skillsList}>
              {mySkills.length === 0 && (
                <p style={{color:'var(--text2)',fontSize:13,marginBottom:8}}>No skills added yet. Select a skill below and click Add.</p>
              )}
              {mySkills.map(s => (
                <div key={s.skill} className={styles.skillRow}>
                  <span className={styles.skillRowIcon}>{s.icon}</span>
                  <span className={styles.skillRowName}>{s.name}</span>
                  <LevelDots level={s.level} onChange={lv => setLevel(s.skill, lv)} />
                  <span className={styles.skillLevelLabel}>
                    {['','Beginner','Elementary','Intermediate','Advanced','Expert'][s.level]}
                  </span>
                  <button className={styles.removeSkillBtn} onClick={() => removeSkill(s.skill)}>✕</button>
                </div>
              ))}
            </div>

            {/* Add skill dropdown */}
            {availableSkills.length > 0 && (
              <div className={styles.addSkillRow}>
                <select
                  className={styles.addSkillSelect}
                  value={newSkillId}
                  onChange={e => setNewSkillId(e.target.value)}
                >
                  <option value="">— Select a skill to add —</option>
                  {availableSkills.map(s => (
                    <option key={s._id} value={s._id}>{s.icon} {s.name} ({s.category})</option>
                  ))}
                </select>
                <button className={styles.addSkillBtn} onClick={handleAddSkill}>＋ Add</button>
              </div>
            )}

            <button className={styles.saveBtn} style={{marginTop:14}} onClick={saveSkills}>
              Save Skills
            </button>
          </section>

          {/* External Links */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}><span>🔗</span> External Profiles</div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>LinkedIn URL</label>
                <input className={styles.input} value={links.linkedin} onChange={setLink('linkedin')} placeholder="linkedin.com/in/yourname" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>LeetCode Username</label>
                <input className={styles.input} value={links.leetcode} onChange={setLink('leetcode')} placeholder="your-handle" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>GitHub Username</label>
                <input className={styles.input} value={links.github} onChange={setLink('github')} placeholder="github-username" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Portfolio URL</label>
                <input className={styles.input} value={links.portfolio} onChange={setLink('portfolio')} placeholder="https://yoursite.com" />
              </div>
            </div>
            <button className={styles.saveBtn} onClick={saveLinks} disabled={savingLinks}>
              {savingLinks ? 'Saving…' : 'Save Links'}
            </button>
          </section>

          {/* Advanced Options */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}><span>⚙️</span> Advanced Options</div>
            {[
              { key:'publicProfile',       label:'Public Profile',                desc:'Let others find and view your profile' },
              { key:'emailNotifications',  label:'Email Notifications',           desc:'Get emailed when someone endorses you' },
              { key:'endorsementApproval', label:'Endorsement Approval Required', desc:'You must approve endorsements before they show' },
              { key:'weeklyDigest',        label:'Weekly Digest',                 desc:'Weekly summary of your skill activity' },
            ].map(({ key, label, desc }) => (
              <div key={key} className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleLabel}>{label}</div>
                  <div className={styles.toggleDesc}>{desc}</div>
                </div>
                <Toggle checked={prefs[key]} onChange={v => setPrefs(p => ({ ...p, [key]:v }))} />
              </div>
            ))}
            <button className={styles.saveBtn} style={{marginTop:16}} onClick={savePrefs} disabled={savingPrefs}>
              {savingPrefs ? 'Saving…' : 'Save Preferences'}
            </button>
          </section>

          {/* Change Password */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}><span>🔒</span> Change Password</div>
            <div className={styles.grid2}>
              <div className={`${styles.field} ${styles.colSpan2}`}>
                <label className={styles.label}>Current Password</label>
                <input className={styles.input} type="password" value={pwForm.currentPassword}
                  onChange={e => setPwForm(f => ({...f, currentPassword:e.target.value}))}
                  placeholder="Your current password" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>New Password</label>
                <input className={styles.input} type="password" value={pwForm.newPassword}
                  onChange={e => setPwForm(f => ({...f, newPassword:e.target.value}))}
                  placeholder="Min 8 characters" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Confirm New Password</label>
                <input className={styles.input} type="password" value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({...f, confirm:e.target.value}))}
                  placeholder="Repeat new password" />
              </div>
            </div>
            <button className={`${styles.saveBtn} ${styles.saveBtnDanger}`} onClick={savePassword} disabled={savingPw}>
              {savingPw ? 'Updating…' : 'Update Password'}
            </button>
          </section>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
