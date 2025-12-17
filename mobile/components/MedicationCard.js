import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native"
import { Check } from "lucide-react-native"

import { LinearGradient } from "expo-linear-gradient"
import { Colors, Spacing, Layout, Typography } from "../theme"
import { ICONS } from "../theme/icons"

export default function MedicationCard({
  config,
  record,
  onViewDate,
  onToggle,
}) {
  // config: { id, name, description, type, color, bg_color, icon, ... }
  // record: { data: { "key1": true, "key2": false } } (or null)

  const isCompleted = (key) => record?.data?.[key] === true

  // Wrapper Component for consistent styles
  const CardWrapper = ({ children }) => {
    // Create a gradient from background color
    // We'll trust the bg_color but if it's missing use a default
    const bg = config.bg_color || "#1e1f25"
    return (
      <LinearGradient
        colors={[bg, adjustColor(bg, 20)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: "rgba(255,255,255,0.08)",
            borderWidth: 1,
          },
        ]}
      >
        {children}
      </LinearGradient>
    )
  }

  // ... (Keep Renderers Logic same, but update their styles slightly if needed)

  // Re-define renderers to use cleaner styles?
  // For now let's just keep the logic but wrap the return.

  /* New Clean Daily Renderer */
  const DailyRenderer = () => {
    // Determine if we have multiple slots to render or just one
    // Ideally we iterate over config.keys if they map to times
    const hasMultiple = config.keys?.length > 1

    // Helper to render a single row
    const renderRow = (infoKey, label, showHeader = false) => {
      const checked = isCompleted(infoKey)

      return (
        <View key={infoKey}>
          <View
            style={[
              styles.dailyRow,
              showHeader && { paddingTop: 0, minHeight: 48 },
            ]}
          >
            {showHeader ? (
              <View
                style={{ flex: 1, justifyContent: "center", minHeight: 48 }}
              >
                <Text style={styles.cardTitle}>{config.name}</Text>
                <Text style={styles.cardDesc}>
                  {config.dosage ||
                    `${config.dosageQuantity || ""} ${config.dosageUnit || ""}`}
                  {label ? ` • ${label}` : ""}
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={styles.timeLabel}>{label}</Text>
              </View>
            )}

            <Pressable
              onPress={() => onToggle(infoKey, !checked)}
              style={[
                styles.checkbox,
                checked
                  ? { backgroundColor: config.color, borderColor: config.color }
                  : styles.checkboxUnchecked,
              ]}
            >
              {checked && <Check size={20} color="white" />}
            </Pressable>
          </View>
          {/* Single dose doesn't need divider usually, but if we wanted logic here it is */}
        </View>
      )
    }

    if (hasMultiple) {
      return (
        <View>
          <View
            style={{
              marginBottom: Spacing.md,
              minHeight: 48,
              justifyContent: "center",
            }}
          >
            <Text style={styles.cardTitle}>{config.name}</Text>
            <Text style={styles.cardDesc}>
              {config.dosage ||
                `${config.dosageQuantity || ""} ${config.dosageUnit || ""}`}
            </Text>
          </View>
          <View>
            {config.keys.map((k, i) => {
              // Fallback logic for label
              const label =
                config.times?.[i] || config.schedule?.[i] || `Dose ${i + 1}`
              const checked = isCompleted(k)
              const isLast = i === config.keys.length - 1

              return (
                <View key={k}>
                  <View
                    style={[styles.dailyRow, { paddingVertical: Spacing.xs }]}
                  >
                    <Text style={styles.timeLabel}>{label}</Text>
                    <Pressable
                      onPress={() => onToggle(k, !checked)}
                      style={[
                        styles.checkbox,
                        checked
                          ? {
                              backgroundColor: config.color,
                              borderColor: config.color,
                            }
                          : styles.checkboxUnchecked,
                      ]}
                    >
                      {checked && <Check size={20} color="white" />}
                    </Pressable>
                  </View>
                  {!isLast && <View style={styles.divider} />}
                </View>
              )
            })}
          </View>
        </View>
      )
    }

    // Single Case
    const singleKey = config.keys?.[0]
    // Label can be specific time or frequency
    const singleLabel = config.times?.[0] || config.frequency
    return renderRow(singleKey, singleLabel, true)
  }

  // Legacy Renderer references...
  const SimpleRenderer = () => {
    const key = config.keys?.[0]
    const checked = isCompleted(key)

    return (
      <View style={styles.rendererContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{config.name}</Text>
          <Text style={styles.cardDesc}>{config.description}</Text>
        </View>

        <Pressable
          onPress={() => onToggle(key, !checked)}
          style={[
            styles.checkbox,
            checked ? styles.checkboxChecked : styles.checkboxUnchecked,
          ]}
        >
          {checked && <Check size={20} color="white" />}
        </Pressable>
      </View>
    )
  }

  const MultiRenderer = () => {
    return (
      <View>
        <View style={[styles.rendererContainer, { marginBottom: 16 }]}>
          <Text style={styles.cardTitle}>{config.name}</Text>
        </View>
        <View style={{ gap: 12 }}>
          {config.schedule?.map((label, index) => {
            const key = config.keys?.[index]
            const checked = isCompleted(key)
            return (
              <View key={key} style={styles.multiRow}>
                <Text style={styles.multiRowLabel}>{label}</Text>
                <Pressable
                  onPress={() => onToggle(key, !checked)}
                  style={[
                    styles.checkboxSmall,
                    checked
                      ? styles.checkboxSmallChecked
                      : styles.checkboxUnchecked,
                    { backgroundColor: checked ? "white" : "transparent" },
                  ]}
                >
                  {checked && <Check size={16} color="black" />}
                </Pressable>
              </View>
            )
          })}
        </View>
      </View>
    )
  }

  const CourseRenderer = () => {
    return (
      <View>
        <View style={[styles.rendererContainer, { marginBottom: 8 }]}>
          <Text style={styles.cardTitle}>{config.name}</Text>
          <Text style={styles.cardDesc}>Target: {config.total || 20}</Text>
        </View>
        {/* Progress Bar Stub - Make it look better */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: "33%", backgroundColor: config.color },
            ]}
          />
        </View>

        <View style={{ gap: 8 }}>
          {config.schedule?.map((label, index) => {
            const key = config.keys?.[index]
            const checked = isCompleted(key)
            return (
              <TouchableOpacity
                key={key}
                onPress={() => onToggle(key, !checked)}
                style={[
                  styles.courseButton,
                  checked
                    ? styles.courseButtonChecked
                    : styles.courseButtonUnchecked,
                ]}
              >
                {checked && <Check size={18} color="black" />}
                <Text
                  style={
                    checked
                      ? styles.courseTextChecked
                      : styles.courseTextUnchecked
                  }
                >
                  {checked ? "Taken" : `Take ${label} Dose`}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    )
  }

  return (
    <CardWrapper>
      <View style={styles.contentRow}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: `${config.color}20` }, // 20% opacity using hex alpha
          ]}
        >
          {(() => {
            // Handle legacy emoji or new keys
            const IconComponent = ICONS[config.icon] || ICONS.Pill
            return <IconComponent size={24} color={config.color} />
          })()}
        </View>

        <View style={{ flex: 1 }}>
          {config.type === "daily" && <DailyRenderer />}

          {config.type === "simple" && <SimpleRenderer />}
          {config.type === "multi" && <MultiRenderer />}
          {config.type === "course" && <CourseRenderer />}

          {/* Fallback for new types */}
          {!["simple", "daily", "multi", "course"].includes(config.type) && (
            <View style={styles.rendererContainer}>
              <View>
                <Text style={styles.cardTitle}>{config.name}</Text>
                <Text style={styles.cardDesc}>
                  {config.type} - Tracking coming soon
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </CardWrapper>
  )
}

// Helper to slightly vary the gradient
function adjustColor(color) {
  // Since we don't have a color manipulation library,
  // we will return the same color. The LinearGradient will still
  // do a subtle shift if we used different opacity, but here
  // we rely on the border and natural lighting of the UI.
  // Ideally, this would darken or lighten the color.
  return color
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.lg,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Layout.radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: Spacing.sm,
  },
  iconText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  rendererContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.subtitle.fontSize,
    fontWeight: "bold",
  },
  cardDesc: {
    color: Colors.white60,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: Layout.radius.full,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.white20,
    borderColor: Colors.textPrimary,
  },
  checkboxUnchecked: {
    borderColor: "rgba(255,255,255,0.3)",
  },
  checkboxSmall: {
    width: 32,
    height: 32,
    borderRadius: Layout.radius.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSmallChecked: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  multiRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: Spacing.md,
    borderRadius: Layout.radius.md,
  },
  multiRowLabel: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.black20,
    borderRadius: Layout.radius.full,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  courseButton: {
    padding: Spacing.md,
    borderRadius: Layout.radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  courseButtonChecked: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  courseButtonUnchecked: {
    backgroundColor: Colors.black20,
  },
  courseTextChecked: {
    color: "black",
    fontWeight: "bold",
  },
  courseTextUnchecked: {
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  dailyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.subtitle.fontSize,
    fontWeight: "600",
  },
  dailyChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Layout.radius.full,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  dailyChipLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.caption.fontSize,
    fontWeight: "600",
  },
})
