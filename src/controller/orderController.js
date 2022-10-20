const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const { isValidObjectId } = require("mongoose");
const validation = require("../Util/Validations");

const createOrder = async function (req, res) {
  try {
    let userIdFromParam = req.params.userId;
    let requestBody = req.body;
    let { cartId, cancellable } = requestBody;

    if (validation.isValidBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "createorder data is required " });
    }


    if (!isValidObjectId(cartId))
      return res
        .status(400)
        .send({ status: false, message: `Invalid cartId ${cartId} !` });

    let checkCart = await cartModel.findOne({ userId: userIdFromParam }).lean();
    if (!checkCart)
      return res
        .status(404)
        .send({
          status: false,
          message: `No cart found by this UserId: ${userIdFromParam} !`,
        });

    if (checkCart.items.length == 0)
      return res
        .status(400)
        .send({
          status: false,
          message: "You have no products in your cart!!",
        });

    if (checkCart._id != cartId)
      return res
        .status(400)
        .send({ status: false, message: "please enter your own cart id" });

    //total quantity of products in cart
    let sum = 0;
    const x = checkCart.items.forEach((ele) => {
      sum += ele.quantity;
    });
    
    const totalproducts = sum;

    if (cancellable) {
      if (typeof cancellable != "boolean")
        return res
          .status(400)
          .send({
            status: false,
            message: "cancellable must be either true or false",
          });

      cancellable = requestBody.cancellable;
    }

    const orderDetails = {
      userId: userIdFromParam,
      items: checkCart.items,
      totalItems: checkCart.totalItems,
      totalPrice: checkCart.totalPrice,
      totalQuantity: totalproducts,
      cancellable: cancellable,
      status: "pending",
      isDeleted: false,
      deletedAt: null,
    };

    const orderCreated = await orderModel.create(orderDetails);
    let cartWithProductDetails = await orderModel
      .findOne({ userId: userIdFromParam })
      .populate("items.productId");

    let cartData = await cartModel.findOneAndUpdate(
      { _id: cartId, userId: userIdFromParam },
      { items: [], totalPrice: 0, totalItems: 0 }
    );

    return res
      .status(201)
      .send({
        status: true,
        message: "order created",
        data: cartWithProductDetails,
      });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateOrder = async function (req, res) {
  try {
    let userIdFromParam = req.params.userId;
    let requestBody = req.body;

    const { orderId, status } = requestBody;

    if (validation.isValidBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "Order data is required " });
    }

    if (!isValidObjectId(orderId))
      return res
        .status(400)
        .send({ status: false, message: `Invalid orderId ${requestBody.orderId} !` });

    let checkOrder = await orderModel.findOne({
      _id: requestBody.orderId,
      isDeleted: false,
    });
    if (!checkOrder)
      return res
        .status(404)
        .send({
          status: false,
          message: `No order found by this UserId: ${requestBody.orderId} !`,
        });


        if(checkOrder.userId!=userIdFromParam)
        return res
        .status(404)
        .send({
          status: false,
          message: `No order found by this UserId: ${userIdFromParam} !`,
        });

    if (!["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).send({
        status: false,
        message: "status should be from [pending, completed, cancelled]",
      });
    }
// console.log(checkOrder)



if(checkOrder.cancellable === true && requestBody.status==="cancelled"){
  const updateStatus = await orderModel.findOneAndUpdate(
    { _id: orderId },
    { $set: { status: "cancelled" } },
    { new: true }
  );
  return res.status(200).send({status:true, message:"Order cancelled", data:updateStatus})
}

    if (checkOrder.status === "completed") {
      return res.status(400).send({
        status: false,
        message: "Order completed, now its status can not be updated",
      });
    }

    if (checkOrder.status === "cancelled" && requestBody.status==="pending") {
      return res.status(400).send({
        status: false,
        message: "you have already cancelled this order",
      });
    }
         

    if (status === "cancelled" && checkOrder.cancellable === false) {
      return res
        .status(400)
        .send({ status: false, message: "This order can not be cancelled" });
    }
  

    if (status === "pending") {
      return res
        .status(400)
        .send({ status: false, message: "order status is already pending" });
    }

    const updateStatus = await orderModel.findOneAndUpdate(
      { _id: orderId },
      { $set: { status: status } },
      { new: true }
    );

    res.status(200).send({
      status: true,
      message: "order status updated",
      data: updateStatus,
    });

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
module.exports = { createOrder, updateOrder };
