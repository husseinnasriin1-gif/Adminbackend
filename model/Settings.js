const db = require("../config/db");

const Settings = {
  // 1. Fetch profile configuration parameters for a single student
  getProfile: async (userId) => {
    const [rows] = await db.execute(
      "SELECT id, name, email, role, status FROM users WHERE id = ?", 
      [userId]
    );
    return rows[0]; // Return just the single student object
  },

  // 2. Update general profile settings
  updateProfile: async (userId, name, email, role) => {
    const [result] = await db.execute(
      "UPDATE users SET name = ?, email = ?, role = ?, updated_at = NOW() WHERE id = ?",
      [name, email, role, userId]
    );
    return result;
  },

  // 3. Update only the account password hash
  updatePassword: async (userId, hashedPassword) => {
    const [result] = await db.execute(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
      [hashedPassword, userId]
    );
    return result;
  }
};

module.exports = Settings;
