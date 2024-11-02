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

const app = express();
const router = express.Router();

dotenv.config();
dbConection();

// app.use(cors({
//     origin: 'https://campus-society-admin.vercel.app/',
//     credentials: true
// }));

app.use(cors());

app.use(cookieParser());
app.use(express.json());

router.post('/adminLogin',adminLogin);
router.post('/adminRegister',authenticateAdmin, adminRegister);
router.post('/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.status(200).json({ message: 'Logout successful' });
});

app.use('/api',router);
app.use('/admin',authenticateAdmin,adminrouter);
app.use('/spoc',spocRouter);
app.use('/coordinator',coordinatorRouter);
app.use('/student',studentRouter);

console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass:', process.env.EMAIL_PASS);

app.listen(process.env.PORT,(error)=>{
    if(error){
        console.log(`Error starting the server: ${error}`);
    }else{
        console.log(`Server is started at PORT: ${process.env.PORT}`);
    }
});