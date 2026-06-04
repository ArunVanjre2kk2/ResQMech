// app/userlayout/_layout.tsx

import { Tabs, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Alert } from "react-native";
import { useEffect, useRef } from "react";

import { auth, firestore } from "../../firebase/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { registerPushToken } from "../services/notificationService";

export default function UserTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const handledRequests = useRef(new Set<string>());
  const initialLoadDone = useRef(false);

  // Register push token for this user on mount
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      registerPushToken(user.uid).catch((e) =>
        console.log("Push token registration failed:", e)
      );
    }
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(firestore, "serviceRequests"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!initialLoadDone.current) {
        initialLoadDone.current = true;
        return;
      }

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const reqId = docSnap.id;

        // STATUS: ACCEPTED
        if (data.status === "accepted" && data.acceptedBy) {
          const handlerKey = `${reqId}-accepted`;
          
          if (!handledRequests.current.has(handlerKey)) {
            handledRequests.current.add(handlerKey);

            if (!pathname.includes("/userlayout/track")) {
              Alert.alert(
                "Request Accepted! ✅",
                "A mechanic has accepted your request!",
                [
                  {
                    text: "View Details",
                    onPress: () => {
                      router.push({
                        pathname: "/userlayout/track/[requestId]",
                        params: { requestId: reqId },
                      });
                    },
                  },
                ]
              );
            }
          }
        }

        // STATUS: ON THE WAY
        if (data.status === "on_the_way") {
          const handlerKey = `${reqId}-on_the_way`;
          
          if (!handledRequests.current.has(handlerKey)) {
            handledRequests.current.add(handlerKey);

            Alert.alert(
              "Mechanic On The Way 🚗",
              "Your mechanic has started travelling towards your location!",
              [{ text: "OK" }]
            );
          }
        }

        // STATUS: ARRIVED
        if (data.status === "arrived") {
          const handlerKey = `${reqId}-arrived`;
          
          if (!handledRequests.current.has(handlerKey)) {
            handledRequests.current.add(handlerKey);

            Alert.alert(
              "Mechanic Arrived 📍",
              "Your mechanic has arrived at your location!",
              [{ text: "OK" }]
            );
          }
        }

        // STATUS: COMPLETED
        if (data.status === "completed") {
          const handlerKey = `${reqId}-completed`;
          
          if (!handledRequests.current.has(handlerKey)) {
            handledRequests.current.add(handlerKey);

            Alert.alert(
              "Service Completed 🎉",
              "Service has been completed! Please proceed to payment.",
              [{ text: "OK" }]
            );
          }
        }
      });
    });

    return () => unsubscribe();
  }, []);

  // Cleanup old handled requests every 30 minutes
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Clear the set to prevent memory leaks
      handledRequests.current.clear();
      console.log("Cleared handled requests cache");
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

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
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="services"
          options={{
            title: "Services",
            tabBarIcon: ({ color }) => (
              <Ionicons name="construct-outline" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="vehicle"
          options={{
            title: "Vehicle",
            tabBarIcon: ({ color }) => (
              <Ionicons name="car-sport-outline" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={24} color={color} />
            ),
          }}
        />

        {/* HIDE THESE FROM TAB BAR */}
        <Tabs.Screen
          name="track"
          options={{
            href: null, // Hides from tab bar
          }}
        />

        <Tabs.Screen
          name="payment"
          options={{
            href: null, // Hides from tab bar
          }}
        />
      </Tabs>
    </View>
  );
}