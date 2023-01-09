const express = require("express");

const productRouter = express.Router();

const { authCheck, adminCheck } = require("../middlewares/authmiddle");
const {
  create,
  listAll,
  remove,
  read,
  update,
  getProductList,
  totalCount,
  productRating,
  listRelated,
  searchFilters,
} = require("../controllers/productController");

productRouter.post("/product", authCheck, adminCheck, create);
productRouter.post("/products", getProductList);
productRouter.get("/products/total", totalCount);
productRouter.get("/products/update/:slug", read);
productRouter.get("/products/:count", listAll);
productRouter.delete("/product/:slug", authCheck, adminCheck, remove);
productRouter.put("/product/:slug", authCheck, adminCheck, update);

//rating
productRouter.put("/product/star/:productId", authCheck, productRating);
//related
productRouter.get("/products/related/:productId", listRelated);

productRouter.post("/search/filters", searchFilters);

module.exports = productRouter;
