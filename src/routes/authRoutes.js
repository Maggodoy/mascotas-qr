const express = require('express');
const router = express.Router();
const { register, login, resetPassword, forgotPassword } = require('../controllers/authController');
const { deleteAccount } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword); 
router.post('/reset-password', resetPassword);


router.delete('/delete-account', authMiddleware, deleteAccount);
module.exports = router;