import {
  Pill,
  Syringe,
  Droplet,
  Droplets,
  Circle,
  SprayCan,
  Pipette,
  Waves,
  Cloud,
  Snowflake,
  Feather,
  Box,
  Cylinder,
  Hand,
} from "lucide-react-native"

export const ICONS = {
  Pill: Pill,
  Capsule: Cylinder, // Best approximation for Capsule if not Pill
  Tablet: Circle,
  Liquid: Droplet,
  Drops: Pipette,
  Injection: Syringe,
  Spray: SprayCan,
  Powder: Snowflake,
  Cream: Waves,
  Foam: Cloud,
  Gel: Droplets,
  Lotion: Feather,
  Topical: Hand,
}

export const ICON_KEYS = Object.keys(ICONS)
