// Asks Redux for a picture in whichever format this site can draw.
//
//   1. Ask for `format=frames`, with the chosen solver. Redux answers `{type, payload, frames}`.
//   2. A `type` with a renderer in ./registry.js is drawn from those frames.
//   3. A legacy `type` (one the old registry in ../svgs/Visualizations.js knows, e.g. "GraphD3")
//      is Redux wrapping its old items: `payload` is the base picture and `frames` the steps and
//      the solved picture, so `[payload, ...frames]` is exactly the old flat list. No second request.
//   4. Any other `type` (a new picture type with no renderer here yet) is asked for again as the
//      old flat list and drawn by the old renderer.
//
// A backend older than `format=frames` ignores the parameter and answers the flat list, which
// is used as is. When `/info` already names the visualization's `pictureType` (Redux#841) and it
// has no renderer here, step 1 is skipped; a solve is expensive and the answer is known.

import { requestVisualization } from "../../redux";
import Visualizations from "../svgs/Visualizations";
import { hasPictureRenderer } from "./registry";

/**
 * @typedef {{format: "frames", type: string, payload: Object|null, frames: Object[]}
 *   | {format: "list", frames: Object[]}} Picture
 */

export const EMPTY_PICTURE = Object.freeze({ format: "list", frames: [] });

const isEmptyPayload = (payload) => payload == null || payload.kind === "empty";

function asList(frames) {
  return { format: "list", frames: Array.isArray(frames) ? frames : [] };
}

function fromFramesResponse(response) {
  if (Array.isArray(response)) return asList(response);
  if (!response || !Array.isArray(response.frames)) return null;
  if (hasPictureRenderer(response.type)) {
    return {
      format: "frames",
      type: response.type,
      payload: response.payload ?? null,
      frames: response.frames,
    };
  }
  if (Visualizations.has(response.type)) {
    const base = isEmptyPayload(response.payload) ? [] : [response.payload];
    return asList([...base, ...response.frames]);
  }
  return null;
}

/**
 * @param {string} url the API base
 * @param {Object} options
 * @param {string} options.visualization the visualization class name
 * @param {string|null} [options.pictureType] its picture type from `/info`, when the API sends one
 * @param {string} options.instance the instance text
 * @param {string} [options.solver] the solver class name whose run to draw
 * @returns {Promise<Picture>}
 */
export async function requestPicture(url, { visualization, pictureType, instance, solver }) {
  const knownWithoutRenderer = pictureType != null && !hasPictureRenderer(pictureType);
  const fromFrames = knownWithoutRenderer
    ? null
    : fromFramesResponse(
        await requestVisualization(url, visualization, instance, { solver, format: "frames" }),
      );
  return fromFrames ?? asList(await requestVisualization(url, visualization, instance, { solver }));
}
