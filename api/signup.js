import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, username, password } = req.body;
    if (!email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        if (supabase) {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .or(`email.eq.${email},username.eq.${username}`)
                .maybeSingle();

            if (existingUser) {
                return res.status(400).json({ error: 'Username or email already in use.' });
            }

            const encodedPassword = Buffer.from(password).toString('base64');
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{ email, username, password: encodedPassword }])
                .select()
                .single();

            if (insertError) throw insertError;
            return res.status(201).json({ message: 'Account created successfully (Cloud).', userId: newUser.id });
        } else {
             // Placeholder for External Database
             return res.status(501).json({ error: 'External database not configured. Please set SUPABASE_URL.' });
        }
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
}
