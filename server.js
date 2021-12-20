const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const tasks = require('./routes/api/tasks');

const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:4200'
}));

app.use(bodyParser.json());

app.use('/api/tasks', tasks);


// DB config
const db = require('./config/keys').mongoURI;

// Connect to Mongo
// Promise based
mongoose
    .connect(db)
    .then(() => {
        console.log(`MongoDB connected...`);
    }).catch(error => {
        console.log(error.response);
    });

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started and listening on port: ${port}`);
});

