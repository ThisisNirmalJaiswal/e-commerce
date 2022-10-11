const userModel = require("../models/userModel");
const aws = require("aws-sdk");
const AWS = require("../awsfile/aws");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validation = require("../Util/Validations");

const createUser = async function (req, res) {
  try {
    const data = req.body;

    let profileImage = req.files;
   
    //using destructuring
    let { fname, lname, email, phone, password, address } = data;

    if (validation.isValidBody(data))
      return res.status(400).send({
        status: false,
        message: "Please!! provide required details to create your account",
      });

    if (validation.isValid(data.fname))
      return res.status(400).send({
        status: false,
        message: "First name must be contains only charachters",
      });

    if (validation.isValid(data.lname))
      return res.status(400).send({
        status: false,
        message: "Last name must be contains only charachters",
      });

    if (!data.email)
      return res
        .status(400)
        .send({ status: false, message: "User email-id is required" });

    if (!validation.isValidEmail(data.email)) {
      return res
        .status(400)
        .send({ status: false, message: "User email is not valid" });
    }
    //  checking if email is unique or not.
    let checkEmail = await userModel.findOne({ email: email });
    if (checkEmail) {
      return res.status(409).send({ message: "Email Already Registered..." });
    }

    // if (profileImage.length == 0)
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Please upload profile image" });

    if (!data.phone)
      return res
        .status(400)
        .send({ status: false, message: "User phone number is required" });

    if (!validation.isValidPhone(data.phone)) {                                  
      return res
        .status(400)
        .send({ status: false, message: "User phone number is not valid" });
    }

    //  checking if mobile is unique or not.
    let checkMobile = await userModel.findOne({ phone: phone });
    if (checkMobile) {
      return res.status(409).send({ message: "Mobile Already Registered" });
    }

    if (!data.password)
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });

    if (!data.address)
      return res
        .status(400)
        .send({ status: false, message: "Address is required" });

    

    //  checking if city is valid or not.
    if (!address && address.city && !isValidCity(address.city)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid city..." });
    }

  

    if (!address["shipping"]["street"]) {
      return res
        .status(400)
        .send({ status: false, message: "street is required" });
    }

    if (!address["shipping"]["city"]) {
      return res
        .status(400)
        .send({ status: false, message: "city is required" });
    }

    if (!address["shipping"]["pincode"]) {
      return res
        .status(400)
        .send({ status: false, message: "pincode is required" });
    }

      //  checking if pincode is valid or not.
      if (address["shipping"] && address["shipping"]["pincode"] && !validation.isValidPincode(address["shipping"]["pincode"])) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid pincode..." });
      }
  


    if (!address["billing"]["street"]) {
      return res
        .status(400)
        .send({ status: false, message: "street is required" });
    }

    if (!address["billing"]["city"]) {
      return res
        .status(400)
        .send({ status: false, message: "city is required" });
    }

    if (!address["billing"]["pincode"]) {
      return res
        .status(400)
        .send({ status: false, message: "pincode is required" });
    }

       //  checking if pincode is valid or not.
       if (address["billing"] && address["billing"]["pincode"] && !validation.isValidPincode(address["billing"]["pincode"])) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid pincode..." });
      }
  

    if (profileImage && profileImage.length > 0) {
      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman
      //let uploadedFileURL= await uploadFile( files[0] )
      var uploadedProfilePictureUrl = await AWS.uploadFile(profileImage[0]);
      console.log(profileImage)

      //res.status(201).send({msg: "file uploaded succesfully", data: uploadedProfilePictureUrl  })
    } else {
     return res.status(400).send({ msg: "No file found" });
    }

    //console.log(uploadedProfilePictureUrl);
    // password encryption
    const salt = await bcrypt.genSalt(10);
    encryptedPassword = await bcrypt.hash(password, salt);

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

    return res.status(201).send({
      status: true,
      message: "User successfully registered",
      data: newUser,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
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
      return res.status(400).send({ status: false, message: "EmailId is required" });
    }
    
    if (!validation.isValidEmail) {
      return res
        .status(400)
        .status({ status: false, message: "Please enter email in valid format" });
    }

    if (!password) {
      return res
        .status(400)
        .status({ status: false, message: "Password is required" });
    }
    if (!validation.isValid(password)) return res.status(400).send({ status: false, message: 'email is mandatory' })


    if (!validation.isValidPassword) {
      return res
        .status(400)
        .status({ status: false, message: "Please inter password in valid format" });
    }

    let data = await userModel.findOne({ email: email });
    if (!data) {
      return res.status(400).send({
        status: false,
        message: "Email doesnot exist. Please recheck it",
      });
    }

    let passwordMatch = await bcrypt.compare(password, data.password);

    if (passwordMatch == false)
      return res
        .status(400)
        .send({ status: false, message: "Password is incorrect" });

    let expiresIn = { expiresIn: "24h" };
    let token = jwt.sign(
      {
        userId: data._id.toString(),
        group: "group-58",
        iat:Math.floor(Date.now() / 1000) 
      },
      "project5",
      expiresIn
    );

   return res.status(200).send({
      status: true,
      message: "user Login Successful",
      data: {
        userId: data._id,
        token: token,
      },
    });
  } catch (err) {
    return res.status(500).send({ status: err.message });
  }
};

