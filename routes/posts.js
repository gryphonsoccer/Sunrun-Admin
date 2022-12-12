const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const dashboardController = require("../controllers/dashboard");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
/*
router.get("/:id", ensureAuth, dashboardController.getPost);

router.post("/createPost", upload.single("file"), dashboardController.createPost);

router.put("/likePost/:id", dashboardController.likePost);

router.delete("/deletePost/:id", dashboardController.deletePost);

module.exports = router;
*/