import React, { useState, useEffect } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Magnetometer as _Mangnetometer } from "expo-sensors"
import { Vector3 } from "three"

export default function Magnetometer({ setMagnetometerVector }) {
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  })
  const [magnetometer, setMagnometer] = useState(0)
  const [subscription, setSubscription] = useState(null)

  const _slow = () => _Mangnetometer.setUpdateInterval(1000)
  const _fast = () => _Mangnetometer.setUpdateInterval(200)

  const _subscribe = () => {
    setSubscription(
      _Mangnetometer.addListener((result) => {
        setData(result)
        setMagnometer(_angle(result))

        const newVector = new Vector3(result.x, result.y, result.z)
        setMagnetometerVector(newVector)
      }),
    )
  }

  const _unsubscribe = () => {
    subscription && subscription.remove()
    setSubscription(null)
  }

  const _angle = (magnetometer) => {
    let angle = 0
    if (magnetometer) {
      let { x, y, z } = magnetometer
      if (Math.atan2(y, x) >= 0) {
        angle = Math.atan2(y, x) * (180 / Math.PI)
      } else {
        angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI)
      }
    }
    return Math.round(angle)
  }

  const _degree = (magnetometer) => {
    return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271
  }

  useEffect(() => {
    _subscribe()
    return () => _unsubscribe()
  }, [])

  return (
    <View>
      {/* <Text style={styles.text}>Magnetometer:</Text>
      <Text style={styles.text}>x: {x}</Text>
      <Text style={styles.text}>y: {y}</Text>
      <Text style={styles.text}>z: {z}</Text>
      <Text style={styles.text}>Angle: {_degree(magnetometer)}</Text>
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
    paddingHorizontal: 10,
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
