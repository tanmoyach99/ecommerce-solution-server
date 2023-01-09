const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Coupon = require("../models/coupon");

const stripe = require("stripe")(
  "sk_test_51Iu0RzDVuG4dQji91qi6MgBR3yf2Ou3itdqb9JGSFlMfolbefNBL87rQwQKkd9scRErrT0guiY8zYCFbjCzCK1tV00jhnvxA2m"
);

exports.createPaymentIntent = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();
  const cart = await Cart.findOne({
    orderedBy: user._id,
  }).exec();

  let finalAmount = 0;
  if (req.body.couponApplied && cart?.totalAfterDiscount) {
    finalAmount = cart?.totalAfterDiscount * 100;
  } else {
    finalAmount = cart?.cartTotal * 100;
  }
  //   console.log("cart total charged", cartTotal, totalAfterDiscount);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalAmount,
    currency: "usd",
  });
  console.log(paymentIntent);
  res.send({
    clientSecret: paymentIntent.client_secret,
    cartTotal: cart?.cartTotal,
    totalAfterDiscount: cart?.totalAfterDiscount,
    payable: finalAmount,
  });
};
