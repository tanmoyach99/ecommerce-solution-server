const express = require("express");

const authRouter = express.Router();

const { authCheck, adminCheck } = require("../middlewares/authmiddle");
const {
  createOrUpdateUser,
  currentUser,
} = require("../controllers/authController");

authRouter.post("/create-or-update-user", authCheck, createOrUpdateUser);
authRouter.post("/current-user", authCheck, currentUser);
authRouter.post("/current-admin", authCheck, adminCheck, currentUser);

module.exports = authRouter;
