const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { createStaff, getAllStaff, updateStaff, toggleStaff } = require('../controllers/staffController');

router.post('/', authenticate, authorize('admin'), createStaff);
router.get('/', authenticate, authorize('admin'), getAllStaff);
router.put('/:id', authenticate, authorize('admin'), updateStaff);
router.patch('/:id/toggle', authenticate, authorize('admin'), toggleStaff);

module.exports = router;
