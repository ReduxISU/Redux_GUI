export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  const baseUrl = process.env.REDUX_BASE_URL;
  if (!baseUrl) {
    res.status(500).json({ error: "REDUX_BASE_URL is not configured" });
    return;
  }

  const suffix = req.url.replace(/^\/api\/redux\/?/, "");
  const targetUrl = `${baseUrl.replace(/\/$/, "")}/${suffix}`;

  // Guard against SSRF: the user-controlled suffix must not be able to steer the
  // request to a host/scheme other than the configured backend. Resolve the URL
  // with the WHATWG parser and require it to stay on the backend's origin.
  let target;
  let base;
  try {
    target = new URL(targetUrl);
    base = new URL(baseUrl);
  } catch {
    res.status(400).json({ error: "Invalid request path" });
    return;
  }

  const isSameOrigin = target.origin === base.origin;
  const isAllowedScheme = target.protocol === "http:" || target.protocol === "https:";
  if (!isSameOrigin || !isAllowedScheme) {
    res.status(400).json({ error: "Refusing to proxy request outside the configured backend" });
    return;
  }

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!["host", "connection", "transfer-encoding"].includes(key.toLowerCase())) {
      headers[key] = Array.isArray(value) ? value.join(", ") : value;
    }
  }

  // Do not follow redirects server-side: a compromised or misbehaving backend
  // could 3xx us toward an internal address (another SSRF path). Forward the
  // redirect response to the client and let the browser decide what to do.
  const fetchOptions = { method: req.method, headers, redirect: "manual" };

  if (!["GET", "HEAD"].includes(req.method)) {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    fetchOptions.body = Buffer.concat(chunks);
  }

  let upstream;
  try {
    upstream = await fetch(target, fetchOptions);
  } catch (err) {
    res.status(502).json({ error: `Upstream unreachable: ${err.message}` });
    return;
  }

  res.status(upstream.status);
  for (const [key, value] of upstream.headers) {
    if (!["transfer-encoding", "connection"].includes(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  }

  const body = await upstream.arrayBuffer();
  res.end(Buffer.from(body));
}
