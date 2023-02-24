const express = require('express');
const dotenv = require('dotenv');
/**import routes */
const course = require('./routes/course');
const user = require('./routes/user');
const cookieParser = require('cookie-parser');
const ErrorMiddleware = require('./middleware/Error');
const cors = require("cors");
const app = express();

/**dotenv configuration */

dotenv.config({
    path: './config/config.env'
})

/**middlewares */
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods:["GET", "POST", "PUT", "DELETE"]
}))

/**routers */

app.use('/api/v1', course);
app.use('/api/v1', user)


module.exports = app;

app.use('/', (req, res) => {
    res.send("Server is running successfully")
})

app.use(ErrorMiddleware);