const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "127.0.0.1",       // Explicit loopback IP ensures fast routing on Windows
    user: "root",
    password: "",            // Empty string fixes the XAMPP access denied error
    database: "afribot",
    port: 3306               // Standard MySQL service port
});

// Verify connection and immediately free the resource socket
db.getConnection()
    .then((connection) => {
        console.log("connected to MYSQL via promise-pool");
        connection.release(); 
    })
    .catch((err) => {
        console.error("Database connection failed:", err.message);
    });

module.exports = db;
