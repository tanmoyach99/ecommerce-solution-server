const mongoose = require("mongoose");

// const { objectId } = mongoose.Schema;

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: "String",
      unique: true,
      index: true,
      trim: true,
      required: "Name is required",
      minlength: [2, "Too short"],
      maxlength: [32, "Too long"],
    },
    slug: {
      type: "String",
      unique: true,
      lowercase: true,
      index: true,
    },
    images: {
      type: Array,
    },
    sub: {
      type: Array,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
