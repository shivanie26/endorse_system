const mongoose = require('mongoose');

const endorsementSchema = new mongoose.Schema({
  endorser:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill:     { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  status:    { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  note:      { type: String, default: '' },
}, { timestamps: true });

// Prevent duplicate endorsements for same endorser+recipient+skill
endorsementSchema.index({ endorser: 1, recipient: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model('Endorsement', endorsementSchema);
