const express = require('express');
const spocRouter = express.Router();

const {changePassword, createHub, spocLogin} = require('../controllers/spocController.js');
const spoc = require('../models/spoc');
const verifySpocToken = require('../middleware/spocToken.js');

spocRouter.post('/changePassword',verifySpocToken,changePassword);
spocRouter.post('/createHub',verifySpocToken,createHub);
spocRouter.post('/login',spocLogin)
spocRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
});

module.exports = spocRouter;