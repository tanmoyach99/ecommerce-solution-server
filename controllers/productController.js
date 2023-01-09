const Product = require("../models/product");
const slugify = require("slugify");
const User = require("../models/user");

exports.create = async (req, res) => {
  try {
    // console.log(req.body);
    req.body.slug = slugify(req.body.title);
    const newProduct = await new Product(req.body).save();
    res.json(newProduct);
  } catch (err) {
    console.log(err);
    res.json({ err: err.message });
    // res.status(404).send("create product failed");
  }
};

exports.read = async (req, res) => {
  console.log(req.body);
  let singleProduct = await Product.findOne({ slug: req.params.slug })
    .populate("category")
    .populate("subs")
    .exec();
  res.json(singleProduct);
};

exports.listAll = async (req, res) => {
  let products = await Product.find({})
    .limit(parseInt(req.params.count))
    .populate("category")
    .populate("subs")
    .sort([["createdAt", "desc"]])
    .exec();

  console.log("products have found", products);
  res.json(products);
};

exports.remove = async (req, res) => {
  try {
    let deletedProducts = await Product.findOneAndRemove({
      slug: req.params.slug,
    }).exec();
    res.json(deletedProducts);
  } catch (err) {
    return res.json("product delete error");
  }
};

exports.update = async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    let updateProducts = await Product.findOneAndUpdate(
      {
        slug: req.params.slug,
      },
      req.body,
      { new: true }
    ).exec();
    res.json(updateProducts);
  } catch (err) {
    console.log(err);
    return res.status(400).send("product update failed");
  }
};

exports.getProductList = async (req, res) => {
  try {
    const { sort, order, page } = req.body;
    const currentPage = page || 1;
    const perPage = 3;
    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .populate("category")
      .populate("subs")
      .sort([[sort, order]])
      .limit(perPage)
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

// exports.getProductList = async (req, res) => {
//   try {
//     const { sort, order, limit } = req.body;
//     const products = await Product.find({})
//       .populate("category")
//       .populate("subs")
//       .sort([[sort, order]])
//       .limit(limit)
//       .exec();

//     res.json(products);
//   } catch (err) {
//     console.log(err);
//   }
// };

exports.totalCount = async (req, res) => {
  let total = await Product.estimatedDocumentCount().exec();
  console.log(total);

  res.json(total);
};

exports.productRating = async (req, res) => {
  // console.table(req.body);
  let product = await Product.findById(req.params.productId).exec();
  let user = await User.findOne({ email: req.user.email });
  let { star } = req.body;

  let existingRatingObject = product.ratings.find(
    (el) => el.postedBy.toString() === user._id.toString()
  );

  if (existingRatingObject === undefined) {
    let ratingAdded = await Product.findByIdAndUpdate(
      product._id,
      {
        $push: {
          ratings: {
            star,
            postedBy: user._id,
          },
        },
      },
      { new: true }
    ).exec();
    res.json(ratingAdded);
    console.log(ratingAdded);
  } else {
    let ratingUpdated = await Product.updateOne(
      {
        ratings: {
          $elemMatch: existingRatingObject,
        },
      },
      {
        $set: { "ratings.$.star": star },
      },
      {
        new: true,
      }
    ).exec();
    res.json(ratingUpdated);
    console.log(ratingUpdated, "rating updated");
  }
};

exports.listRelated = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec();
  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
  })
    .limit(3)
    .populate("category")
    .populate("subs")
    .exec();
  console.log("related", related);
  res.json(related);
};

//search and filters

const handleQuery = async (req, res, query) => {
  const products = await Product.find({ $text: { $search: query } })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .exec();

  res.json(products);
};

const handlePrice = async (req, res, price) => {
  try {
    const product = await Product.find({
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .exec();
    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

const handleCategory = async (req, res, category) => {
  try {
    const products = await Product.find({ category })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleStars = (req, res, stars) => {
  console.log(req.body);
  Product.aggregate([
    {
      $project: {
        document: "$$ROOT",
        floorAverage: {
          $floor: { $avg: "$ratings.star" },
        },
      },
    },
    {
      $match: { floorAverage: stars },
    },
  ])
    .limit(12)
    .exec((err, aggregates) => {
      if (err) {
        console.log(err);
      } else {
        Product.find({ _id: aggregates })
          .populate("category", "_id name")
          .populate("subs", "_id name")
          .exec((err, products) => {
            if (err) console.log("product aggregate error", err);
            else {
              console.log(products);
              res.json(products);
            }
          });
      }
    });
};

const handleSub = async (req, res, sub) => {
  const products = await Product.find({ subs: sub })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .exec();
  res.json(products);
};

const handleShipping = async (req, res, shipping) => {
  const products = await Product.find({ shipping })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .exec();
  res.json(products);
};
const handleColor = async (req, res, color) => {
  const products = await Product.find({ color })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .exec();
  res.json(products);
};
const handleBrand = async (req, res, brand) => {
  const products = await Product.find({ brand })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .exec();
  res.json(products);
};

exports.searchFilters = async (req, res) => {
  const { query, price, category, stars, sub, shipping, brand, color } =
    req.body;
  if (query) {
    await handleQuery(req, res, query);
  }
  if (price !== undefined) {
    console.log(price);
    await handlePrice(req, res, price);
  }
  if (category) {
    await handleCategory(req, res, category);
  }
  if (stars) {
    handleStars(req, res, stars);
  }
  if (sub) {
    await handleSub(req, res, sub);
  }
  if (shipping) {
    await handleShipping(req, res, shipping);
  }
  if (brand) {
    await handleBrand(req, res, brand);
  }
  if (color) {
    await handleColor(req, res, color);
  }
};
