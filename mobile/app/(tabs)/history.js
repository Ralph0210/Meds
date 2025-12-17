import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import Svg, { Circle } from "react-native-svg"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { getRecords, getMedications } from "../../lib/db"
import { useAppStore } from "../../store/useAppStore"
import CalendarGrid from "../../components/CalendarGrid"
import { Colors, Spacing, Typography } from "../../theme"

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]

export default function HistoryScreen() {
  const router = useRouter()
  const { setSelectedDate } = useAppStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  )
  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  )

  // Fetch Data
  const { data: records } = useQuery({
    queryKey: ["history", startOfMonth.toISOString(), endOfMonth.toISOString()], // Query key can stay ISO or change, but payload matters
    queryFn: async () => {
      const s = startOfMonth.toLocaleDateString("en-CA")
      const e = endOfMonth.toLocaleDateString("en-CA")
      return getRecords(s, e)
    },
  })

  // We need config to know total checkboxes per day to calculate progress
  const { data: config } = useQuery({
    queryKey: ["medications"],
    queryFn: async () => {
      return getMedications()
    },
  })

  const getDaySegments = (day) => {
    if (!config) return []
    const dateStr = day.toLocaleDateString("en-CA")
    const rec = records?.[dateStr]?.data || {}

    const segments = []
    config.forEach((med) => {
      med.keys.forEach((key) => {
        segments.push({
          color: med.color || Colors.primary,
          completed: !!rec[key],
        })
      })
    })
    return segments
  }

  const changeMonth = (delta) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + delta)
    setCurrentMonth(newDate)
  }

  const handleDayPress = (day) => {
    setSelectedDate(day)
    router.push("/(tabs)")
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
          <ChevronRight color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <Text key={i} style={styles.weekdayText}>
            {d}
          </Text>
        ))}
      </View>

      <CalendarGrid
        startOfMonth={startOfMonth}
        endOfMonth={endOfMonth}
        getDaySegments={getDaySegments}
        onDayPress={handleDayPress}
      />
    </SafeAreaView>
  )
}

const { width } = Dimensions.get("window")
const CELL_SIZE = (width - 32) / 7

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  monthTitle: {
    fontSize: Typography.title.fontSize,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  navBtn: {
    padding: Spacing.sm,
  },
  weekRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  weekdayText: {
    width: CELL_SIZE,
    textAlign: "center",
    color: Colors.textTertiary,
    fontWeight: "bold",
  },
  dayNum: {
    color: Colors.textSecondary,
    fontWeight: "600",
    zIndex: 1,
  },
  todayText: {
    color: Colors.textPrimary,
    fontWeight: "bold",
  },
})
