const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const { isValidObjectId } = require("mongoose");
const createOrder = async function (req,res){
    try{
       let userIdFromParam = req.params.userId
        let requestBody = req.body;
        let {cartId, cancellable} = requestBody

        if(!isValidObjectId(cartId))return res.status(400)
        .send({status:false, message: `Invalid cartId ${cartId} !`});
        


        let checkCart = await cartModel.findOne({ userId: userIdFromParam }).lean();
        if(!checkCart) 
        return res.status(400)
        .send({status:false, message: `No cart found by this UserId: ${userIdFromParam} !`});
        
        
        if(checkCart.items.length == 0) 
        return res.status(400).send({ status: false, message: "You have no products in your cart!!" });
        if(checkCart._id!=cartId)
        return res.status(400)
        .send({ status: false, message: "please enter your own cart id" });
      
//total quantity of products in cart
     let sum = 0
    const x = checkCart.items.forEach((ele)=>{sum += ele.quantity})
    console.log(sum)
    const totalproducts = sum

    if(cancellable){

      if(typeof cancellable != "boolean")
      return res.status(400)
      .send({ status: false, message: "cancellable must be either true or false" });
    
      cancellable = cancellable
    }

    const orderDetails = {
        userId: userIdFromParam,
        items: checkCart.items,
        totalItems: checkCart.totalItems,
        totalPrice: checkCart.totalPrice,
        totalQuantity:totalproducts,
        cancellable: cancellable,
        status: "pending",
        isDeleted: false,
        deletedAt: null,
    };

    const orderCreated = await orderModel.create(orderDetails);
    let cartWithProductDetails = await orderModel.findOne({ userId: userIdFromParam }).populate('items.productId')


    let cartData = await cartModel.findOneAndUpdate(
        { _id:cartId, userId: userIdFromParam },
        { items: [], totalPrice: 0, totalItems: 0 }
      );

      return res
      .status(201)
      .send({ status: true, message: "order created", data: cartWithProductDetails });



    }catch(err){
        return res.status(500).send({status:false, message: err.message})
    }
}

module.exports = {createOrder,}