import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// In Vercel, we need to use absolute paths for the bundled files
const DB_FILE = path.join(process.cwd(), 'database.json');

const readDB = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            return { users: [] };
        }
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        console.error("DB Read Error:", e);
        return { users: [] };
    }
};

const writeDB = (data) => {
    // Note: On Vercel, this will NOT persist across different requests/instances
    // It's recommended to use a real database for production.
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("DB Write Error:", e);
    }
};

app.post('/api/signup', (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) return res.status(400).json({ error: 'All fields are required.' });
    
    try {
        const db = readDB();
        const exists = db.users.find(u => u.email === email || u.username === username);
        if (exists) return res.status(400).json({ error: 'Username or email already exists.' });

        const newUser = { id: Date.now(), email, username, password: btoa(password) }; 
        db.users.push(newUser);
        writeDB(db);

        res.status(201).json({ message: 'Account created.', userId: newUser.id });
    } catch (err) {
        res.status(500).json({ error: 'Database error.' });
    }
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });

    try {
        const db = readDB();
        const user = db.users.find(u => u.username === username);
        if (!user) return res.status(400).json({ error: 'Invalid username.' });
        if (atob(user.password) !== password) return res.status(400).json({ error: 'Invalid password.' });

        res.status(200).json({ message: 'Login successful', username: user.username });
    } catch(err) {
        res.status(500).json({ error: 'Database error.' });
    }
});

export default app;
