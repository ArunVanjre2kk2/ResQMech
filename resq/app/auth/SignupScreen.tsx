// app/auth/SignupScreen.tsx

import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

export default function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const role = params.role || "user";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirm)
      return Alert.alert("Missing", "Fill all fields");

    if (password !== confirm)
      return Alert.alert("Mismatch", "Passwords do not match");

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // Send email verification immediately
      await sendEmailVerification(cred.user);

      Alert.alert(
        "Verify Your Email 📧",
        `A verification link has been sent to ${email.trim()}. Please verify your email before logging in.`,
        [{ text: "OK" }]
      );

      router.replace({
        pathname: "/auth/LoginScreen",
        params: { role, email: email.trim() },
      } as any);
    } catch (err: any) {
      Alert.alert("Signup Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.headerBox}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Role: {role.toUpperCase()}</Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#A7B3C7"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#A7B3C7"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#A7B3C7"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.btnText}>
              {loading ? "Creating..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.replace({
                pathname: "/auth/LoginScreen",
                params: { role },
              } as any)
            }
            style={{ marginTop: 16, alignItems: "center" }}
          >
            <Text style={styles.link}>Already have an account? Login</Text>
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
    marginTop: 40,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
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

  link: {
    color: "#22D3EE",
    fontSize: 15,
    fontWeight: "600",
  },
});
