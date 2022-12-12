const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const ahjEditorController = require("../controllers/ahjEditor");
const dashboardController = require("../controllers/dashboard");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.get("/", ahjEditorController.getAhjEditor);
router.get("/viewAhj", ahjEditorController.getAhjView);
router.get("/addAhj", ahjEditorController.getAddAhj);
router.post("/saveAhj", ahjEditorController.postAhjEditor);


module.exports = router;