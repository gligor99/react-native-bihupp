// ─── Components ──────────────────────────────────────────────────────────────
export { BihuppQRCode } from './BihuppQRCode';
export type { BihuppQRCodeProps } from './BihuppQRCode';

// ─── Hooks ───────────────────────────────────────────────────────────────────
export { useBihuppScanner } from './useBihuppScanner';
export type {
  UseBihuppScannerOptions,
  UseBihuppScannerReturn,
  ScannerState,
} from './useBihuppScanner';

// ─── Re-export bihupp-js core for convenience ─────────────────────────────────
export {
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
