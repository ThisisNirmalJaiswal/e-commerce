    const mongoose = require("mongoose");
    const ObjectId = mongoose.Schema.Types.ObjectId;

    const orederSchema = new mongoose.Schema(
    {
        userId: {type:ObjectId, ref: "User", required:true, trim:true},
        items: [{
            productId: {type: ObjectId, ref:"product", required:true, trim:true},
            quantity: {type:Number, required:true, min:1, trim:true}
        }],
        totalPrice: {type:Number, required:true, trim:true, },
        totalItems: {type:Number, required:true, trim:true, },
        totalQuantity: {type:Number, required:true, trim:true,},
        cancellable: {type:Boolean, default: true, trim:true},
        status: {type:String, default: 'pending', trim:true, enum:["pending", "completed", "cancelled"]},
        deletedAt: {type:Date}, 
        isDeleted: {type:Boolean, default: false},
        },{timestamps:true});


        module.exports = mongoose.model("order", orederSchema);