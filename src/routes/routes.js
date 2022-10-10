const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')


router.get("/testme",function(req,res){
    res.send("Hey its working")
});

router.post("/register", userController.createUser)



module.exports = router