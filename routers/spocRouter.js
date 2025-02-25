const express = require('express');
const spocRouter = express.Router();
const { upload } = require('../services/uploadService.js');

const {changePassword, createHub, spocLogin, requestPasswordReset, resetPassword, getSpocById} = require('../controllers/spocController.js');
const spoc = require('../models/spoc.js');
const verifySpocToken = require('../middleware/spocToken.js');

spocRouter.post('/changePassword',verifySpocToken,changePassword);
spocRouter.post('/createHub',verifySpocToken, upload.single('photo'), createHub);

spocRouter.post('/login',spocLogin);
spocRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
});

spocRouter.post('/forgotPassword', requestPasswordReset);
spocRouter.post('/resetPassword', resetPassword);

spocRouter.get('/getSpocById/:id', getSpocById);

module.exports = spocRouter;
