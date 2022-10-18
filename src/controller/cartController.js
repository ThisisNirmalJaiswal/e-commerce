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
 
        const userCart = await cartModel.findOne({ userId: userIdFromParam })
        //ifcart does not exist for the use
        if (!userCart) {
            let filter = {}

            let prodData = { productId: productById._id, quantity: 1 }

            filter.totalItems = 1
            filter.totalPrice = productById.price
            filter.userId = userIdFromParam
            filter.items = prodData
            const createdCart = await cartModel.create(filter)

            let productDataAll = await cartModel.findOne({ userId: userIdFromParam }).populate('items.productId')

            return res.status(200)
                .send({ status: true, message: "New cart created with products", data: productDataAll, });

        }
        if (userCart._id != cartId) {
            return res
                .status(400)
                .send({ status: false, message: "cart doesnot exist" });
        }
        //if usercart is created but is empty
        if (userCart.items.length === 0) {
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
          { $set: cartData } , { new: true }).populate('items.productId');


            // const newItemInCart = await cartModel.findOneAndUpdate({ userId: userIdFromParam },
            //  {  { $set: {items:{ addedProduct}} }, 
            //    { $inc: { totalItems: +1, totalPrice: +productById.price } }, }, 
            //    { new: true }).populate('items.productId')
            // const newItemInCart = await cartModel.findOneAndUpdate({ userId: userIdFromParam }, 
            //   { $set: { "items": addedProduct } , 
            //     $inc: { totalItems: +1, totalPrice: +productById.price },} , { new: true }).populate('items.productId');




            return res.status(200).send({
                status: true,
                message: "Product added to cart",
                data: newItemInCart,
            });
        }
        //for checking if product exist in cart
        {
            let productExistInCart = userCart.items.findIndex(items => items.productId == requestBody.productId);

            console.log(productExistInCart)

            //if provided product does exist in cart
            if (productExistInCart > -1) {

              const increasedProductQuantity = await cartModel.findOneAndUpdate({ userId: userIdFromParam, "items.productId": productId }, {
                $inc: { totalPrice: +productById.price, totalItems: +1, "items.$.quantity": +1 },
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


/*==========================================EXPORTING ALL APIS HERE=============================================*/
module.exports = { getCartDetails, deleteCart, createCart };
