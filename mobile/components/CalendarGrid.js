import React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native"
import ProgressRing from "./ProgressRing" // Sibling import
import { Colors, Spacing, Typography, Layout } from "../theme"

const { width } = Dimensions.get("window")
const CELL_SIZE = (width - 32) / 7

// Helper
function isToday(date) {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export default function CalendarGrid({
  startOfMonth,
  endOfMonth,
  getDaySegments,
  onDayPress,
}) {
  // Grid Generation logic
  const daysInMonth = endOfMonth.getDate()
  const startDay = startOfMonth.getDay() // 0 = Sun
  const totalSlots = Math.ceil((daysInMonth + startDay) / 7) * 7

  const grid = []
  for (let i = 0; i < totalSlots; i++) {
    if (i < startDay || i >= startDay + daysInMonth) {
      grid.push(null)
    } else {
      const d = new Date(
        startOfMonth.getFullYear(),
        startOfMonth.getMonth(),
        i - startDay + 1
      )
      grid.push(d)
    }
  }

  return (
    <View style={styles.grid}>
      {grid.map((day, i) => {
        const segments = day ? getDaySegments(day) : []
        return (
          <View key={i} style={styles.cellWrapper}>
            {day && (
              <TouchableOpacity
                style={styles.cell}
                onPress={() => onDayPress(day)}
              >
                <View style={styles.ring}>
                  {segments.length > 0 && <ProgressRing segments={segments} />}
                </View>
                <Text style={[styles.dayNum, isToday(day) && styles.todayText]}>
                  {day.getDate()}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
  },
  cellWrapper: {
    width: CELL_SIZE,
    height: CELL_SIZE + 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cell: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNum: {
    color: Colors.textSecondary,
    fontWeight: "600",
    zIndex: 1,
    fontSize: Typography.body.fontSize,
  },
  todayText: {
    color: Colors.textPrimary,
    fontWeight: "bold",
  },
})
