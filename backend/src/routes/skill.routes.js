const express = require('express');
const { protect } = require('../middleware/auth');
const { getAllSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skill.controller');

const router = express.Router();

router.use(protect);

router.get('/',        getAllSkills);

// ✅ allow all logged-in users
router.post('/',       createSkill);
router.put('/:id',     updateSkill);
router.delete('/:id',  deleteSkill);

module.exports = router;
