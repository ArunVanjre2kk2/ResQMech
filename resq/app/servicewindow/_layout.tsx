// app/servicewindow/_layout.tsx

import { Stack } from "expo-router";

export default function ServiceWindowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
