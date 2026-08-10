const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Router imports
const authRoutes = require("./Routes/authRoutes");
const courseRoutes = require("./Routes/courseRoutes"); 
const resourceRoutes = require("./Routes/resourceRoutes"); 
const userRoutes = require("./Routes/userRoutes");
const settingsRoutes = require("./Routes/settingsRoutes"); 
const chatRoutes = require("./Routes/chatRoutes"); 
// FIXED: Import your new student route file here
// (Make sure the path matching capitalization for your folders is exactly correct)
const studentRoutes = require("./Routes/studentRoutes"); 

const app = express();

// Global Middlewares
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174","127.0.0.1","https://vercel.app"],
  credentials: true
}));

// Modular Route Mounting
app.use("/", authRoutes);                  
app.use("/api", courseRoutes);             
app.use("/api/resources", resourceRoutes); 
app.use("/api/users", userRoutes);         
app.use("/api/settings", settingsRoutes); 
app.use("/api", chatRoutes);               

// FIXED: Mount the student routes under the "/api" prefix
// This creates the perfect match for: POST /api/students/login
app.use("/api", studentRoutes);

// Server Configuration
const port = 8080;
app.listen(port, () => {
  console.log(`Server running in clean MVC layout on port ${port}`);
});
