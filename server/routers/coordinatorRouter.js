const express = require('express');
const coordinatorRouter = express.Router();

const changePassword = require('../controllers/coordinatorController.js')

coordinatorRouter.post('/changePassword',changePassword);

module.exports = coordinatorRouter;