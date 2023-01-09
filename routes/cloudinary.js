const express = require("express");

const cloudinaryRouter = express.Router();

const { authCheck, adminCheck } = require("../middlewares/authmiddle");

const { upload, remove } = require("../controllers/imageController");

cloudinaryRouter.post("/upload", authCheck, adminCheck, upload);
cloudinaryRouter.post("/remove", authCheck, adminCheck, remove);

module.exports = cloudinaryRouter;
