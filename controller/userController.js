const User = require('../model/Users');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const items = await User.findAll();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getUserStats: async (req, res) => {
    try {
      const stats = await User.getStats();
      return res.json(stats);
    } catch (err) {
      console.error("⛔ DATABASE CRASH DETAILS:", err);
      res.status(500).json({ error: err.message });
    }
  },

  createUser: async (req, res) => {
    try {
      const { name, email, password, role, status } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password fields are required" });
      }
      const result = await User.create({ name, email, password, role, status });
      res.status(201).json({ success: true, insertId: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 🆕 Add this controller handler to process modification requests
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, password, role, status } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email field is required" });
      }

      const result = await User.update(id, { name, email, password, role, status });

      if (result && result.affectedRows === 0) {
        return res.status(404).json({ error: "User profile not found in database" });
      }

      res.json({ success: true, message: "User profile updated successfully" });
    } catch (err) {
      console.error("Controller update operation error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await User.delete(id);
      if (result && result.affectedRows === 0) {
        return res.status(404).json({ error: "User profile not found in database" });
      }
      res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = userController;
