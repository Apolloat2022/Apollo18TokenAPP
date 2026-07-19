// services/notify.ts
// Cross-platform replacement for React Native's Alert.alert().
//
// react-native-web's Alert.alert() is a hardcoded no-op (`static alert() {}`
// — see node_modules/react-native-web/src/exports/Alert), and this app is
// web-only in production (vercel.json builds `expo export -p web`). Every
// Alert.alert() call was silently doing nothing on the live site — including
// checkout/sign-in error messages, which made real failures look like
// "nothing happens" to users. Use this everywhere instead.
import { Alert, Platform } from 'react-native';

export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}
