// app/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0B0C10',
            borderTopColor: '#1F2833',
          },
          tabBarActiveTintColor: '#D4AF37',
          tabBarInactiveTintColor: '#C5C6C7',
        }}>
        <Tabs.Screen
          name="(tabs)/index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(tabs)/reserve"
          options={{
            title: 'Checkout',
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="cart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(tabs)/course"
          options={{
            title: 'Course',
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="school" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(tabs)/profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}