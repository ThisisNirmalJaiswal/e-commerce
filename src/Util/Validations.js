const mongoose = require("mongoose");

// const isValid = (value) => {
//   if(typeof value === "undefined" || typeof value === "null") return true;
//   if(typeof value === "string" && value.trim().length == 0) return true;
//   if(typeof value === "object" && Object.keys(value).length == 0) return true;
//   return false; 
// }
const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return true;
  if (typeof value === "string" && value.trim().length === 0) return true;
  return false;
};

const isValidPincode = (num) => {
  return /^[0-9]{6}$/.test(num);
}

const isValidBody = (reqBody) => {
  return Object.keys(reqBody).length == 0;
}

const isValidString = (String) => {

  return /^[a-zA-Z]*$/.test(String)
}

const isValidPhone = (Mobile) => {
  return /^[6-9]\d{9}$/.test(Mobile)
};

const isValidEmail = (Email) => {
  return  /^([A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{2,6})+$/.test(Email)
};

const isValidPassword = (password) => {
  return (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/.test(password))
 
};

const isValidObjectId = (objectId) => {
  return mongoose.Types.ObjectId.isValid(objectId);
}

const isValidPrice = (price) => {
  return (/^(0(?!\.00)|[1-9]\d{0,6})\.\d{2}$/.test(price))
};

const isValidinstallments= (installments)=>{
  return(/[0-9]/.test(installments))
}


module.exports = { isValid, 
  isValidBody, 
  isValidString, 
  isValidPhone, 
  isValidEmail, 
  isValidPassword, 
  isValidObjectId, 
  isValidPincode,
  isValidPrice,
  isValidinstallments
 }