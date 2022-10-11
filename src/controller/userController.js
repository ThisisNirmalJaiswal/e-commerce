const userModel = require("../models/userModel");
const aws = require("aws-sdk");
const AWS = require("../awsfile/aws");
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
      var uploadedProfilePictureUrl = await AWS.uploadFile(profileImage[0]);
      //res.status(201).send({msg: "file uploaded succesfully", data: uploadedProfilePictureUrl  })
    } else {
      res.status(400).send({ msg: "No file found" });
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

    let data = await userModel.findOne({ email: email })
    if (!data) {
      return res.status(400).send({
        status: false,
        message: "Email doesnot exist. Please recheck it",
      });
    }

    let passwordMatch = await bcrypt.compare(password, data.password);
    
    if(passwordMatch==false)  return res.status(400).send({ status: false, message: "Password is incorrect" });

    

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


const getUser = async function (req, res){

try{

 
  res.status(200).send({message:"Here are the details", data:req.userByUserId})
}catch(err){
  return res.status(500).send({ status: false, message: err.message })
}

}


const updateUser = async function (req, res){

  try{
    let requestBody = req.body
//fname,lname,email,phone,password,addressshipping-street,city,pincode,addresbilling
    let filter = {}
    let { fname, lname, email, phone, password, address } = requestBody;
    let profileImage = req.files;

    if (profileImage && profileImage.length > 0) {
      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman
      //let uploadedFileURL= await uploadFile( files[0] )
      var updatedProfilePictureUrl = await AWS.uploadFile(profileImage[0]);
      //res.status(201).send({msg: "file uploaded succesfully", data: uploadedProfilePictureUrl  })
    } else {
      res.status(400).send({ msg: "No file found" });
    }
    
    if (fname) filter.fname = fname
    if (lname) filter.lname = lname
    if (email) filter.email = email
    if (phone) filter.phone = phone
    const isUnique = await bookModel.find({ $or: [{ email: email }, { phone: phone }] })
    if (isUnique.length >= 1) {
        if (isUnique.length == 1) {
            if (isUnique[0].email == email) {
                return res.status(400).send({ status: false, message: "title already exist" })
            }
            if (isUnique[0].phone == phone) {
                return res.status(400).send({ status: false, message: "ISBN already exist" })
            }
        }else{
            return res.status(400).send({ status: false, message: "title and ISBN already exist" })
        }
    }
    


    if (password){const salt = await bcrypt.genSalt(10);
      encryptedPassword = await bcrypt.hash(password, salt);
  
      filter.password = encryptedPassword
    }
    if (profileImage) filter.profileImage = updatedProfilePictureUrl

    if (address.shipping.street) address.shipping.street = address.shipping.street
    if (address.shipping.city) address.shipping.city=address.shipping.city
    if (address.shipping.pincode) address.shipping.pincode=address.shipping.pincode
    if (address.billing.street) address.billing.street = address.billing.street
    if (address.billing.city) address.billing.city=address.billing.city
    if (address.billing.pincode) address.billing.pincode=address.billing.pincode
   
    const updatedUser = await userModel.findByIdAndUpdate(req.userIdFromParam,filter,{new:true})

   
    return res.status(200).send({message:"yess...your details are updated successfully", data:updatedUser})
  }catch(err){
    return res.status(500).send({ status: false, message: err.message })
  }
  
  }

module.exports = { createUser, login, getUser, updateUser };
