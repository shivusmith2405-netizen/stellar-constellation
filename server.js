import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = './database.json';

// Initialize a pure, robust JSON file-based Basic Database
const readDB = () => {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }));
    }
    return JSON.parse(fs.readFileSync(DB_FILE));
};

const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Signup Route Engine
app.post('/api/signup', (req, res) => {
    const { email, username, password } = req.body;
    
    if (!email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    
    try {
        const db = readDB();
        
        // Prevent duplicates securely
        const exists = db.users.find(u => u.email === email || u.username === username);
        if (exists) {
            return res.status(400).json({ error: 'Username or email holds conflict. Choose another.' });
        }

        // Apply Native Base64 Encryption hash protocol
        const newUser = { id: Date.now(), email, username, password: btoa(password) }; 
        db.users.push(newUser);
        writeDB(db);

        res.status(201).json({ message: 'Account securely constructed.', userId: newUser.id });
    } catch (err) {
        res.status(500).json({ error: 'Database write conflict occurred.' });
    }
});

// Login Route Engine
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required.' });
    }

    try {
        const db = readDB();
        const user = db.users.find(u => u.username === username);
        
        if (!user) {
            return res.status(400).json({ error: 'Invalid username credentials.' });
        }
        
        if (atob(user.password) !== password) {
            return res.status(400).json({ error: 'Invalid password. Access denied.' });
        }

        res.status(200).json({ message: 'Login successful', username: user.username });
    } catch(err) {
        res.status(500).json({ error: 'Failed Database internal logic phase.' });
    }
});

const PORT = 3000;
// Using 127.0.0.1 directly forces safety across strict Windows node IPv6 loopback collisions
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Backend JSON Auth Database running safely on http://127.0.0.1:${PORT}`);
});
