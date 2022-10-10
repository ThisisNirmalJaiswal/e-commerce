const userModel = require("../models/userModel");
const aws = require("aws-sdk");
const AW = require("../awsfile/aws");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createUser = async function (req, res) {
  try {
    const requestBody = req.body;

    let profileImage = req.files;

    //using destructuring
    let { fname, lname, email, phone, password, address } = requestBody;

    if (profileImage && profileImage.length > 0) {
      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman
      //let uploadedFileURL= await uploadFile( files[0] )
      var uploadedProfilePictureUrl = await AW.uploadFile(profileImage[0]);
      //res.status(201).send({msg: "file uploaded succesfully", data: uploadedProfilePictureUrl  })
    } else {
      res.status(400).send({ msg: "No file found" });
    }

    //console.log(uploadedProfilePictureUrl);
    // password encryption
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const userData = {
      fname: fname,
      lname: lname,
      email: email,
      profileImage: uploadedProfilePictureUrl,
      phone: phone,
      password: encryptedPassword,
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
};

const login = async function (req, res) {
  try {
    requestBody = req.body;

    if ((Object.keys(requestBody).length = 0)) {
      res.status(400).send({
        status: false,
        message: "please enter Email and Password to login ",
      });
    }
    if (Object.keys(requestBody).length > 2) {
      res.status(400).send({
        status: false,
        message: "pls enter only email and password in the body",
      });
    }
    //Distructure
    const { email, password } = req.body;
    if (!email) {
      res.status(400).send({ status: false, message: "EmailId is required" });
    }
    if (!password) {
      res
        .status(400)
        .status({ status: false, message: "Password is required" });
    }

    let data = await userModel.findOne({ email: email, password: password });

    if (!data) {
      return res.status(400).send({
        status: false,
        message: "Email or Password is incorrect.Please recheck it",
      });
    }

    let expiresIn = { expiresIn: "24h" };
    let token = jwt.sign(
      {
        userId: data._id.toString(),
        group: "group-58",
      },
      "project5",
      expiresIn
    );

    res.status(200).send({
      status: true,
      message: "user Login Successful",
      data:{
      userId: data._id,
      token: token,
    }});
  } catch (err) {
    return res.status(500).send({ status: err.message });
  }
};

module.exports = { createUser, login };
