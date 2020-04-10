const express = require('express')
const morgan = require('morgan')
const bodyParser = require("body-parser");
const app = express()

const router = require('./router')

const API_ROOT = process.env.API_ROOT || '/auth'

app.use(morgan('dev'))
app.use(bodyParser.json());


app.use('/', (req, res, next) => {
    if (req.url == '/') {
        res.redirect(API_ROOT)
        return;
    }

    next();
})

app.use(API_ROOT , router)



module.exports = app