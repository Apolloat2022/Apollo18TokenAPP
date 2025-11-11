import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
     screenOptions={{
  headerShown: false,
  tabBarStyle: {
    backgroundColor: '#000000', // Black background
    borderTopColor: '#FFD700', // Gold border
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
  },
  tabBarActiveTintColor: '#FFD700', // Gold active tabs
  tabBarInactiveTintColor: '#B8860B', // Dark gold inactive tabs
}}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reserve"
        options={{
          title: 'Reserve',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}