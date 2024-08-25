const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.route('/changePassword').patch(
    authController.protect, 
    userController.changePassword);

    router.route('/updateMe').patch(
        authController.protect, 
        userController.updateMe);    

module.exports = router;    