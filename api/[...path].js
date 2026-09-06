export default async function handler(req, res) {
    // Lấy phần path đằng sau /api/ (ví dụ: v2/manga)
    const { path } = req.query;
    const pathStr = Array.isArray(path) ? path.join('/') : path || '';

    // Lấy các query params (page=1, limit=16...)
    const urlObj = new URL(req.url, `https://${req.headers.host}`);
    urlObj.searchParams.delete('path');
    const queryString = urlObj.searchParams.toString();

    const targetUrl = `https://moe.suicaodex.com/${pathStr}${queryString ? `?${queryString}` : ''}`;

    try {
        // Gọi sang moe.suicaodex.com KHÔNG KÈM Origin/Referer của vercel
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            body: req.method !== 'GET' && req.method !== 'HEAD' && req.body ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.text();

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
        return res.status(response.status).send(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}