import tex2svg from "node-tikzjax";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();
    const { tikzBody } = req.body;

    const tikzDocument = `
\\begin{document}
${tikzBody}
\\end{document}
  `;

    try {
        const svg = await tex2svg(tikzDocument, {
            showConsole: true,
            tikzLibraries: ["automata", "positioning", "arrows.meta"],
        });
        res.status(200).json({ success: true, svg });
    } catch (err) {
        console.error("TikZ Compilation Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
}
