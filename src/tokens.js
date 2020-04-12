const fs = require('fs')
const jwt = require('jsonwebtoken')
const accessKey = fs.readFileSync('./keys/auth', 'utf8')
const refreshKey = fs.readFileSync('./keys/refresh', 'utf8')

const TokenModel = require('./models/token_model')

const accessTokenSignOptions = {
    issuer:  "groceryhub",
    subject:  "auth",
    audience:  "user",
    expiresIn:  "15m",
    algorithm:  "RS256" 
}

var accessTokenVerifyOptions = {
    issuer:  "groceryhub",
    subject:  "auth",
    audience:  "user",
    expiresIn:  "7d",
    algorithms:  ["RS256"]
};

const createAccessToken = function(payload) {
    
    return jwt.sign(payload, accessKey, accessTokenSignOptions)
}


const refreshTokenSignOptions = {
    issuer:  "groceryhub",
    subject:  "auth",
    audience:  "user",
    expiresIn:  "7d",
    algorithm:  "RS256"
}

var refreshTokenVerifyOptions = {
    issuer:  "groceryhub",
    subject:  "auth",
    audience:  "user",
    expiresIn:  "7d",
    algorithms:  ["RS256"]
};

const createRefreshToken = function(payload) {


    const refreshToken = jwt.sign(payload, refreshKey, refreshTokenSignOptions)
    
    /* Store refresh tokens in database -> link it to the user */ 
    const newEntry = new TokenModel({
        userID: payload.user.userID,
        token: refreshToken
    })

    newEntry.save()

    return refreshToken
}

const refreshToken = async function(access, refresh, callback) {

    var userID = -1

    /*
    *   Get UserID from --access-- token
    */

    var { user: { userID } } = jwt.decode(access)

    if (!userID) {
        callback({})
    }

    /*
    *   --access-- token has userID in it, now decode userID from --refresh token--
    */
    //try {
        var { user: {userID}} = jwt.verify(refresh, refreshKey, refreshTokenVerifyOptions)
    /*} catch (err) {
        callback({
            isOK: false,
            msg: 'access token Invalid'
        })
    }*/

    if(!userID) {
        callback({})
    }

    /*
    *   Check if the --refresh-- token belongs to the actual user in the database.
    */


    TokenModel.find({
        $and: [
            { userID: userID },
            { token: refresh }
        ]
        
    }).exec((err,res) => {

        if (res.length > 0) {
            /*
            *   Refresh Token is already in database and belongs to the user.
            *
            *   -> Generate a new access token for the user.
            */

            const payload = {
                user : jwt.decode(res[0].token).user
            }

            callback({
                accessToken: createAccessToken(payload)
            })


        } else {
            callback({})
        }
    })



}


module.exports = {
    createRefreshToken,
    createAccessToken,
    refreshToken
}