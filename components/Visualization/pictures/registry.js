// Which picture types this site draws from Redux's `format=frames` response, and with which
// renderer. The response names its picture type in `type` ("Graph", "Formula", ...); that is the
// only thing the choice is made on.
//
// A picture type not listed here keeps the renderer it had before the redesign: pictureRequest.js
// gets the old flat list instead and the registry in ../svgs/Visualizations.js draws it. So each
// picture type switches over on its own, the moment its renderer is added here, and nothing that
// draws today stops drawing in between (ReduxISU/Redux_GUI#351).
//
// Adding a renderer (ReduxISU/Redux_GUI#353):
//   1. Write ./<Type>Renderer.js. It receives
//        { idPrefix, name, payload, frame, frameIndex, frameCount, mode }
//      where `payload` is the response's static part, `frame` is `frames[frameIndex]` and `mode`
//      is the theme mode. React owns the SVG; D3 is for math only; every colour comes from
//      pictureStates.js; every focusable piece gets an aria-label.
//   2. Add it below under the exact `type` Redux sends.
//   3. Cover it in tests/e2e with a payload captured from the live API.

export const PICTURE_RENDERERS = {};

export function hasPictureRenderer(type) {
  return typeof type === "string" && Object.hasOwn(PICTURE_RENDERERS, type);
}
