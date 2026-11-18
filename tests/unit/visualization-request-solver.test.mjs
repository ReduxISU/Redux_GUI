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
