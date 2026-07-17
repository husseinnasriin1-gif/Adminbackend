const Resource = require('../model/Resource');
// Import jsonwebtoken dependency to secure your file downloads
const jwt = require('jsonwebtoken'); 

const ResourceController = {
  // 1. Fetch all items (Admin only or secured)
  getAllResources: async (req, res) => {
    try {
      const items = await Resource.findAll();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 2. Fetch computed statistics
  getResourceStats: async (req, res) => {
    try {
      const statistics = await Resource.getStats();
      res.json(statistics);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 3. Process file upload and save record
  uploadResource: async (req, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: 'Please choose a file to upload' });

      if (!file.path) {
        return res.status(502).json({ error: 'File upload to storage failed. Please try again.' });
      }

      const category = req.body.category || 'General';
      const title = file.originalname;
      const fileType = file.mimetype.startsWith('video/') ? 'video' : 'document';
      const fileUrl = file.path;

      const result = await Resource.create(
        title, file.originalname, fileUrl, fileType, file.mimetype, file.size, category
      );

      res.status(201).json({ success: true, id: result.insertId, url: fileUrl });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 4. Get resources by category — UPDATED TO STOP 401 CRASHES AND MASK PATHS
  getResourcesByCategory: async (req, res) => {
    try {
      // 1. Fetch items from your database so we have the metadata ready
      const items = await Resource.findByCategory(req.params.category);
      
      // 2. Read the authorization header string sent from React
      const authHeader = req.headers['authorization'];
      
      // Helper function to map out public cards without giving away real links
      const mapPublicMetadata = (resourceList) => {
        return resourceList.map(item => ({
          id: item.id,
          title: item.title,
          file_url: "#" // Scrambles real path so guests trigger frontend modal instead of downloading
        }));
      };

      // 3. IF NO TOKEN: Treat as public user. Return titles safely with a 200 OK.
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json(mapPublicMetadata(items));
      }

      // 4. IF TOKEN EXISTS: Validate token profile
      try {
        const token = authHeader.split(' ')[1];
        const secretKey = process.env.JWT_SECRET || "SUPER_SECRET_STUDENT_PASSPHRASE_KEY";
        const verifiedUser = jwt.verify(token, secretKey);

        // Check if role is student
        if (!verifiedUser || verifiedUser.role.toLowerCase() !== 'student') {
          // If token belongs to admin or wrong role, fallback to public visibility layout
          return res.json(mapPublicMetadata(items));
        }

        // Student validation passed! Return real download items safely.
        return res.json(items);

      } catch (tokenError) {
        // If token is invalid or expired, don't crash with a 401—serve masked public data
        return res.json(mapPublicMetadata(items));
      }

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 5. Delete resource
  deleteResource: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Resource.delete(id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = ResourceController;
