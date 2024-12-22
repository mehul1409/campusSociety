const express = require('express');
const coordinatorRouter = express.Router();

const {changePassword,postEvent, coordinatorLogin, requestPasswordReset, resetPassword, getEventsByCoordinator, editEvent, deleteEvent, getEventById} = require('../controllers/coordinatorController.js');
const verifyCoordinatorToken = require('../middleware/coordinatorToken.js');

coordinatorRouter.post('/eventsByCoordinator',verifyCoordinatorToken, getEventsByCoordinator);
coordinatorRouter.put('/editEvent',verifyCoordinatorToken, editEvent);
coordinatorRouter.delete('/deleteEvent',verifyCoordinatorToken, deleteEvent);
coordinatorRouter.get('/getEventById/:eventId',verifyCoordinatorToken, getEventById);
coordinatorRouter.post('/postEvent',verifyCoordinatorToken ,postEvent);

coordinatorRouter.post('/changePassword',verifyCoordinatorToken,changePassword);
coordinatorRouter.post('/login', coordinatorLogin);
coordinatorRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
});

coordinatorRouter.post('/forgotPassword', requestPasswordReset);
coordinatorRouter.post('/resetPassword', resetPassword);

module.exports = coordinatorRouter;
