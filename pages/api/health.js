// Readiness probe. `rbs integration-test` polls this to know the container is serving before it
// runs the suite, so it must not depend on the backend or on any page rendering.
export default function handler(_req, res) {
  res.status(200).json({ status: "ok" });
}
