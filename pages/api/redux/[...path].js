export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  const baseUrl = process.env.REDUX_BASE_URL;
  if (!baseUrl) {
    res.status(500).json({ error: 'REDUX_BASE_URL is not configured' });
    return;
  }

  const suffix = req.url.replace(/^\/api\/redux\/?/, '');
  const targetUrl = `${baseUrl.replace(/\/$/, '')}/${suffix}`;

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
      headers[key] = Array.isArray(value) ? value.join(', ') : value;
    }
  }

  const fetchOptions = { method: req.method, headers };

  if (!['GET', 'HEAD'].includes(req.method)) {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    fetchOptions.body = Buffer.concat(chunks);
  }

  let upstream;
  try {
    upstream = await fetch(targetUrl, fetchOptions);
  } catch (err) {
    res.status(502).json({ error: `Upstream unreachable: ${err.message}` });
    return;
  }

  res.status(upstream.status);
  for (const [key, value] of upstream.headers) {
    if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  }

  const body = await upstream.arrayBuffer();
  res.end(Buffer.from(body));
}
