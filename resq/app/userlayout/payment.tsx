// app/userlayout/payment.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebaseConfig";

type PaymentMethod = "upi" | "cash" | "qr";

export default function PaymentScreen() {
  const router = useRouter();
  const { requestId, amount: paramAmount } = useLocalSearchParams<{ requestId: string; amount: string }>();

  const [amount, setAmount] = useState<number>(Number(paramAmount ?? 0));
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!requestId) return;

    const loadRequest = async () => {
      try {
        const snap = await getDoc(
          doc(firestore, "serviceRequests", requestId)
        );

        if (!snap.exists()) {
          Alert.alert("Error", "Request not found");
          router.back();
          return;
        }

        const data = snap.data();

        if (data.status === "paid" || data.status === "rated") {
          Alert.alert("Already Paid", "Payment already completed");
          router.replace({
            pathname: "/userlayout/track/[requestId]",
            params: { requestId },
          });
          return;
        }

        setAmount(data.amount ?? 0);
      } catch {
        Alert.alert("Error", "Failed to load payment details");
        router.back();
      } finally {
        setInitialLoading(false);
      }
    };

    loadRequest();
  }, [requestId]);

  //  HANDLE PAYMENT
  const handlePayment = async () => {
    if (!method) {
      Alert.alert("Select Payment Method", "Please choose a payment option.");
      return;
    }

    try {
      setLoading(true);

      await updateDoc(doc(firestore, "serviceRequests", requestId), {
        status: "paid",
        paymentStatus: "paid",
        paymentMethod: method,
        paidAt: Date.now(),
        nextAction: "rating",
      });

      Alert.alert("Payment Successful", "Thank you for your payment!");

      router.replace({
        pathname: "/userlayout/track/[requestId]",
        params: { requestId },
      });
    } catch {
      Alert.alert("Payment Failed", "Please try again.");
    } finally {
      setLoading(false);
    }
  };


  if (initialLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={{ color: "#ccc", marginTop: 10 }}>
          Loading payment details...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Make Payment</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Service Amount</Text>
        <Text style={styles.amount}>₹ {amount}</Text>
      </View>

      {/* PAYMENT OPTIONS */}
      <TouchableOpacity
        style={[styles.option, method === "upi" && styles.selected]}
        onPress={() => setMethod("upi")}
      >
        <Text style={styles.optionText}>UPI Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, method === "cash" && styles.selected]}
        onPress={() => setMethod("cash")}
      >
        <Text style={styles.optionText}>Cash on Service</Text>
      </TouchableOpacity>

      {/* PAY BUTTON */}
      <TouchableOpacity
        style={[styles.payBtn, loading && { opacity: 0.6 }]}
        onPress={handlePayment}
        disabled={loading}
      >
        <Text style={styles.payText}>
          {loading ? "Processing..." : "Pay Now"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1120", padding: 20 },
  center: {
    flex: 1,
    backgroundColor: "#0B1120",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 14,
    marginBottom: 30,
  },
  label: { color: "#94A3B8", fontSize: 16 },
  amount: {
    color: "#38BDF8",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 6,
  },
  option: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  selected: { borderWidth: 2, borderColor: "#38BDF8" },
  optionText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  payBtn: {
    backgroundColor: "#22C55E",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 30,
  },
  payText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
