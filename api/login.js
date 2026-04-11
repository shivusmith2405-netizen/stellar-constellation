import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
    // Add CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });

    try {
        if (supabase) {
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .maybeSingle();
            
            if (error) throw error;
            if (!user) return res.status(400).json({ error: 'Invalid username.' });
            
            const decodedPassword = Buffer.from(user.password, 'base64').toString('utf8');
            if (decodedPassword !== password) return res.status(400).json({ error: 'Invalid password.' });

            return res.status(200).json({ message: 'Login successful', username: user.username });
        } else {
            // Placeholder for External Database
            return res.status(501).json({ error: 'External database not configured. Please set SUPABASE_URL.' });
        }
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
}
