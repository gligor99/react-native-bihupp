# react-native-bihupp

React Native components and hooks for **BIHUPP10** bank payment QR codes in Bosnia and Herzegovina.

Built on top of [`bihupp-js`](../bihupp-js) — the core TypeScript library.

---

## Installation

```bash
npm install react-native-bihupp bihupp-js
npx expo install react-native-qrcode-svg react-native-svg
```

For bare React Native (non-Expo):
```bash
cd ios && pod install
```

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
      size={250}
    />
  );
}
```

### Scan a payment QR code

```tsx
import { CameraView } from 'expo-camera';
import { useBihuppScanner } from 'react-native-bihupp';

export function ScannerScreen() {
  const { handleScan, state, reset, isActive } = useBihuppScanner({
    onSuccess: (result) => {
      const { instruction } = result;
      console.log('Recipient:', instruction.recipient.name.value);
      console.log('Amount:', instruction.amount.pennies / 100, 'BAM');
      console.log('Purpose:', instruction.purpose.value);
    },
    onError: (result) => {
      console.warn('Not a valid BIHUPP QR code:', result.error.message);
    },
  });

  return (
    <CameraView
      onBarcodeScanned={isActive ? ({ data }) => handleScan(data) : undefined}
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      style={{ flex: 1 }}
    />
  );
}
```

---

## API

### `<BihuppQRCode />`

| Prop | Type | Default | Description |
|---|---|---|---|
| `instruction` | `PaymentInstructionParams` | required | Payment data |
| `size` | `number` | `200` | QR code size in pixels |
| `color` | `string` | `'#000000'` | Foreground color |
| `backgroundColor` | `string` | `'#ffffff'` | Background color |
| `logo` | `object` | — | Logo to embed in center |
| `logoSize` | `number` | `0.2` | Logo size as ratio of QR size |
| `style` | `ViewStyle` | — | Container style |
| `onReady` | `() => void` | — | Called when QR renders |
| `onError` | `(error: Error) => void` | — | Called on validation error |

### `useBihuppScanner(options)`

```ts
const { handleScan, state, reset, isActive } = useBihuppScanner({
  onSuccess?: (result) => void,  // called on valid BIHUPP10 scan
  onError?: (result) => void,    // called on invalid QR
  stopAfterScan?: boolean,       // default: true
});
```

| Return | Type | Description |
|---|---|---|
| `handleScan` | `(data: string) => void` | Pass raw QR string from camera |
| `state.result` | `ParseResult \| null` | Last parse result |
| `state.hasScanned` | `boolean` | Whether a successful scan happened |
| `state.isScanning` | `boolean` | Processing in progress |
| `reset` | `() => void` | Reset to scan again |
| `isActive` | `boolean` | Pass to camera to enable/disable scanning |

---

## Re-exports

All `bihupp-js` exports are re-exported for convenience:

```ts
import {
  // From bihupp-js core:
  PaymentInstruction,
  parsePaymentInstruction,
  Name,
  AddressLine1,
  AddressLine2,
  Amount,
  PaymentPurpose,
  PaymentPriority,
  PhoneNumber,
  RecipientAccount,
  BihuppValidationError,
  // From react-native-bihupp:
  BihuppQRCode,
  useBihuppScanner,
} from 'react-native-bihupp';
```

---

## Peer dependencies

| Package | Version |
|---|---|
| `react` | `>=18.0.0` |
| `react-native` | `>=0.74.0` |
| `react-native-qrcode-svg` | `>=6.0.0` (optional, for `<BihuppQRCode />`) |
| `react-native-svg` | `>=15.0.0` (optional, for `<BihuppQRCode />`) |

`react-native-qrcode-svg` and `react-native-svg` are only required if you use `<BihuppQRCode />`. The `useBihuppScanner` hook has zero native dependencies.

---

## License

MIT
