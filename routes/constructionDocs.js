const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const constructionDocsController = require("../controllers/constructionDocs");
const dashboardController = require("../controllers/dashboard");
const { ensureAuth, ensureGuest } = require("../middleware/auth");
const upload = require("../middleware/multer");

//Main Routes - simplified for now
router.get("/", constructionDocsController.getConstructionDocs);
router.post('/postConstructionDocs',upload.any('deliverables-temp'),constructionDocsController.postConstructionDocs)
router.get("/deleteDocs", constructionDocsController.deleteConstructionDocs);
router.get("/deleteLabels", constructionDocsController.deleteLabels);
router.get("/deleteMergedDocs", constructionDocsController.deleteMergedDocs);
router.get("/mergeDocs", constructionDocsController.mergeDocs);
router.get("/downloadDocs/:id", constructionDocsController.downloadDocs);

module.exports = router;