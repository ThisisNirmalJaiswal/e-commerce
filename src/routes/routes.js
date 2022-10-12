const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const auth = require('../auth/auth');
const { Route53RecoveryControlConfig } = require('aws-sdk');


router.get("/testme",function(req,res){
    res.send("Hey its working")
});

router.post("/register", userController.createUser)
router.post("/login",userController.login)
router.get("/user/:userId/profile", auth.verifyToken, auth.authentication,auth.authorization, userController.getUser)
router.put("/user/:userId/profile", auth.verifyToken, auth.authentication,auth.authorization, userController.updateUser)

router.post("/products",productController.createProduct);

module.exports = router