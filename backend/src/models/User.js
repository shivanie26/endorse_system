const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillEntrySchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  level: { type: Number, min: 1, max: 5, default: 1 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 8, select: false },
  role:       { type: String, enum: ['user', 'admin'], default: 'user' },
  jobTitle:   { type: String, default: '' },
  department: { type: String, default: '' },
  bio:        { type: String, default: '' },
  skills:     [skillEntrySchema],
  linkedin:   { type: String, default: '' },
  leetcode:   { type: String, default: '' },
  github:     { type: String, default: '' },
  portfolio:  { type: String, default: '' },
  preferences: {
    publicProfile:          { type: Boolean, default: true },
    emailNotifications:     { type: Boolean, default: true },
    endorsementApproval:    { type: Boolean, default: false },
    weeklyDigest:           { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
