const express = require("express");
const router = express.Router();
const Resource = require("../model/Resource");
const upload = require("../middleware/upload"); // Cloudinary Multer middleware
const ResourceController=require("../controller/ResourceController");

router.post("/upload", upload.single("file"), ResourceController.uploadResource);
router.delete("/:id", ResourceController.deleteResource);
router.get("/", ResourceController.getAllResources);
router.get("/stats", ResourceController.getResourceStats);
router.get("/category/:category", ResourceController.getResourcesByCategory);


module.exports = router;