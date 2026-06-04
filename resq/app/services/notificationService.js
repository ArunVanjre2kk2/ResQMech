// app/services/notificationService.js

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebaseConfig";

/**
 * Registers the device for push notifications and saves the Expo push token
 * to Firestore on the user's document.
 * @param {string} userId - Firebase UID of the current user
 * @returns {Promise<string|null>} - The Expo push token, or null on failure
 */
export async function registerPushToken(userId) {
  try {
    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Push notification permission not granted.");
      return null;
    }

    // Get the Expo push token (requires projectId in newer Expo SDKs)
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId ??
      "dummy-resq-project-id";

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    // Save token to Firestore so other users/mechanics can notify this user
    await updateDoc(doc(firestore, "users", userId), {
      pushToken: token,
    });

    // Android requires a notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "ResQ Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#38BDF8",
      });
    }

    console.log("✅ Push token registered:", token);
    return token;
  } catch (error) {
    console.error("❌ Error registering push token:", error);
    return null;
  }
}

/**
 * Sends an Expo push notification to a specific token.
 * @param {string} token - Expo push token of the recipient
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 */
export async function sendPushNotification(token, title, message) {
  if (!token) {
    console.log("❌ No push token provided — skipping notification.");
    return;
  }

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        sound: "default",
        title,
        body: message,
        data: { screen: "track" },
      }),
    });
    console.log("📨 Push notification sent to:", token);
  } catch (error) {
    console.error("❌ Push Notification Error:", error);
  }
}
