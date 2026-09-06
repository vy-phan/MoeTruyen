export default async function handler(req, res) {
    // Xử lý CORS Preflight (dành cho các method POST như page-access)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 1. Lấy phần đường dẫn đằng sau /api/
    const { path, ...otherParams } = req.query;
    const pathStr = Array.isArray(path) ? path.join('/') : (path || '');
    const cleanPath = pathStr.replace(/^\/+/, ''); // Bỏ dấu / ở đầu nếu có

    // 2. Nối lại toàn bộ query params (page=1, limit=16, type=day...)
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(otherParams)) {
        if (Array.isArray(val)) {
            val.forEach((v) => searchParams.append(key, v));
        } else if (val !== undefined) {
            searchParams.append(key, val);
        }
    }
    const queryString = searchParams.toString();

    // Tạo URL đích chuyển sang moe.suicaodex.com
    const targetUrl = `https://moe.suicaodex.com/${cleanPath}${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            body: req.method !== 'GET' && req.method !== 'HEAD' && req.body ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.text();

        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
        return res.status(response.status).send(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}