const express = require("express");
const stripeRouter = express.Router();

const { createPaymentIntent } = require("../controllers/stripeController");

// const {route}=require('./userRoute');

const { authCheck } = require("../middlewares/authmiddle");

stripeRouter.post("/create-payment-intent", authCheck, createPaymentIntent);

module.exports = stripeRouter;
