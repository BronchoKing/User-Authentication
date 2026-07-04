const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({path: './config.env'})

const app = require('./app.js');


mongoose.connect(process.env.MONGO_URI, {
    //useNewUrlParser: true
}).then((connectionObj) => {
    console.log('Database connection successful!');
})

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log(`Server has started and listing on port ${port}`);
});