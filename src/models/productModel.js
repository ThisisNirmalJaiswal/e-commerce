const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, trim: true },
    currencyId: { type: String, required: true, default: "INR" },
    currencyFormat: { type: String, required: true, default: "₹" },
    isFreeShipping: { type: Boolean, trim:true, default: false },
    productImage: { type: String, required: true }, // s3 link
    style: { type: String, trim:true },
    availableSizes: [
      { type: String, enum: ["S", "XS", "M", "X", "L", "XXL", "XL"] },
    ],
    installments: { type: Number },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
