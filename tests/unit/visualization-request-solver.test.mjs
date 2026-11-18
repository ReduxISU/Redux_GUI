import assert from "node:assert/strict";
import { test } from "node:test";
import { requestVisualization } from "../../components/redux/index.js";

test("visualization requests forward the selected solver and preserve the instance", async (t) => {
  const instance = "(({a},{}),((a,9223372036854775807)))";
  let request;
  t.mock.method(globalThis, "fetch", async (url, init) => {
    request = { url, init };
    return new Response(JSON.stringify([{ kind: "graph", nodes: [], links: [] }]));
  });
  const pictures = await requestVisualization(
    "http://localhost/",
    "WeightedMaxCliqueVisualization",
    instance,
    undefined,
    undefined,
    "WeightedMaxCliqueGreedyLocalSearchSolver",
  );
  assert.equal(
    new URL(request.url).searchParams.get("solver"),
    "WeightedMaxCliqueGreedyLocalSearchSolver",
  );
  assert.equal(request.init.method, "POST");
  assert.equal(JSON.parse(request.init.body), instance);
  assert.equal(pictures[0].kind, "graph");
});

test("callers without a solver retain the visualization's backend default", async (t) => {
  let requestedUrl;
  t.mock.method(globalThis, "fetch", async (url) => {
    requestedUrl = url;
    return new Response("[]");
  });
  assert.deepEqual(
    await requestVisualization("http://localhost/", "CliqueDefaultVisualization", "instance"),
    [],
  );
  assert.equal(new URL(requestedUrl).searchParams.has("solver"), false);
});

test("busy visualization retries preserve the selected solver and instance", async (t) => {
  const controller = new AbortController();
  const requests = [];
  t.mock.method(Math, "random", () => 0);
  t.mock.method(globalThis, "fetch", async (url, init) => {
    requests.push({ url, init });
    return requests.length === 1
      ? new Response(JSON.stringify({ error: "server_busy" }), {
          status: 429,
          headers: { "Retry-After": "0" },
        })
      : new Response("[]");
  });
  const failures = [];
  assert.deepEqual(
    await requestVisualization(
      "http://localhost/",
      "WeightedMaxCliqueVisualization",
      "instance",
      (...failure) => failures.push(failure),
      controller.signal,
      "Solver with spaces&symbols",
    ),
    [],
  );
  assert.equal(requests.length, 2);
  assert.equal(requests[1].url, requests[0].url);
  for (const request of requests) {
    assert.equal(new URL(request.url).searchParams.get("solver"), "Solver with spaces&symbols");
    assert.equal(JSON.parse(request.init.body), "instance");
  }
  assert.deepEqual(failures, []);
});

test("an obsolete visualization does not retry a busy answer or report an error", async (t) => {
  const controller = new AbortController();
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls += 1;
    controller.abort();
    return new Response(JSON.stringify({ error: "server_busy" }), { status: 429 });
  });
  const failures = [];
  assert.equal(
    await requestVisualization(
      "http://localhost/",
      "WeightedMaxCliqueVisualization",
      "instance",
      (...failure) => failures.push(failure),
      controller.signal,
      "WeightedMaxCliqueGreedyLocalSearchSolver",
    ),
    undefined,
  );
  assert.equal(calls, 1);
  assert.deepEqual(failures, []);
});
