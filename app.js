const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const sanitizeNosqlQuery = require('express-mongo-sanitize');
const preventCrossSiteScripting = require('xss-clean');
const preventParameterPollution = require('hpp');
const compression = require('compression');
const cors = require('cors');
const router = require('./server/routes/router');
const http = require('http');

const app = express();

mongoose.connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => console.log(`Connected to ${con.connections[0].name} Database successfully`))
    .catch(error => { return console.log(error); });

app.use(express.static(path.join(__dirname, 'ui')));

app.use(cors());
app.options('*', cors());

app.use(helmet());
app.use('/api', rateLimiter({
    max: 200,
    windowMs: 1000 * 60 * 60,
    message: 'Too many requests from this IP. Try again in an hour.'
}));

app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());

app.use(sanitizeNosqlQuery());
app.use(preventCrossSiteScripting());
app.use(preventParameterPollution());

app.use(compression());


app.use(router);

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500);

    if (process.env.NODE_ENV === 'production') {
        err.statusCode = err.status || 500;
        err.message = err.statusCode === 500 ? "Something has gone very wrong" : err.message;
    }
    return res.json({ status: err.status, message: err.message });
});

const server = http.createServer(app);

server.listen(process.env.PORT || 5000, () => {
    console.log('Server is running on port 8080');
});

process.on('uncaughtException', (error) => {
    console.log(error.name, error.message);
    console.log(error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.log(error.name, error.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated!');
    });
});
