#!/usr/bin/env bash
# Installs the packed library into a fresh Expo app for the given SDK version,
# then type-checks and bundles it for iOS and Android.
#
# Usage: scripts/sdk-compat.sh <sdk-version> [work-dir]
# Example: scripts/sdk-compat.sh 58
set -euo pipefail

SDK="${1:?Usage: scripts/sdk-compat.sh <sdk-version> [work-dir]}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${2:-$(mktemp -d)}"
APP="$WORK/app-sdk-$SDK"

echo "› Packing library"
mkdir -p "$WORK"
(cd "$ROOT" && npm pack --pack-destination "$WORK" --silent)
TARBALL="$(ls "$WORK"/react-native-bihupp-*.tgz | head -n 1)"

echo "› Creating Expo SDK $SDK app in $APP"
CI=1 npx --yes create-expo-app@latest "$APP" \
  --template "blank-typescript@sdk-$SDK" --no-install >/dev/null

cd "$APP"
npm install --silent
CI=1 npx expo install react-native-svg react-native-qrcode-svg
npm install --silent "$TARBALL"

cat > App.tsx <<'EOF'
import { Text, View } from 'react-native';
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

export default function App() {
  const { isActive } = useBihuppScanner();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{isActive ? 'Scanner ready' : 'Scanned'}</Text>
      <BihuppQRCode
        size={220}
        instruction={{
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
        }}
      />
    </View>
  );
}
EOF

echo "› Versions"
node -p "['expo','react-native','react','react-native-svg'].map(p => p + '@' + require(p + '/package.json').version).join('  ')"

echo "› Type-checking"
npx tsc --noEmit

echo "› Bundling for iOS and Android"
CI=1 npx expo export --platform ios --platform android --output-dir dist

echo "› expo-doctor"
CI=1 npx --yes expo-doctor@latest

echo "✔ Expo SDK $SDK compatible"
