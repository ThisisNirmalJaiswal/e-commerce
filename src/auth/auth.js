const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel")
const mongoose = require("mongoose")

const isValidObjectId = function (objectid) {
    return mongoose.Types.ObjectId.isValid(objectid)
}

const verifyToken = function (req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    
    next();
  } else {
    // Forbidden
    res.status(403).send({status:false, message:"NO token in bearer"});
  }
}

const authentication = function (req, res, next) {
    try {
       
         jwt.verify(req.token, "project5",  (err, decoded)=> {
            if (err) {
                return res.status(401).send({ status: false, error:  err.message})
            } else {
                let userId = decoded.userId
                req["tokenUserId"] = userId
                next()
            }
        });
        
    } catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Congrats!!, You messesd Up. :(", error: err.message })
    }
}
const authorization = async function (req , res , next){
  try{
   
    let userId = req.userId
    req.userIdFromParam = req.params.userId
    if (!isValidObjectId(req.userIdFromParam)) {
      return res
        .status(400)
        .send({ status: false, message: " Please!! input a valid Id :(" });
    }
    if(req["tokenUserId"]!=req.userIdFromParam) return  res.status(403).send({message:"Sorry!! You are not AUTHORISED"})


    req.userByUserId = await userModel.findById(req.userIdFromParam)

    if (!req.userByUserId) {
      return res.status(404).send({ status: false, message: " User not found!!!" })
  }

    
    next()
  }
  catch(err){
    return res.status(500).send({ msg:" Congrats!!, You messesd Up", err: err.message })
  }
  }

module.exports = {authentication , authorization, verifyToken}