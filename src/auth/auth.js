
const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel")
const mongoose = require("mongoose")
const { isValidObjectId } = require("mongoose");


const verifyToken = function (req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
   // console.log(bearerHeader)
    const bearer = bearerHeader.split(' ');
   // console.log(bearer)
    const bearerToken = bearer[1];

   
    req.token = bearerToken;

    next();
  } else {
    // Forbidden
    return res.status(400).send({ status: false, message: "NO token in bearer" });
  }
}

const authentication = function (req, res, next) {

  try {
    const decodedToken = jwt.verify(req.token, "project5")

    if (Date.now() > decodedToken.exp * 1000) {
      return res.status(401).send({ status: false, message: "Session Expired" })
    }
    //console.log(decodedToken)

    req.decodedToken = decodedToken
    req["tokenUserId"] = decodedToken.userId
    req.decodedToken = decodedToken
  

    next()

  } catch {
   return res.status(401).send({ status: false, message: "authentication failed" })
  }

  
}
const authorization = async function (req, res, next) {
  try {

    let userId = req.userId
    req.userIdFromParam = req.params.userId
    if (!isValidObjectId(req.userIdFromParam)) {
      return res
        .status(400)
        .send({ status: false, message: " Please!! input a valid Id :(" });
    }
    if (req["tokenUserId"] != req.userIdFromParam) return res.status(403).send({ message: "Sorry!! You are not AUTHORISED" })


    req.userByUserId = await userModel.findById(req.userIdFromParam)

    if (!req.userByUserId) {
      return res.status(404).send({ status: false, message: " User not found!!!" })
    }


    next()
  }
  catch (err) {
    return res.status(500).send({ msg: " Congrats!!, You messesd Up", err: err.message })
  }
}

module.exports = { authentication, authorization, verifyToken }