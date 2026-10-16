# Contributing to react-native-bihupp

Thanks for your interest in contributing! Bug reports, fixes and improvements are all welcome.

## Reporting issues

- **Bugs and feature requests:** open an [issue](https://github.com/gligor99/react-native-bihupp/issues/new/choose) using one of the templates.
- **Security vulnerabilities:** do not open a public issue — see [SECURITY.md](SECURITY.md).
- Never paste real account numbers, tax IDs or other personal data. Use placeholder values.
- Problems with the BIHUPP10 payload itself (field rules, parsing) usually belong in [`bihupp-js`](https://github.com/gligor99/bihupp-js/issues).

## Development setup

Requires Node.js 22 or newer. The project uses Yarn 4 workspaces; enable Corepack once so `yarn` picks the right version:

```bash
corepack enable
git clone https://github.com/gligor99/react-native-bihupp.git
cd react-native-bihupp
yarn
```

| Command                          | Description                                         |
| -------------------------------- | --------------------------------------------------- |
| `yarn test`                      | Run unit tests (Jest + React Native Testing Library) |
| `yarn typecheck`                 | Type-check the library and the example app          |
| `yarn prepare`                   | Build `lib/` with react-native-builder-bob          |
| `yarn lint:pkg`                  | Check package exports with publint                  |
| `yarn example start`             | Start the example app (Expo SDK 58)                 |
| `scripts/sdk-compat.sh <sdk>`    | Install the packed library into a fresh Expo app and bundle it |

The example app resolves `react-native-bihupp` to `src/`, so changes are picked up with fast refresh — no rebuild needed.

## Project structure

```
src/
  index.tsx              public entry point
  BihuppQRCode.tsx       QR code component
  useBihuppScanner.ts    scanner hook
  __tests__/             unit tests
example/                 Expo example app
example/snack/App.tsx    source of the Expo Snack demo (paste into the Snack when it changes)
scripts/sdk-compat.sh    Expo SDK compatibility check (used in CI)
```

## Expo SDK support

CI checks every supported Expo SDK (`expo-compat` job in `.github/workflows/ci.yml`). When a new SDK is released:

1. Add it to the `sdk` matrix in CI.
2. Upgrade the example app: `yarn example expo install expo@^<sdk> --fix`.
3. Drop SDKs that Expo no longer supports.

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Make your change and add tests.
3. Make sure `yarn typecheck` and `yarn test` pass.
4. Update `README.md` if the public API changed, and add an entry to `CHANGELOG.md`.
5. Open a pull request with a short description of what and why.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:` …).

## Releases

Releases are published to npm by the maintainer from GitHub Actions when a `v*` tag is pushed.

## Code of conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to uphold it.
