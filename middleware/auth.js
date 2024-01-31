let security = require('../helper/security')
let { User } = require("../schema/user")

async function auth(req, res, next) {

    // check if token exists in header
    let token = req.header("token")
    if (typeof (token) != 'string') {
        return res.status(400).send({ error: "token is required" })
    }

    // decrypt token using jwt
    let decryptedToken = await security.verifyAsync(token).catch((error) => { return { error } })
    if (!decryptedToken || (decryptedToken && decryptedToken.error)) {
        return res.status(403).send({ error: "Token not valid" })
    }

    // check if user id and token is present in db
    let user = await User.findOne({ where: { token: token, id: decryptedToken.id } }).catch((error) => { return { error } })
    if (!user || (user && user.error)) {
        return res.status(403).send({ error: "Access Denied !!" })
    }

    // check if user is not deleted
    if (user.isDeleted) {
        return res.status(403).send("User Deleted")
    }

    req["userData"] = {
        id: user.id, email: user.email, name: user.name, isActive: user.isActive
    }

    // pass request to next function 
    next()
}

module.exports = auth;