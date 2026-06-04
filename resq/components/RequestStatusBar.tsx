// components/RequestStatusBar.tsx

import { View, Text, StyleSheet } from "react-native";
interface StatusProps {
  status: string;
}

export default function RequestStatusBar({ status }: StatusProps) {
  const steps = ["pending", "accepted", "on_the_way", "arrived", "completed"];
  const currentIndex = steps.indexOf(status);

  return (
    <View style={styles.container}>

      {/* CIRCLES ROW */}
      <View style={styles.circleRow}>
        {steps.map((_, index) => {
          const active = index <= currentIndex;
          return (
            <View key={index} style={styles.circleWrapper}>
              <View
                style={[
                  styles.circle,
                  active ? styles.circleActive : styles.circleInactive,
                ]}
              />

              {index !== steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    active ? styles.lineActive : styles.lineInactive,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* LABELS ROW  */}
      <View style={styles.labelRow}>
        {steps.map((item, index) => {
          const active = index <= currentIndex;
          return (
            <Text
              key={item}
              style={[
                styles.label,
                active ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {item.replace("_", " ")}
            </Text>
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
  },

  circleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  circleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  circle: {
    width: 16,
    height: 16,
    borderRadius: 10,
  },

  circleActive: { backgroundColor: "#38BDF8" },
  circleInactive: { backgroundColor: "#1E293B" },

  line: {
    flex: 1,
    height: 3,
    marginHorizontal: 4,
  },

  lineActive: { backgroundColor: "#38BDF8" },
  lineInactive: { backgroundColor: "#1E293B" },
  
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  labelActive: { color: "#38BDF8" },
  labelInactive: { color: "#64748B" },
});
