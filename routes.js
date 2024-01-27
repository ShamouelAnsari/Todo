let express = require('express')
let authController = require('./controller/auth')
let router = express.Router()

router.get('/', (req, res) => {
    return res.send("~~ Welcome To the Project ~~")
})

router.post('/register', authController.register)
router.post('/login', authController.login)

module.exports = router;