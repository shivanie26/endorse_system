const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers, getUserById, updateProfile,
  updateSkills, changePassword, deleteUser,
} = require('../controllers/user.controller');

const router = express.Router();

router.use(protect);

router.get('/',            getAllUsers);
router.get('/:id',         getUserById);
router.put('/profile',     updateProfile);
router.put('/skills',      updateSkills);
router.put('/password',    changePassword);
router.delete('/:id',      adminOnly, deleteUser);

module.exports = router;
