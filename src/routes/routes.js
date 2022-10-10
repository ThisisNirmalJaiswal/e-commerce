const express = require('express')
const router = express.Router()
const userController = ('../controller/userController')

router.get("/testme",function(req,res){
    res.send("Hey its working")
});



module.exports = router