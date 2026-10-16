// ─── Components ──────────────────────────────────────────────────────────────
export { BihuppQRCode } from './BihuppQRCode.js';
export type { BihuppQRCodeProps } from './BihuppQRCode.js';

// ─── Hooks ───────────────────────────────────────────────────────────────────
export { useBihuppScanner } from './useBihuppScanner.js';
export type {
  UseBihuppScannerOptions,
  UseBihuppScannerReturn,
  ScannerState,
} from './useBihuppScanner.js';

// ─── Re-export bihupp-js core for convenience ─────────────────────────────────
export {
  PaymentInstruction,
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
  BIHUPP_VERSION,
  BIHUPP_CURRENCY,
} from 'bihupp-js';

export type {
  PaymentInstructionParams,
  Recipient,
  Sender,
  Address,
  Account,
  ParseResult,
  PublicRevenueInstruction,
  PaymentReference,
} from 'bihupp-js';
