const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Min 8 characters'),
  body('role').optional().isIn(['user', 'admin']),
], register);

router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
