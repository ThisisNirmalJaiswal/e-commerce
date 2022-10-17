const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cardSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", required: true, unique: true },
    items: [
      {
        productId: { ObjectId, ref: "product", required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    totalItems: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("cart", cardSchema);
