const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      maxlength: 300,
      text: true,
    },
    slug: {
      type: String,
      unique: true,
      text: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 20000,
      text: true,
    },
    price: {
      type: Number,
      required: true,
      maxlength: 32,
      trim: true,
    },
    category: {
      type: ObjectId,
      ref: "Category",
    },
    subs: [
      {
        type: ObjectId,
        ref: "SubCategory",
      },
    ],
    quantity: Number,
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
    },
    shipping: {
      type: String,
      enum: ["Yes", "No"],
    },
    color: {
      type: String,
      enum: [
        "Black",
        "Brown",
        "Silver",
        "White",
        "Blue",
        "Unknown",
        "Not mentioned",
      ],
    },
    brand: {
      type: String,
      enum: ["Apple", "HP", "Lenovo", "Acer", "ASUS", "Unknown"],
    },
    postedBy: {},
    ratings: [
      {
        star: Number,
        postedBy: {
          type: ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
