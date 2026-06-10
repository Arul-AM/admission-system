const router = require('express').Router();
const { login, studentLogin } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts' });

router.post('/login', loginLimiter, login);
router.post('/student-login', loginLimiter, studentLogin);

module.exports = router;
