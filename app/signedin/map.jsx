import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import "expo-dev-client";
import { Link, useRouter } from "expo-router";
import * as Location from "expo-location";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import { getDocs, collection } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Map = () => {
  const [userLocation, setUserLocation] = useState();
  const [permissionStatus, setPermissionStatus] = useState();
  const [currentPlaces, setCurrentPlaces] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const router = useRouter();

  useEffect(() => {
    getUserLocation();
    fetchNearbyPlaces();
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }
  const randomIndex = (max) => {
    return Math.floor(Math.random() * max);
  };

  const showPois = () => {
    return currentPlaces.map((place, index) => {
      return (
        <Marker
          title={place.name}
          key={index}
          coordinate={{
            latitude: place.coordinates[1],
            longitude: place.coordinates[0],
          }}
          image={require("../../assets/pin.png")}
          style={{ width: 48, height: 48 }}
          onPress={() => {
            if (
              calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                place.coordinates[1],
                place.coordinates[0]
              ) < 100
            ) {
              router.push("/signedin/AR");
            } else {
              console.log(`Youre too far`);
            }
          }}
        />
      );
    });
  };
  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status);
    if (status === "granted") {
      let currentLocation = await Location.getCurrentPositionAsync();
      setUserLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    }
  };
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;
    const metersPerKilometer = 1000;
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degreesToRadians(lat1)) *
        Math.cos(degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = earthRadiusKm * c;
    const distanceInMeters = distanceInKm * metersPerKilometer;
    return distanceInMeters;
  }

  const fetchNearbyPlaces = async () => {
    const user = FIREBASE_AUTH.currentUser;
    const uid = user ? user.uid : null;
    try {
      const jsonValue = await AsyncStorage.getItem(`cachedPlaces_${uid}`);
      const actualJsonValue = jsonValue ? JSON.parse(jsonValue) : null;
      if (!actualJsonValue) {
        const querySnapshot = await getDocs(collection(FIREBASE_DB, "users"));
        for (const doc of querySnapshot.docs) {
          if (user.email === doc.data().email) {
            const places = doc.data().places;
            const copyOfPlaces = [...places];
            const newPlace1 = copyOfPlaces[randomIndex(copyOfPlaces.length)];
            const newPlace2 = copyOfPlaces[randomIndex(copyOfPlaces.length)];
            const newPlace3 = copyOfPlaces[randomIndex(copyOfPlaces.length)];
            // Save to AsyncStorage
            const jsonArr = [newPlace1, newPlace2, newPlace3];
            await AsyncStorage.setItem(
              `cachedPlaces_${uid}`,
              JSON.stringify(jsonArr)
            );
            setCurrentPlaces([
              ...jsonArr,
              { coordinates: [-0.054682, 51.3493916], name: "Test" },
            ]);
            break;
          }
        }
      } else {
        console.log("Retrieved places from AsyncStorage:", actualJsonValue);
        setCurrentPlaces([
          ...actualJsonValue,
          { coordinates: [-0.054682, 51.3493916], name: "Test" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  const calculateTimeLeft = () => {
    const now = new Date();
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    const diff = endOfDay - now;
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };



  return (
    <>
      <View style={styles.container}>
        {userLocation ? (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.0035,
              longitudeDelta: 0.015,
            }}
          >
            {currentPlaces.length !== 0 ? showPois() : null}

            <Marker
              coordinate={userLocation}
              image={require("../../assets/currentLocation.png")}
              title="Your location"
            />
          </MapView>
        ) : (
          <Text>
            Please grant location permissions{"\n"}
            {"\n"}Let's not wait for the grass to grow...
          </Text>
        )}
        <Text style={styles.timeLeftText}>Time left: {timeLeft}</Text>
      </View>
      {/* <Pressable style={styles.button} onPress={() => console.log()}>
        <Link href="/signedin/AR">
          {" "}
          <Text>Camera</Text>{" "}
        </Link>
      </Pressable> */}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "white",
    margin: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "blue",
  },
  markers: {
    color: "blue",
  },
  timeLeftText: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
export default Map;
