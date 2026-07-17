const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StudentController = {
  login: async (req, res) => {
    try {
      // Destructure admission number (sent as email/identifier) and raw password from React
      const { admissionNumber, password } = req.body;

      if (!admissionNumber || !password) {
        return res.status(400).json({ error: "Please enter both admission number and password" });
      }

      // 1. Fetch user by email/admission number and ensure they have the 'student' role
      // Adjust column names if your database layout maps admission numbers to a different field
      const [rows] = await db.execute(
        "SELECT * FROM users WHERE email = ? AND LOWER(role) = 'student' LIMIT 1",
        [admissionNumber]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: "Invalid admission number or unauthorized profile." });
      }

      const student = rows[0];

      // 2. Safeguard check against inactive student records
      if (student.status && student.status.toLowerCase() !== "active") {
        return res.status(403).json({ error: "Your student profile is currently deactivated. Contact Admin." });
      }

      // 3. Compare hashed database password against raw frontend user input text
      const isMatch = await bcrypt.compare(password, student.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Incorrect password credentials." });
      }

      // 4. Issue a signed stateless JSON Web Token (JWT)
      // Provide a secret fallback string if process.env.JWT_SECRET is not configured yet
      const token = jwt.sign(
        { id: student.id, name: student.name, email: student.email, role: student.role },
        process.env.JWT_SECRET || "SUPER_SECRET_STUDENT_PASSPHRASE_KEY",
        { expiresIn: "3h" } // Session expires cleanly after 3 hours
      );

      // Return token to frontend storage
      res.json({
        success: true,
        message: "Logged in successfully",
        token,
        student: { id: student.id, name: student.name }
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = StudentController;
