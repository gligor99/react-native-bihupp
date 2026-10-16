## 1.0.1

- Docs: add Expo Snack demo, README badges and npm provenance (first release published from CI).

## 1.0.0

- Initial release:
  - `<BihuppQRCode />` component for rendering BIHUPP10 payment QR codes.
  - `useBihuppScanner()` hook for parsing scanned QR codes, firing `onSuccess` exactly once per scan.
  - Re-exports of the `bihupp-js` core API.
  - Supports Expo SDK 57 and 58 (Expo Go, development builds) and bare React Native 0.79+.
