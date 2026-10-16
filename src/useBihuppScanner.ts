import { useCallback, useState } from 'react';
import { parsePaymentInstruction, type ParseResult } from 'bihupp-js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScannerState {
  result: ParseResult | null;
  isScanning: boolean;
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
 * Works with `expo-camera`, `expo-barcode-scanner`, or any scanner
 * that gives you a raw string from the QR code.
 *
 * @example
 * ```tsx
 * import { CameraView } from 'expo-camera';
 * import { useBihuppScanner } from 'react-native-bihupp';
 *
 * export function ScannerScreen() {
 *   const { handleScan, state, reset, isActive } = useBihuppScanner({
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
    isScanning: false,
    hasScanned: false,
  });

  const handleScan = useCallback(
    (data: string) => {
      if (stopAfterScan && state.hasScanned) return;

      setState((prev) => ({ ...prev, isScanning: true }));

      const result = parsePaymentInstruction(data);

      setState({
        result,
        isScanning: false,
        hasScanned: result.success ? stopAfterScan : false,
      });

      if (result.success) {
        onSuccess?.(result);
      } else {
        onError?.(result);
      }
    },
    [state.hasScanned, stopAfterScan, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setState({ result: null, isScanning: false, hasScanned: false });
  }, []);

  return {
    handleScan,
    state,
    reset,
    isActive: !state.hasScanned,
  };
}
