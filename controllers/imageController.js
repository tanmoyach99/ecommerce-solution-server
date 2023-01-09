const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// cloudinary.config({
//   cloud_name: "dvzn2mpvu",
//   api_key: "593229835317812",
//   api_secret: "tJfk0VF_ecLMwsgUYQDnbsdT0YE",
// });

//req.files.file.path
exports.upload = async (req, res) => {
  try {
    let result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `${Date.now()}`,
      resource_type: "auto",
    });
    // console.log(result);
    res.json({
      public_id: result.public_id,
      url: result.secure_url,
    });
  } catch (err) {
    res.json(err);
    // console.log(err);
  }
};

exports.remove = async (req, res) => {
  try {
    let image_id = req.body.public_id;

    cloudinary.uploader.destroy(image_id, (err, result) => {
      if (err) return res.json({ success: false, err });
      res.send("ok");
    });
  } catch (err) {
    res.json(err);
  }
};
