const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel")

// _____________________________________________createCart_______________________________________________________________


// {
//   userId: {ObjectId, refs to User, mandatory, unique},
//   items: [{
//     productId: {ObjectId, refs to Product model, mandatory},
//     quantity: {number, mandatory, min 1}
//   }],
//   totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
//   totalItems: {number, mandatory, comment: "Holds total number of items in the cart"},
//   createdAt: {timestamp},
//   updatedAt: {timestamp},
// }

const createCart = async function (req, res) {
  try{
  
    let requestBody = req.body;
  
    userIdFromParam = req.params.userId

    let { cartId,productId  } = requestBody;

     const productById = await productModel.findById(productId).lean()
  if(!productById)
  {
    return res.status(404).send({ status: false, message: " product not found!!!" })
  }

  if(productById.isDeleted==true)
  {
    return res.status(404).send({ status: false, message: " product is deleted!!!" })
  }

  if (productById.installments === 0) {
    return res
        .status(400)
        .send({ status: false, message: "product is out of stock" });
}



const userCart = await cartModel.findOne({userId:userIdFromParam}).lean()

if(userCart._id!=cartId) {
  return res
      .status(400)
      .send({ status: false, message: "cart doesnot exist" });
}




//ifcart does not exist for the user
if(!userCart){
    

  let filter = {}

 let prodData = {productId:productById._id,quantity : 1}

  filter.totalItems =  1
  filter.totalPrice = productById.price
  filter.userId =  userIdFromParam 
  filter.items = [prodData]


  const createdCart = await cartModel.create(filter)

  return res.status(200).send({
    status: true,
    message: "New cart created with products",
    data:createdCart,
});

}

if(userCart.userId!=req.params.userId)
return res.status(400).send({
  status: false,
  message: "your userId doesnot match with the uaer of cart"
  
});



//if usercart is created but is empty
if(userCart.items.length===0){
const addedProduct = {productId:productById._id,
quantity:{$inc:+1}
}

const newItemInCart = await cartModel.findOneAndUpdate({userId: userIdFromParam },{$set:{items:[addedProduct]}},{$inc:{totalItems:+1, totalPrice:+productById.price}}, {new:true})

return res.status(200).send({
  status: true,
  message: "Product added to cart",
  data: newItemInCart,
});
}




//for checking if product exist in cart
  {let productExistInCart = userCart.items.findIndex(items => items.productId == requestBody.productId);

    console.log(productExistInCart)
  
     //if provided product does exist in cart
       if (productExistInCart>-1){

        


        const increasedProductQuantity = await cartModel.findOneAndUpdate({userId:  userIdFromParam, "items.productId": productId} , {
          $inc: {
              totalPrice:+productById.price,
              totalItems:+1,
              "items.$.quantity": +1
             },
      }, { new: true });
  
      return res.status(200).send({
        status: true,
        message: "Product quantity and price updated in the cart",
        data: increasedProductQuantity,
    });
       }


       //if provided product does not exist in cart
       if (productExistInCart == -1){

        
        const updatedProductQuantity = await cartModel.findOneAndUpdate({userId:  userIdFromParam } ,
          {$push:{items:{productId:productId, quantity:1 }},
          $inc: {totalPrice:+productById.price,
            totalItems:+1 },}, { new: true });

      
      return res.status(200).send({
        status: true,
        message: "product updated to cart",
        data: updatedProductQuantity,
    });

       }
}



  
 } catch (err) {
  return res.status(500).send({ status: false, error: err.message });
}
};

//----------------------------------get cart details---------------------------------
const getCartDetails = async function (req, res) {
  try {
    let userId = req.params.userId;

    if (!validation.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: `${userId} not a valid userId` });
    }

    let getCart = await cartModel
      .findOne({ userId: userId })
      //.populate(items.productId);

    if (!getCart) {
      return res.status(404).send({
        status: false,
        message: `We can't find any cart by this id....${userId}`,
      });
    }
    return res
      .status(200)
      .send({ status: true, message: "success", data: getCart });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

//---------------------------------------Deleting Cart-------------------------------------

const deleteCart = async function (req, res) {
  try {
    let userId = req.params.userId;

    let findCart = await Cart.findOne({ userId: userId });
    if (!findCart)
      return res
        .status(404)
        .send({
          status: false,
          message: `There is no cart by this user: ${userId}!`,
        });

    if (findCart.items.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Beta tumhari cart hmesha hi khali rhti!!!!" });

    await Cart.updateOne(
      { _id: findCart._id },
      { items: [], totalPrice: 0, totalItems: 0 }
    );

    return res.status(204).send({ status: true, message: "Success" });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = {createCart, getCartDetails, deleteCart}