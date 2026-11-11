import { Component } from "react";

const sameKeys = (a = [], b = []) =>
  a.length === b.length && a.every((key, i) => Object.is(key, b[i]));

/**
 * Catches an exception a visualization renderer throws while React renders it (or in one of its
 * effects), which the try/catch around the renderer factory in VisualizationLogic cannot see: the
 * factory only builds the element, React renders it afterwards. Without this the error escapes to
 * the page and Next.js shows its "Application error" / runtime error screen instead of the picture
 * pane's "Failed to Visualize" card.
 *
 * On an error it shows `fallback(error)` (the same card the try/catch path shows) and logs the
 * error with `logMessage`, like that path does. The card stays only while `resetKeys` (the problem,
 * instance, visualization, picture data and so on) are unchanged: when any of them changes the
 * renderer is tried again, so one bad picture never sticks after a switch (#388). Healthy pictures
 * are not remounted when the keys change.
 */
export default class VisualizationErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps, prevState) {
    // Only an error from an earlier render is cleared: one thrown in the render that brought the
    // new keys belongs to them.
    if (
      this.state.error !== null &&
      prevState.error !== null &&
      !sameKeys(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error, info) {
    console.error(
      this.props.logMessage,
      ...(this.props.logDetails ?? []),
      error,
      info?.componentStack,
    );
  }

  render() {
    if (this.state.error !== null) return this.props.fallback(this.state.error);
    return this.props.children;
  }
}
