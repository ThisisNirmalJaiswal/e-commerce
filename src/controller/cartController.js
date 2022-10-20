//--------------------------------------Requiring Cart model from models-------------------------------------
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const validation = require("../Util/Validations")

//==========================================create cart API===========================================

const createCart = async function (req, res) {
  try {

    let requestBody = req.body;

    userIdFromParam = req.params.userId

    let { cartId, productId } = requestBody;

    if (validation.isValidBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "cart data is required " });
    }

    if (!validation.isValidObjectId(productId))
      return res.status(400).send({ status: false, message: "Invalid productId" });

    const productById = await productModel.findById(productId).lean()
    if (!productById) {
      return res.status(404).send({ status: false, message: " product not found!!!" })
    }

    if (productById.isDeleted == true) {
      return res.status(404).send({ status: false, message: " product is deleted!!!" })
    }

    if (productById.installments === 0) {
      return res
        .status(400)
        .send({ status: false, message: "product is out of stock" });
    }

    if (cartId && !validation.isValidObjectId(cartId))
      return res.status(400).send({ status: false, message: "Invalid cartId" });


     
    const userCart = await cartModel.findOne({  userId: userIdFromParam })


    //if cart id is given and cart not found by user
    if (cartId  && !userCart) {
      return res.status(404).send({ status: false, message: "cart by this user does not exist!!!" })
    }

    //if cartId is not given and cart is found byb userId from params
    if((!cartId) && userCart){ return res.status(200).send({
      status: true,
      message: "Cart exist by this user please provide cartid",
     
    });}


    //if cartId is given but cart found by the userId does not match with the cartId from rreqbody
    if (userCart && userCart._id!=cartId) {
      return res.status(404).send({ status: false, message: " Please give correct cartId" })
    }

    //if cartId is given but cart found by the userId does not match with the cartId from rreqbody
   
    if (cartId  && userCart._id!=cartId) {
      return res.status(404).send({ status: false, message: " hey!!dont give others cartId!!!!" })
    }
   
    //ifcart does not exist for the user and cartId is not given
    if ( !cartId && !userCart) {
      let filter = {}

      let prodData = { productId: productById._id, quantity: 1 }

      filter.totalItems = 1
      filter.totalPrice = productById.price
      filter.userId = userIdFromParam
      filter.items = prodData
      const createdCart = await cartModel.create(filter)

      let productDataAll = await cartModel.findOne({ userId: userIdFromParam }).populate('items.productId')

      return res.status(201)
        .send({ status: true, message: "New cart created with products", data: productDataAll, });

    }
   
    //if usercart is created but is empty
    if ((cartId) && (userCart.items.length === 0)) {
      const addedProduct = {
        productId: productId,
        quantity: 1,
      };

      const cartData = {
        items: [addedProduct],
        totalPrice: productById.price,
        totalItems: 1,
      };

      const newItemInCart = await cartModel.findOneAndUpdate({ userId: userIdFromParam },
        { $set: cartData }, { new: true }).populate('items.productId');




      return res.status(200).send({
        status: true,
        message: "Product added to cart",
        data: newItemInCart,
      });
    }

  
    //for checking if product exist in cart
    {
      let productExistInCart = userCart.items.findIndex(items => items.productId == requestBody.productId);

     
      //if provided product does exist in cart
      if (productExistInCart > -1) {

        const increasedProductQuantity = await cartModel.findOneAndUpdate({ userId: userIdFromParam, "items.productId": productId }, {
          $inc: { totalPrice: +productById.price, "items.$.quantity": +1 },
        }, { new: true }).populate('items.productId')


        return res.status(200)
          .send({ status: true, message: "Product quantity and price updated in the cart", data: increasedProductQuantity });
      }
      //if provided product does not exist in cart
      if (productExistInCart == -1) {
        const updatedProductQuantity = await cartModel.findOneAndUpdate({ userId: userIdFromParam },
          { $push: { items: { productId: productId, quantity: 1 } }, $inc: { totalPrice: +productById.price, totalItems: +1 }, }, { new: true }).populate('items.productId')


        return res.status(200)
          .send({ status: true, message: "product updated to cart", data: updatedProductQuantity });
      }
    }

  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })

  }

}
//==========================================create cart API end here===========================================



//==========================================get cart details API===========================================
const getCartDetails = async function (req, res) {
  try {
    //--------------------------------------Request UserId from path Params-------------------------------------
    let userId = req.params.userId;

    //--------------------------------------Checking UserId is valid or not-------------------------------------
    if (!validation.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: `${userId} not a valid userId` });
    }

    //--------------------------------------Finding cart by given UserId from Cart model-------------------------------------
    let getCart = await cartModel
      .findOne({ userId: userId })
      .populate("items.productId");

    //--------------------------------------if there is no cart in database by given userId-------------------------------------
    if (!getCart) {
      return res
        .status(404)
        .send({
          status: false,
          message: `We can't find any cart by this id....${userId}`,
        });
    }

    //--------------------------------------response for cart details---------------------------------------------
    return res
      .status(200)
      .send({ status: true, message: "success", data: getCart });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};
