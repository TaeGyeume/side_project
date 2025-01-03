const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");

const app = express();

// CORS 설정
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// 미들웨어 설정
app.use(bodyParser.json());
app.use("/api/users", userRoutes);

module.exports = app;
