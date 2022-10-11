const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const auth = require('../auth/auth')


router.get("/testme",function(req,res){
    res.send("Hey its working")
});

router.post("/register", userController.createUser)

router.post("/login",userController.login)
router.get("/user/:userId/profile", auth.verifyToken, auth.authentication,auth.authorization, userController.getUser)
router.put("/user/:userId/profile", auth.verifyToken, auth.authentication,auth.authorization, userController.updateUser)

module.exports = router