# Redux Frontend (GUI)

**Interactive web interface for the Redux computational complexity knowledgebase**

[![Idaho State University](https://img.shields.io/badge/Idaho%20State%20University-Computer%20Science-orange)](https://www.isu.edu/cs/)

##  Live Demo
- **Website**: [https://redux.portneuf.cose.isu.edu/](https://redux.portneuf.cose.isu.edu/)
- **Backend Repository**: [Redux Backend](https://github.com/ReduxISU/Redux)

##  Table of Contents
- [About Redux Frontend](#about-redux-frontend)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Code Overview](#code-overview)
- [Adding to the Codebase](#adding-to-the-codebase)
- [Deployment](#deployment)
- [Branching Strategy](#branching-strategy)
- [Definition of Done](#definition-of-done)
- [Contributors](#contributors)
- [Additional Resources](#additional-resources)

---

## About Redux Frontend

The Redux Frontend is a Next.js-based web application that provides an interactive interface for exploring computational complexity problems, reductions, and visualizations. The frontend is **integrally linked to the Redux REST API** and depends on the backend being installed and running.

**Key Features:**
- Interactive problem visualization using React and D3.js
- Real-time problem reduction visualization
- Solution and certificate verification interface
- Gadget highlighting for reduction mappings
- SVG-based rendering for mathematical structures

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download) version 26 or newer (it comes with npm)
- [Redux Backend](https://github.com/ReduxISU/Redux) (must be running)

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/ReduxISU/Redux_GUI.git
cd Redux_GUI
```

### Step 2: Install Dependencies

```bash
npm ci
```

`npm ci` installs exactly the package versions the project expects.

### Step 3: Ensure Backend is Running

The Redux GUI requires the Redux API to be running. If you need to work on both the frontend and backend simultaneously:

1. Clone the Redux API repository
2. Launch the Redux API using `dotnet run` (the Redux repo's [setup guide](https://github.com/ReduxISU/Redux/blob/CSharpAPI/Documentation/guides/setup.md) has the details)
3. The API will be available at `http://127.0.0.1:27000/`

The GUI finds the API through the `REDUX_BASE_URL` setting. `.env.development` already points it at `http://localhost:27000/`, so for local work you do not need to change anything.

The info boxes link each problem, solver, verifier, visualization, and reduction to its source file on GitHub. The repo defaults to `https://github.com/reduxISU/Redux`; set `NEXT_PUBLIC_REDUX_REPO_URL` (e.g. in `.env.local`) to point at a fork. It is read at build time, so restart `npm run dev` after changing it.

### Step 4: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Code Overview

The Redux frontend is currently functionally complete. The majority of future additions will be **visualizations**.

### Key Directory Structure

**Visualization Files:**
- `components/Visualization/svgs/Visualizations.js` - The registry that maps a `visualizationType` (for example `GraphD3`) to the renderer that draws it
- `components/Visualization/svgs/visualizationTypes.json` - A copy of the API's list of visualization types (see "Adding New Visualizations" below)
- `components/Visualization/svgs/` - Contains all SVG-generating React components
- `components/widgets/VisualizationLogic.js` - Looks up the renderer and hands it the data to draw (reductions are drawn through the same registry)

**Page Components:**
- `components/pageblocks/` - Major components that make up the main interface
- `pages/index.js` - Main page that implements all components

**Widgets:**
- `components/widgets/` - Reusable React components used throughout the application

### Adding New Components

When adding new features:
- **New major components** → Add to `components/pageblocks/` folder, then implement in `pages/index.js`
- **New visualizations** → Add to `components/Visualization/svgs/` folder
- **New widgets** → Add to `components/widgets/` folder
---

## Adding to the Codebase

### Adding New Visualizations

A visualization has two halves. The **API** works out the data and sends it as JSON. The **GUI** (this repo) draws that JSON. For the full cross-repo walkthrough, read the Redux guide
[Adding a visualization](https://github.com/ReduxISU/Redux/blob/CSharpAPI/Documentation/guides/adding-a-visualization.md).

**Most of the time you do not need to change this repo.** If your new problem can be drawn by an existing renderer (graphs, sets, SAT formulas, quantum circuits, tables, pump schedules), you only add a visualization class in the Redux API. The GUI asks the API what exists and draws it.

You only change this repo when you need a **brand-new visualization type** that no existing renderer can draw. Then:

1. **Create the renderer.** Add a React component to `components/Visualization/svgs/` that returns an SVG. The GUI fetches the data for you and passes it in as props, so your component does not call the API itself. It receives `problemData` (the JSON the API produced), `solve`, `url`, `gadgetMap`, and `gadgetsOn`. Copy a small existing renderer such as `StandardGraphSvgReact.js` and follow its style.
2. **Register it.** In `components/Visualization/svgs/Visualizations.js`, add a small factory function and one entry to the `Visualizations` map, keyed by the type name:

   ```javascript
   ["GraphD3", renderGraphD3],
   ```

   Keep the key a double-quoted string at the start of the entry. The coverage checker reads the file with a text pattern, not a JavaScript parser.
3. **Update the vendored manifest.** Add the type name to `components/Visualization/svgs/visualizationTypes.json`. This file is a copy of the API's `Documentation/visualization-types.json`.
4. **Check it.** Run `npm run check:visualizations`. It fails if the registry and the manifest disagree.
5. **Open the matching API PR** in the Redux repo (new `VisualizationType` member plus its manifest entry). Open this GUI PR first and link the two PRs to each other. If the lists drift apart, a daily check (`.github/workflows/manifest-drift.yml`) opens an issue. It never blocks your PR.

Whichever case you are in, make sure the visualization works for both solved and unsolved problem instances.

### Adding New Major Components

New major page components should be:
1. Created in the `components/pageblocks/` folder
2. Implemented in the `pages/index.js` file

### Adding New Widgets

General-purpose React components should be added to the `components/widgets/` folder.

---

## Deployment

### Docker Deployment

Production runs as a Docker image. The `Dockerfile` installs dependencies and builds the site inside the image, so you do not need to run `npm run build` first:

```bash
docker build -t reduxgui .
docker run -it --rm -p 3000:3000 --name reduxgui reduxgui
```

The site is then at [http://localhost:3000](http://localhost:3000). Add `-e REDUX_BASE_URL=<address of a running Redux API>` to the `docker run` command so the container can reach the API. To link the info boxes to a different source repo, pass `--build-arg NEXT_PUBLIC_REDUX_REPO_URL=<repo URL>` to `docker build` (a `docker run -e` will not work, since the value is baked in at build time).

**Note:** The Docker server uses production binaries, so warnings will be different from the development environment.

To only check that the site builds (no Docker), run `npm run build`.

### CI and publishing

`.github/workflows/rbs.yml` runs the whole pipeline through the
[Redux Build System](https://github.com/ReduxISU/Redux_Build_System) inside this repo's dev
container: `audit → format-check → lint → build → integration-test → push`. Gates and thresholds
live in `rbs.toml`, and the same command runs locally:

```bash
rbs ci
```

On a push to `ReduxAPI_GUI`, and only if every gate passed, `push` publishes the exact image the
integration tests ran against to `ghcr.io/reduxisu/redux_gui` as `:<sha7>` and `:latest`. On pull
requests it reports `skipped`. See [TESTING.md](TESTING.md) for the integration suite and how to run it.

For a plain-language overview of every check on a PR (what it does, which ones block merging, and what to do when one fails), see the Redux guide [Building and testing](https://github.com/ReduxISU/Redux/blob/CSharpAPI/Documentation/guides/building-and-testing.md).

Before you push, run:

```bash
npm run format:check   # formatting (Biome); `npm run format` fixes it
npm run lint           # code problems (ESLint); `npm run lint:fix` fixes many
npm run check:visualizations
npm run build
```

---

## Branching Strategy

There is one long-lived branch: **`ReduxAPI_GUI`**. It is the production branch, and every change reaches it through a pull request (PR).

### Workflow

1. **Create a branch** from `ReduxAPI_GUI`, with a descriptive name:

   ```bash
   git fetch origin
   git switch -c my-change origin/ReduxAPI_GUI
   ```

2. **Make your changes** and run the checks listed under "CI and publishing" above.
3. **Open a pull request** that targets `ReduxAPI_GUI`.
4. **Assign a reviewer** for code review.
5. **Wait for the checks to pass.** When a push to `ReduxAPI_GUI` succeeds, the image is published automatically (see "CI and publishing").

**Important:** The person who completes the code review is responsible for completing the pull request.

---

## Definition of Done

### Any pull request

- `npm run format:check` and `npm run lint` pass
- `npm run check:visualizations` passes
- `npm run build` succeeds
- The PR targets `ReduxAPI_GUI` and the CI checks are green (read the rbs report, not just the status)
- If you changed behavior a user can see, you added or updated an integration test, or explained in the PR why not (see [TESTING.md](TESTING.md))

### New Visualizations

If your visualization reuses an existing type, the work is in the Redux API and is covered by the [checklist in that guide](https://github.com/ReduxISU/Redux/blob/CSharpAPI/Documentation/guides/adding-a-visualization.md). Nothing is needed here.

If you added a **new type** to this repo, all of the following must be true:

**React Component Structure**
- The renderer is a React component that returns an SVG
- It draws from the `problemData` prop it is given, and does not call the API itself
- It follows the style of existing visualizations and reuses their methods where applicable

**Feature Completeness**
- Solution highlighting works (both solved and unsolved instances draw correctly)
- Gadget highlighting works if the type is used for reduction visualizations
- It works for all relevant reduction types

**Code Integration**
- The renderer is registered in `components/Visualization/svgs/Visualizations.js`
- The type name is in `components/Visualization/svgs/visualizationTypes.json`, spelled exactly like the API's enum member
- The matching Redux API PR exists and links to this one

---

## Contributors

This project is developed by students and faculty at Idaho State University's Computer Science Department.

For a complete list of contributors, visit our [About Us page](https://redux.portneuf.cose.isu.edu/aboutus).

---

## Additional Resources

### Documentation
- [Redux Backend Repository](https://github.com/ReduxISU/Redux)
- [Redux Backend API Documentation](https://api.redux.portneuf.cose.isu.edu/swagger/index.html)
- [Wikipedia: What is NP-Complete?](https://en.wikipedia.org/wiki/NP-completeness)
- [Karp's 21 NP-Complete Problems](https://en.wikipedia.org/wiki/Karp%27s_21_NP-complete_problems)

### Technology Stack
- **Framework:** Next.js (React)
- **Visualization:** D3.js, SVG
- **Styling:** MUI (Material UI) and CSS
- **API Communication:** REST API calls to Redux Backend

### Related Repositories
- **Backend API:** [Redux](https://github.com/ReduxISU/Redux)
- **Quantum Solver:** [quantumsolver](https://github.com/ReduxISU/quantumsolver)

---

## Getting Help

- **Issues:** Use GitHub Issues for bug reports and feature requests
- **Discord:** [Join our community](https://discord.gg/sEC3rTXn2Z)
- **Weekly Meetings:** Thursdays at 11:20 AM MT via [Zoom](https://isu.zoom.us/j/85203480771?pwd=oEMlnn5EItmPFy3OKHnLqENQF52OIK.1&jst=3)

---

## License

This project is developed at Idaho State University's Computer Science Department.

---


