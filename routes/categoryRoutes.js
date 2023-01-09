const express = require("express");

const categoryRouter = express.Router();

const { authCheck, adminCheck } = require("../middlewares/authmiddle");
const {
  create,
  read,
  update,
  remove,
  list,
} = require("../controllers/categoryController");
const { getSubs } = require("../controllers/subController");

categoryRouter.post("/category", authCheck, adminCheck, create);
categoryRouter.get("/categories", list);
categoryRouter.get("/category/:slug", read);
categoryRouter.put("/category/:slug", authCheck, adminCheck, update);

categoryRouter.get("/category/subs/:_id", getSubs);

categoryRouter.delete("/category/:slug", authCheck, adminCheck, remove);

module.exports = categoryRouter;
