import { useState } from "react";

/**
 * Calls `adjust` during render whenever any of `deps` differs from the previous render.
 *
 * React's own recipe for state that must follow another value: the setter runs before this
 * render commits, so the reset is never one paint late the way it is from an effect. `adjust`
 * may only set state owned by the calling component, and it does not run on mount.
 */
export function useWhenChanged(deps, adjust) {
  const [previous, setPrevious] = useState(deps);
  if (deps.some((dep, i) => !Object.is(dep, previous[i]))) {
    setPrevious(deps);
    adjust();
  }
}
