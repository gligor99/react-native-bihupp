// Snack demo for react-native-bihupp: https://snack.expo.dev
import { useMemo, useState } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  AddressLine1,
  AddressLine2,
  Amount,
  BihuppQRCode,
  Name,
  PaymentPurpose,
  RecipientAccount,
  useBihuppScanner,
} from 'react-native-bihupp';
import type { PaymentInstructionParams } from 'react-native-bihupp';

export default function App() {
  const [scan, setScan] = useState(false);
  return (
    <View style={{ flex: 1, paddingTop: 48, backgroundColor: '#fff' }}>
      <Button
        title={scan ? 'Generiši QR' : 'Skeniraj QR'}
        onPress={() => setScan(!scan)}
      />
      {scan ? <Scanner /> : <Generator />}
    </View>
  );
}

function Generator() {
  const [name, setName] = useState('Vodovod d.o.o.');
  const [account, setAccount] = useState('9876543210987654');
  const [amount, setAmount] = useState('98.62');
  const [purpose, setPurpose] = useState('Račun za vodu');

  const result = useMemo((): PaymentInstructionParams | Error => {
    try {
      return {
        recipient: {
          name: Name.business(name),
          address: {
            addressLine1: AddressLine1.of('Kralja Petra I', '97'),
            addressLine2: AddressLine2.of('78000', 'Banja Luka'),
          },
          account: RecipientAccount.of({ value: account }),
        },
        amount: Amount.fromBAM(Number(amount.replace(',', '.')) || 0),
        purpose: PaymentPurpose.of(purpose),
      };
    } catch (e) {
      return e instanceof Error ? e : new Error(String(e));
    }
  }, [name, account, amount, purpose]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
      <View style={{ alignItems: 'center', minHeight: 240 }}>
        {result instanceof Error ? (
          <Text style={{ color: 'red' }}>{result.message}</Text>
        ) : (
          <BihuppQRCode instruction={result} size={220} />
        )}
      </View>
      <Field label="Primalac" value={name} onChange={setName} />
      <Field label="Račun" value={account} onChange={setAccount} />
      <Field label="Iznos (KM)" value={amount} onChange={setAmount} />
      <Field label="Svrha" value={purpose} onChange={setPurpose} />
    </ScrollView>
  );
}

function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const { handleScan, state, reset, isActive } = useBihuppScanner();

  if (!permission?.granted) {
    return <Button title="Dozvoli kameru" onPress={requestPermission} />;
  }

  const r = state.result;
  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={isActive ? ({ data }) => handleScan(data) : undefined}
      />
      <View style={{ padding: 16 }}>
        {!r ? (
          <Text>Usmjeri kameru na BIHUPP QR kod.</Text>
        ) : r.success ? (
          <>
            <Text>{r.instruction.recipient.name.value}</Text>
            <Text>{(r.instruction.amount.pennies / 100).toFixed(2)} KM</Text>
            <Text>{r.instruction.purpose.value}</Text>
            <Button title="Skeniraj ponovo" onPress={reset} />
          </>
        ) : (
          <Text style={{ color: 'red' }}>{r.error.message}</Text>
        )}
      </View>
    </View>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View>
      <Text>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChange}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8 }}
      />
    </View>
  );
}