/*=========================================GET CART DETAILS END HERE======================================*/



/*==========================================DELETE A CART API==========================================*/

const deleteCart = async function (req, res) {
  try {
    //--------------------------------------Getting userId from path params -------------------------------------
    let userId = req.params.userId;

    //--------------------------------------Finding the cart by the UserId-------------------------------------
    let findCart = await cartModel.findOne({ userId: userId });
    if (!findCart)
      return res.status(404).send({
        status: false,
        message: `There is no cart by this user: ${userId}!`,
      });

    //--------------------------------------If there is no product in your cart-------------------------------------
    if (findCart.items.length == 0)
      return res
        .status(400)
        .send({
          status: false,
          message: "Beta tumhari cart hmesha hi khali rhti!!!!",
        });

    //--------------------------------------Updating cart items/ removing cart items-------------------------------------
    let cartData = await cartModel.updateOne(
      { _id: findCart._id },
      { items: [], totalPrice: 0, totalItems: 0 }
    );

    //--------------------------------------Response message-------------------------------------
    return res.status(204).send({ status: true, message: "Successfully deleted" });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};
/*==========================================DELETE A CART API END HERE=========================================*/

// ______________________________________________update cart_________________________________________________

const updateCart = async function (req, res) {
  try {

    let requestBody = req.body;

    userIdFromParam = req.params.userId

    let { cartId, productId, removeProduct } = requestBody;
    console.log(removeProduct)

    if (!validation.isValidObjectId(productId))
      return res.status(400).send({ status: false, message: "Invalid productId" });

      if (!validation.isValidObjectId(cartId))
      return res.status(400).send({ status: false, message: "Invalid cartId" });


    const productById = await productModel.findById(productId).lean()

    if (!productById) {
      return res.status(404).send({ status: false, message: " product not found!!!" })
    }

    if (productById.isDeleted == true) {
      return res.status(404).send({ status: false, message: " product is deleted!!!" })
    }

    if (requestBody.removeProduct !== 0 &&requestBody. removeProduct !== 1) {
      return res.status(404).send({ status: false, message: " removeProduct must be either 0 or 1" })
    }

   

    const userCart = await cartModel.findOne({ _id: cartId, userId: userIdFromParam })
    if (!userCart) {
      return res.status(404).send({ status: false, message: " hey!!dont give others cartId" })
    }

    //for checking if product exist in cart

    const productExistInCart = userCart.items.findIndex(items => items.productId == requestBody.productId);

    console.log(productExistInCart)

    //if provided product does exist in cart
    if (productExistInCart == -1) {
      return res.status(404)
        .send({ status: false, message: " This product does not exist in cart" })
    }

   
    if (productExistInCart > -1) {

      //chek the remove product key is 1
      if (removeProduct === 1) {


        //check the quantity of poduct incart if == 1 delet the whole product
        if (userCart.items[productExistInCart].quantity == 1) {

          const deleteWholeProduct = await cartModel.findOneAndUpdate({ userId: userIdFromParam, "items.productId": productId },
            {
              $pull: { items: {  productId: productId, quantity: userCart.items[productExistInCart].quantity  } },
              $inc: { totalItems: -1, totalPrice: -productById.price },
            }, { new: true }).populate("items.productId")



          return res.status(200).send({
            status: true,
            message: "Single product is completely removed from the cart",
            data: deleteWholeProduct,
          });
        }

        if (userCart.items[productExistInCart].quantity > 1) {

          const reduceProductQuantity = await cartModel.findOneAndUpdate({ userId: userIdFromParam, "items.productId": productId },
            { $inc: {  totalPrice: -productById.price, "items.$.quantity": -1 } }, { new: true }).populate("items.productId");


          return res.status(200).send({
            status: true,
            message: "Product Quantity is decreased from the cart",
            data: reduceProductQuantity,
          });
        }


      } 
      //chek the remove product key is 0
      if (removeProduct === 0) {


        const removeWholeProducts = await cartModel.findOneAndUpdate({ userId: userIdFromParam, "items.productId": productId },
          {
            $pull: { items:   {productId: productId, quantity: userCart.items[productExistInCart].quantity}},
            $inc: { totalItems: -1, totalPrice: -(productById.price *((userCart.items[productExistInCart]).quantity)) },
          }, { new: true }).populate("items.productId")

        return res.status(200).send({
          status: true,
          message: "The whole product is removed",
          data: removeWholeProducts,
        });
      }


    }
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
}
  ;



// ______________________________________________update cart ends___________________________________________




/*==========================================EXPORTING ALL APIS HERE=============================================*/
module.exports = { getCartDetails, deleteCart, createCart, updateCart }
