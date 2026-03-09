// pages/problemmap/index.js

import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import { requestProblems, requestReductionOptions } from "../../components/redux";

import {
  Box,
  Button,
  Chip,
  Container,
  createTheme,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";

export default function ProblemMapPage() {
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: { main: "#424242" },
      secondary: { main: "#f47920" },
    },
  });

  // Backend base URL
  const reduxBaseUrl = (process.env.NEXT_PUBLIC_REDUX_BASE_URL || "").trim();

  // Ensure trailing slash
  const safeApiUrl = useMemo(() => {
    if (!reduxBaseUrl) return "";
    return reduxBaseUrl.endsWith("/") ? reduxBaseUrl : reduxBaseUrl + "/";
  }, [reduxBaseUrl]);

  /**
   * Backend returns NPC_* names and does not expose true complexity metadata,
   * so we classify in the frontend:
   * - P_SET => P
   * - everything else => NP-COMPLETE
   */
  const P_SET = useMemo(
    () =>
      new Set([
        "PRIMEFACTOR",
        "DEUTSCH",
        "DEUTSCHJOZSA",
        "BERNSTEINVAZIRANI",
        "SIMON",
      ]),
    []
  );

  const canonicalKey = (name) =>
  String(name || "")
    .trim()
    .toUpperCase()
    .replace(/^NPC_/, "");

  const classifyProblem = (name) => {
  const key = canonicalKey(name);
  if (!key) return "UNKNOWN";
  if (P_SET.has(key)) return "P";
  return "NP-COMPLETE";
};

  const COMPLEXITY_TABS = [
    { label: "ALL", problemType: "ALL" },
    { label: "P", problemType: "P" },
    { label: "NP-COMPLETE", problemType: "NP-COMPLETE" },
    { label: "NP-HARD", problemType: "NP-HARD" },
  ];

  const [tabIndex, setTabIndex] = useState(0);
  const currentProblemType = COMPLEXITY_TABS[tabIndex]?.problemType ?? "ALL";

  const [status, setStatus] = useState("Idle.");
  const [loading, setLoading] = useState(false);

  const [problems, setProblems] = useState([]); // [{name, raw, class}]
  const [edgesByProblem, setEdgesByProblem] = useState({}); // { [name]: string[] }

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showOnlySelectedEdges, setShowOnlySelectedEdges] = useState(false);

  // For Inspector explanation: selected -> focusTarget
  const [focusTarget, setFocusTarget] = useState(null);

  // ---- helpers ------------------------------------------------------------
  const normalizeProblems = (raw) => {
    if (!Array.isArray(raw)) return [];

    return raw
      .map((p) => {
        let name =
          p?.problemName ??
          p?.name ??
          p?.id ??
          p?.problem ??
          (typeof p === "string" ? p : null);

        // If it's a JSON string like: "{ \"problemName\": \"NPC_CLIQUE\" }"
        if (typeof name === "string" && name.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(name);
            name = parsed?.problemName ?? parsed?.name ?? name;
          } catch {
            // ignore
          }
        }

        if (!name) return null;
        const n = String(name).trim();
        if (!n) return null;

        return { name: n, raw: p, class: classifyProblem(n) };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Remove prefix for display only
  const stripPrefix = (name) => String(name || "").replace(/^NPC_/, "");

  const runWithConcurrency = async (items, limit, worker) => {
    const results = new Array(items.length);
    let i = 0;

    const runners = new Array(Math.min(limit, items.length))
      .fill(null)
      .map(async () => {
        while (true) {
          const idx = i++;
          if (idx >= items.length) break;
          results[idx] = await worker(items[idx], idx);
        }
      });

    await Promise.all(runners);
    return results;
  };

  const explainReduction = (from, to, viewType) => {
    if (!from || !to) return "";

    const fromClass = classifyProblem(from);
    const toClass = classifyProblem(to);

    return (
      `Reduction: ${stripPrefix(from)} → ${stripPrefix(to)}\n\n` +
      `Classes (frontend view):\n` +
      `• ${stripPrefix(from)}: ${fromClass}\n` +
      `• ${stripPrefix(to)}: ${toClass}\n\n` +
      `Meaning:\n` +
      `There is an efficient (polynomial-time) transformation that converts any instance of "${stripPrefix(
        from
      )}" into an instance of "${stripPrefix(to)}".\n\n` +
      `Why it matters:\n` +
      `If we can solve "${stripPrefix(to)}" efficiently, then we can solve "${stripPrefix(from)}" efficiently by converting it into "${stripPrefix(to)}" first.\n\n` +
      `Notation:\n` +
      `"${stripPrefix(from)} ≤p ${stripPrefix(to)}"\n\n` +
      `View: ${viewType}`
    );
  };

  // ---- data fetch ---------------------------------------------------------
  const loadProblems = async () => {
    if (!safeApiUrl) {
      setStatus(
        "NEXT_PUBLIC_REDUX_BASE_URL is not set. Problem Map cannot load from backend."
      );
      return;
    }
    try {
      setStatus("Loading problems...");
      const rawProblems = await requestProblems(safeApiUrl);
      const normalized = normalizeProblems(rawProblems);
      setProblems(normalized);
      setStatus(`Loaded ${normalized.length} problems.`);
    } catch (err) {
      console.error(err);
      setStatus("Failed to load problems from backend.");
    }
  };

  const loadEdgesForType = async () => {
    if (!safeApiUrl) return;

    setLoading(true);
    setSelected(null);
    setFocusTarget(null);
    setShowOnlySelectedEdges(false);

    try {
      // Pick visible nodes based on classification
      const nodesForThisTab =
        currentProblemType === "ALL"
          ? problems.map((p) => p.name)
          : currentProblemType === "P"
          ? problems.filter((p) => p.class === "P").map((p) => p.name)
          : currentProblemType === "NP-COMPLETE"
          ? problems.filter((p) => p.class === "NP-COMPLETE").map((p) => p.name)
          : // NP-HARD tab for now = "everything not P"
            problems.filter((p) => p.class !== "P").map((p) => p.name);

      setStatus(
        `Loading reductions for ${currentProblemType} (${nodesForThisTab.length} nodes visible)...`
      );

      if (!nodesForThisTab.length) {
        setEdgesByProblem({});
        setStatus(`No problems found for ${currentProblemType}.`);
        return;
      }

      // ✅ SKIP reductions for P (you wanted list-only + no edges)
      if (currentProblemType === "P") {
        const emptyMap = {};
        nodesForThisTab.forEach((n) => (emptyMap[n] = []));
        setEdgesByProblem(emptyMap);
        setStatus(
          `Loaded ${nodesForThisTab.length} P problems (list view; no reductions).`
        );
        return;
      }

      const visibleSet = new Set(nodesForThisTab);

      const edgePairs = await runWithConcurrency(
        nodesForThisTab,
        6,
        async (problemName) => {
          try {
            // Always ask backend for reductions in NPC graph world
            const opts = await requestReductionOptions(
              safeApiUrl,
              problemName,
              "NPC"
            );

            const targets = Array.isArray(opts)
              ? opts
                  .map(
                    (x) =>
                      x?.problemName ??
                      x?.name ??
                      x?.id ??
                      (typeof x === "string" ? x : null)
                  )
                  .filter(Boolean)
                  .map(String)
              : [];

            // keep only edges inside current tab
            const cleaned = Array.from(new Set(targets)).filter((t) =>
              visibleSet.has(t)
            );

            return [problemName, cleaned];
          } catch (e) {
            return [problemName, []];
          }
        }
      );

      const map = {};
      for (const [from, tos] of edgePairs) map[from] = tos;

      setEdgesByProblem(map);
      setStatus(`Loaded graph: ${nodesForThisTab.length} nodes.`);
    } catch (err) {
      console.error(err);
      setStatus("Failed to load reductions for this view.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!safeApiUrl) return;
    loadProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeApiUrl]);

  useEffect(() => {
    if (!safeApiUrl) return;
    if (!problems.length) return;
    loadEdgesForType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeApiUrl, currentProblemType, problems.length]);

  // ---- filtering (TYPE + search) -----------------------------------------
  const filteredProblems = useMemo(() => {
    const q = query.trim().toLowerCase();

    let base =
      currentProblemType === "ALL"
        ? problems
        : currentProblemType === "P"
        ? problems.filter((p) => p.class === "P")
        : currentProblemType === "NP-COMPLETE"
        ? problems.filter((p) => p.class === "NP-COMPLETE")
        : problems.filter((p) => p.class !== "P"); // NP-HARD for now

    if (!q) return base;
    return base.filter((p) => p.name.toLowerCase().includes(q));
  }, [problems, query, currentProblemType]);

  const nodeNames = useMemo(
    () => filteredProblems.map((p) => p.name),
    [filteredProblems]
  );

  const visibleEdgeList = useMemo(() => {
    const set = new Set(nodeNames);
    const list = [];

    for (const from of nodeNames) {
      const tos = edgesByProblem[from] || [];
      for (const to of tos) {
        if (!set.has(to)) continue;

        if (showOnlySelectedEdges) {
          if (!selected) continue;
          if (from !== selected && to !== selected) continue;
        }

        list.push({ from, to });
      }
    }

    return list;
  }, [nodeNames, edgesByProblem, showOnlySelectedEdges, selected]);

  // ---- layout / SVG -------------------------------------------------------
  const svgRef = useRef(null);

  const layout = useMemo(() => {
    const W = 980;
    const H = 600;
    const cx = W / 2;
    const cy = H / 2;
    const r = Math.min(W, H) * 0.36;

    const pos = {};
    const n = nodeNames.length;

    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / Math.max(1, n) - Math.PI / 2;
      pos[nodeNames[i]] = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    }

    return { W, H, pos };
  }, [nodeNames]);

  const getNodeRadius = (name) => (name === selected ? 12 : 9);

  const edgePath = (from, to) => {
    const a = layout.pos[from];
    const b = layout.pos[to];
    if (!a || !b) return "";

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.max(1, Math.hypot(dx, dy));

    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const ox = (-dy / len) * 22;
    const oy = (dx / len) * 22;

    const cx = mx + ox;
    const cy = my + oy;

    const ra = getNodeRadius(from) + 2;
    const rb = getNodeRadius(to) + 6;

    const sx = a.x + (dx / len) * ra;
    const sy = a.y + (dy / len) * ra;
    const ex = b.x - (dx / len) * rb;
    const ey = b.y - (dy / len) * rb;

    return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
  };

  const selectedOutgoing = useMemo(() => {
    if (!selected) return [];
    return edgesByProblem[selected] || [];
  }, [selected, edgesByProblem]);

  const selectedIncoming = useMemo(() => {
    if (!selected) return [];
    const inc = [];
    for (const [from, tos] of Object.entries(edgesByProblem)) {
      if (tos?.includes(selected)) inc.push(from);
    }
    return inc.sort((a, b) => a.localeCompare(b));
  }, [selected, edgesByProblem]);

  // ---- UI ----------------------------------------------------------------
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Redux | Problem Map</title>
      </Head>

      <ResponsiveAppBar />

      <Container sx={{ mt: 3, mb: 4 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Problem Map
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Status:{" "}
            {safeApiUrl
              ? status
              : "NEXT_PUBLIC_REDUX_BASE_URL is not set, so I can’t load problems from the backend."}
          </Typography>

          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            {COMPLEXITY_TABS.map((t) => (
              <Tab key={t.problemType} label={t.label} />
            ))}
          </Tabs>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ md: "center" }}
            sx={{ mb: 2 }}
          >
            <TextField
              label="Search problems"
              size="small"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ minWidth: 260 }}
            />

            <Button
              variant="contained"
              disabled={loading || !safeApiUrl}
              onClick={loadEdgesForType}
              sx={{ minWidth: 160 }}
            >
              {loading ? "Loading..." : "Reload Graph"}
            </Button>

            <Button
              variant={showOnlySelectedEdges ? "contained" : "outlined"}
              disabled={!nodeNames.length}
              onClick={() => setShowOnlySelectedEdges((v) => !v)}
            >
              {showOnlySelectedEdges
                ? "Showing: Selected Edges"
                : "Show Only Selected Edges"}
            </Button>

            {selected ? (
              <Chip
                label={`Selected: ${stripPrefix(selected)} (${classifyProblem(
                  selected
                )})`}
                onDelete={() => {
                  setSelected(null);
                  setFocusTarget(null);
                }}
              />
            ) : (
              <Chip label="Click a node to inspect" variant="outlined" />
            )}
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
            {/* Graph / List */}
            <Box sx={{ flex: 1, overflowX: "auto" }}>
              <Box sx={{ minWidth: 980 }}>
                {/* ✅ LIST VIEW FOR P */}
                {currentProblemType === "P" ? (
                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 1, fontWeight: 700 }}
                    >
                      P Problems (List)
                    </Typography>

                    {nodeNames.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No P problems found.
                      </Typography>
                    ) : (
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {nodeNames.map((name) => (
                          <Chip
                            key={name}
                            label={stripPrefix(name)}
                            onClick={() => {
                              setSelected(name);
                              setFocusTarget(null);
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                ) : (
                  <svg
                    ref={svgRef}
                    width={layout.W}
                    height={600}
                    style={{
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 10,
                      background: "white",
                    }}
                  >
                    <defs>
                      <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="9"
                        refY="5"
                        markerWidth="7"
                        markerHeight="7"
                        orient="auto-start-reverse"
                      >
                        <path
                          d="M 0 0 L 10 5 L 0 10 z"
                          fill="rgba(0,0,0,0.55)"
                        />
                      </marker>
                    </defs>

                    {/* edges */}
                    {visibleEdgeList.map((e, idx) => {
                      const focused =
                        selected &&
                        focusTarget &&
                        e.from === selected &&
                        e.to === focusTarget;
                      const hot =
                        focused ||
                        (selected &&
                          (e.from === selected || e.to === selected));

                      return (
                        <path
                          key={`${e.from}->${e.to}-${idx}`}
                          d={edgePath(e.from, e.to)}
                          fill="none"
                          stroke={
                            focused
                              ? "rgba(244,121,32,1)"
                              : hot
                              ? "rgba(244,121,32,0.9)"
                              : "rgba(0,0,0,0.22)"
                          }
                          strokeWidth={focused ? 3.2 : hot ? 2.2 : 1.2}
                          markerEnd="url(#arrow)"
                        />
                      );
                    })}

                    {/* nodes */}
                    {nodeNames.map((name) => {
                      const p = layout.pos[name];
                      if (!p) return null;
                      const isSelected = name === selected;
                      const c = classifyProblem(name);

                      const fill =
                        c === "P"
                          ? "rgba(120,120,120,0.85)"
                          : "rgba(66,66,66,0.85)";

                      return (
                        <g
                          key={name}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setSelected(name);
                            setFocusTarget(null);
                          }}
                        >
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={getNodeRadius(name)}
                            fill={
                              isSelected ? "rgba(244,121,32,0.95)" : fill
                            }
                            stroke="rgba(0,0,0,0.25)"
                            strokeWidth="1"
                          />
                          <text
                            x={p.x}
                            y={p.y - 14}
                            textAnchor="middle"
                            fontSize="11"
                            fill="rgba(0,0,0,0.75)"
                          >
                            {stripPrefix(name).length > 18
                              ? stripPrefix(name).slice(0, 18) + "…"
                              : stripPrefix(name)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}

                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 1, color: "text.secondary" }}
                >
                  Showing {nodeNames.length} nodes and{" "}
                  {currentProblemType === "P" ? 0 : visibleEdgeList.length}{" "}
                  directed edges for <b>{currentProblemType}</b>.
                </Typography>
              </Box>
            </Box>

            {/* Inspector */}
            <Box sx={{ width: { xs: "100%", lg: 360 } }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Inspector
                </Typography>

                {!selected ? (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "text.secondary" }}
                  >
                    Click a node to see its incoming/outgoing reductions and an
                    explanation.
                  </Typography>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <b>Problem:</b> {stripPrefix(selected)}{" "}
                      <span style={{ color: "rgba(0,0,0,0.55)" }}>
                        ({classifyProblem(selected)})
                      </span>
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    >
                      Outgoing (to):
                    </Typography>

                    {selectedOutgoing.length ? (
                      <Stack direction="row" flexWrap="wrap" gap={0.8}>
                        {selectedOutgoing
                          .filter((t) => nodeNames.includes(t))
                          .sort((a, b) => a.localeCompare(b))
                          .slice(0, 60)
                          .map((t) => (
                            <Chip
                              key={t}
                              size="small"
                              label={`${stripPrefix(t)} (${classifyProblem(
                                t
                              )})`}
                              color={focusTarget === t ? "secondary" : "default"}
                              onClick={() => setFocusTarget(t)}
                            />
                          ))}
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        None found.
                      </Typography>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    >
                      Incoming (from):
                    </Typography>

                    {selectedIncoming.length ? (
                      <Stack direction="row" flexWrap="wrap" gap={0.8}>
                        {selectedIncoming
                          .filter((t) => nodeNames.includes(t))
                          .slice(0, 60)
                          .map((t) => (
                            <Chip
                              key={t}
                              size="small"
                              label={`${stripPrefix(t)} (${classifyProblem(
                                t
                              )})`}
                              variant="outlined"
                              onClick={() => {
                                setSelected(t);
                                setFocusTarget(null);
                              }}
                            />
                          ))}
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        None visible.
                      </Typography>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    >
                      Reduction Explanation
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", whiteSpace: "pre-line" }}
                    >
                      {focusTarget
                        ? explainReduction(selected, focusTarget, currentProblemType)
                        : `Click an outgoing target chip above to explain a specific reduction.\n\nGeneral idea:\nA → B means we can transform A into B efficiently. So if B is easy to solve, then A becomes easy too.`}
                    </Typography>

                    {focusTarget && (
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={() => setFocusTarget(null)}
                      >
                        Clear Reduction Explanation
                      </Button>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        setSelected(null);
                        setFocusTarget(null);
                      }}
                    >
                      Clear Selection
                    </Button>
                  </>
                )}
              </Paper>
            </Box>
          </Stack>

          {!safeApiUrl && (
            <Box sx={{ mt: 2 }}>
              <Paper
                variant="outlined"
                sx={{ p: 2, borderColor: "rgba(244,121,32,0.5)" }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 0.5 }}
                >
                  Backend not configured
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Set:
                  <br />
                  <code>NEXT_PUBLIC_REDUX_BASE_URL=http://localhost:27000/</code>
                  <br />
                  Then restart:
                  <br />
                  <code>Ctrl+C</code> and <code>npm run dev</code>
                </Typography>
              </Paper>
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}