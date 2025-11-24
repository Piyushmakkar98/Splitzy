// index.js
const express = require("express");
const connectDB = require("./db/connectdb");
require("dotenv").config();
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Routes
const routerPaths = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expense");
const settlementRoutes = require("./routes/settlements.routes");

// Middlewares
app.use(cors({
    origin: "*",
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// App routes
app.use("/", routerPaths);
app.use("/settlements", settlementRoutes);
app.use("/api/expense", expenseRoutes);

// Create HTTP server
const server = app.listen(4000, () => {
    console.log("Backend: express started on port 4000");
});

// SOCKET INIT
const { initSocket } = require("./socket");
initSocket(server);

// DB connect
connectDB();
