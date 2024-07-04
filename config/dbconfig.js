
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const hotelPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000 
});





module.exports = {

    hotelPool // Exporting pool for direct use if needed
};