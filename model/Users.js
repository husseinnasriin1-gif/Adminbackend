const db = require("../config/db");
// 1. Import the hashing utility dependency
const bcrypt = require("bcryptjs"); 

const User = {
  // Execute selection query ordered by creation timestamp
  findAll: async () => {
    const [rows] = await db.execute("SELECT * FROM users ORDER BY created_at DESC");
    return rows;
  },

  // Compute database counters for status states
  getStats: async () => {
    const [[stats]] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN LOWER(status) = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN LOWER(status) = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM users
    `);
    return {
      total: Number(stats.total || 0),
      active: Number(stats.active || 0),
      inactive: Number(stats.inactive || 0)
    };
  },

  // Execute row deletion query safely using parameter arrays
  delete: async (id) => {
    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);
    return result;
  },
  updatePassword: async (userId, hashedPassword) => {
    const [result] = await db.execute(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
      [hashedPassword, userId]
    );
    return result;
  },


  // ✨ SECURED: Automatically hashes the plain-text password upon creation
  create: async (userData) => {
    const { name, email, password, role, status } = userData;
    
    // Hash the raw text with a safe cost factor of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
      [name, email, hashedPassword, role, status]
    );
    return result;
  },

  // ✨ SECURED: Handles clean, selective password updates
  update: async (id, userData) => {
    const { name, email, password, role, status } = userData;

    // Dynamically check if a password modification was requested by the user
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await db.execute(
        "UPDATE users SET name = ?, email = ?, password = ?, role = ?, status = ?, updated_at = NOW() WHERE id = ?",
        [name, email, hashedPassword, role, status, id]
      );
      return result;
    } else {
      // Update everything EXCEPT the password field if it was left blank
      const [result] = await db.execute(
        "UPDATE users SET name = ?, email = ?, role = ?, status = ?, updated_at = NOW() WHERE id = ?",
        [name, email, role, status, id]
      );
      return result;
    }
  }
};

module.exports = User;
