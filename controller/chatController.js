const chatModel = require("../model/chatModel");
const { getWebsiteContext } = require("../services/knowledgeService");

async function sendMessage(req, res) {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // 1. Establish the Event Stream headers to keep the connection open
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  try {
    // === GET WEBSITE CONTEXT & INJECT INTO MESSAGES ===
    const latestUserQuery = messages[messages.length - 1]?.content || "";
    const websiteContext = getWebsiteContext(latestUserQuery);

    const systemPrompt = {
      role: "system",
      content: `You are an official customer support AI assistant. Answer the user's question using ONLY the following verified rules and facts extracted directly from our company website. If the answer cannot be found in the context below, politely tell the customer that you don't have that specific information and offer to connect them to support. Do not invent answers.

WEBSITE CONTEXT:
${websiteContext}`,
    };

    const augmentedMessages = [systemPrompt, ...messages];
    // =======================================================

    // 2. Fetch the raw stream response using the augmented messages array
    const response = await chatModel.streamChatCompletion(augmentedMessages);

    // 3. Read the raw readable body buffer chunks
    let buffer = "";

    for await (const chunk of response.body) {
      // response.body yields Uint8Array chunks — must go through Buffer.from()
      // to decode correctly, since Uint8Array.toString() joins raw byte values.
      buffer += Buffer.from(chunk).toString("utf-8");

      // Gemini's SSE events are separated by a blank line, which may be
      // "\n\n" or "\r\n\r\n" depending on the stream — split on both.
      const events = buffer.split(/\r?\n\r?\n/);

      // Keep the last (possibly incomplete) chunk in the buffer for next time
      buffer = events.pop();

      for (const event of events) {
        const lines = event.split("\n").filter((l) => l.startsWith("data: "));
        if (lines.length === 0) continue;

        const jsonStr = lines.map((l) => l.slice(6)).join("").trim();
        if (!jsonStr) continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (text) {
            res.write(text);
          }
        } catch (e) {
          // Gracefully skip partial streaming frames or trailing brackets
        }
      }
    }

    // 4. Close the client socket cleanly when the data stream completes
    res.end();
  } catch (err) {
    console.error("Chat controller streaming error:", err.message);
    console.error("Underlying cause:", err.cause);
    res.write(" [Server Error: Connection to AI lost]");
    res.end();
  }
}

module.exports = { sendMessage };