import { useCallback, useEffect, useRef, useState } from 'react';
import { parsePaymentInstruction, type ParseResult } from 'bihupp-js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScannerState {
  /** Result of the last scan, or `null` if nothing was scanned yet */
  result: ParseResult | null;
  /** True once a valid BIHUPP10 code was scanned and `stopAfterScan` is on */
  hasScanned: boolean;
}

export interface UseBihuppScannerOptions {
  /** Called when a valid BIHUPP10 QR is successfully scanned and parsed */
  onSuccess?: (result: Extract<ParseResult, { success: true }>) => void;
  /** Called when scanned QR is not a valid BIHUPP10 payload */
  onError?: (result: Extract<ParseResult, { success: false }>) => void;
  /** If true, stops scanning after first successful scan (default: true) */
  stopAfterScan?: boolean;
}

export interface UseBihuppScannerReturn {
  /** Handle a scanned QR code string from expo-camera or any scanner */
  handleScan: (data: string) => void;
  /** Current scanner state */
  state: ScannerState;
  /** Reset scanner state to allow scanning again */
  reset: () => void;
  /** Whether to allow camera to process new barcodes */
  isActive: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook for handling BIHUPP10 QR code scanning.
 *
 * Works with `expo-camera`, `react-native-vision-camera`, or any scanner
 * that gives you a raw string from the QR code.
 *
 * @example
 * ```tsx
 * import { CameraView } from 'expo-camera';
 * import { useBihuppScanner } from 'react-native-bihupp';
 *
 * export function ScannerScreen() {
 *   const { handleScan, isActive } = useBihuppScanner({
 *     onSuccess: (result) => {
 *       console.log(result.instruction.recipient.name.value);
 *       console.log(result.instruction.amount.pennies / 100, 'BAM');
 *     },
 *     onError: (result) => {
 *       console.error('Not a BIHUPP QR:', result.error.message);
 *     },
 *   });
 *
 *   return (
 *     <CameraView
 *       onBarcodeScanned={isActive ? ({ data }) => handleScan(data) : undefined}
 *       barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
 *       style={{ flex: 1 }}
 *     />
 *   );
 * }
 * ```
 */
export function useBihuppScanner({
  onSuccess,
  onError,
  stopAfterScan = true,
}: UseBihuppScannerOptions = {}): UseBihuppScannerReturn {
  const [state, setState] = useState<ScannerState>({
    result: null,
    hasScanned: false,
  });

  // Cameras fire many scan events per second, before React re-renders.
  // A ref lock guarantees `onSuccess` fires exactly once per successful scan.
  const lockedRef = useRef(false);

  // Keep the latest callbacks without making `handleScan` unstable.
  const callbacksRef = useRef({ onSuccess, onError });
  useEffect(() => {
    callbacksRef.current = { onSuccess, onError };
  });

  const handleScan = useCallback(
    (data: string) => {
      if (lockedRef.current) return;

      const result = parsePaymentInstruction(data);
      const locked = result.success && stopAfterScan;
      lockedRef.current = locked;

      setState({ result, hasScanned: locked });

      if (result.success) {
        callbacksRef.current.onSuccess?.(result);
      } else {
        callbacksRef.current.onError?.(result);
      }
    },
    [stopAfterScan]
  );

  const reset = useCallback(() => {
    lockedRef.current = false;
    setState({ result: null, hasScanned: false });
  }, []);

  return {
    handleScan,
    state,
    reset,
    isActive: !state.hasScanned,
  };
}
