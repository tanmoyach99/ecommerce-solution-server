const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Order = require("../models/order");
const uniqueid = require("uniqueid");

exports.userCart = async (req, res) => {
  const { cart } = req.body;
  //   console.log(cart);

  let products = [];

  const user = await User.findOne({ email: req.user.email }).exec();

  //check if cart with logged in user id already exist

  let cartExistByThisUser = await Cart.findOne({ orderedBy: user._id }).exec();

  if (cartExistByThisUser) {
    cartExistByThisUser.remove();
    console.log("remove old carts");
  }

  for (let i = 0; i < cart.length; i++) {
    let object = {};
    object.product = cart[i]._id;
    object.count = cart[i].count;
    object.color = cart[i].color;
    //get price for getting total price
    let { price } = await Product.findById(cart[i]._id).select("price").exec();
    object.price = price;

    products.push(object);
  }
  // console.log('products',products);

  let cartTotal = 0;

  for (let i = 0; i < products.length; i++) {
    cartTotal = cartTotal + products[i].price * products[i].count;
  }
  // console.log("cartTotal",cartTotal)
  let newCart = await new Cart({
    products,
    cartTotal,
    orderedBy: user._id,
  }).save();

  res.json({ ok: true });
};

exports.user = async (req, res) => {
  const userGet = await User.findOne({ email: req.user?.email }).exec();
  // console.log(userGet);
  res.json(userGet);
};

exports.getUserCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();

  let cart = await Cart.findOne({ orderedBy: user._id })
    .populate("products.product", "_id title price totalAfterDiscount")
    .exec();
  console.log(cart);

  if (cart !== null) {
    const { products, cartTotal, totalAfterDiscount } = cart;
    res.json({ products, cartTotal, totalAfterDiscount });
  }
};

exports.emptyCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();

  const cart = await Cart.findOneAndRemove({ orderedBy: user._id }).exec();
  res.json(cart);
};

exports.userAddress = async (req, res) => {
  const userAddress = await User.findOneAndUpdate(
    { email: req.user.email },
    { address: req.body.address }
  ).exec();

  res.json({ ok: true });
};

exports.applyCoupon = async (req, res) => {
  const { coupon } = req.body;
  //   console.log(coupon);
  const validCoupon = await Coupon.findOne({ name: coupon }).exec();
  if (validCoupon === null) {
    return res.json({
      err: "invalid Coupon",
    });
  }

  //   console.log("valid coupon", validCoupon);

  const user = await User.findOne({ email: req.user.email }).exec();

  let { products, cartTotal } = await Cart.findOne({ orderedBy: user._id })
    .populate("products.product", "_id title price")
    .exec();

  //    .populate("products.product", "_id title price")
  //   2nd argument is for the field you chose to populate

  //total after applying coupon to
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);

  await Cart.findOneAndUpdate(
    { orderedBy: user._id },
    { totalAfterDiscount },
    { new: true }
  ).exec();
  res.json(totalAfterDiscount);
};
exports.createOrder = async (req, res) => {
  const { paymentIntent } = req.body.stripeResponse;
  const user = await User.findOne({ email: req.user.email }).exec();

  let { products } = await Cart.findOne({ orderedBy: user._id }).exec();

  const newOrder = await new Order({
    products,
    paymentIntent,
    orderedBy: user._id,
  }).save();

  //product stock and sold count updated accordingly

  let bulkOption = products.map((item) => {
    return {
      updateOne: {
        filter: {
          _id: item.product._id,
        },
        update: {
          $inc: { quantity: -item.count, sold: +item.count },
        },
      },
    };
  });
  let updated = await Product.bulkWrite(bulkOption, {});

  res.json({ ok: true });
};

exports.orders = async (req, res) => {
  let user = await User.findOne({ email: req.user.email }).exec();
  console.log(user, "user");

  let userOrders = await Order.find({ orderedBy: user._id })
    .populate("products.product")
    .exec();

  res.json(userOrders);
};
exports.addToWishList = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $addToSet: { wishlist: productId } }
  ).exec();

  res.json({ ok: true });
};

exports.wishlist = async (req, res) => {
  const list = await User.findOne({ email: req.user.email })
    .select("wishlist")
    .populate("wishlist")
    .exec();
  res.json(list);
};

exports.wishlistUpdate = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $pull: { wishlist: productId } }
  ).exec();
  res.json({ ok: true });
};

exports.createCashOrder = async (req, res) => {
  const { COD, couponApplied } = req.body;
  if (!COD) {
    return res.status(400).send("Create cash on delivery ordered falied");
  }

  //if COD is true,create order with cash on delivery
  const user = await User.findOne({ email: req.user.email }).exec();

  let userCart = await Cart.findOne({ orderedBy: user._id }).exec();

  let finalAmount = 0;
  if (req.body.couponApplied && userCart.totalAfterDiscount) {
    finalAmount = userCart.totalAfterDiscount * 100;
  } else {
    finalAmount = userCart.cartTotal * 100;
  }

  const newOrder = await new Order({
    products: userCart.products,
    paymentIntent: {
      id: uniqueid(),
      amount: finalAmount,
      currency: "usd",
      status: "Cash On Delivery",
      created: Date.now(),
      payment_method_types: ["Cash"],
    },
    orderedBy: user._id,
    orderStatus: "Cash On Delivery",
  }).save();

  //product stock and sold count updated accordingly

  let bulkOption = userCart.products.map((item) => {
    return {
      updateOne: {
        filter: {
          _id: item.product._id,
        },
        update: {
          $inc: { quantity: -item.count, sold: +item.count },
        },
      },
    };
  });
  let updated = await Product.bulkWrite(bulkOption, {});

  console.log(newOrder);

  res.json({ ok: true });
};
