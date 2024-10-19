const express = require('express');
const adminRouter = express.Router();

const addCollege = require('../controllers/addCollege.js');

adminRouter.post('/addCollege',addCollege)

module.exports = adminRouter;