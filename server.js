const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

const cors = require('cors');

const app = express();

// app.use(cors({
//     origin: 'https://confident-kirch-028f9c.netlify.app/'
// }));

app.use(cors());

app.use(express.json());

// DB config
const db = config.get('mongoURI');

// Connect to Mongo
// Promise based
mongoose
    .connect(db, {
        useNewUrlParser: true,
        // useCreateIndex: true
    })
    .then(() => {
        console.log(`MongoDB connected...`);
    }).catch(error => {
        console.log(error);
    });

const port = process.env.PORT || 6678;

app.get('/', (req, res) => {
    res
        .status(200)
        .send('Hello server is running')
        .end();
});

app.use('/api/tasks', require('./routes/api/tasks'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));

app.listen(port, () => {
    console.log(`Server started and listening on port: ${port}`);
});

