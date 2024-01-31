let express = require('express')
let authController = require('./controller/auth')
let router = express.Router()
let auth = require("./middleware/auth")

router.get('/', (req, res) => {
    return res.send("~~ Welcome To the Project ~~")
})

router.post('/register', authController.register)
router.post('/login', authController.login)
router.put('/forgetPassword', authController.forgetPassword)
router.put('/resetPassword', authController.resetPassword)
router.put('/logout',auth, authController.logout)

module.exports = router;