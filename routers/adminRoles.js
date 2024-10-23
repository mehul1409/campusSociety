const express = require('express');
const adminRouter = express.Router();

const {addCollege, getAllColleges, updateCollege, deleteCollege} = require('../controllers/addCollege.js');
const { assignSpoc } = require('../controllers/adminController.js');
const {getAllSpocs, updateSpoc, deleteSpoc} = require('../controllers/spocController.js');
const { getAllCoordinators, updateCoordinator, deleteCoordinator } = require('../controllers/coordinatorController.js');
const { getAllStudents, updateStudent, deleteStudent } = require('../controllers/studentController.js');

adminRouter.post('/addCollege', addCollege);
adminRouter.post('/assignSpoc', assignSpoc);
adminRouter.get('/getAllSpocs',getAllSpocs);
adminRouter.put('/:spocId/spocupdate',updateSpoc);
adminRouter.delete('/:spocId/spocdelete',deleteSpoc);
adminRouter.get('/getAllCoordinators',getAllCoordinators);
adminRouter.put('/:coordinatorId/coordinatorupdate',updateCoordinator);
adminRouter.delete('/:coordinatorId/coordinatordelete',deleteCoordinator);
adminRouter.get('/getAllStudents',getAllStudents);
adminRouter.put('/:studentId/studentupdate',updateStudent);
adminRouter.delete('/:studentId/studentdelete',deleteStudent);
adminRouter.get('/getAllColleges',getAllColleges);
adminRouter.put('/:collegeId/collegeupdate',updateCollege);
adminRouter.delete('/:collegeId/collegedelete',deleteCollege);

module.exports = adminRouter;

