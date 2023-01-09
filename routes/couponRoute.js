const express = require("express");

const couponRouter = express.Router();

const { authCheck, adminCheck } = require("../middlewares/authmiddle");
const { create, remove, list } = require("../controllers/couponController");

couponRouter.post("/coupon", authCheck, adminCheck, create);
couponRouter.get("/coupons", list);

couponRouter.delete("/coupons/:couponId", authCheck, adminCheck, remove);

module.exports = couponRouter;
