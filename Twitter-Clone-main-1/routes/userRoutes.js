const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/getAllUsers', userController.getAllUsers);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/follow/:id', authController.protect, userController.follow);
router.patch(
    '/editProfile',
    authController.protect,
    userController.editProfile
);
router.get('/logout', authController.logout);
module.exports = router;
