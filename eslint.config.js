// ESLint flat config (ESLint 9+). CommonJS to match the repo (no "type":"module").
//
// Layering, applied in order — later entries win on conflicts:
//   1. ignores        — vendored + build output we must NOT lint
//   2. js.recommended — the base-JavaScript correctness floor (no-undef, no-unused-vars,
//                       no-dupe-keys, no-unreachable, use-isnan, ...). eslint-config-next
//                       does NOT include this, so without it the whole plain-JS bug class
//                       goes unchecked. This is the coverage that was missing.
//   3. next/core-web-vitals — React + React Hooks (incl. React-Compiler rules) + jsx-a11y
//                       + @next/next, and 1000+ browser/node globals.
//   4. import-x       — import-correctness (catches importing a name that doesn't exist).
//                       See the long note below for why we use import-x, not Next's bundled
//                       import plugin.
//   5. project tuning — severity choices for THIS repo.
//   6. eslint-config-prettier — MUST be last: turns off any stylistic rules so ESLint and
//                       the Biome formatter never fight. Biome owns formatting; ESLint owns
//                       correctness. No overlap.
//
// Blocking: the CI ESLint job is still report-only (continue-on-error) — findings surface in
// GitHub code-scanning but do not fail PRs yet. Promoting a rule to a hard gate later is a
// one-line change here (flip a "warn" to "error") plus removing continue-on-error in CI.
//
// WHY import-x INSTEAD OF Next's bundled eslint-plugin-import:
//   Next ships a vendored eslint-plugin-import + eslint-module-utils whose default resolver is a
//   TypeScript resolver. Under ESLint 9 flat config that resolver loads with an "invalid
//   interface" and CRASHES the entire run the moment a resolver-dependent rule (import/named,
//   import/no-unresolved) hits a file that imports a package. Overriding the resolver setting
//   doesn't help because ESLint deep-merges `settings`, so Next's broken `typescript` resolver
//   can't be removed by omission. eslint-plugin-import-x is the maintained, flat-config-native
//   fork; we register it under its own `import-x/*` namespace with a node-only resolver (correct
//   for this pure-JS repo) and leave Next's import rules untouched. This is dev-time only —
//   Next 16's `next build` does not run ESLint, so none of this can affect the build or deploy.

const js = require("@eslint/js");
const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const importX = require("eslint-plugin-import-x");
const prettier = require("eslint-config-prettier");

// eslint-config-next exports an array of flat-config objects; spread it in.
const nextConfigs = Array.isArray(nextCoreWebVitals) ? nextCoreWebVitals : [nextCoreWebVitals];

module.exports = [
  // 1. Ignore what isn't ours. A config object with ONLY `ignores` is global.
  //    public/ holds the vendored Q.js library + static assets — linting it produced 38
  //    spurious no-undef errors, so it's excluded here.
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "public/**", "next-env.d.ts"],
  },

  // 2. Base JavaScript correctness — the previously-missing floor.
  js.configs.recommended,

  // 3. Next.js / React / hooks / a11y / @next (existing coverage + globals).
  ...nextConfigs,

  // 4. Import correctness via import-x (see header note). Node resolver = correct for pure JS.
  {
    plugins: { "import-x": importX },
    settings: {
      "import-x/resolver": { node: { extensions: [".js", ".jsx", ".json"] } },
    },
    rules: {
      // Imported a name the target module doesn't export (e.g. requestIsCertificateValid,
      // Typograph). no-unused-vars can't catch these — they're imported AND used.
      "import-x/named": "warn",
      // Import path that doesn't resolve to a real module.
      "import-x/no-unresolved": "warn",
    },
  },

  // 5. Project-specific severity tuning.
  {
    rules: {
      // Dead vars/imports are worth surfacing but there are ~100 today; keep them visible as
      // warnings rather than a wall of errors while we're still non-blocking. Ratchet to
      // "error" once the backlog is cleared.
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },

  // 6. Disable formatting-related rules so Biome (the formatter) is the single source of truth.
  //    Keep LAST so it overrides anything stylistic enabled above.
  prettier,
];
