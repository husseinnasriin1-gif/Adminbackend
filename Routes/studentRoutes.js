const express = require("express");
const router = express.Router();
const StudentController = require("../controller/studentController");

// Handles the fetch post request coming from your frontend Resource view
router.post("/students/login", StudentController.login);

module.exports = router;
