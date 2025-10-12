const express = require('express');
const mysql = require('mysql2'); // Or your preferred MySQL library
const cors = require('cors'); // Import the cors middleware
const app = express();
const port = 5000;

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors({
    origin: 'http://localhost:3000', // This MUST match your frontend's URL
    credentials: true // If you're using cookies or authorization headers
})); // Enable CORS for cross-origin requests (very important!)

// MySQL Connection Configuration (replace with your actual credentials)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '8919332417k',
    database: 'HospitalManagement'
});

// Example API Endpoint:  /login (as called in api.js)
app.post('/login', (req, res) => {
    const { username, password } = req.body;  // Access data sent from the client
    debugger;
    // Perform database query to authenticate user (example)
    // pool.query(
    //     'SELECT * FROM users WHERE username = ? AND password = ?',
    //     [username, password],
    //     (err, results) => {
    //         if (err) {
    //             console.error(err);
    //             return res.status(500).json({ error: 'Database error' });
    //         }

    //         if (results.length > 0) {
    //             // Successful login
    //             // In real app, use JWT for authentication
    //             res.json({ message: 'Login successful', user: results[0] });
    //         } else {
    //             // Invalid credentials
    //             res.status(401).json({ error: 'Invalid credentials' });
    //         }
    //     }
    // );
    res.json({ message: 'Login successful' });
});

app.get("{API_URL}/api/data", (req, res) => {
    const sampleArray = [
        { id: 1, name: "Kumar" },
        { id: 2, name: "Teja" },
        { id: 3, name: "Node.js Working!" }
    ];
    res.json(sampleArray);
});

// Example API Endpoint: /patient_dashboard (as called in api.js)
app.get('/patient_dashboard', (req, res) => {
    // Your code to fetch patient dashboard data from the database
    // ... (Query database, process data) ...
    res.json({ dashboardData: { /* ... */ } });
});

// Example API Endpoint: /register
app.post('/register', (req, res) => {
    // Your registration logic here
})
// ... Define other API endpoints here ...

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});