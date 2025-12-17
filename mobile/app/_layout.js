import { Slot } from "expo-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { initDatabase, seedDefaults, resetDatabase } from "../lib/db"

const queryClient = new QueryClient()

let StorybookUIRoot
try {
  // eslint-disable-next-line
  StorybookUIRoot = require("../.rnstorybook").default
} catch (error) {
  // Storybook might not be available in all environments
}

export default function RootLayout() {
  if (process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true" && StorybookUIRoot) {
    return <StorybookUIRoot />
  }

  useEffect(() => {
    initDatabase()
    // seedDefaults()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Slot />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
