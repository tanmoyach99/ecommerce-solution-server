const express = require("express");

const subCategoryRouter = express.Router();

const { authCheck, adminCheck } = require("../middlewares/authmiddle");
const {
  create,
  read,
  update,
  remove,
  list,
} = require("../controllers/subController");

subCategoryRouter.post("/subCategory", authCheck, adminCheck, create);
subCategoryRouter.get("/subCategories", list);
subCategoryRouter.get("/subCategory/:slug", read);
// subCategoryRouter.get("/subCategory/category", readCategory);
subCategoryRouter.put("/subCategory/:slug", authCheck, adminCheck, update);

subCategoryRouter.delete("/subCategory/:slug", authCheck, adminCheck, remove);

module.exports = subCategoryRouter;
