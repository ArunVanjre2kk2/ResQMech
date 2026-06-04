// components/MapComponent.tsx

import React from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MechanicMarker {
  lat: number;
  lng: number;
  id?: string;
  name?: string;
  available?: boolean;
}

interface MapProps {
  user: LatLng;
  mechanics?: MechanicMarker[];
}

export default function MapComponent({ user, mechanics = [] }: MapProps) {
  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Fetching location...</Text>
      </View>
    );
  }

  const region = {
    latitude: user.lat,
    longitude: user.lng,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        loadingEnabled={true}
      >
        {/* USER MARKER */}
        <Marker
          coordinate={{
            latitude: user.lat,
            longitude: user.lng,
          }}
          pinColor="blue"
          title="You"
          description="Your current location"
        />

        {/* MECHANIC MARKERS */}
        {mechanics.map((m, index) => (
          <Marker
            key={m.id || index}
            coordinate={{
              latitude: m.lat,
              longitude: m.lng,
            }}
            title={m.name || "Mechanic"}
            description={m.available ? "Available" : "Busy"}
            pinColor="red"
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
