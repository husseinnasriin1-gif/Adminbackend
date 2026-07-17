const chatModel = require("../model/chatModel");

async function sendMessage(req, res) {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const anthropicResponse = await chatModel.streamChatCompletion(messages);

    for await (const chunk of anthropicResponse.body) {
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    console.error("Chat controller error:", err.message);
    res.end();
  }
}

module.exports = { sendMessage };