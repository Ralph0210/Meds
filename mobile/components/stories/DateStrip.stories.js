import React from "react"
import { View } from "react-native"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import DateStrip from "../DateStrip"
import { Colors } from "../../theme"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

export default {
  title: "DateStrip",
  component: DateStrip,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <View
          style={{
            flex: 1,
            paddingTop: 50,
            backgroundColor: Colors.background,
          }}
        >
          <Story />
        </View>
      </QueryClientProvider>
    ),
  ],
  argTypes: {
    config: { control: "object" },
  },
}

const mockConfig = [
  {
    keys: ["med_1"],
    color: "#FF6B6B",
  },
  {
    keys: ["med_2"],
    color: "#4ECDC4",
  },
]

export const Default = {
  args: {
    config: mockConfig,
  },
}

export const NoMeds = {
  args: {
    config: [],
  },
}
