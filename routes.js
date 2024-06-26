let express = require('express')
let authController = require('./controller/auth')
let router = express.Router()
let auth = require("./middleware/auth")
let taskController = require("./controller/taskcontroller")
let comController = require("./controller/comcontroller")

router.get('/', (req, res) => {
    return res.send("~~ Welcome To the Project ~~")
})

router.post('/register', authController.register)
router.post('/login', authController.login)
router.put('/forgetPassword', authController.forgetPassword)
router.put('/resetPassword', authController.resetPassword)
router.put('/logout', auth, authController.logout)
router.put('/changePassword', auth, authController.changePassword)

// PHASE 2 TASK Related API's
router.post('/createTask', auth, taskController.createTask)
router.put('/assignTask', auth, taskController.assignTask)
router.put('/updateTask/:taskId', auth, taskController.updateTask)
router.get('/listTask', auth, taskController.listTask)
router.get('/detailTask/:taskId', auth, taskController.detailTask)
router.delete('/deleteTask/:taskId', auth, taskController.deleteTask)
router.put('/restoreTask/:taskId', auth, taskController.restoreTask)
router.put('/updateTaskStatus/:taskId', auth, taskController.updateTaskStatus)

// PHASE 3 Comment related API's
router.post('/task/comment/:taskId', auth, comController.addComment)
router.get('/task/comment/:taskId', auth, comController.listComment)

module.exports = router;