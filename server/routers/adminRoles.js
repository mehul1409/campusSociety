const express = require('express');
const adminRouter = express.Router();

const addCollege = require('../controllers/addCollege.js');
const { assignSpoc } = require('../controllers/spocController.js');

adminRouter.post('/addCollege', addCollege);
adminRouter.post('/assignSpoc', assignSpoc);

module.exports = adminRouter;
