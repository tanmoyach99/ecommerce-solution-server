const admin = require("../firebase");
const User = require("../models/user");

exports.authCheck = async (req, res, next) => {

  try {
    const idToken = req.headers.authtoken;
    const firebaseUser = await admin.auth().verifyIdToken(idToken);
    req.user = firebaseUser;

    next();
  } catch (err) {
    res.status(401).json({
      err: "Invalid or expire token",
    });
  }
};

exports.adminCheck = async (req, res, next) => {
  console.log(req.user);
 

  const adminUser = await User.findOne({ email: req.user.email }).exec();
  console.log(adminUser);

  if (adminUser.role !== "admin") {
    res.status(403).json({ err: "Admin Resource.access denied" });
  } else {
    next();
  }
};
