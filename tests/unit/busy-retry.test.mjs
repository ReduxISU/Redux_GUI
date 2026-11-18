// Waiting and asking again when the Redux server is busy (HTTP 429): the backend runs at most a
// few compute jobs at once and turns the rest away with `Retry-After` and a `server_busy` body
// (Redux Interfaces/ComputeJobs.cs). The waits and the jitter are injected, so these run at once.
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import {
  BUSY_HINT,
  BUSY_MESSAGE,
  busyAnswerAction,
  busyError,
  busyRetryDelayMs,
  MAX_BUSY_RETRIES,
  retryAfterSeconds,
  waitUnlessAborted,
} from "../../components/redux/busyRetry.js";
import {
  fetchAndParse,
  requestSolvedInstance,
  requestVerifiedInstance,
  userFacingError,
} from "../../components/redux/index.js";

// The backend's busy answer, as ComputeJobLimiter.ServerBusyBody builds it.
const BUSY_BODY = {
  error: "server_busy",
  message: "The server is busy with other jobs right now, so this one wasn't started.",
  detail: "At most 4 compute jobs can run at once, and all of them are in use.",
  maxConcurrentJobs: 4,
  retryAfterSeconds: 5,
  hint: "Wait about 5 seconds and try again.",
};

const busy = (headers = { "Retry-After": "5" }, body = BUSY_BODY) =>
  new Response(JSON.stringify(body), {
    status: 429,
    statusText: "Too Many Requests",
    headers: { "Content-Type": "application/json", ...headers },
  });
const ok = (body) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

// Answers fetch with `answers` in turn (the last one repeats) and records each call.
let calls;
let realFetch;
let realLog;
function answerWith(...answers) {
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    const next = answers[Math.min(calls.length - 1, answers.length - 1)];
    return typeof next === "function" ? next() : next.clone();
  };
}

// Records the waits instead of taking them.
let waits;
const wait = async (ms, signal) => {
  waits.push(ms);
  return !signal?.aborted;
};
const noJitter = () => 0;

beforeEach(() => {
  calls = [];
  waits = [];
  realFetch = globalThis.fetch;
  realLog = console.log;
  console.log = () => {};
});
afterEach(() => {
  globalThis.fetch = realFetch;
  console.log = realLog;
});

describe("retryAfterSeconds", () => {
  test("takes the Retry-After header first", () => {
    assert.equal(retryAfterSeconds("7", { retryAfterSeconds: 3 }), 7);
  });

  test("falls back to the body's retryAfterSeconds, then to 5 seconds", () => {
    assert.equal(retryAfterSeconds(null, { retryAfterSeconds: 3 }), 3);
    assert.equal(retryAfterSeconds(undefined, undefined), 5);
    assert.equal(retryAfterSeconds("", {}), 5);
  });

  test("ignores a header that isn't a number of seconds (an HTTP date, junk)", () => {
    assert.equal(retryAfterSeconds("Wed, 21 Oct 2026 07:28:00 GMT", { retryAfterSeconds: 2 }), 2);
    assert.equal(retryAfterSeconds("soon", undefined), 5);
  });

  test("keeps the wait between 1 and 30 seconds", () => {
    assert.equal(retryAfterSeconds("0", undefined), 1);
    assert.equal(retryAfterSeconds("-4", undefined), 1);
    assert.equal(retryAfterSeconds("3600", undefined), 30);
    assert.equal(retryAfterSeconds(null, { retryAfterSeconds: 999 }), 30);
  });
});

describe("busyRetryDelayMs", () => {
  test("adds up to a second of jitter", () => {
    assert.equal(
      busyRetryDelayMs("5", undefined, () => 0),
      5000,
    );
    assert.equal(
      busyRetryDelayMs("5", undefined, () => 0.999),
      5999,
    );
  });
});

describe("busyAnswerAction", () => {
  test("retries a 429 only while retries are left", () => {
    for (let used = 0; used < MAX_BUSY_RETRIES; used += 1) {
      assert.equal(busyAnswerAction(429, used), "retry");
    }
    assert.equal(busyAnswerAction(429, MAX_BUSY_RETRIES), "fail");
  });

  test("never retries another status", () => {
    for (const status of [400, 404, 408, 422, 500, 502, 503, 504]) {
      assert.equal(busyAnswerAction(status, 0), "fail");
    }
  });

  test("drops a 429 nobody is waiting for any more", () => {
    const controller = new AbortController();
    controller.abort();
    assert.equal(busyAnswerAction(429, 0, controller.signal), "drop");
  });
});

describe("waitUnlessAborted", () => {
  test("ends early, answering false, when the signal aborts", async () => {
    const controller = new AbortController();
    const waited = waitUnlessAborted(60_000, controller.signal);
    controller.abort();
    assert.equal(await waited, false);
  });

  test("answers false at once for a signal that already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    assert.equal(await waitUnlessAborted(60_000, controller.signal), false);
  });

  test("answers true once the wait runs out", async () => {
    assert.equal(await waitUnlessAborted(1), true);
  });
});

