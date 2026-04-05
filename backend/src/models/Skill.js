const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true, trim: true },
  category: { type: String, enum: ['Programming', 'Leadership', 'Design', 'Soft Skills'], required: true },
  icon:     { type: String, default: '⭐' },
  status:   { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Virtual: endorsement count (populated from Endorsement collection)
skillSchema.virtual('endorsementCount', {
  ref: 'Endorsement',
  localField: '_id',
  foreignField: 'skill',
  count: true,
});

skillSchema.set('toJSON', { virtuals: true });
skillSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Skill', skillSchema);
