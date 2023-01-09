const Category = require("../models/category");

const slugify = require("slugify");
const Product = require("../models/product");

exports.create = async (req, res) => {
  console.log(req.body);
  try {
    const { name, images } = req.body;
    const category = await new Category({
      name,
      slug: slugify(name),
      images,
    }).save();

    console.log("category------------>", category);
    res.json(category);
  } catch (err) {
    res.status(400).send("Create category failed");
  }
};

exports.list = async (req, res) => {
  const categoryList = await Category.find({}).sort({ createdAt: -1 }).exec();
  res.json(categoryList);
};

exports.read = async (req, res) => {
  let category = await Category.findOne({ slug: req.params.slug }).exec();

  const categoryProduct = await Product.find({ category })
    .populate("category")
    .populate("subs")
    .exec();
  res.json({ category, categoryProduct });
};

exports.update = async (req, res) => {
  try {
    const updated = await Category.findOneAndUpdate(
      { slug: req.params.slug },
      {
        name: req.body.name,
        images: req.body.images,
        sub: req.body.sub,
        slug: slugify(req.body.name),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(400).send("update failed");
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({ slug: req.params.slug });

    res.json(deleted);
  } catch (err) {
    console.log(err);
    res.status(400).send("create delete failed");
  }
};
