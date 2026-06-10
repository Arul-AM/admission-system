const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  registerStudent, getMyProfile, getAllStudents,
  getStudentById, advanceStage, getStats,
} = require('../controllers/studentController');

// Public
router.post('/register', registerStudent);

// Student
router.get('/me', authenticate, authorize('student'), getMyProfile);

// Staff & Admin
router.get('/', authenticate, authorize('admin', 'staff'), getAllStudents);
router.get('/stats', authenticate, authorize('admin'), getStats);
router.get('/:id', authenticate, authorize('admin', 'staff'), getStudentById);
router.post('/:id/advance', authenticate, authorize('admin', 'staff'), advanceStage);

module.exports = router;


