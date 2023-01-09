const User = require("../models/user");
const Order = require("../models/order");

exports.orders = async (req, res) => {
  let orders = await Order.find({})
    .sort("_createdAt")
    .populate("products.product")
    .exec();
  res.json(orders);
};

exports.orderStatus = async (req, res) => {
  const { orderId, orderStatus } = req.body;

  let updatedOrders = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus },
    { new: true }
  ).exec();

  res.json(updatedOrders);
};
