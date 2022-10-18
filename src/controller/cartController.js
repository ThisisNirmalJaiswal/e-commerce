//--------------------------------------Requiring Cart model from models-------------------------------------
const cartModel = require("../models/cartModel");

//----------------------------------get cart details---------------------------------
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
    .populate(items.productId);

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



/*====   ======================================DELETE A CART API==========================================*/

const deleteCart = async function (req, res) {
  try {
//--------------------------------------Getting userId from path params -------------------------------------
    let userId = req.params.userId;

//--------------------------------------Finding the cart by the UserId-------------------------------------
    let findCart = await Cart.findOne({ userId: userId });
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
    await Cart.updateOne(
      { _id: findCart._id },
      { items: [], totalPrice: 0, totalItems: 0 }
    );

//--------------------------------------Response message-------------------------------------
    return res.status(204).send({ status: true, message: "Success" });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};
/*==========================================DELETE A CART API END HERE=========================================*/


/*==========================================EXPORTING ALL APIS HERE=============================================*/
module.exports = { getCartDetails, deleteCart, createCart };

module.exports = {getCartDetails, deleteCart}