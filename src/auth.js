const bcrypt = require('bcryptjs')
const { createRefreshToken, createAccessToken } = require('./tokens')

const User = require('./models/user_model')

const checkPassword = async function(password, hash, callback) {

    bcrypt.compare(password, hash, (err, success) => {
        return callback(success)
    })

}

const authLogin = async function(request, response, next) {

    if (!request.body.query || !request.body.password){
        response.status(406).json({
            msg: "Invalid Parameters"
        })
        response.end()
        return;
    }

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
                    /*
                    *  Password Incorrect, send 403 - Forbidden
                    */
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
                    user: {
                        userID: res.userID,
                        userName: res.userName,
                        userEmail: res.userEmail
                    }
                }
                
                response.json({
                    token: createAccessToken(payload),
                    refresh: createRefreshToken(payload)
                })
                response.end()
                return;
            })

        }
    })
}

module.exports = authLogin