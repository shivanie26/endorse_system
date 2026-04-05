const Endorsement = require('../models/Endorsement');
const User = require('../models/User');

// POST /api/endorsements  (admin only)
const createEndorsement = async (req, res) => {
  try {
    const { recipientId, skillId, note } = req.body;
    if (req.user._id.toString() === recipientId)
      return res.status(400).json({ message: 'Cannot endorse yourself' });

    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

    // Check recipient has skill
    const hasSkill = recipient.skills.some(s => s.skill.toString() === skillId);
    if (!hasSkill) return res.status(400).json({ message: 'Recipient does not have this skill' });

    const needsApproval = recipient.preferences?.endorsementApproval;
    const endorsement = await Endorsement.create({
      endorser: req.user._id,
      recipient: recipientId,
      skill: skillId,
      status: needsApproval ? 'pending' : 'approved',
      note: note || '',
    });

    await endorsement.populate([
      { path: 'endorser', select: 'name' },
      { path: 'recipient', select: 'name' },
      { path: 'skill', select: 'name icon' },
    ]);

    res.status(201).json(endorsement);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'You already endorsed this skill for this user' });
    res.status(500).json({ message: err.message });
  }
};

// GET /api/endorsements  — all (admin) or own (user)
const getEndorsements = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : {
      $or: [{ endorser: req.user._id }, { recipient: req.user._id }]
    };
    const list = await Endorsement.find(filter)
      .populate('endorser', 'name')
      .populate('recipient', 'name')
      .populate('skill', 'name icon category')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/endorsements/pending  (admin)
const getPending = async (req, res) => {
  try {
    const list = await Endorsement.find({ status: 'pending' })
      .populate('endorser', 'name')
      .populate('recipient', 'name')
      .populate('skill', 'name icon');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/endorsements/:id/status  (admin or recipient)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const e = await Endorsement.findById(req.params.id);
    if (!e) return res.status(404).json({ message: 'Not found' });

    const isAdmin = req.user.role === 'admin';
    const isRecipient = e.recipient.toString() === req.user._id.toString();
    if (!isAdmin && !isRecipient)
      return res.status(403).json({ message: 'Not authorized' });

    e.status = status;
    await e.save();
    res.json(e);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/endorsements/stats  — dashboard stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalEndorsements, pendingCount, skillCount] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Endorsement.countDocuments({ status: 'approved' }),
      Endorsement.countDocuments({ status: 'pending' }),
      require('../models/Skill').countDocuments(),
    ]);

    // Top endorsed users
    const topUsers = await Endorsement.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$recipient', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', count: 1 } },
    ]);

    // Category breakdown
    const catBreakdown = await Endorsement.aggregate([
      { $match: { status: 'approved' } },
      { $lookup: { from: 'skills', localField: 'skill', foreignField: '_id', as: 'skill' } },
      { $unwind: '$skill' },
      { $group: { _id: '$skill.category', count: { $sum: 1 } } },
    ]);

    res.json({ totalUsers, totalEndorsements, pendingCount, skillCount, topUsers, catBreakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createEndorsement, getEndorsements, getPending, updateStatus, getStats };
