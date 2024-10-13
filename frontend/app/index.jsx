import React, { useState, useEffect } from "react";
import { Platform, Text, View, StyleSheet, Button, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Device from "expo-device";
import * as Location from "expo-location";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [hills, setHills] = useState([]);

  useEffect(() => {
    (async () => {
      if (!permission || !permission.granted) {
        const { status } = await requestPermission();
        if (status !== "granted") {
          setErrorMsg("Permission to access camera was denied");
          return;
        }
      }

      if (Platform.OS === "android" && !Device.isDevice) {
        setErrorMsg(
          "This won't work on an Android emulator. Try it on your device!"
        );
        return;
      }

      let { status: locationStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      const headingSubscription = await Location.watchHeadingAsync(
        (newHeading) => {
          setHeading(newHeading);
        }
      );

      const locationSubscription = await Location.watchPositionAsync(
        { distanceInterval: 1 },
        (newLocation) => {
          setLocation(newLocation);
          fetchNearbyHills(
            newLocation.coords.latitude,
            newLocation.coords.longitude
          );
        }
      );

      // Cleanup function to unsubscribe from heading updates
      return () => {
        headingSubscription.remove();
        locationSubscription.remove();
      };
    })();
  }, [permission]);

  const fetchNearbyHills = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `http://172.20.10.2:8000/nearest?latitude=${latitude}&longitude=${longitude}`
      );
      const data = await response.json();
      setHills(data.results);
    } catch (error) {
      setErrorMsg("Failed to fetch nearby hills");
      console.error(error);
    }
  };

  let headingValue = "Waiting for heading..";
  let rotationAngle = 0;
  if (errorMsg) {
    headingValue = errorMsg;
  } else if (heading) {
    // Display the heading in degrees
    headingValue = heading.magHeading.toFixed(0) + "°";
    rotationAngle = -heading.magHeading - 90;
  }

  // Find the closest hill for each bearing degree
  const closestHills = hills.reduce((closest, hill) => {
    const roundedBearing = Math.round(hill.bearing);
    if (
      !closest[roundedBearing] ||
      closest[roundedBearing].distance > hill.distance
    ) {
      closest[roundedBearing] = hill;
    }
    return closest;
  }, {});

  return (
    <View style={styles.container}>
      {!permission || !permission.granted ? (
        <View style={styles.container}>
          <Text style={styles.message}>
            We need your permission to show the camera
          </Text>
          <Button onPress={requestPermission} title="Grant Permission" />
        </View>
      ) : (
        <CameraView style={styles.camera} facing={"back"}>
          <View style={styles.overlayContainer}>
            <Image
              source={require("../assets/img/compass_bg.png")}
              style={[
                styles.compassImage,
                {
                  transform: [
                    { translateY: 400 }, // Push the image towards the bottom
                    { scaleX: 1.8 },
                    { scaleY: 0.9 }, // Squash the image vertically to simulate perspective
                    { rotate: `${rotationAngle}deg` }, // Rotate the compass based on the heading
                  ],
                },
              ]}
              resizeMode="contain"
            />
            <Text style={styles.headingValue}>{headingValue}</Text>

            {Object.values(closestHills).map((hill, index) => {
              // Calculate the position for each hill line based on its bearing
              const relativeBearing =
                (hill.bearing - heading.magHeading + 360) % 360;
              const angleInRadians = (relativeBearing * Math.PI) / 180;
              const radius = 100; // Radius of the compass in the view

              const x = radius * Math.cos(angleInRadians);
              const y = radius * Math.sin(angleInRadians);

              return (
                <View
                  key={index}
                  style={[
                    styles.hillLineContainer,
                    {
                      transform: [
                        { translateY: 0 },
                        { scaleX: 1.8 },
                        { scaleY: 0.9 }, // Squash the image vertically to simulate perspective

                        // { translateX: x },
                        // { translateY: y },
                        { rotate: `${relativeBearing}deg` }, // Rotate line to be perpendicular
                        // { rotateX: "-90deg" }, // Rotate line to be perpendicular
                        // { skewY: "10deg" },
                      ],
                    },
                  ]}
                >
                  <View style={styles.hillLine} />
                  {/* <Text style={styles.hillName}>{hill.name}</Text> */}
                </View>
              );
            })}
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  camera: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headingValue: {
    fontSize: 24,
    color: "white",
    position: "absolute",
    bottom: 20,
  },
  compassImage: {
    position: "absolute",
    width: 200,
    height: 200,
    top: "50%",
    left: "50%",
    marginTop: -100,
    marginLeft: -100,
    zIndex: 1, // Ensures the compass is on top
  },
  hillLineContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 2,
  },
  hillLine: {
    width: 2,
    height: 200,
    backgroundColor: "red",
  },
  hillName: {
    fontSize: 12,
    color: "red",
    textAlign: "center",
    marginTop: 5,
  },
  buttonContainer: {
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  paragraph: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
});
