import React from "react"
import { View } from "react-native"
import CalendarGrid from "../CalendarGrid"
import { Colors } from "../../theme"

export default {
  title: "CalendarGrid",
  component: CalendarGrid,
  decorators: [
    (Story) => (
      <View
        style={{ flex: 1, padding: 20, backgroundColor: Colors.background }}
      >
        <Story />
      </View>
    ),
  ],
  argTypes: {
    onDayPress: { action: "onDayPress" },
  },
}

const today = new Date()
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const MOCK_SEGMENTS = [
  { color: "#FF6B6B", completed: true },
  { color: "#4ECDC4", completed: false },
]

export const Default = {
  args: {
    startOfMonth,
    endOfMonth,
    getDaySegments: (date) => {
      // Random segments for visual variety
      const day = date.getDate()
      if (day % 3 === 0) return [{ color: "#FF6B6B", completed: true }]
      if (day % 3 === 1) return MOCK_SEGMENTS
      return []
    },
  },
}

export const EmptyMonth = {
  args: {
    startOfMonth,
    endOfMonth,
    getDaySegments: () => [],
  },
}

export const PerfectMonth = {
  args: {
    startOfMonth,
    endOfMonth,
    getDaySegments: () => [
      { color: "#FF6B6B", completed: true },
      { color: "#4ECDC4", completed: true },
    ],
  },
}
