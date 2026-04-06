const Skill = require('../models/Skill');
const Endorsement = require('../models/Endorsement');
const User = require('../models/User'); // ✅ ADD THIS

// GET /api/skills
const getAllSkills = async (req, res) => {
try {
const { search, category } = req.query;
const filter = {};
if (category) filter.category = category;
if (search) filter.name = { $regex: search, $options: 'i' };

```
const skills = await Skill.find(filter).sort({ name: 1 });

const withStats = await Promise.all(skills.map(async (s) => {
  const total = await Endorsement.countDocuments({ skill: s._id, status: 'approved' });

  const days = Math.max(1, (Date.now() - new Date(s.createdAt)) / 86400000);
  const growth = Math.round((total / days) * 100);

  return { ...s.toObject(), endorsementCount: total, growth };
}));

res.json(withStats);
```

} catch (err) {
res.status(500).json({ message: err.message });
}
};

// ✅ FIXED CREATE SKILL
const createSkill = async (req, res) => {
try {
const { name, category, icon } = req.body;

```
let skill = await Skill.findOne({ name });

// If skill doesn't exist → create
if (!skill) {
  skill = await Skill.create({
    name,
    category,
    icon,
    createdBy: req.user._id
  });
}

// ✅ ADD SKILL TO USER
await User.findByIdAndUpdate(
  req.user._id,
  {
    $addToSet: {
      skills: {
        skill: skill._id,
        level: 1
      }
    }
  }
);

res.status(201).json({
  message: 'Skill added to user',
  skill
});
```

} catch (err) {
res.status(500).json({ message: err.message });
}
};

// PUT /api/skills/:id
const updateSkill = async (req, res) => {
try {
const skill = await Skill.findByIdAndUpdate(
req.params.id,
req.body,
{ new: true, runValidators: true }
);
if (!skill) return res.status(404).json({ message: 'Skill not found' });
res.json(skill);
} catch (err) {
res.status(500).json({ message: err.message });
}
};

// DELETE /api/skills/:id
const deleteSkill = async (req, res) => {
try {
await Skill.findByIdAndDelete(req.params.id);
res.json({ message: 'Skill deleted' });
} catch (err) {
res.status(500).json({ message: err.message });
}
};

module.exports = { getAllSkills, createSkill, updateSkill, deleteSkill };
