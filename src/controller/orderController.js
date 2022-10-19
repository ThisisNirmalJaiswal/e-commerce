const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");

const createOrder = async function (req,res){
    try{
        let userId = req.params.userId;


        let checkCart = await cartModel.findOne({ userId: userId });
        if(!checkCart) return res.status(400).send({status:false, message: `No cart found by this UserId: ${userId} !`});
        if(checkCart.items.length == 0) return res.status(400).send({ status: false, message: "You have no products in your cart!!" });


    }catch(err){
        return res.status(500).send({status:false, message: err.message})
    }
}

module.exports = {createOrder,}