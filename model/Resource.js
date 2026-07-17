const db = require("../config/db");

const Resource = {
  // Find all resources
  findAll: async () => {
    const [rows] = await db.execute("SELECT * FROM resource_list ORDER BY created_at DESC");
    return rows;
  },

  // Calculate live statistical aggregates for videos and documents
  getStats: async () => {
    const [[stats]] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN file_type = 'video' THEN 1 ELSE 0 END) as videos,
        SUM(CASE WHEN file_type = 'document' THEN 1 ELSE 0 END) as documents
      FROM resource_list
    `);
    return {
      total: Number(stats.total || 0),
      videos: Number(stats.videos || 0),
      documents: Number(stats.documents || 0)
    };
  },

  // Insert a file record
findByCategory: async (category) => {
  const [rows] = await db.execute(
    "SELECT * FROM resource_list WHERE category = ? ORDER BY created_at DESC",
    [category]
  );
  return rows;
},

create: async (title, fileName, fileUrl, fileType, mimeType, fileSize, category) => {
  const [result] = await db.execute(
    "INSERT INTO resource_list (title, file_name, file_url, file_type, mime_type, file_size, category) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, fileName, fileUrl, fileType, mimeType, fileSize, category]
  );
  return result;
},

  // Update a record
  update: async (id, title, fileType) => {
    const [result] = await db.execute(
      "UPDATE resource_list SET title = ?, file_type = ? WHERE id = ?", 
      [title, fileType, id]
    );
    return result;
  },

  // Delete a record
  delete: async (id) => {
    const [result] = await db.execute("DELETE FROM resource_list WHERE id = ?", [id]);
    return result;
  }
  
};

module.exports = Resource;
