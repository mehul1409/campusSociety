const express = require('express');
const dotenv = require('dotenv');
const dbConection = require('./dbConnection/dbConnection.js');
const adminrouter = require('./routers/adminRoles.js');

const app = express();

dotenv.config();

dbConection();

app.use(express.json());
app.use('/admin',adminrouter);

app.listen(process.env.PORT,(error)=>{
    if(error){
        console.log(`Error starting the server: ${error}`);
    }else{
        console.log(`Server is started at PORT: ${process.env.PORT}`);
    }
});
