const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dbConection = require('./dbConnection/dbConnection.js');
const adminrouter = require('./routers/adminRoles.js');
const spocRouter = require('./routers/spocRouter.js');
const coordinatorRouter = require('./routers/coordinatorRouter.js');
const cookieParser = require('cookie-parser');
const studentRouter = require('./routers/studentRouter.js');
const { adminLogin, adminRegister } = require('./controllers/adminController.js');
const authenticateAdmin = require('./middleware/adminToken.js');

dotenv.config();
dbConection();

const app = express();
const router = express.Router();

// Determine allowed origins based on environment
const allowedOrigins = [
  'http://localhost:5173',  // local frontend
  'https://campus-society-admin.vercel.app'  // production frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin, like mobile apps or curl requests
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// Public routes
router.post('/adminLogin', adminLogin);
router.post('/adminRegister', authenticateAdmin, adminRegister);
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.status(200).json({ message: 'Logout successful' });
});

app.use('/api', router);
app.use('/admin', authenticateAdmin, adminrouter);
app.use('/spoc', spocRouter);
app.use('/coordinator', coordinatorRouter);
app.use('/student', studentRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    console.log(`Error starting the server: ${error}`);
  } else {
    console.log(`Server is started at PORT: ${PORT}`);
  }
});
