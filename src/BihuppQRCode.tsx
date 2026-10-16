import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { PaymentInstruction, type PaymentInstructionParams } from 'bihupp-js';

// We lazy-import QRCode to avoid hard crash if peer dep isn't installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let QRCode: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  QRCode = require('react-native-qrcode-svg').default;
} catch {
  QRCode = null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BihuppQRCodeProps {
  /** Payment instruction params — passed directly to PaymentInstruction constructor */
  instruction: PaymentInstructionParams;
  /** QR code size in pixels (default: 200) */
  size?: number;
  /** QR code foreground color (default: '#000000') */
  color?: string;
  /** QR code background color (default: '#ffffff') */
  backgroundColor?: string;
  /** Optional logo to embed in center of QR */
  logo?: object;
  /** Logo size as ratio of QR size (default: 0.2) */
  logoSize?: number;
  /** Container style */
  style?: ViewStyle;
  /** Called when QR is successfully rendered */
  onReady?: () => void;
  /** Called if building the payload throws a validation error */
  onError?: (error: Error) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a BIHUPP10-compliant QR code for bank payment instructions in BiH.
 *
 * Requires `react-native-qrcode-svg` and `react-native-svg` as peer dependencies.
 *
 * @example
 * ```tsx
 * <BihuppQRCode
 *   instruction={{
 *     recipient: {
 *       name: Name.business('Vodovod d.o.o.'),
 *       address: {
 *         addressLine1: AddressLine1.of('Kralja Petra I', '97'),
 *         addressLine2: AddressLine2.of('78000', 'Banja Luka'),
 *       },
 *       account: RecipientAccount.of({ value: '9876543210987654' }),
 *     },
 *     amount: Amount.fromBAM(98.62),
 *     purpose: PaymentPurpose.of('Račun za vodu - april 2025'),
 *   }}
 *   size={250}
 * />
 * ```
 */
export function BihuppQRCode({
  instruction: instructionParams,
  size = 200,
  color = '#000000',
  backgroundColor = '#ffffff',
  logo,
  logoSize = 0.2,
  style,
  onReady,
  onError,
}: BihuppQRCodeProps): React.ReactElement | null {
  if (QRCode === null) {
    console.error(
      '[react-native-bihupp] `react-native-qrcode-svg` is not installed. ' +
        'Run: npx expo install react-native-qrcode-svg react-native-svg',
    );
    return null;
  }

  let payload: string;
  try {
    const inst = new PaymentInstruction(instructionParams);
    payload = inst.toString();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    onError?.(error);
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <QRCode
        value={payload}
        size={size}
        color={color}
        backgroundColor={backgroundColor}
        logo={logo}
        logoSize={size * logoSize}
        onError={onError}
        getRef={onReady ? () => onReady() : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
