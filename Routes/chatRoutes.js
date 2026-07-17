const express = require("express");
const chatController = require("../Controller/chatController");

const router = express.Router();

router.post("/chat", chatController.sendMessage);

module.exports = router;