// The GUI's proxy (pages/api/redux/[...path].js) must hand the backend's busy answer to the
// browser unchanged: the 429 status, its Retry-After header and its server_busy body are what the
// app's wait-and-retry (components/redux/busyRetry.js) reads.
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import handler from "../../pages/api/redux/[...path].js";

const BUSY_BODY = JSON.stringify({
  error: "server_busy",
  message: "The server is busy with other jobs right now, so this one wasn't started.",
  detail: "At most 4 compute jobs can run at once, and all of them are in use.",
  maxConcurrentJobs: 4,
  retryAfterSeconds: 5,
  hint: "Wait about 5 seconds and try again.",
});

let realFetch;
let realBase;
beforeEach(() => {
  realFetch = globalThis.fetch;
  realBase = process.env.REDUX_BASE_URL;
  process.env.REDUX_BASE_URL = "http://redux-api:27000/";
});
afterEach(() => {
  globalThis.fetch = realFetch;
  if (realBase === undefined) delete process.env.REDUX_BASE_URL;
  else process.env.REDUX_BASE_URL = realBase;
});

function fakeRequest(url, method, body) {
  return {
    url,
    method,
    headers: { host: "gui", "content-type": "application/json" },
    async *[Symbol.asyncIterator]() {
      if (body) yield Buffer.from(body);
    },
  };
}

function fakeResponse() {
  const res = { statusCode: 0, headers: {}, body: undefined };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.setHeader = (key, value) => {
    res.headers[key.toLowerCase()] = value;
  };
  res.end = (buffer) => {
    res.body = buffer.toString("utf8");
  };
  res.json = (value) => res.end(Buffer.from(JSON.stringify(value)));
  return res;
}

test("a busy answer passes through with its status, Retry-After and body", async () => {
  let forwarded;
  globalThis.fetch = async (target, init) => {
    forwarded = { target: String(target), init };
    return new Response(BUSY_BODY, {
      status: 429,
      statusText: "Too Many Requests",
      headers: { "Content-Type": "application/json; charset=utf-8", "Retry-After": "5" },
    });
  };
  const res = fakeResponse();
  await handler(fakeRequest("/api/redux/ProblemProvider/solve?solver=S", "POST", '"(x1)"'), res);

  assert.equal(forwarded.target, "http://redux-api:27000/ProblemProvider/solve?solver=S");
  assert.equal(res.statusCode, 429);
  assert.equal(res.headers["retry-after"], "5");
  assert.equal(res.body, BUSY_BODY);
});
