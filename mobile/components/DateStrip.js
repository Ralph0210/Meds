import { useRef, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native"
import { useQuery } from "@tanstack/react-query"
import { getRecords } from "../lib/db"
import { useAppStore } from "../store/useAppStore"
import { LinearGradient } from "expo-linear-gradient"
import { Colors, Spacing, Layout, Typography } from "../theme"
import ProgressRing from "./ProgressRing" // Use new component

const DAYS_TO_SHOW = 14

function getDates(startDate, count) {
  const dates = []
  for (let i = 0; i < count; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}

export default function DateStrip({ config = [] }) {
  const { selectedDate, setSelectedDate } = useAppStore()
  const flatListRef = useRef(null)

  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - 3)
  const dates = getDates(start, DAYS_TO_SHOW)

  // Use local date strings for consistency with HomeScreen
  const startStr = dates[0].toLocaleDateString("en-CA")
  const endStr = dates[dates.length - 1].toLocaleDateString("en-CA")

  // Fetch Range History
  const { data: history } = useQuery({
    queryKey: ["history", startStr, endStr],
    queryFn: async () => {
      // getRecords expects YYYY-MM-DD
      return getRecords(startStr, endStr)
    },
    enabled: !!config,
  })

  const renderItem = ({ item }) => {
    const isSelected = isSameDay(item, selectedDate)

    // 1. Calculate Segments
    const segments = []
    if (config && config.length > 0) {
      const dateStr = item.toLocaleDateString("en-CA")
      const record = history?.[dateStr]?.data || {}

      config.forEach((med) => {
        med.keys.forEach((key) => {
          segments.push({
            completed: !!record[key],
            color: med.color,
          })
        })
      })
    }

    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(item)}
        style={styles.dateItemWrapper}
      >
        <View style={[styles.dateItem, isSelected && styles.dateItemSelected]}>
          <Text
            style={[styles.dayText, isSelected && { color: Colors.primary }]}
          >
            {item.toLocaleDateString("en-US", { weekday: "narrow" })}
          </Text>

          <View style={styles.ringContainer}>
            <ProgressRing segments={segments} size={36} />
            <Text
              style={[styles.dateText, isSelected && styles.dateTextSelected]}
            >
              {item.getDate()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        horizontal
        data={dates}
        keyExtractor={(item) => item.toISOString()}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
}

function isSameDay(d1, d2) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  dateItemWrapper: {
    marginHorizontal: Spacing.xs,
    borderRadius: Layout.radius.full,
    overflow: "hidden",
  },
  dateItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 70, // Increased slightly to breathe
    borderRadius: Layout.radius.full,
    gap: Spacing.xs, // Use gap for consistent spacing between Text and Ring
  },
  dateItemSelected: {
    // Intentionally empty if using LinearGradient or just styles
  },
  dayText: {
    color: Colors.textTertiary,
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
    // Removed marginBottom in favor of gap
  },
  ringContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    position: "absolute",
    fontSize: Typography.caption.fontSize,
    fontWeight: "bold",
    color: Colors.textSecondary,
  },
  dateTextSelected: {
    color: Colors.textPrimary,
  },
})
