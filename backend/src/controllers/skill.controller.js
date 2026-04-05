const Skill = require('../models/Skill');
const Endorsement = require('../models/Endorsement');

// GET /api/skills
const getAllSkills = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skills = await Skill.find(filter).sort({ name: 1 });

    // Attach endorsement count + growth estimate
    const withStats = await Promise.all(skills.map(async (s) => {
      const total = await Endorsement.countDocuments({ skill: s._id, status: 'approved' });
      // Growth = total / days since created (capped display value)
      const days = Math.max(1, (Date.now() - new Date(s.createdAt)) / 86400000);
      const growth = Math.round((total / days) * 100);
      return { ...s.toObject(), endorsementCount: total, growth };
    }));

    res.json(withStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/skills  (admin)
const createSkill = async (req, res) => {
  try {
    const { name, category, icon } = req.body;
    const exists = await Skill.findOne({ name });
    if (exists) return res.status(409).json({ message: 'Skill already exists' });
    const skill = await Skill.create({ name, category, icon, createdBy: req.user._id });
    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/skills/:id  (admin)
const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/skills/:id  (admin)
const deleteSkill = async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllSkills, createSkill, updateSkill, deleteSkill };
