import { describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import {
  AddressLine1,
  AddressLine2,
  Amount,
  Name,
  PaymentInstruction,
  PaymentPurpose,
  RecipientAccount,
  useBihuppScanner,
} from '../index';

const payload = new PaymentInstruction({
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
}).toString();

describe('useBihuppScanner', () => {
  it('parses a valid payload and stops scanning', async () => {
    const onSuccess = jest.fn();
    const { result } = await renderHook(() => useBihuppScanner({ onSuccess }));

    expect(result.current.isActive).toBe(true);

    await act(() => result.current.handleScan(payload));

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.isActive).toBe(false);
    expect(result.current.state.hasScanned).toBe(true);
    expect(result.current.state.result?.success).toBe(true);
  });

  it('fires onSuccess once for a burst of scans before re-render', async () => {
    const onSuccess = jest.fn();
    const { result } = await renderHook(() => useBihuppScanner({ onSuccess }));

    // Cameras deliver several events within the same frame.
    await act(() => {
      result.current.handleScan(payload);
      result.current.handleScan(payload);
      result.current.handleScan(payload);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('calls onError for non-BIHUPP data and keeps scanning', async () => {
    const onError = jest.fn();
    const onSuccess = jest.fn();
    const { result } = await renderHook(() =>
      useBihuppScanner({ onError, onSuccess })
    );

    await act(() => result.current.handleScan('https://example.com'));

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.isActive).toBe(true);
    expect(result.current.state.result?.success).toBe(false);
  });

  it('reset allows scanning again', async () => {
    const onSuccess = jest.fn();
    const { result } = await renderHook(() => useBihuppScanner({ onSuccess }));

    await act(() => result.current.handleScan(payload));
    await act(() => result.current.reset());

    expect(result.current.isActive).toBe(true);
    expect(result.current.state.result).toBeNull();

    await act(() => result.current.handleScan(payload));
    expect(onSuccess).toHaveBeenCalledTimes(2);
  });

  it('keeps scanning after success when stopAfterScan is false', async () => {
    const onSuccess = jest.fn();
    const { result } = await renderHook(() =>
      useBihuppScanner({ onSuccess, stopAfterScan: false })
    );

    await act(() => result.current.handleScan(payload));
    await act(() => result.current.handleScan(payload));

    expect(onSuccess).toHaveBeenCalledTimes(2);
    expect(result.current.isActive).toBe(true);
  });

  it('uses the latest callback without re-creating handleScan', async () => {
    const first = jest.fn();
    const second = jest.fn();
    const { result, rerender } = await renderHook(
      ({ cb }: { cb: () => void }) => useBihuppScanner({ onSuccess: cb }),
      { initialProps: { cb: first } }
    );
    const handleScan = result.current.handleScan;

    await rerender({ cb: second });
    expect(result.current.handleScan).toBe(handleScan);

    await act(() => result.current.handleScan(payload));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
