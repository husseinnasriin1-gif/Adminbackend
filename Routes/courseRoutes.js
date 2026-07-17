const express = require("express");
const router = express.Router();
const Course = require("../model/Course"); // Connects directly to the model

// 1. GET ALL COURSES AND STATS
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.findAll();
    const stats = await Course.getStats();
    return res.json({ courses, stats });
  } catch (error) {
    console.error("Fetch courses error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 2. ADD A NEW COURSE
router.post("/courses", async (req, res) => {
  const { name, status } = req.body;
  if (!name) return res.status(400).json({ message: "Course name is required" });

  try {
    await Course.create(name, status);
    return res.status(201).json({ message: "Course added successfully" });
  } catch (error) {
    console.error("Create course error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 3. EDIT A COURSE
router.put("/courses/:id", async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  try {
    await Course.update(id, name, status);
    return res.json({ message: "Course updated successfully" });
  } catch (error) {
    console.error("Update course error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 4. DELETE A COURSE
router.delete("/courses/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Course.delete(id);
    return res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
