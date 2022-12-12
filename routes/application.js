const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const applicationController = require("../controllers/application");
const dashboardController = require("../controllers/dashboard");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.get("/", applicationController.getApplication);


module.exports = router;