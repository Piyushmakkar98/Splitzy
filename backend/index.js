const express = require("express");
const connectDB = require("./db/connectdb");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

connectDB().then(()=>{
    app.listen(4000,(req,res)=>{
        console.log("Backend: express started on port 4000");
    })
})