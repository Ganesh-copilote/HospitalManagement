const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost', // Or '127.0.0.1'
    user: 'root', // As seen in the MySQL Connections
    password: '8919332417k', // Replace with your actual MySQL root password
    database: 'HospitalManagement' //  Name of your database, as seen in the MySQL Connections
});

module.exports = pool;