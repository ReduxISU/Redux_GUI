# Node 24 Migration TODO

## Immediate fixes (low effort)

- [ ] Align `react` and `react-dom` to the same version (`^18.3.1`)
- [ ] Add `"engines": { "node": ">=24" }` to `package.json`
- [ ] Add `.nvmrc` with `24`

## Upgrade Next.js (bulk of the work)

Next.js 12 → 14+ is required for Node 24 compatibility. Risks with staying on 12:
- Webpack 4 / OpenSSL 3 conflict (the `--openssl-legacy-provider` workaround may break on Node 24)
- V8 13.x (Node 24) may break Next 12's native SWC compiler

Steps:
- [ ] Follow the [Next.js upgrade guides](https://nextjs.org/docs/upgrading) incrementally: 12 → 13 → 14 → 15
- [ ] Update `next.config.js`: replace `experimental: { outputStandalone: true }` with `output: 'standalone'`
- [ ] Update `eslint-config-next` to match the new Next.js version

## ESLint

- [ ] Upgrade ESLint 8 → 9 (ESLint 8 is EOL)
- [ ] Migrate config format: `.eslintrc` → `eslint.config.mjs` (ESLint 9 uses flat config)

## Jest

- [ ] Upgrade Jest 28 → 29 or 30 (explicit Node 24 support, drops old polyfills)

## Node 24 LTS timeline (for reference)

- Active LTS: October 2025 – October 2027
- Maintenance LTS: October 2027 – April 2028
- End of Life: April 2028
