export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { owner, repo, type } = req.query;
    if (!owner || !repo) return res.status(400).json({ error: 'Missing owner or repo.' });

    const token = process.env.GITHUB_TOKEN;
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Stellar-Constellation-DevOps'
    };
    
    // Step 4: Include GITHUB_TOKEN in headers if available in environment
    if (token) {
        headers['Authorization'] = `token ${token}`;
    }

    const endpoint = type === 'tags' ? 'tags' : 'commits?per_page=30';
    const url = `https://api.github.com/repos/${owner}/${repo}/${endpoint}`;

    try {
        const response = await fetch(url, { headers });
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.status(200).json(data);
    } catch (err) {
        console.error('GitHub Proxy Error:', err);
        res.status(500).json({ error: 'Failed to fetch GitHub data' });
    }
}
