// app/services/sendPushNotification.js

export async function sendPushNotification(expoPushToken, title, body) {
  if (!expoPushToken) {
    console.log("❌ No Expo push token found for user.");
    return;
  }

  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data: { screen: "track" },
  };

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    console.log("📨 Push notification sent!");
  } catch (error) {
    console.log("Push Notification Error:", error);
  }
}
