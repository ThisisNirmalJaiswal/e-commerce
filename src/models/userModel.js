const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    fname: {type:String, required:true, trim:true},
    lname: {type:String, required:true, trim:true},
    email: {type:String, required:true, unique:true, lowercase:true, trim:true},
    profileImage: {type:String, required:true, trim:true}, // s3 link
    phone: {type:Number, required:true, unique:true, trim:true}, 
    password: {type:String, required:true, trim:true, minLen:8, maxLen:15}, // encrypted password
    address: {
        shipping: {
          street: {type:String, required:true, trim:true},
          city: {type:String, required:true, trim:true},
          pincode: {type:String, required:true, trim:true}
        },
        billing: {
          street: {type:String, required:true, trim:true},
          city: {type:String, required:true, trim:true},
          pincode: {type:String, required:true, trim:true}
        }
      }},{timestamps:true}

)

module.exports = mongoose.model('user',userSchema)


// userSchema.pre('save', async function(next){
//   if(this.isModified('password')){
//     this.password = bycrypt.hash(thispassword,10);
//   }next()
//})




// { 
//     fname: {string, mandatory},
//     lname: {string, mandatory},
//     email: {string, mandatory, valid email, unique},
//     profileImage: {string, mandatory}, // s3 link
//     phone: {string, mandatory, unique, valid Indian mobile number}, 
//     password: {string, mandatory, minLen 8, maxLen 15}, // encrypted password
//     address: {
//       shipping: {
//         street: {string, mandatory},
//         city: {string, mandatory},
//         pincode: {number, mandatory}
//       },
//       billing: {
//         street: {string, mandatory},
//         city: {string, mandatory},
//         pincode: {number, mandatory}
//       }
//     },
//     createdAt: {timestamp},
//     updatedAt: {timestamp}
//   }