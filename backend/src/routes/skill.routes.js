const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { getAllSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skill.controller');

const router = express.Router();

router.use(protect);

router.get('/',        getAllSkills);
router.post('/',       adminOnly, createSkill);
router.put('/:id',     adminOnly, updateSkill);
router.delete('/:id',  adminOnly, deleteSkill);

module.exports = router;