const getUser = async function (req, res) {
  try {
    res
      .status(200)
      .send({ message: "Here are the details", data: req.userByUserId });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateUser = async function (req, res) {
  try {
    let requestBody = req.body;
    //fname,lname,email,phone,password,addressshipping-street,city,pincode,addresbilling
    let filter = {};
    let { fname, lname, email, phone, password, address } = requestBody;
    
    if(req.files){
      let profileImage = req.files
      console.log(req.files)
    if (profileImage!=undefined && profileImage.length > 0) {
      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman
      //let uploadedFileURL= await uploadFile( files[0] )
      var updatedProfilePictureUrl = await AWS.uploadFile(profileImage[0]);
      //res.status(201).send({msg: "file uploaded succesfully", data: uploadedProfilePictureUrl  })
      } 
      //else {
    //  return res.status(400).send({ msg: "No file found" });
    // }
    filter.profileImage = updatedProfilePictureUrl;
    }
    if (fname) filter.fname = fname;
    if (lname) filter.lname = lname;
    if (email) filter.email = email;
    if (phone) filter.phone = phone;
    const isUnique = await userModel.find({
      $or: [{ email: email }, { phone: phone }],
    });
    if (isUnique.length >= 1) {
      if (isUnique.length == 1) {
        if (isUnique[0].email == email) {
          return res
            .status(400)
            .send({ status: false, message: "email already exist" });
        }
        if (isUnique[0].phone == phone) {
          return res
            .status(400)
            .send({ status: false, message: "phone already exist" });
        }
      } else {
        return res
          .status(400)
          .send({ status: false, message: "email and phone already exist" });
      }
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      encryptedPassword = await bcrypt.hash(password, salt);

      filter.password = encryptedPassword;
    }
    
    // if (address["shipping"]["street"])
    // filter["address"]["shipping"]["street"] = address["shipping"]["street"];
    // if (address["shipping"]["city"]) filter["address"]["shipping"]["city"] = address["shipping"]["city"];
    // if (address["shipping"] && address["shipping"]["pincode"])
    // filter["address"]["shipping"]["pincode"]= address["shipping"]["pincode"];
    // // if (address.billing.street) filter.address.billing.street = address.billing.street;
    // if (address.billing.city) filter.address.billing.city = address.billing.city;
    // if (address.billing.pincode)
    //   filter.address.billing.pincode = address.billing.pincode;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.userIdFromParam,
      filter,
      { new: true }
    );

    return res.status(200).send({
      message: "yess!!your details are updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createUser, login, getUser, updateUser };
