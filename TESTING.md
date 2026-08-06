# Testing Redux_GUI

This repo has **integration tests**: a real browser driving the real app against a real Redux
backend. They are the only automated check that the GUI actually works — everything else here
(`next build`, ESLint, Biome) only proves the code compiles and is tidy.

There are four tests today. That is on purpose: they are **examples to copy**, one per kind of
thing you might want to test. Adding more is exactly the kind of contribution we want, and the
[backlog](#backlog--good-first-contributions) at the bottom lists ones we would like.

> **New here?** Read [Why these tests matter](#why-these-tests-matter) first. This app hides its
> own failures, which changes how you have to test it.

---

## 1. Getting an environment

Everything you need — Node 26, the `rbs` build tool, Chromium, Docker access — is in the
**dev container**. You do not need to install any of it yourself.

### VS Code (or GitHub Codespaces)

1. Install the **Dev Containers** extension.
2. Open the repo, then **Reopen in Container** when prompted (or `Ctrl/Cmd+Shift+P` →
   *Dev Containers: Reopen in Container*).
3. Wait for the first build. It installs dependencies and downloads Chromium, so it takes a few
   minutes once; after that it is cached.

### Terminal (no VS Code)

```bash
npm install -g @devcontainers/cli   # once

devcontainer up   --workspace-folder .
devcontainer exec --workspace-folder . bash
```

You are now inside the container, in `/workspaces/Redux_GUI`.

### When the container will not start

Two failures are common enough to be worth naming.

**Port 3000 is already in use.** The container publishes 3000, so anything already holding it —
a `npm run dev` left running, or a container from a previous session — makes startup fail:

```bash
docker ps --filter publish=3000     # find what has it
docker rm -f <name>                 # if it is a container
```

**A failed start leaves a broken container behind.** If `devcontainer up` fails *while setting up
networking*, it leaves a half-created container, and the next attempt **reuses that same container**
— which has no network at all. The symptom is misleading: setup fails with a DNS error like
`curl: (6) Could not resolve host: mise.run`, which looks like a problem with your network. It is
not. Delete the container and try again:

```bash
docker rm -f $(docker ps -aq --filter "label=devcontainer.local_folder=$PWD")
```

**`rbs` is missing a command you expect.** `rbs` is installed into the container *image*, so a
cached image pins it to whenever that image was built. Rebuild to pick up a newer one — in VS Code,
*Dev Containers: Rebuild Container*; from the terminal:

```bash
devcontainer up --workspace-folder . --build-no-cache --remove-existing-container
```

---

## 2. Running the tests

The tests do **not** start anything. They expect the app to already be running and take its
address from `RBS_BASE_URL`. There are two ways to get there.

### The full run — exactly what CI does

```bash
rbs integration-test
```

`rbs` builds the production image, starts it alongside a Redux backend container, waits for both
to be healthy, runs this suite against them, and tears it all down. This is the real gate: if it
passes here, it passes in the pull request. It is also the slowest option, because it rebuilds the
image every time.

`rbs ci` runs the whole pipeline (audit, format, lint, build, integration tests, report).

### The fast loop — while you are writing a test

Rebuilding an image for every edit is miserable. Start a stack once, leave it up, and re-run just
the test you care about:

```bash
# Start the backend and the GUI. Do this once.
docker network create redux-it
docker run -d --name redux-api --network redux-it --network-alias redux-api \
  ghcr.io/reduxisu/redux:latest
docker run -d --name redux-gui --network redux-it -p 3101:3000 \
  -e REDUX_BASE_URL=http://redux-api:27000/ local/redux_gui:ci

export RBS_BASE_URL=http://localhost:3101

# Now iterate.
npm run test:e2e                                    # all four
npx playwright test app.spec.js                     # one file
npx playwright test -g "solving 3SAT"               # one test, by name
npx playwright test --headed                        # watch it happen in a real window
npx playwright test --debug                         # step through it

# When you are done.
docker rm -f redux-api redux-gui && docker network rm redux-it
```

`local/redux_gui:ci` is the image `rbs build` produces. Build it yourself with
`docker build -t local/redux_gui:ci .` — and rebuild it whenever you change app code, since the
container serves a compiled copy, not your working tree.

**When a test fails**, Playwright saves a screenshot and a trace. The trace is the useful one — it
replays the whole run with the DOM and network at every step:

```bash
npx playwright show-trace test-results/<failed-test>/trace.zip
```

---

## 3. Why these tests matter

`components/redux/index.js` **swallows every network error**. Look at `fetchJson`: it catches,
writes to `console.log`, and returns `undefined`. Nothing is thrown. Nothing is shown to the user.

The consequence is that **a completely broken backend produces a page that looks fine.** Dropdowns
are merely empty, panels are merely blank. A test that just checks "the page loaded" would pass
against a stack with no backend at all.

That is why `tests/e2e/fixtures.js` exists. It watches every request the page makes and fails the
test if any of them fail. Import `test` from `./fixtures` — not from `@playwright/test` — in any
test that drives a page, and you get that protection automatically.

That file also holds `KNOWN_SILENT_FAILURES`: an inventory of requests that already fail on every
page load today. Each one is a real bug **in this repo** — the API is correctly rejecting a
malformed request or a route that was never real — with a written explanation. **Fixing one means
deleting its entry**, which turns the guard back on for that call. It is a to-do list as much as a
config.

One caution when you add an entry: pull a fresh backend image first
(`docker pull ghcr.io/reduxisu/redux:latest`). `:latest` moves, and a stale local copy makes a
route that exists look permanently broken.

---

## 4. Writing a new test

Start from the example closest to what you want:

| You want to test | Copy | Technique it shows |
|---|---|---|
| What the API returns to the GUI | `tests/e2e/proxy.spec.js` | HTTP assertions, no browser — fast and stable |
| A dropdown, a value, a page state | `app.spec.js` › *the problem catalogue loads* | Locating a row, reading a combobox |
| A visualization drawing | `app.spec.js` › *renders a visualization* | Asserting on drawn SVG, and ruling out error cards |
| Clicking something and checking the result | `app.spec.js` › *solving 3SAT* | Expanding a row, waiting for enabled, asserting output |

### Things that will cost you an afternoon if nobody tells you

**Do not use `getByLabel` for the dropdowns.** All six of them render `id="search-bar"`
(`components/widgets/SearchBarExtensible.js`), so all six `<label for="search-bar">` elements point
at whichever input the browser saw first. Every `getByLabel("Select …")` call on this page silently
resolves to the *Problem* row's input — no error, just the wrong element. Use the `row()` helper in
`app.spec.js` to scope to a row by its header title, then `getByRole("combobox")` inside it.
(This duplicate id is also a genuine accessibility bug: screen readers announce every dropdown as
"Select problem". Fixing it is on the backlog.)

**Solve and Verify start collapsed.** Their bodies are in the DOM but hidden, so assertions inside
them fail until you click the row's `▼` button.

**Exclude MUI icons when looking for a visualization.** Every toolbar icon is an `<svg>`. Use
`svg:not(.MuiSvgIcon-root)` or you will match an icon and pass without anything being drawn.

**Display names come from the API, not the code.** The problem keyed `SAT3` is shown as `3SAT`;
`CLIQUE` is shown as `Clique`. Assert on what the user sees.

**Do not type into the problem-instance box** unless the test is about that box. It debounces for
about two seconds before the rest of the app sees your change
(`components/pageblocks/ProblemRowReact.js`), so a test that types and immediately asserts will
be flaky.

**Stay on 3SAT for visualization tests, for now.** 3SAT has exactly one visualization, so it always
picks the right one. Problems with two — CLIQUE, for instance — currently pick the *wrong* default
because of a bug in `components/hooks/ProblemProvider/Visualization.js`. A test for that belongs
together with the fix (it is on the backlog); written today it would just fail.

### Before you open a pull request

```bash
npm run lint          # ESLint
npm run format        # Biome, writes fixes
npm run test:e2e      # against a stack, per section 2
```

Or `rbs ci` to run everything the pull request will run.

---

## Backlog — good first contributions

Each of these is a real gap. Pick one, open an issue if there is not one already, and use the
matching example above as your starting point.

**More flows**
- The **Reduce** row: 3SAT reduces to Clique by default — assert the reduced instance renders.
- The **Verify** row: submit the prefilled certificate and assert the verifier's output.
- One test per visualization type in `components/Visualization/svgs/Visualizations.js`. There are
  many and almost none are covered.

**The proxy's error handling** (`pages/api/redux/[...path].js`) — none of these is tested:
- 500 when `REDUX_BASE_URL` is unset
- 400 when it is set to something that is not a URL
- 502 when the backend is unreachable

These do not need a browser or a backend; call the handler directly with a fake request/response.

**Bugs to fix, each of which unlocks a test**
- The duplicate `id="search-bar"` across all six dropdowns (accessibility + testability).
- The wrong-default-visualization bug in `components/hooks/ProblemProvider/Visualization.js` — it
  reads `.VisualizationName` where the backend sends `visualizationName`. Fix it, then add a test
  asserting CLIQUE selects its declared default.
- Anything in `KNOWN_SILENT_FAILURES` in `tests/e2e/fixtures.js`. Fix the request, delete the
  entry, and the guard starts protecting that call. Two are nearly free:
  `requestReductionInfo` builds `GET <reduction>/info`, which does not exist — the working route is
  `GET ProblemProvider/info?interface=<reduction>`; and several calls fire with an empty
  `reduction=` parameter before the reduction has been chosen, which should simply be guarded.

**Later**
- Tour walkthrough tests, once the tutorial branch merges — see `INTEGRATION_TEST_REQUIREMENTS.md`
  in the parent directory for what those should assert.
