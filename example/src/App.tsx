import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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
  type PaymentInstructionParams,
} from 'react-native-bihupp';

type Tab = 'generate' | 'scan';

export default function App() {
  const [tab, setTab] = useState<Tab>('generate');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <Text style={styles.title}>react-native-bihupp</Text>
        <View style={styles.tabs}>
          <TabButton
            label="Generiši QR"
            active={tab === 'generate'}
            onPress={() => setTab('generate')}
          />
          <TabButton
            label="Skeniraj QR"
            active={tab === 'scan'}
            onPress={() => setTab('scan')}
          />
        </View>
        {tab === 'generate' ? <GenerateScreen /> : <ScanScreen />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ─── Generate ─────────────────────────────────────────────────────────────────

function GenerateScreen() {
  const [name, setName] = useState('Vodovod d.o.o.');
  const [street, setStreet] = useState('Kralja Petra I');
  const [number, setNumber] = useState('97');
  const [postalCode, setPostalCode] = useState('78000');
  const [city, setCity] = useState('Banja Luka');
  const [account, setAccount] = useState('9876543210987654');
  const [amount, setAmount] = useState('98.62');
  const [purpose, setPurpose] = useState('Račun za vodu');
  const [qrError, setQrError] = useState<string | null>(null);

  // Value-object factories validate eagerly, so build inside try/catch.
  const built = useMemo((): {
    instruction: PaymentInstructionParams | null;
    error: string | null;
  } => {
    try {
      const instruction: PaymentInstructionParams = {
        recipient: {
          name: Name.business(name),
          address: {
            addressLine1: AddressLine1.of(street, number),
            addressLine2: AddressLine2.of(postalCode, city),
          },
          account: RecipientAccount.of({ value: account }),
        },
        amount: Amount.fromBAM(Number(amount.replace(',', '.')) || 0),
        purpose: PaymentPurpose.of(purpose),
      };
      return { instruction, error: null };
    } catch (err) {
      return {
        instruction: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }, [name, street, number, postalCode, city, account, amount, purpose]);

  const { instruction } = built;
  const error = built.error ?? qrError;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.qr}>
        {instruction ? (
          <BihuppQRCode
            instruction={instruction}
            size={220}
            onReady={() => setQrError(null)}
            onError={(err) => setQrError(err.message)}
          />
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <Field label="Primalac" value={name} onChangeText={setName} />
      <View style={styles.row}>
        <Field label="Ulica" value={street} onChangeText={setStreet} flex={3} />
        <Field label="Broj" value={number} onChangeText={setNumber} flex={1} />
      </View>
      <View style={styles.row}>
        <Field
          label="Poštanski broj"
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="number-pad"
          flex={1}
        />
        <Field label="Grad" value={city} onChangeText={setCity} flex={2} />
      </View>
      <Field
        label="Račun primaoca"
        value={account}
        onChangeText={setAccount}
        keyboardType="number-pad"
      />
      <Field
        label="Iznos (KM)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />
      <Field label="Svrha uplate" value={purpose} onChangeText={setPurpose} />
    </ScrollView>
  );
}

// ─── Scan ─────────────────────────────────────────────────────────────────────

function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { handleScan, state, reset, isActive } = useBihuppScanner();

  if (Platform.OS === 'web') {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>
          Skeniranje radi na telefonu (Expo Go). Otvori primjer na uređaju.
        </Text>
      </View>
    );
  }

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Potrebna je dozvola za kameru.</Text>
        <Button label="Dozvoli kameru" onPress={requestPermission} />
      </View>
    );
  }

  const result = state.result;

  return (
    <View style={styles.flex}>
      <CameraView
        style={styles.flex}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={isActive ? ({ data }) => handleScan(data) : undefined}
      />
      <View style={styles.result}>
        {result === null ? (
          <Text style={styles.muted}>Usmjeri kameru na BIHUPP QR kod.</Text>
        ) : result.success ? (
          <>
            <Text style={styles.resultTitle}>
              {result.instruction.recipient.name.value}
            </Text>
            <Text>
              {(result.instruction.amount.pennies / 100).toFixed(2)} KM
            </Text>
            <Text>{result.instruction.purpose.value}</Text>
            <Text style={styles.muted}>
              Račun: {result.instruction.recipient.account.accounts[0]?.value}
            </Text>
            <Button label="Skeniraj ponovo" onPress={reset} />
          </>
        ) : (
          <Text style={styles.error}>
            Nije BIHUPP QR kod: {result.error.message}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function Field({
  label,
  flex,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string; flex?: number }) {
  return (
    <View style={[styles.field, flex !== undefined && { flex }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} autoCorrect={false} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f7f9' },
  flex: { flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  tabs: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#e4e7ec',
    borderRadius: 10,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#475467', fontWeight: '500' },
  tabTextActive: { color: '#101828' },
  content: { padding: 16, paddingTop: 0, gap: 12 },
  qr: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 252,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  row: { flexDirection: 'row', gap: 12 },
  field: { gap: 4 },
  label: { fontSize: 13, color: '#475467' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  result: { padding: 16, gap: 4, backgroundColor: '#fff' },
  resultTitle: { fontSize: 18, fontWeight: '600' },
  muted: { color: '#667085', textAlign: 'center' },
  error: { color: '#d92d20', textAlign: 'center', marginTop: 8 },
  button: {
    marginTop: 8,
    backgroundColor: '#155eef',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
