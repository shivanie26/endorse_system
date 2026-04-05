const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  createEndorsement, getEndorsements,
  getPending, updateStatus, getStats,
} = require('../controllers/endorsement.controller');

const router = express.Router();

router.use(protect);

router.get('/stats',        getStats);
router.get('/pending',      adminOnly, getPending);
router.get('/',             getEndorsements);
router.post('/',            adminOnly, createEndorsement);
router.patch('/:id/status', updateStatus);

module.exports = router;
