const mysql = require("mysql2/promise");

// Configured to use Railway variables in production, with local fallbacks
const db = mysql.createPool({
    host: process.env.MYSQLHOST || "127.0.0.1",       
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD !== undefined ? process.env.MYSQLPASSWORD : "",            
    database: process.env.MYSQLDATABASE || "afribot",
    port: process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT) : 3306               
});

// Verify connection and immediately free the resource socket
db.getConnection()
    .then((connection) => {
        console.log("Connected to MySQL database pool successfully.");
        connection.release(); 
    })
    .catch((err) => {
        console.error("Database connection failed:", err.message);
    });

module.exports = db;
