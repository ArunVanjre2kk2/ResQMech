// app/mechlayout/mprofile.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth, firestore } from "../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

type MechProfileType = {
  name: string;
  phone: string;
  location: string;
  experience: string;
  skills: string;
};

type IconName =
  | "person-outline"
  | "call-outline"
  | "location-outline"
  | "briefcase-outline"
  | "construct-outline";

export default function MechProfileScreen() {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);

  const [mech, setMech] = useState<MechProfileType>({
    name: "",
    phone: "",
    location: "",
    experience: "",
    skills: "",
  });

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const snap = await getDoc(doc(firestore, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();

          setMech({
            name: (data.name as string) || "",
            phone: (data.phone as string) || "",
            location: (data.location as string) || "",
            experience: (data.experience as string) || "",
            skills: (data.skills as string) || "",
          });
        }
      } catch (err) {
        console.log("load mech profile err", err);
      }
    };

    load();
  }, []);

  const updateProfile = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      await updateDoc(doc(firestore, "users", uid), { ...mech });
      setEditMode(false);
      Alert.alert("Success", "Profile updated!");
    } catch (err) {
      console.log("update profile err", err);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/LoginScreen");
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (field: keyof MechProfileType, value: string) =>
    setMech((p) => ({ ...p, [field]: value }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mechanic Profile</Text>
          <Text style={styles.headerSub}>Manage your account details</Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={42} color="#9CC4FF" />
            </View>
          </View>

          {!editMode && (
            <TouchableOpacity onPress={() => setEditMode(true)}>
              <Text style={styles.editProfile}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* FORM FIELDS */}
        <View style={styles.formContainer}>
          {(
            [
              ["name", "Full Name", "person-outline"],
              ["phone", "Phone Number", "call-outline"],
              ["location", "Workshop Location", "location-outline"],
              ["experience", "Experience (Years)", "briefcase-outline"],
              ["skills", "Skills / Services", "construct-outline"],
            ] as [keyof MechProfileType, string, IconName][]
          ).map(([field, label, icon]) => (
            <View key={field} style={styles.fieldWrapper}>
              <Text style={styles.label}>{label}</Text>

              <View style={styles.inputRow}>
                <Ionicons name={icon} size={20} color="#6F8FB7" />

                <TextInput
                  editable={editMode}
                  placeholder="Enter here..."
                  placeholderTextColor="#7788A6"
                  value={mech[field]}
                  onChangeText={(v) => handleChange(field, v)}
                  style={[styles.input, editMode && styles.inputEditable]}
                />
              </View>
            </View>
          ))}

          {/* SAVE BUTTON */}
          {editMode && (
            <TouchableOpacity style={styles.saveBtn} onPress={updateProfile}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          )}

          {/* LOGOUT BUTTON */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#071424",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#E9F1FF",
  },

  headerSub: {
    fontSize: 14,
    color: "#8AA4C2",
    marginTop: 4,
  },

  profileCard: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#0E2339",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#113A60",
    alignItems: "center",
  },

  avatarContainer: { alignItems: "center", marginBottom: 10 },

  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#133A59",
    justifyContent: "center",
    alignItems: "center",
  },

  editProfile: {
    marginTop: 6,
    color: "#58A6FF",
    fontSize: 15,
    fontWeight: "500",
  },

  formContainer: { paddingHorizontal: 20, marginTop: 30 },

  fieldWrapper: { marginBottom: 20 },

  label: { color: "#9CB4D4", fontSize: 14, marginBottom: 5 },

  inputRow: {
    flexDirection: "row",
    backgroundColor: "#10263D",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: "#DCE7F5",
    fontSize: 16,
  },

  inputEditable: {
    borderBottomWidth: 1,
    borderBottomColor: "#4DB7FF",
  },

  saveBtn: {
    backgroundColor: "#1E90FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  logoutBtn: {
    backgroundColor: "#D9534F",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
