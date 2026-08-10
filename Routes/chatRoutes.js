const express = require("express");
const chatController = require("../controller/chatController");

const router = express.Router();

router.post("/chat", chatController.sendMessage);

module.exports = router;