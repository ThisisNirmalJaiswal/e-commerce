const cartModel = require("../models/cartModel");

//----------------------------------get cart details---------------------------------
const getCartDetails = async function (req, res) {
  try {
    let userId = req.params.userId;

    if (!validation.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: `${userId} not a valid productId` });
    }

    let getCart = await cartModel
      .findOne({ userId: userId })
      .populate("items.productId");

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

module.exports = {getCartDetails, deleteCart}