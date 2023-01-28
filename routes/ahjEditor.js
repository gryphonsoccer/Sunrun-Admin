const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const ahjEditorController = require("../controllers/ahjEditor");
const dashboardController = require("../controllers/dashboard");
const { ensureAuth, ensureGuest } = require("../middleware/auth");
upload = require("../middleware/multer");


router.get("/", ahjEditorController.getAhjEditor);
router.get("/viewAhj", ahjEditorController.getAhjView);
router.get("/addAhj", ahjEditorController.getAddAhj);
router.post("/saveAhj", ahjEditorController.postAhjEditor);
router.get("/viewApplication", ahjEditorController.getApplication);
router.post('/applicationForm',upload.any('deliverables-temp'),ahjEditorController.postApplication)
//router.post("/coordinates", ahjEditorController.coordinates);
 
module.exports = router; 