const SubCategory = require("../models/subCategory");
const slugify = require("slugify");
const Product = require("../models/product");
const Category = require("../models/category");

exports.create = async (req, res) => {
  try {
    const { name, parent } = req.body;

    const subCategory = await new SubCategory({
      name,
      parent,
      slug: slugify(name),
    }).save();
    res.json(subCategory);
  } catch (err) {
    console.log(err);
    res.status(400).send("Create subCategory failed");
  }
};

exports.list = async (req, res) => {
  const subCategoryList = await SubCategory.find({})
    .sort({ createdAt: -1 })
    .exec();
  res.json(subCategoryList);
};

exports.read = async (req, res) => {
  let subCategory = await SubCategory.findOne({ slug: req.params.slug }).exec();
  let subsProduct = await Product.find({ subs: subCategory })
    .populate("category")
    .exec();
  res.json({ subCategory, subsProduct });
};

exports.update = async (req, res) => {
  try {
    const updated = await SubCategory.findOneAndUpdate(
      { slug: req.params.slug },
      {
        name: req.body.name,
        parent: req.body.parent,
        slug: slugify(req.body.name),
      },
      { new: true }
    );
    console.log(updated);
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(400).send("update subCategory failed");
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await SubCategory.findOneAndDelete({
      slug: req.params.slug,
    });
    console.log(deleted);
    res.json(deleted);
  } catch (err) {
    console.log(err);
    res.status(400).send("create subCategory delete failed");
  }
};

exports.getSubs = (req, res) => {
  SubCategory.find({ parent: req.params._id }).exec((err, subs) => {
    if (err) console.log(err);
    res.json(subs);
  });
};
