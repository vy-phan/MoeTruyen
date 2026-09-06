export default async function handler(req, res) {
    // Xử lý CORS Preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 1. Lấy chính xác đường dẫn (ví dụ: v2/manga/top)
    const matchParam = req.query.match || req.query.path || '';
    const pathStr = Array.isArray(matchParam) ? matchParam.join('/') : matchParam;
    const cleanPath = pathStr.replace(/^\/+/, '');

    // 2. Gom các query params còn lại (type=day, limit=10, page=1...)
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(req.query)) {
        if (key !== 'match' && key !== 'path') {
            if (Array.isArray(val)) {
                val.forEach((v) => searchParams.append(key, v));
            } else if (val !== undefined) {
                searchParams.append(key, val);
            }
        }
    }
    const queryString = searchParams.toString();

    // URL chuẩn xác sẽ là: https://moe.suicaodex.com/v2/manga/top?type=day&limit=10
    const targetUrl = `https://moe.suicaodex.com/${cleanPath}${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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