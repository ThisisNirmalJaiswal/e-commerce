const userModel = require('../models/userModel')
const mongoose = require('mongoose')
const aws= require("aws-sdk")
const AW = require('../awsfile/aws')

const createUser = async function(req, res){

    try {
      const requestBody = req.body;
     
  
      let profileImage = req.files;
      console.log(req.body);
      console.log(req.files)
     
      //using destructuring
      let { fname, lname, email, phone, password, address } = requestBody;
      
      if(profileImage && profileImage.length>0){
          //upload to s3 and get the uploaded link
          // res.send the link back to frontend/postman
          //let uploadedFileURL= await uploadFile( files[0] )
          var uploadedProfilePictureUrl = await AW.uploadFile(profileImage[0]);
          //res.status(201).send({msg: "file uploaded succesfully", data: uploadedProfilePictureUrl  })
      }
      else{
          res.status(400).send({ msg: "No file found" })
      }
  
     
      //console.log(uploadedProfilePictureUrl);
      // password encryption
      
      const userData = {
        fname: fname,
        lname: lname,
        email: email,
        profileImage: uploadedProfilePictureUrl,
        phone: phone,
        password: password,
        address: address,
      };
      // registering a new user
      const newUser = await userModel.create(userData);
  
      res.status(201).send({
        status: true,
        message: "User successfully registered",
        data: newUser,
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }

  module.exports = { createUser }








