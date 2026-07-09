const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(express.static("Public"));
const userRoute = require('./src/Routes/userRoute.js');

app.use(cors({
    origin: "https://profitharvester.com",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', userRoute);
app.use('/api/me', userRoute);


module.exports = app;