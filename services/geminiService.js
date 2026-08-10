require("dotenv").config();

// Live, production-ready stable tier endpoint for Google Gemini
const MODEL = "gemini-flash-latest";

// Auth keys (the new "AQ." format from AI Studio) must be sent via the
// x-goog-api-key header, NOT as a ?key= query param. The query-param method
// only works with legacy "AIzaSy" Standard keys, which Google is retiring.
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`;

const SYSTEM_PROMPT = `You are "Afribot Assistant", an AI customer service agent for Afribot Robotics. Your tone is energetic, welcoming, helpful, and highly knowledgeable about STEM and automation. Keep answers concise. Always direct users to the official contact lines for bookings or partnerships.

Use ONLY the following company details to answer. If asked anything unrelated to Afribot Robotics, politely state that you can only assist with questions about Afribot.

COMPANY INFO:
- Company name: Afribot Robotics
- Locations:
  - Mombasa HQ: Jomo Kenyatta Avenue, Mombasa, Kenya
  - Mombasa Skills Center: Mombasa Mall, 2nd Floor
  - Nairobi Office: Adanian Labs, Westlands, Nairobi, Kenya
- Contacts:
  - Phone: +254 701 518 100
  - Email: info@afribot.africa
  - WhatsApp: https://wa.link
- Operating hours (Mombasa Mall):
  - Youth and Adults: Monday to Friday, 4:00 PM to 10:00 PM
  - Kids and Teenagers: Weekdays & Weekends, 8:00 AM to 4:00 PM

CORE SERVICES:
1. STEM Education:
   - Robotics & Coding Clubs for K-12 Schools
   - FUNSTEM Camps
   - Educational Aerial Drones testing & training
   - Teachers Training & Certification (Project: 1Million STEM Teachers 4 Africa)
2. Industrial Automation & Commercial Robotics:
   - Restaurant & Delivery Table Robots (waiter automation)
   - Industrial Robot Arms calibration & programming (e.g., ABB Robots)
   - Inventory Drones and Industrial Inspection Robots
   - E-Mobility & Retrofitting (Green port solutions with Green Fuels Automotive Technology)

COMMON FAQS:
Q: Where is the main skills training center located?
A: Our flagship Skills Center 001 is located on the 2nd Floor of Mombasa Mall. It is designed to empower innovators and solve the skills retention gap.

Q: How do I sign my child up for robotics or coding classes?
A: You can book a slot via our WhatsApp link (https://wa.link) or call us directly at +254701518100 to check for ongoing weekend or holiday camp availability.

Q: Do you provide business automation solutions?
A: Yes. We design and install smart tech including table delivery robots for restaurants, warehouse inventory drones, and access control machinery. Contact info@afribot.africa for a consult.`;

// Explicitly filter out any "system" items from the chat conversation array
function toGeminiContents(messages) {
  const pureChatTurns = messages.filter((m) => m.role !== "system" && m.role !== "developer");

  return pureChatTurns.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function streamChatCompletion(messages) {
  const maxRetries = 3;
  let attempt = 0;

  // Grab any dynamic website context passed down by the controller
  const controllerSystemMsg = messages.find((m) => m.role === "system")?.content || "";

  // Combine your base rules with your live scraped website context
  const fullSystemGrounding = `${SYSTEM_PROMPT}\n\nADDITIONAL REAL-TIME WEBSITE CONTEXT:\n${controllerSystemMsg}`;

  while (attempt <= maxRetries) {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY, // auth key goes here, not in the URL
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: fullSystemGrounding }], // Combines static prompt + scraped web info safely
        },
        contents: toGeminiContents(messages), // Sends only clean user/model text messages
        generationConfig: {
          maxOutputTokens: 1024,
        },
      }),
    });

    if (response.ok) {
      return response;
    }

    const errorBody = await response.text();

    if ((response.status === 429 || response.status === 503) && attempt < maxRetries) {
      attempt += 1;
      const delayMs = 1000 * 2 ** attempt;
      console.log(`Gemini API ${response.status}, retrying in ${delayMs}ms (attempt ${attempt}/${maxRetries})`);
      await sleep(delayMs);
      continue;
    }

    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  throw new Error("Gemini API error: max retries exceeded");
}

module.exports = { streamChatCompletion };