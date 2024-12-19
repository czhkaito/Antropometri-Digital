// app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="pengukuran" />
      <Stack.Screen name="riwayat" />
      <Stack.Screen name="informasiGizi" />
    </Stack>
  );
}