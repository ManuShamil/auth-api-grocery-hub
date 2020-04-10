const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const fs = require('fs')

const authKey = fs.readFileSync('./keys/auth', 'utf8')
const refreshKey = fs.readFileSync('./keys/refresh', 'utf8')

const User = require('./models/user_model')

const checkPassword = async function(password, hash, callback) {

    bcrypt.compare(password, hash, (err, success) => {
        return callback(success)
    })

}

const createToken = function(payload) {

    const signOptions = {
        issuer:  "groceryhub",
        subject:  "login",
        audience:  "user",
        expiresIn:  "15m",
        algorithm:  "RS256"
    }
    

    return jwt.sign(payload, authKey, signOptions)
}

const createRefreshToken = function(payload) {

    const signOptions = {
        issuer:  "groceryhub",
        subject:  "login",
        audience:  "user",
        expiresIn:  "7d",
        algorithm:  "RS256"
    }

    return jwt.sign(payload, refreshKey, signOptions)
}

const authLogin = async function(request, response, next) {

    const query = request.body.query
    const password = request.body.password

    User.findOne({
        $or: [
            { userName: query },
            { userEmail: query}
        ]
    }).exec((err, res)  =>{

        if (res == null) {
            /*
            *   No User found, send 406 Not Acceptable(User not in database)
            */

            response.status(406).json({
                msg: "Username or Email is incorrect"
            })

            response.end()
            return;

        } else {

            /*
            *   Found user, compare password with the hash
            */
            


            checkPassword(password, res.userPassword,(result) => {

                if (!result) {
                    response.status(403).json({
                        msg: "Wrong Password"
                    })
                    response.end()
                    return;
                }

                /*
                *   User seems to be legit, create Tokens and return
                */

                const payload = {
                    userID: res.userID,
                    userName: res.userName,
                    userEmail: res.userEmail
                }
                
                response.json({
                    token: createToken(payload),
                    refresh: createRefreshToken({
                        userID: payload.userID
                    })
                })
                response.end()
                return;
            })

        }
    })
}

module.exports = authLogin