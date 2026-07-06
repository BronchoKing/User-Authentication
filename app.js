const express = require('express');

const app = express();


const userRoute = require('./src/Routes/userRoute.js');


app.use(express.json());
app.use('/api/auth', userRoute);
app.use('/api/me', userRoute);


module.exports = app;