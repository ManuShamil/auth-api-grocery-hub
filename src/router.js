const express = require('express')
const router = express.Router()
const { refreshToken } = require('./tokens')

router.get('/',async (req,res,next) => {
    res.status(200).json({
        'info': 'Auth API end-point'
    })
})

router.post('/refresh', async(req, res, next) => {
    const token = req.body.token
    const refresh = req.body.refreshToken

    refreshToken(token, refresh, result => {
        res.json(result)
        res.end()
    })

})

const authlogin = require('./auth')

router.post('/login', authlogin)

module.exports = router