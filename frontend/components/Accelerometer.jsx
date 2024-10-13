import React, { useState, useEffect } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Accelerometer as _Accelerometer } from "expo-sensors"
import { Vector3 } from "three"

export default function Accelerometer({ setAccelerometerVector }) {
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  })
  const [subscription, setSubscription] = useState(null)

  const _slow = () => _Accelerometer.setUpdateInterval(1000)
  const _fast = () => _Accelerometer.setUpdateInterval(200)

  const _subscribe = () => {
    setSubscription(
      _Accelerometer.addListener((result) => {
        setData(result)

        const newVector = new Vector3(result.x, result.y, result.z)
        setAccelerometerVector(newVector)
      }),
    )
  }

  const _unsubscribe = () => {
    subscription && subscription.remove()
    setSubscription(null)
  }

  useEffect(() => {
    _subscribe()
    return () => _unsubscribe()
  }, [])

  return (
    <View>
      {/* <Text style={styles.text}>
        Accelerometer: (in gs where 1g = 9.81 m/s^2)
      </Text>
      <Text style={styles.text}>x: {x}</Text>
      <Text style={styles.text}>y: {y}</Text>
      <Text style={styles.text}>z: {z}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={subscription ? _unsubscribe : _subscribe}
          style={styles.button}
        >
          <Text>{subscription ? "On" : "Off"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={_slow}
          style={[styles.button, styles.middleButton]}
        >
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_fast} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  text: {
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
})
