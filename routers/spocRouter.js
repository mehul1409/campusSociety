const express = require('express');
const spocRouter = express.Router();

const {changePassword, createHub, spocLogin, requestPasswordReset, resetPassword} = require('../controllers/spocController.js');
const spoc = require('../models/spoc.js');
const verifySpocToken = require('../middleware/spocToken.js');

spocRouter.post('/changePassword',verifySpocToken,changePassword);

// later we have to add verifySpocToken router for createhub
spocRouter.post('/createHub',verifySpocToken, createHub);

spocRouter.post('/login',spocLogin);
spocRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
});

spocRouter.post('/forgotPassword', requestPasswordReset);
spocRouter.post('/resetPassword', resetPassword);

module.exports = spocRouter;