describe("fetchAndParse with retryBusy", () => {
  const request = (onError, options = {}) =>
    fetchAndParse("http://redux/solve", { method: "POST" }, () => "SOLVE REQUEST FAILED", onError, {
      retryBusy: true,
      wait,
      random: noJitter,
      ...options,
    });

  test("asks again after a busy answer and resolves the answer that follows", async () => {
    answerWith(busy(), busy({ "Retry-After": "2" }), ok({ solution: "x1:True" }));
    const errors = [];
    const result = await request((...failure) => errors.push(failure));
    assert.deepEqual(result, { solution: "x1:True" });
    assert.equal(calls.length, 3);
    assert.deepEqual(waits, [5000, 2000]);
    assert.deepEqual(errors, [], "no error is reported between attempts");
  });

  test("sends the same request again", async () => {
    answerWith(busy(), ok(1));
    await request();
    assert.equal(calls[1].url, calls[0].url);
    assert.equal(calls[1].init.method, "POST");
  });

  test("uses the body's retryAfterSeconds when there is no header", async () => {
    answerWith(busy({}, { ...BUSY_BODY, retryAfterSeconds: 3 }), ok(1));
    await request();
    assert.deepEqual(waits, [3000]);
  });

  test("gives up after 3 retries and reports the last busy answer", async () => {
    answerWith(busy());
    const errors = [];
    const result = await request((...failure) => errors.push(failure));
    assert.equal(result, undefined);
    assert.equal(calls.length, 1 + MAX_BUSY_RETRIES);
    assert.equal(waits.length, MAX_BUSY_RETRIES);
    assert.equal(errors.length, 1);
    const [detail, body, failure] = errors[0];
    assert.match(detail, /^HTTP 429 Too Many Requests: At most 4 compute jobs/);
    assert.equal(body.error, "server_busy");
    assert.deepEqual(failure, { kind: "rejected", status: 429, text: "" });
  });

  test("the final busy failure reads as a busy message with the server's hint", async () => {
    answerWith(busy());
    let shown;
    await request((...failure) => {
      shown = userFacingError(...failure);
    });
    assert.equal(shown.message, BUSY_MESSAGE);
    assert.equal(shown.hint, BUSY_BODY.hint);
    assert.match(shown.detail, /HTTP 429/);
  });

  test("does not retry other failures", async () => {
    answerWith(new Response("boom", { status: 503 }));
    const errors = [];
    await request((...failure) => errors.push(failure));
    assert.equal(calls.length, 1);
    assert.deepEqual(waits, []);
    assert.equal(errors[0][2].status, 503);
  });

  test("does not retry a network error", async () => {
    answerWith(() => {
      throw new TypeError("fetch failed");
    });
    const errors = [];
    await request((...failure) => errors.push(failure));
    assert.equal(calls.length, 1);
    assert.equal(errors[0][2].kind, "unreachable");
  });

  test("without retryBusy a 429 fails at once, as before", async () => {
    answerWith(busy());
    const errors = [];
    await request((...failure) => errors.push(failure), { retryBusy: false });
    assert.equal(calls.length, 1);
    assert.equal(errors.length, 1);
  });

  test("an abort during the wait stops it: nothing more is sent and nothing reported", async () => {
    answerWith(busy(), ok(1));
    const controller = new AbortController();
    const errors = [];
    const result = await request((...failure) => errors.push(failure), {
      signal: controller.signal,
      wait: (ms, signal) => {
        controller.abort();
        return waitUnlessAborted(ms, signal);
      },
    });
    assert.equal(result, undefined);
    assert.equal(calls.length, 1);
    assert.deepEqual(errors, []);
  });

  test("a busy answer that arrives after an abort is dropped, not reported", async () => {
    const controller = new AbortController();
    answerWith(() => {
      controller.abort();
      return busy();
    });
    const errors = [];
    const result = await request((...failure) => errors.push(failure), {
      signal: controller.signal,
    });
    assert.equal(result, undefined);
    assert.equal(calls.length, 1);
    assert.deepEqual(errors, []);
  });
});

describe("compute requests", () => {
  test("requestSolvedInstance retries a busy server", async () => {
    // The real timer, kept short by a Retry-After the clamp raises to 1 s, would make this slow;
    // so only check that the request is sent again, then let it give up through an abort.
    const controller = new AbortController();
    answerWith(() => {
      if (calls.length === 2) controller.abort();
      return busy({ "Retry-After": "0" });
    });
    const started = Date.now();
    await requestSolvedInstance("http://redux/", "S", "(x1)", undefined, controller.signal);
    assert.equal(calls.length, 2);
    assert.ok(Date.now() - started < 5000);
  });

  test("requestVerifiedInstance retries a busy server and says so when it stays busy", async () => {
    answerWith(busy());
    const result = await requestVerifiedInstance("http://redux/", "P", "V", "i", "c", {
      wait,
      random: noJitter,
    });
    assert.equal(calls.length, 1 + MAX_BUSY_RETRIES);
    assert.equal(result, `${BUSY_MESSAGE} ${BUSY_BODY.hint}`);
  });

  test("requestVerifiedInstance answers once the server has room", async () => {
    answerWith(busy(), ok(true));
    const result = await requestVerifiedInstance("http://redux/", "P", "V", "i", "c", {
      wait,
      random: noJitter,
    });
    assert.equal(result, true);
  });
});

describe("userFacingError for a 429", () => {
  test("falls back to a plain hint when the server sent none", () => {
    const shown = userFacingError("HTTP 429", undefined, { kind: "rejected", status: 429 });
    assert.deepEqual(shown, { message: BUSY_MESSAGE, hint: BUSY_HINT, detail: "HTTP 429" });
  });

  test("busyError prefers the server's hint", () => {
    assert.equal(busyError({ hint: " Wait 5 s. " }).hint, "Wait 5 s.");
    assert.equal(busyError({ hint: "" }).hint, BUSY_HINT);
  });
});
