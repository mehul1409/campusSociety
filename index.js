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
const { getAllColleges } = require('./controllers/addCollege.js');
const {getAllHubs,updateHub,deleteHub} = require('./controllers/hub.js')
const {getEventsByCoordinator,getEventById} = require('./controllers/coordinatorController.js')
const nodemailer = require('nodemailer');

const app = express();
const router = express.Router();

dotenv.config();
dbConection();

// app.use(cors({
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'coordinatorauthorize'],
//   }));

// const allowedOrigins = [
//     'http://localhost:5173',  
//     'https://campus-society-admin.vercel.app'  // production frontend
//   ];

//   app.use(cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//   }));

app.use(cors());

app.use(cookieParser());
app.use(express.json());

router.post('/adminLogin', adminLogin);
router.post('/adminRegister', authenticateAdmin, adminRegister);
router.post('/adminLogout', (req, res) => {
    res.clearCookie('adminToken');
    res.status(200).json({ message: 'Logout successful' });
});
router.get('/getAllColleges', getAllColleges);
router.get('/getAllHubs',getAllHubs);
router.put('/:hubId/hubupdate', updateHub);
router.delete('/:hubId/hubdelete', deleteHub);
router.post('/getAllEvents', getEventsByCoordinator);
router.get('/getEventById/:eventId',getEventById);

app.use('/api', router);
app.use('/admin', authenticateAdmin, adminrouter);
app.use('/spoc', spocRouter);
app.use('/coordinator', coordinatorRouter);
app.use('/student', studentRouter);

app.post("/send-mail", async (req, res) => {
    const { name, email,message } = req.body;
  
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    let mailOptions = {
      from: `${email}`,
      to: "teeshakakkar2004@gmail.com",
      subject: "Synergy 25'",
      text: `Name: ${name}\nEmail: ${email}\n${message}`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: "Email sent successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send email", error });
    }
  });

app.listen(process.env.PORT, (error) => {
    if (error) {
        console.log(`Error starting the server: ${error}`);
    } else {
        console.log(`Server is started at PORT: ${process.env.PORT}`);
    }
});

