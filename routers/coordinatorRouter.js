const express = require('express');
const coordinatorRouter = express.Router();

const {changePassword,postEvent, coordinatorLogin, requestPasswordReset, resetPassword} = require('../controllers/coordinatorController.js');
const verifyCoordinatorToken = require('../middleware/coordinatorToken.js');

coordinatorRouter.post('/changePassword',verifyCoordinatorToken,changePassword);
coordinatorRouter.post('/postEvent',verifyCoordinatorToken ,postEvent);
coordinatorRouter.post('/login', coordinatorLogin);
coordinatorRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
});

coordinatorRouter.post('/forgotPassword', requestPasswordReset);
coordinatorRouter.post('/resetPassword', resetPassword);

module.exports = coordinatorRouter;