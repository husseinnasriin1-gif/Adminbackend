const db = require("../config/db");

const Course = {
  // Find all courses
  findAll: async () => {
    const [rows] = await db.execute("SELECT * FROM course_list ORDER BY created_at DESC");
    return rows;
  },

  // Calculate live statistical aggregates
  getStats: async () => {
    const [[stats]] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM course_list
    `);
    return {
      total: stats.total || 0,
      active: stats.active || 0,
      inactive: stats.inactive || 0
    };
  },

  // Insert a record
  create: async (name, status) => {
    const [result] = await db.execute(
      "INSERT INTO course_list (name, status) VALUES (?, ?)", 
      [name, status || "active"]
    );
    return result;
  },

  // Update a record
  update: async (id, name, status) => {
    const [result] = await db.execute(
      "UPDATE course_list SET name = ?, status = ? WHERE id = ?", 
      [name, status, id]
    );
    return result;
  },

  // Delete a record
  delete: async (id) => {
    const [result] = await db.execute("DELETE FROM course_list WHERE id = ?", [id]);
    return result;
  }
  
};

module.exports = Course;
