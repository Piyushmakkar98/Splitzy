const mongoose = require("mongoose");

async function connectDB(){
    await mongoose.connect(process.env.DB_URI).then(()=>{
        console.log("MongoDB Connected Successfully");
    })
    .catch((err)=>{
        console.log("Mongo DB Failed to connect "+err.message);
    })
}

module.exports = connectDB;