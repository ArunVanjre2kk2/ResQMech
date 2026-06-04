// app/auth/LoginScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, firestore } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const role = (params.role as string) || "user";
  const preEmail = (params.email as string) || "";

  const [email, setEmail] = useState(preEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      return Alert.alert("Missing Fields", "Please enter email and password");
    }

    if (!email.includes("@")) {
      return Alert.alert("Invalid Email", "Please enter a valid email address");
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;

      // EMAIL NOT VERIFIED
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        await signOut(auth);
        Alert.alert(
          "Email Not Verified",
          "We've sent a verification email to your inbox. Please verify your email and try logging in again.",
          [{ text: "OK" }]
        );
        return;
      }

      // Check if user document exists
      const snap = await getDoc(doc(firestore, "users", user.uid));

      if (snap.exists()) {
        const userData = snap.data();
        const userType = userData?.userType;

        if (userType === "user") {
          router.replace("/userlayout/home");
        } else if (userType === "mechanic") {
          router.replace("/mechlayout/mhome");
        } else {
          // Unknown user type
          Alert.alert("Error", "Invalid user type. Please contact support.");
          await signOut(auth);
        }
      } else {
        // User document doesn't exist - redirect to complete profile
        router.replace({
          pathname: "/auth/PersonalDetailsScreen",
          params: { uid: user.uid, email: user.email || "", role },
        });
      }
    } catch (err: any) {
      // Enhanced error messages
      let errorMessage = "Login failed. Please try again.";

      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (err.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      }

      Alert.alert("Login Error", errorMessage);
      console.error("Login error:", err.code, err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkVerification = async () => {
    if (!email || !password) {
      return Alert.alert("Missing Fields", "Please enter email and password to check verification");
    }

    setChecking(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;
      await user.reload(); // Refresh user data

      if (user.emailVerified) {
        Alert.alert(
          "Email Verified! ✅",
          "Your email has been verified successfully. Redirecting to complete your profile...",
          [{ text: "Continue" }]
        );

        router.replace({
          pathname: "/auth/PersonalDetailsScreen",
          params: { uid: user.uid, email: user.email || "", role },
        });
      } else {
        Alert.alert(
          "Not Verified Yet",
          "Please click the verification link sent to your email and try again.",
          [{ text: "OK" }]
        );
        await signOut(auth);
      }
    } catch (err: any) {
      let errorMessage = "Unable to check verification status.";
      
      if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.headerBox}>
          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>Login to continue your journey</Text>
        </View>

        <View style={styles.card}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#A7B3C7"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#A7B3C7"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.btnText}>
              {loading ? "Please wait..." : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={checkVerification}
            disabled={checking}
          >
            <Text style={styles.secondaryText}>
              {checking ? "Checking..." : "Already Verified? Check Status"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F2C",
  },
  headerBox: {
    paddingTop: 60,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
  },
  subtitle: {
    color: "#A7B3C7",
    marginTop: 5,
    fontSize: 15,
  },
  card: {
    backgroundColor: "#121932",
    marginTop: 50,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
  },
  input: {
    backgroundColor: "#1C2545",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryBtn: {
    marginTop: 15,
    alignItems: "center",
  },
  secondaryText: {
    color: "#22D3EE",
    fontSize: 15,
    fontWeight: "600",
  },
});