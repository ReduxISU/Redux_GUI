import tex2svg from "node-tikzjax";

// node-tikzjax runs one TeX engine per process and is not safe to call concurrently: two compiles
// that overlap fail with "TeX engine render failed" (issue #389). So every compile goes through
// this queue and runs only after the one before it has finished, success or failure.
let queue = Promise.resolve();

function runOneAtATime(task) {
  const run = queue.then(task);
  // Keep the chain alive after a failed compile, or every later request would fail with it.
  queue = run.catch(() => {});
  return run;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { tikzBody } = req.body;

  const tikzDocument = `
\\begin{document}
${tikzBody}
\\end{document}
  `;

  try {
    const svg = await runOneAtATime(() =>
      tex2svg(tikzDocument, {
        showConsole: false,
        tikzLibraries: ["automata", "positioning", "arrows.meta"],
        // Without this, glyph <text> elements reference TeX-only font
        // families (cmr10, cmmi10, ...) that browsers don't have, so they
        // render in a fallback font -- and dvisvgm's chosen Unicode code
        // point for a given glyph slot doesn't always match what it
        // actually looks like in a normal font (e.g. cmmi10's lowercase
        // epsilon renders as "²", a superscript 2, in any font that
        // isn't cmmi10 itself). Embedding the real font as `@font-face`
        // CSS makes every glyph render using its actual TeX shape.
        embedFontCss: true,
      }),
    );
    res.status(200).json({ success: true, svg });
  } catch (err) {
    console.error("TikZ Compilation Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
