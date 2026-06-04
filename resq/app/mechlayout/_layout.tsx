// app/mechlayout/_layout.tsx

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

export default function MechTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0ea5e9",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#0f172a",
            borderTopColor: "#1e293b",
            paddingBottom: 6,
            paddingTop: 6,
            height: 58,
          },
        }}
      >
        {/* HOME TAB */}
        <Tabs.Screen
          name="mhome"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
          }}
        />

        {/* REQUEST TAB */}
        <Tabs.Screen
          name="mrequest"
          options={{
            title: "Requests",
            tabBarIcon: ({ color }) => (
              <Ionicons name="list-outline" size={24} color={color} />
            ),
          }}
        />

        {/* Request Detail — hidden from tab bar */}
        <Tabs.Screen
          name="requestDetails"
          options={{
            href: null,
          }}
        />

        {/* PROFILE TAB */}
        <Tabs.Screen
          name="mprofile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
