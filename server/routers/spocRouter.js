const express = require('express');
const spocRouter = express.Router();

const {changePassword, createHub} = require('../controllers/spocController.js');
const spoc = require('../models/spoc');

spocRouter.post('/changePassword',changePassword);
spocRouter.post('/createHub',createHub);

module.exports = spocRouter;