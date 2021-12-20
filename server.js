const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const tasks = require('./routes/api/tasks');

const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:4200'
    // origin: 'https://confident-kirch-028f9c.netlify.app/'
}));

app.use(bodyParser.json());

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

app.get('/', (req, res) => {
    res
        .status(200)
        .send('Hello server is running')
        .end();
});

app.use('/api/tasks', tasks);

app.listen(port, () => {
    console.log(`Server started and listening on port: ${port}`);
});

