const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key', // Change to a strong secret in production
    resave: false,
    saveUninitialized: true
}));

// Database setup
const db = new sqlite3.Database('./users.db');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT)");
});

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Registration endpoint
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword], function(err) {
        if (err) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.json({ message: 'Registration successful' });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err || !user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        req.session.userId = user.id;
        res.json({ message: 'Login successful', redirect: 'http://127.0.0.1:3000/startpage/navigation_page.html' });
    });
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out' });
});

// Protected route example (dashboard)
app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    res.send('<h1>Welcome to Smart Tax Assistant Dashboard!</h1><a href="/logout">Logout</a>');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});