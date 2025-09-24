const express = require("express");
const connectDB = require("./db/connectdb");
require("dotenv").config();
const app = express();
const cors = require("cors");
const routerPaths = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

app.use(cors({
    origin: "http://localhost:5173", // React dev server
    credentials: true,               // allow cookies
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/",routerPaths);

connectDB().then(()=>{
    app.listen(4000,(req,res)=>{
        console.log("Backend: express started on port 4000");
    })
})