const User = require('../models/User');
const Endorsement = require('../models/Endorsement');

// GET /api/users  — list all (with endorsement counts)
const getAllUsers = async (req, res) => {
  try {
    const { search, role, skill } = req.query;
    const filter = { isActive: true };
    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: 'i' };

    let users = await User.find(filter)
      .populate('skills.skill', 'name category icon')
      .select('-password');

    if (skill) {
      users = users.filter(u =>
        u.skills.some(s => s.skill?.name === skill)
      );
    }

    // Attach received endorsement count per user
    const withCounts = await Promise.all(users.map(async (u) => {
      const count = await Endorsement.countDocuments({ recipient: u._id, status: 'approved' });
      return { ...u.toObject(), endorsementCount: count };
    }));

    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('skills.skill', 'name category icon')
      .select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const endorsements = await Endorsement.find({ recipient: user._id, status: 'approved' })
      .populate('endorser', 'name')
      .populate('skill', 'name icon');

    res.json({ user, endorsements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/profile — update own profile
const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'jobTitle', 'department', 'bio', 'linkedin', 'leetcode', 'github', 'portfolio', 'preferences'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
      .populate('skills.skill', 'name category icon')
      .select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/skills — replace skill list
const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body; // [{skill: ObjectId, level: 1-5}]
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { skills },
      { new: true }
    ).populate('skills.skill', 'name category icon').select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id  (admin)
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, getUserById, updateProfile, updateSkills, changePassword, deleteUser };
