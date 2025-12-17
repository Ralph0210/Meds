import React from "react"
import { View } from "react-native"
import MedicationCard from "../MedicationCard"
import { Colors } from "../../theme"

export default {
  title: "MedicationCard",
  component: MedicationCard,
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
    onToggle: { action: "onToggle" },
  },
}

const dailySingle = {
  id: 1,
  name: "Lisinopril",
  dosage: "10mg",
  frequency: "1x Daily",
  times: ["Morning"],
  keys: ["med_1_0"],
  color: "#FF6B6B",
  icon: "Pill",
  type: "daily",
}

const dailyTwice = {
  id: 2,
  name: "Metformin",
  dosage: "500mg",
  frequency: "2x Daily",
  times: ["Morning", "Night"],
  keys: ["med_2_0", "med_2_1"],
  color: "#4ECDC4",
  icon: "Bottle",
  type: "daily",
}

const dailyThrice = {
  id: 3,
  name: "Amoxicillin",
  dosage: "250mg",
  frequency: "3x Daily",
  times: ["Morning", "Noon", "Night"],
  keys: ["med_3_0", "med_3_1", "med_3_2"],
  color: "#FFE66D",
  icon: "Pill",
  type: "daily",
}

const dailyCustom = {
  id: 4,
  name: "Insulin",
  dosage: "10 Units",
  frequency: "Custom",
  times: ["8:00 AM", "2:00 PM", "8:00 PM"],
  keys: ["med_4_0", "med_4_1", "med_4_2"],
  color: "#FF9F43",
  icon: "Syringe",
  type: "daily",
}

export const DailySingle = {
  args: {
    config: dailySingle,
    record: { data: {} },
  },
}

export const DailyTwice_Mixed = {
  args: {
    config: dailyTwice,
    record: {
      data: {
        med_2_0: true, // Morning taken
        med_2_1: false, // Night not taken
      },
    },
  },
}

export const DailyThrice_All = {
  args: {
    config: dailyThrice,
    record: {
      data: {
        med_3_0: true,
        med_3_1: true,
        med_3_2: true,
      },
    },
  },
}

export const DailyCustom = {
  args: {
    config: dailyCustom,
    record: {
      data: {
        med_4_0: true,
      },
    },
  },
}
