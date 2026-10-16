import { useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { PaymentInstruction, type PaymentInstructionParams } from 'bihupp-js';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BihuppQRCodeProps {
  /**
   * Payment instruction — either the params object passed to the
   * `PaymentInstruction` constructor, or an already built `PaymentInstruction`.
   */
  instruction: PaymentInstructionParams | PaymentInstruction;
  /** QR code size in pixels (default: 200) */
  size?: number;
  /** QR code foreground color (default: '#000000') */
  color?: string;
  /** QR code background color (default: '#ffffff') */
  backgroundColor?: string;
  /** Error correction level (default: 'M') */
  ecl?: 'L' | 'M' | 'Q' | 'H';
  /** Quiet zone (white border) around the QR code in pixels (default: 0) */
  quietZone?: number;
  /** Optional logo to embed in the center of the QR code */
  logo?: ImageSourcePropType;
  /** Logo size as ratio of QR size (default: 0.2) */
  logoSize?: number;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Accessibility label for the QR code (default: 'Payment QR code') */
  accessibilityLabel?: string;
  /** Called with the BIHUPP10 payload once it is built successfully */
  onReady?: (payload: string) => void;
  /** Called if building the payload throws a validation error */
  onError?: (error: Error) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type BuildResult =
  { payload: string; error: null } | { payload: null; error: Error };

function buildPayload(
  instruction: PaymentInstructionParams | PaymentInstruction
): BuildResult {
  try {
    const inst =
      instruction instanceof PaymentInstruction
        ? instruction
        : new PaymentInstruction(instruction);
    return { payload: inst.toString(), error: null };
  } catch (err) {
    return {
      payload: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
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
  instruction,
  size = 200,
  color = '#000000',
  backgroundColor = '#ffffff',
  ecl = 'M',
  quietZone = 0,
  logo,
  logoSize = 0.2,
  style,
  accessibilityLabel = 'Payment QR code',
  onReady,
  onError,
}: BihuppQRCodeProps) {
  const { payload, error } = useMemo(
    () => buildPayload(instruction),
    [instruction]
  );

  // Callbacks run after render, never during it.
  useEffect(() => {
    if (error) onError?.(error);
    else onReady?.(payload);
    // Only re-run when the result changes, not when callback identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, error]);

  if (payload === null) return null;

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID="bihupp-qr-code"
    >
      <QRCode
        value={payload}
        size={size}
        color={color}
        backgroundColor={backgroundColor}
        ecl={ecl}
        quietZone={quietZone}
        {...(logo ? { logo, logoSize: size * logoSize } : {})}
        onError={onError}
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
