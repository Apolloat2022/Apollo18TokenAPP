# Skills — Apollo18Working

## Tech Stack
- Runtime/Framework: Expo SDK 54 / React Native 0.73.6, Expo Router 3 (older router version despite newer Expo core — verify compatibility before upgrading either independently)
- Language: TypeScript, `app.config.js` (dynamic config)
- Key libraries: `ethers` v5 (older ethers major version, unlike `viem`/`wagmi` used by most siblings), `web3modal`, `@walletconnect/web3wallet`, `@walletconnect/universal-provider`, `@walletconnect/utils`, `@walletconnect/types`, `react-native-dotenv` (env var injection via Babel)
- Database/ORM: none — but see `services/taxEngine` below, a bespoke in-app tax calculation module
- Auth: wallet-based (WalletConnect v2 web3wallet stack)
- Deployment target: Vercel — `vercel.json` (`expo export -p web`, static `dist/` output, SPA rewrites) plus `package.json` scripts `deploy` (`npm run build && vercel --prod`) and `vercel` (bare `vercel` CLI invocation). This is the most "production-leaning" variant per its own tooling.

## What makes this variant distinct
- `README.md` and `PLAN.md` describe a detailed **2026 regulatory compliance framework** ("Apollo 18: 2026 Compliance Regulatory Framework") positioning the Apollo18 token as a "Functional Digital Tool"/utility rather than a security, with Texas-specific tax handling (Prosper, TX; 8.25% rate applied to 80% of transaction value under a claimed "Data Processing & Information Services" exemption), KYC thresholds ($1,000+ triggers "Light KYC"), and geographic IP gating.
- `services/taxEngine` (referenced by `verify_tax.ts`) implements exactly this Texas tax formula: `finalPrice = price + (price * 0.8 * 0.0825)`. This directly parallels the Texas tax/OBBBA logic in the sibling `Apollo-tax` project — the two apps appear to be part of the same product ecosystem (PLAN.md explicitly mentions "Form 1099-DA reporting via the Apollo Tax tool").
- `verify_tax.ts` is a **hand-rolled verification script** (not a test framework) — run it directly (e.g. via `ts-node` or `npx tsx verify_tax.ts`) to check the tax engine against 4 hardcoded price/tax expectations; there's no npm script wired up for it, so check `package.json` before assuming a `test` command exists.
- `metro.config.js.backup` — an unused backup file, worth noting but not acted on here.

## Common Workflows
- Install: `npm install`
- Dev server: `npm run start` (`expo start`)
- Platform-specific: `npm run android`, `npm run ios`, `npm run web`
- Build: `npm run build` (`expo export -p web`)
- Deploy: `npm run deploy` (build + `vercel --prod`), or `npm run vercel` for a plain Vercel CLI call
- Test/verify: no wired npm script — run `verify_tax.ts` directly against `services/taxEngine` to sanity-check the Texas tax calculation
- Env: copy `.env.local.example` to `.env.local` (uses `react-native-dotenv`, so also check `babel.config.js` for how env vars are exposed to the app)

## Relevant Claude Code Skills (already available)
- `expo-dev-run` — project-specific skill for starting/running this Expo app
- `find-canonical-app` — should be consulted before working here; this variant's Vercel deploy scripts and detailed compliance docs suggest it may be the most "current"/production candidate among the Apollo18 copies, but that should be confirmed with a human rather than assumed
- `vercel-app-deploy` — this repo has explicit `deploy`/`vercel` npm scripts and a `vercel.json`; use this skill for deploy/build-log debugging
- `security-review` — this variant handles wallet connections (WalletConnect web3wallet), a bespoke tax/compliance calculation, and KYC-threshold logic; changes here are higher-stakes than a typical UI tweak and should get a security review
- `verify` — the tax-engine logic in particular should be exercised end-to-end (e.g. via `verify_tax.ts`) before considering a change to `services/taxEngine` done

## Skills We'd Need to Create
- `tax-engine-parity-check`: compare the Texas tax formula in this app's `services/taxEngine` against the equivalent logic in the sibling `Apollo-tax` project, since PLAN.md implies they're meant to stay consistent (both implement OBBBA/Texas-specific tax rules) but there's no automated cross-repo check today.

## Notes
This is one of several parallel/iterative copies of the same Apollo18 crypto wallet reservation product. Sibling folders: `Apollo18`, `Apollo18App`, `Apollo18Expo`, `Apollo18Netlify`, `ApolloWorking`, `APOLLO18KIMI`. This copy stands out as the most feature-complete/production-leaning one (detailed compliance docs, working Vercel deploy scripts, a real tax-engine verification script) — a strong candidate for "canonical" status, but confirm with a human before treating it as such.
