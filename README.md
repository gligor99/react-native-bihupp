# react-native-bihupp

[![npm](https://img.shields.io/npm/v/react-native-bihupp)](https://www.npmjs.com/package/react-native-bihupp)
[![CI](https://github.com/gligor99/react-native-bihupp/actions/workflows/ci.yml/badge.svg)](https://github.com/gligor99/react-native-bihupp/actions/workflows/ci.yml)
[![Try it on Snack](https://img.shields.io/badge/Try%20it-Expo%20Snack-4630EB?logo=expo)](https://snack.expo.dev/@g99labs/react-native-bihupp)

React Native and Expo components for **BIHUPP10** bank payment QR codes in Bosnia and Herzegovina — render a payment QR code ("uplatnica") or scan one with the camera.

Built on top of [`bihupp-js`](https://github.com/gligor99/bihupp-js), the core TypeScript library.

- `<BihuppQRCode />` — renders a BIHUPP10 QR code that banking apps can scan
- `useBihuppScanner()` — turns raw camera scans into parsed payment data
- Pure JavaScript, no native code — works in **Expo Go**, development builds and bare React Native
- Tested against **Expo SDK 57 and 58** on every change

**▶ [Try it in your browser or on your phone with Expo Snack](https://snack.expo.dev/@g99labs/react-native-bihupp)** — generate a payment QR code and scan it with Expo Go.

---

## Installation

### Expo

```bash
npx expo install react-native-bihupp react-native-qrcode-svg react-native-svg
```

For scanning, also install the camera:

```bash
npx expo install expo-camera
```

### Bare React Native

```bash
npm install react-native-bihupp react-native-qrcode-svg react-native-svg
cd ios && pod install
```

### Requirements

| Package                   | Version     |
| ------------------------- | ----------- |
| `react`                   | `>=19.0.0`  |
| `react-native`            | `>=0.79.0`  |
| `react-native-svg`        | `>=15.0.0`  |
| `react-native-qrcode-svg` | `>=6.3.0`   |

---

## Quick start

### Render a payment QR code

```tsx
import {
  BihuppQRCode,
  Name,
  AddressLine1,
  AddressLine2,
  Amount,
  PaymentPurpose,
  RecipientAccount,
} from 'react-native-bihupp';

export function InvoiceScreen() {
  return (
    <BihuppQRCode
      size={250}
      instruction={{
        recipient: {
          name: Name.business('Vodovod d.o.o.'),
          address: {
            addressLine1: AddressLine1.of('Kralja Petra I Karađorđevića', '97'),
            addressLine2: AddressLine2.of('78000', 'Banja Luka'),
          },
          account: RecipientAccount.of({ value: '9876543210987654' }),
        },
        amount: Amount.fromBAM(98.62),
        purpose: PaymentPurpose.of('Račun za vodu - april 2025'),
        reference: { value: '1234-5678-001' },
      }}
      onError={(error) => console.warn(error.message)}
    />
  );
}
```

### Scan a payment QR code

```tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useBihuppScanner } from 'react-native-bihupp';

export function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { handleScan, isActive, reset } = useBihuppScanner({
    onSuccess: ({ instruction }) => {
      console.log('Recipient:', instruction.recipient.name.value);
      console.log('Amount:', instruction.amount.pennies / 100, 'BAM');
      console.log('Purpose:', instruction.purpose.value);
    },
    onError: ({ error }) => {
      console.warn('Not a BIHUPP QR code:', error.message);
    },
  });

  if (!permission?.granted) {
    // ask for permission with requestPermission()
    return null;
  }

  return (
    <CameraView
      style={{ flex: 1 }}
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      onBarcodeScanned={isActive ? ({ data }) => handleScan(data) : undefined}
    />
  );
}
```

Cameras report the same code many times per second. `useBihuppScanner` locks after the first successful scan, so `onSuccess` fires exactly once until you call `reset()`.

---

## API

### `<BihuppQRCode />`

| Prop                 | Type                                            | Default             | Description                                           |
| -------------------- | ----------------------------------------------- | ------------------- | ----------------------------------------------------- |
| `instruction`        | `PaymentInstructionParams \| PaymentInstruction` | required            | Payment data, or an already built `PaymentInstruction` |
| `size`               | `number`                                        | `200`               | QR code size in pixels                                |
| `color`              | `string`                                        | `'#000000'`         | Foreground color                                      |
| `backgroundColor`    | `string`                                        | `'#ffffff'`         | Background color                                      |
| `ecl`                | `'L' \| 'M' \| 'Q' \| 'H'`                      | `'M'`               | Error correction level                                |
| `quietZone`          | `number`                                        | `0`                 | White border around the code, in pixels               |
| `logo`               | `ImageSourcePropType`                           | —                   | Logo in the center (use `ecl="H"` with a logo)        |
| `logoSize`           | `number`                                        | `0.2`               | Logo size as a ratio of `size`                        |
| `style`              | `StyleProp<ViewStyle>`                          | —                   | Container style                                       |
| `accessibilityLabel` | `string`                                        | `'Payment QR code'` | Label read by screen readers                          |
| `onReady`            | `(payload: string) => void`                     | —                   | Called with the BIHUPP10 payload once it is built     |
| `onError`            | `(error: Error) => void`                        | —                   | Called when the payment data is invalid               |

When the instruction is invalid the component renders nothing and calls `onError` with a `BihuppValidationError`.

### `useBihuppScanner(options?)`

| Option          | Type                       | Default | Description                                  |
| --------------- | -------------------------- | ------- | -------------------------------------------- |
| `onSuccess`     | `(result) => void`         | —       | Called for a valid BIHUPP10 code             |
| `onError`       | `(result) => void`         | —       | Called for any other QR code                 |
| `stopAfterScan` | `boolean`                  | `true`  | Stop after the first successful scan         |

| Returns            | Type                     | Description                                      |
| ------------------ | ------------------------ | ------------------------------------------------ |
| `handleScan`       | `(data: string) => void` | Pass the raw QR string from your camera          |
| `isActive`         | `boolean`                | `false` after a successful scan, until `reset()` |
| `reset`            | `() => void`             | Allow scanning again                             |
| `state.result`     | `ParseResult \| null`    | Result of the last scan                          |
| `state.hasScanned` | `boolean`                | Whether a successful scan locked the scanner     |

`handleScan` is stable across renders, and the latest `onSuccess` / `onError` are always used.

### Re-exports

Everything you need from `bihupp-js` is re-exported, so one import is enough:

```ts
import {
  PaymentInstruction,
  PaymentInstructionBuilder,
  parsePaymentInstruction,
  validatePaymentInstruction,
  Name,
  AddressLine1,
  AddressLine2,
  Amount,
  PaymentPurpose,
  PaymentPriority,
  PhoneNumber,
  RecipientAccount,
  BihuppValidationError,
} from 'react-native-bihupp';
```

For field constraints, the allowed character set and Zod validation, see the [`bihupp-js` documentation](https://github.com/gligor99/bihupp-js#readme).

---

## Example app

Try it without installing anything on [Expo Snack](https://snack.expo.dev/@g99labs/react-native-bihupp) (source: [`example/snack/App.tsx`](example/snack/App.tsx)).

The [`example`](example) folder contains an Expo SDK 58 app with a QR generator form and a camera scanner.

```bash
yarn
yarn example start
```

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for the development setup and guidelines. Found a bug? [Open an issue](https://github.com/gligor99/react-native-bihupp/issues/new/choose).

---

## License

MIT — see [LICENSE](LICENSE).
