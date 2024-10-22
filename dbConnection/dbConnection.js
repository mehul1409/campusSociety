const mongoose = require('mongoose');

const dbConection = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Mongodb connected successfully!");
    } catch (error) {
        console.log(`Error connection to database: ${error}`);
    }
}

module.exports = dbConection;