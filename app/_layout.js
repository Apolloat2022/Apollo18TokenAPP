import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout() {
  return (
    <>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: {
            backgroundColor: '#000000',
          }
        }} 
      />

      {/* Analytics only runs on Web */}
      {Platform.OS === 'web' && <Analytics />}
    </>
  );
}
