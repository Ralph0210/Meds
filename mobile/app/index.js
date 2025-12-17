import { Redirect } from "expo-router"

export default function Index() {
  // No auth required for local-only app
  return <Redirect href="/(tabs)" />
}
