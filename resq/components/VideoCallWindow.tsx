// // components/VideoCallWindow.tsx

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   ScrollView,
//   Image,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";

// import { createServiceRequest } from "../app/services/requestService.js";
// import { auth } from "../firebase/firebaseConfig";

// export default function VideoCallWindow() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [created, setCreated] = useState<{ id: string; roomId: string | null } | null>(null);

//   const handleRequest = async () => {
//     try {
//       if (!auth.currentUser) {
//         Alert.alert("Not logged in", "Please login to request a video call.");
//         return;
//       }

//       setLoading(true);

//       const requestId = await createServiceRequest(
//         auth.currentUser.uid,
//         "Video Assistance"
//       );

//       setCreated({ id: requestId, roomId: null });

//       Alert.alert(
//         "Video Call Requested",
//         "A mechanic will join shortly to assist you."
//       );

//       router.push("/userlayout/home");
//     } catch (err) {
//       console.log("Video call request error:", err);
//       Alert.alert("Error", "Could not start video call. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View style={styles.container}>

//           {/* 🔙 BACK BUTTON */}
//           <TouchableOpacity onPress={() => router.back()}>
//             <Ionicons name="arrow-back" size={26} color="#9CC4FF" />
//           </TouchableOpacity>

//           <Text style={styles.title}>Video Call Assistance</Text>

//           {/* IMAGE */}
//           <Image
//             source={require("../assets/services/video.png")}
//             style={styles.bannerImage}
//           />

//           <Text style={styles.subtitle}>-- Show your vehicle issue live through a video call.</Text>
//           <Text style={styles.subtitle}>-- Mechanic will guide you instantly and tell whether it needs repair,a quick fix, or towing.</Text>

//           {/* ⭐ WHEN TO USE */}
//           <View style={styles.highlightBox}>
//             <Text style={styles.highlightTitle}>Best situations to choose this option:</Text>
//             <Text style={styles.highlightText}>• When you do not know what issue vehicle has</Text>
//             <Text style={styles.highlightText}>• Unknown sounds coming from the engine</Text>
//             <Text style={styles.highlightText}>• Any leakag, Smoke or unusual smell</Text>
//             <Text style={styles.highlightText}>• Warning lights you don’t understand</Text>
//             <Text style={styles.highlightText}>• Vehicle not starting but reason unknown</Text>
//           </View>

//           {/* ⭐ REQUEST BUTTON */}
//           <TouchableOpacity
//             style={styles.requestBtn}
//             onPress={handleRequest}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.requestText}>Start Video Call</Text>
//             )}
//           </TouchableOpacity>

//           {/* CREATED INFO */}
//           {created && (
//             <View style={styles.infoBox}>
//               <Text style={styles.infoTitle}>Request Created</Text>
//               <Text style={styles.infoText}>ID: {created.id}</Text>
//               <Text style={styles.infoNote}>
//                 A mechanic will join the call after accepting your request.
//               </Text>
//             </View>
//           )}

//           <View style={{ height: 80 }} />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// /* ---------------------------- STYLES ---------------------------- */

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#071424" },
//   container: { padding: 20 },

//   bannerImage: {
//     width: "90%",
//     height: 220,
//     borderRadius: 16,
//     alignSelf: "center",
//     marginTop: 20,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: "#123A5C",
//   },

//   title: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#E9F1FF",
//     marginTop: 10,
//   },

//   subtitle: {
//     color: "#9CB4D4",
//     marginTop: 6,
//     fontSize: 15,
//   },

//   infoCard: {
//     backgroundColor: "#0E2339",
//     marginTop: 20,
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#113A60",
//   },

//   sectionTitle: {
//     color: "#E9F1FF",
//     fontSize: 20,
//     fontWeight: "700",
//     marginBottom: 10,
//   },

//   description: {
//     color: "#9CB4D4",
//     fontSize: 15,
//     lineHeight: 22,
//   },

//   highlightBox: {
//     backgroundColor: "#10263D",
//     marginTop: 20,
//     padding: 16,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#2E4A6B",
//   },

//   highlightTitle: {
//     color: "#4DB7FF",
//     fontSize: 16,
//     fontWeight: "700",
//     marginBottom: 6,
//   },

//   highlightText: {
//     color: "#CFD9E6",
//     fontSize: 14,
//     lineHeight: 20,
//   },

//   requestBtn: {
//     backgroundColor: "#1E90FF",
//     paddingVertical: 15,
//     borderRadius: 14,
//     alignItems: "center",
//     marginTop: 30,
//   },

//   requestText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//   },

//   infoBox: {
//     marginTop: 25,
//     backgroundColor: "#0E2339",
//     padding: 14,
//     borderRadius: 12,
//   },

//   infoTitle: { color: "#fff", fontWeight: "700" },
//   infoText: { color: "#CFE7FF", marginTop: 6 },
//   infoNote: { color: "#7B9ABD", marginTop: 6, fontSize: 12 },
// });

