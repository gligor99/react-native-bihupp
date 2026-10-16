import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import {
  AddressLine1,
  AddressLine2,
  Amount,
  BihuppQRCode,
  Name,
  PaymentInstruction,
  PaymentPurpose,
  RecipientAccount,
} from '../index';

// react-native-svg is native; render the QR value as plain text instead.
jest.mock('react-native-qrcode-svg', () => {
  const { Text } =
    jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: ({ value }: { value: string }) => (
      <Text testID="qr-value">{value}</Text>
    ),
  };
});

const params = {
  recipient: {
    name: Name.business('Vodovod d.o.o.'),
    address: {
      addressLine1: AddressLine1.of('Kralja Petra I', '97'),
      addressLine2: AddressLine2.of('78000', 'Banja Luka'),
    },
    account: RecipientAccount.of({ value: '9876543210987654' }),
  },
  amount: Amount.fromBAM(98.62),
  purpose: PaymentPurpose.of('Račun za vodu'),
};

describe('BihuppQRCode', () => {
  it('renders the BIHUPP10 payload from params', async () => {
    const onReady = jest.fn();
    await render(<BihuppQRCode instruction={params} onReady={onReady} />);

    const expected = new PaymentInstruction(params).toString();
    expect(screen.getByTestId('qr-value').props.children).toBe(expected);
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledWith(expected);
  });

  it('accepts a prebuilt PaymentInstruction', async () => {
    const instruction = new PaymentInstruction(params);
    await render(<BihuppQRCode instruction={instruction} />);

    expect(screen.getByTestId('qr-value').props.children).toBe(
      instruction.toString()
    );
  });

  it('is accessible as an image', async () => {
    await render(
      <BihuppQRCode instruction={params} accessibilityLabel="Uplatnica" />
    );

    expect(screen.getByRole('image', { name: 'Uplatnica' })).toBeTruthy();
  });

  it('renders nothing and calls onError for invalid params', async () => {
    const onError = jest.fn();
    const onReady = jest.fn();
    const invalid = {
      ...params,
      recipient: {
        ...params.recipient,
        account: { accounts: [{ value: 'not-digits' }] },
      },
    };

    await render(
      <BihuppQRCode instruction={invalid} onError={onError} onReady={onReady} />
    );

    expect(screen.queryByTestId('qr-value')).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(onReady).not.toHaveBeenCalled();
  });
});
