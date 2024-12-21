const express = require('express');
const adminRouter = express.Router();

const {addCollege, updateCollege, deleteCollege} = require('../controllers/addCollege.js');
const { assignSpoc, getAllAdmins, updateAdmin, deleteAdmin } = require('../controllers/adminController.js');
const {getAllSpocs, updateSpoc, deleteSpoc} = require('../controllers/spocController.js');
const { getAllCoordinators, updateCoordinator, deleteCoordinator } = require('../controllers/coordinatorController.js');
const { getAllStudents, updateStudent, deleteStudent } = require('../controllers/studentController.js');
const { getAllHubs, updateHub, deleteHub } = require('../controllers/hub.js');

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
adminRouter.put('/:collegeId/collegeupdate',updateCollege);
adminRouter.delete('/:collegeId/collegedelete',deleteCollege);
adminRouter.get('/getAllHubs',getAllHubs);
adminRouter.put('/:hubId/hubupdate', updateHub);
adminRouter.delete('/:hubId/hubdelete', deleteHub);
adminRouter.get('/getAllAdmins',getAllAdmins);
adminRouter.put('/:adminId/adminupdate', updateAdmin);
adminRouter.delete('/:adminId/admindelete', deleteAdmin);

module.exports = adminRouter;

