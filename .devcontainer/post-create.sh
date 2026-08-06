#!/usr/bin/env bash
set -euo pipefail

# mise supplies dev-loop aliases only (rbs owns the gates), and this script also runs in CI via
# devcontainers/ci — so a mise.run outage must not fail container creation or redden a PR.
if ! command -v mise >/dev/null 2>&1; then
  curl -fsSL https://mise.run | sh || echo "warn: mise install failed; 'mise run ...' unavailable"
fi
MISE="$(command -v mise || true)"
[ -n "${MISE}" ] || MISE="${HOME}/.local/bin/mise"
if [ -x "${MISE}" ]; then
  grep -qF 'mise activate bash' "${HOME}/.bashrc" 2>/dev/null || echo "eval \"\$(${MISE} activate bash)\"" >> "${HOME}/.bashrc"
  "${MISE}" trust
fi

# node_modules and .next are container-local volumes; make them writable by this user.
sudo chown "$(id -u):$(id -g)" node_modules .next

# Seed local env from template, then install deps.
[ -f .env.local ] || cp .env.example .env.local
npm ci

# Chromium for the integration tests (see TESTING.md). Guarded like mise above: this also runs in
# CI via devcontainers/ci, so a download failure must not fail container creation or redden a PR.
#
# `sudo -E` on its own is NOT enough: sudoers' secure_path replaces PATH regardless, npx is not
# found, and the deps quietly never install. Chromium then dies with exit 127 and
# "error while loading shared libraries: libglib-2.0.so.0" — which looks nothing like the cause.
if ! sudo -E env "PATH=${PATH}" npx --yes playwright install-deps chromium; then
  echo "warn: playwright system deps failed to install — browser tests will not be able to start"
fi
npx playwright install chromium || echo "warn: chromium download failed; 'npm run test:e2e' unavailable"
