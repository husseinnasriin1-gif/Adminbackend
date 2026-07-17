const User = require("../model/Users");
const bcrypt = require("bcrypt");

// 1. GET: Fetch user profile details
exports.getSettingsProfile = async (req, res) => {
  try {
    const rows = await User.findAll(); 
    const activeUser = rows.find(u => u.id === 1); // Testing ID fallback
    
    if (!activeUser) {
      return res.status(404).json({ error: "Profile record not found." });
    }

    return res.json({
      name: activeUser.name || "Nasreen",
      email: activeUser.email,
      role: activeUser.role || "Student"
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 2. PUT: Update Profile text fields
exports.updateProfileData = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    await User.update(1, { name, email, role, status: 'Active' });
    return res.json({ success: true, message: "Profile settings modified successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 3. PUT: Update Password (Placeholder from your router)
exports.updateAccountPassword = async (req, res) => {
  try {
    // 🔴 FIX 1: Extract "newPassword" from req.body (NOT hashedPassword)
    const { currentPassword, newPassword } = req.body;
    const userId = 1; // Testing fallback placeholder tracking Nasreen

    // Guard clause against empty payloads
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Missing required password fields." });
    }

    const rows = await User.findAll();
    const activeUser = rows.find(u => u.id === userId);
    
    if (!activeUser) {
      return res.status(404).json({ error: "User configuration not found." });
    }

    const match = await bcrypt.compare(currentPassword, activeUser.password);
    if (!match) {
      return res.status(400).json({ error: "The current password provided is incorrect." });
    }

    const saltRounds = 10;
    // 🔴 FIX 2: Create the hash here from the clean frontend text field
    const securedPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 🔴 FIX 3: Ensure neither argument going into the array is undefined
    await User.updatePassword(userId, securedPasswordHash);

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 4. DELETE: Purge account (Placeholder from your router)
exports.purgeAccountSelf = async (req, res) => {
  try {
    // Add delete logic here using your model
    return res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
