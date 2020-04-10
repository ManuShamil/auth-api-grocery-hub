const express = require('express')
const router = express.Router()

router.get('/',async (req,res,next) => {
    res.status(200).json({
        'info': 'Auth API end-point'
    })
})

const authlogin = require('./auth')

router.post('/login', authlogin)

module.exports = router