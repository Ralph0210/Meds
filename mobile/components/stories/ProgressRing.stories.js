import React from "react"
import { View } from "react-native"
import ProgressRing from "../ProgressRing"

export default {
  title: "ProgressRing",
  component: ProgressRing,
  decorators: [
    (Story) => (
      <View
        style={{
          flex: 1,
          padding: 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0c0e",
        }}
      >
        <Story />
      </View>
    ),
  ],
  argTypes: {
    progress: { control: { type: "range", min: 0, max: 1, step: 0.1 } },
    size: { control: "number" },
    strokeWidth: { control: "number" },
    color: { control: "color" },
  },
}

export const Default = {
  args: {
    progress: 0.75,
    size: 36,
    strokeWidth: 3,
  },
}

export const Empty = {
  args: {
    progress: 0,
    size: 36,
  },
}

export const Full = {
  args: {
    progress: 1,
    size: 36,
  },
}

export const Segmented = {
  args: {
    segments: [
      { color: "#FF6B6B", completed: true },
      { color: "#4ECDC4", completed: false },
      { color: "#3498DB", completed: true },
      { color: "#F1C40F", completed: false },
      { color: "#9B59B6", completed: false },
    ],
    size: 48,
    strokeWidth: 4,
  },
}

export const Large = {
  args: {
    progress: 0.5,
    size: 100,
    strokeWidth: 8,
  },
}
