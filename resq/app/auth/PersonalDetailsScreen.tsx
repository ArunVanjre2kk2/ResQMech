// app/auth/PersonalDetailsScreen.tsx

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
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { firestore } from "../../firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const uid = params.uid as string;
  const emailFromLogin = params.email as string;
  const role = (params.role as string) || "user";

  // COMMON FIELDS
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  // MECHANIC FIELDS
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");

  const [saving, setSaving] = useState(false);

  // Enhanced phone validation (Indian numbers)
  const validatePhone = (phoneNumber: string): boolean => {
    // Remove all spaces and special characters
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    // Match: optional +91 or 91, then 10 digits starting with 6-9
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return phoneRegex.test(cleanPhone);
  };

  const saveDetails = async () => {
    // Validation - Name
    if (!name.trim()) {
      return Alert.alert("Missing Field", "Please enter your name");
    }

    if (name.trim().length < 2) {
      return Alert.alert("Invalid Name", "Name must be at least 2 characters");
    }

    if (name.trim().length > 50) {
      return Alert.alert("Invalid Name", "Name is too long (max 50 characters)");
    }

    // Validation - Phone
    if (!validatePhone(phone)) {
      return Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
      );
    }

    // Validation - City
    if (!city.trim()) {
      return Alert.alert("Missing Field", "Please enter your city");
    }

    if (city.trim().length < 2) {
      return Alert.alert("Invalid City", "City name must be at least 2 characters");
    }

    // Mechanic-specific validation
    if (role === "mechanic") {
      if (!location.trim()) {
        return Alert.alert("Missing Field", "Please enter your workshop/operating location");
      }

      if (!experience.trim()) {
        return Alert.alert("Missing Field", "Please enter your years of experience");
      }

      const expNum = parseInt(experience);
      if (isNaN(expNum) || expNum < 0 || expNum > 50) {
        return Alert.alert("Invalid Experience", "Please enter valid years of experience (0-50)");
      }

      if (!skills.trim()) {
        return Alert.alert("Missing Field", "Please enter your skills/services offered");
      }

      if (skills.trim().length < 3) {
        return Alert.alert("Invalid Skills", "Please provide more details about your skills");
      }
    }

    setSaving(true);

    try {
      // Clean phone number (remove spaces, keep only digits and +)
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

      const payload: any = {
        uid,
        userType: role,
        name: name.trim(),
        email: emailFromLogin,
        phone: cleanPhone,
        city: city.trim(),
        createdAt: serverTimestamp(),
      };

      if (role === "mechanic") {
        payload.location = location.trim();
        payload.experience = experience.trim();
        payload.skills = skills.trim();
      } else {
        // For users, set empty strings
        payload.location = "";
        payload.experience = "";
        payload.skills = "";
      }

      await setDoc(doc(firestore, "users", uid), payload);

      Alert.alert(
        "Success",
        "Your profile has been created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              if (role === "mechanic") {
                router.replace("/mechlayout/mhome");
              } else {
                router.replace("/userlayout/home");
              }
            },
          },
        ]
      );
    } catch (err: any) {
      console.error("Save details error:", err);
      Alert.alert("Error", err.message || "Failed to save details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerBox}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Role: {role.toUpperCase()}</Text>
          </View>

          <View style={styles.card}>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#A7B3C7"
              value={name}
              onChangeText={setName}
              maxLength={50}
              autoCorrect={false}
              style={styles.input}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor="#A7B3C7"
              value={emailFromLogin}
              editable={false}
              style={[styles.input, { opacity: 0.7 }]}
            />

            <TextInput
              placeholder="Phone (+91 XXXXXXXXXX)"
              placeholderTextColor="#A7B3C7"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={15}
              autoCorrect={false}
              style={styles.input}
            />

            <TextInput
              placeholder="City"
              placeholderTextColor="#A7B3C7"
              value={city}
              onChangeText={setCity}
              maxLength={50}
              autoCorrect={false}
              style={styles.input}
            />

            {role === "mechanic" && (
              <>
                <TextInput
                  placeholder="Workshop / Operating Location"
                  placeholderTextColor="#A7B3C7"
                  value={location}
                  onChangeText={setLocation}
                  maxLength={100}
                  autoCorrect={false}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Experience (in years)"
                  placeholderTextColor="#A7B3C7"
                  value={experience}
                  onChangeText={setExperience}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Skills / Services (e.g., Tyre, Battery, Engine)"
                  placeholderTextColor="#A7B3C7"
                  value={skills}
                  onChangeText={setSkills}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.btn, saving && { opacity: 0.6 }]}
              onPress={saveDetails}
              disabled={saving}
            >
              <Text style={styles.btnText}>
                {saving ? "Saving..." : "Save & Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0F2C" },
  headerBox: { paddingTop: 50, paddingHorizontal: 25 },
  title: { fontSize: 28, color: "#fff", fontWeight: "700" },
  subtitle: { fontSize: 16, color: "#A7B3C7", marginTop: 5 },
  card: {
    backgroundColor: "#121932",
    marginTop: 40,
    padding: 20,
    marginHorizontal: 20,
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
    backgroundColor: "#16a3a3ff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { fontSize: 17, color: "#fff", fontWeight: "700" },
});