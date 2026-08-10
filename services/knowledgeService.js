// services/knowledgeService.js

// A dictionary mapping common user query keywords to factual content blocks
// specific to Afribot Robotics. Extend this list as new common questions come in.
const websiteData = [
  {
    keywords: ["hours", "open", "time", "close", "schedule", "when"],
    text: "Operating hours at the Mombasa Mall Skills Center: Youth and Adults — Monday to Friday, 4:00 PM to 10:00 PM. Kids and Teenagers — Weekdays & Weekends, 8:00 AM to 4:00 PM.",
  },
  {
    keywords: ["location", "address", "where", "mombasa", "nairobi", "office", "center", "centre"],
    text: "Afribot Robotics locations: Mombasa HQ on Jomo Kenyatta Avenue, Mombasa, Kenya. Mombasa Skills Center on the 2nd Floor of Mombasa Mall. Nairobi Office at Adanian Labs, Westlands, Nairobi, Kenya.",
  },
  {
    keywords: ["contact", "email", "phone", "support", "help", "call", "reach", "whatsapp"],
    text: "Contact Afribot Robotics: Phone +254 701 518 100, Email info@afribot.africa, WhatsApp https://wa.link.",
  },
  {
    keywords: ["enroll", "sign up", "signup", "register", "join", "class", "classes", "camp", "kids", "child", "children"],
    text: "To sign up for robotics or coding classes, book a slot via WhatsApp (https://wa.link) or call +254701518100 to check ongoing weekend or holiday camp availability. Core STEM education offerings include Robotics & Coding Clubs for K-12 Schools, FUNSTEM Camps, Educational Aerial Drones testing & training, and Teachers Training & Certification under the '1Million STEM Teachers 4 Africa' project.",
  },
  {
    keywords: ["business", "automation", "industrial", "robot arm", "drone", "inventory", "retrofit", "e-mobility", "restaurant"],
    text: "Afribot designs and installs industrial automation and commercial robotics: restaurant & delivery table robots (waiter automation), industrial robot arm calibration & programming (e.g. ABB Robots), inventory drones and industrial inspection robots, and E-Mobility & Retrofitting green port solutions with Green Fuels Automotive Technology. Contact info@afribot.africa for a consult.",
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good evening", "good afternoon"],
    text: "Greet the user warmly and ask how you can help them with Afribot Robotics' STEM education or automation services today.",
  },
];

/**
 * Searches the local knowledge blocks for matches against user input words
 * @param {string} query - The raw user question
 * @returns {string} Combined matched knowledge blocks, or a general fallback summary
 */
function getWebsiteContext(query) {
  if (!query) return "No specific query provided.";

  const lowerQuery = query.toLowerCase();
  const matchedBlocks = [];

  for (const item of websiteData) {
    const hasKeyword = item.keywords.some((keyword) => lowerQuery.includes(keyword.toLowerCase()));
    if (hasKeyword) {
      matchedBlocks.push(item.text);
    }
  }

  // If keywords match, return them joined together.
  // Otherwise, return all text blocks as a broad context foundation.
  if (matchedBlocks.length > 0) {
    return matchedBlocks.join("\n");
  } else {
    return websiteData.map((item) => item.text).join("\n");
  }
}

module.exports = { getWebsiteContext };