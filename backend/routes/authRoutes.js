const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { requireBody } = require('../middleware/validateRequest');

const router = express.Router();

router.post('/signup', requireBody(['name', 'email', 'password']), authController.signup);
router.post('/login', requireBody(['email', 'password']), authController.login);
router.delete('/delete', protect, authController.deleteAccount);

module.exports = router;
