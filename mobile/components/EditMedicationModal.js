import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
} from "react-native"
import { BlurView } from "expo-blur"
import { X, Trash2, Check, ChevronRight } from "lucide-react-native"
import { Colors, Spacing, Layout, Typography } from "../theme"
import { ICONS, ICON_KEYS } from "../theme/icons"
import Dropdown from "./Dropdown"

const SUPPORTED_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9B59B6",
  "#3498DB",
  "#1ABC9C",
  "#F1C40F",
]

const MEDICATION_TYPES = [
  { id: "daily", label: "Every day", desc: "Take everyday" },
  { id: "course", label: "For a set period", desc: "Limited duration" },
  { id: "cyclic", label: "On and off", desc: "On/Off cycles" },
]

export default function EditMedicationModal({
  visible,
  medication,
  onClose,
  onSave,
  onDelete,
}) {
  const isNew = !medication?.id

  const [form, setForm] = useState({
    name: "",
    dosageQuantity: "",
    dosageUnit: "pill",
    type: "daily",
    frequency: "1x Daily", // For Daily
    times: ["Morning"], // For Daily
    config: {}, // For other types
    color: SUPPORTED_COLORS[0],
    icon: ICON_KEYS[0],
  })

  useEffect(() => {
    if (medication) {
      setForm({
        name: medication.name || "",
        dosageQuantity: medication.dosage
          ? medication.dosage.replace(/[a-zA-Z\s]/g, "")
          : "",
        dosageUnit:
          medication.dosage && medication.dosage.includes("mg")
            ? "mg"
            : medication.dosage && medication.dosage.includes("ml")
              ? "ml"
              : "pill",
        type: medication.type || "daily",
        frequency: medication.frequency || "1x Daily",
        times: medication.times || ["Morning"],
        config: medication.config || {},
        color: medication.color || SUPPORTED_COLORS[0],
        icon: medication.icon || ICON_KEYS[0],
      })
    } else {
      setForm({
        name: "",
        dosageQuantity: "",
        dosageUnit: "pill",
        type: "daily",
        frequency: "1x Daily",
        times: ["Morning"],
        config: {},
        color: SUPPORTED_COLORS[0],
        icon: ICON_KEYS[0],
      })
    }
  }, [medication])

  const handleSave = () => {
    if (!form.name) return
    const finalDosage = form.dosageQuantity
      ? `${form.dosageQuantity}${form.dosageUnit === "pill" ? "" : form.dosageUnit}`
      : ""
    onSave({ ...medication, ...form, dosage: finalDosage })
  }

  const handleDelete = () => {
    Alert.alert("Delete Medication?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(medication),
      },
    ])
  }

  const updateConfig = (key, value) => {
    setForm((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }))
  }

  // --- Renderers for Type-Specific Forms ---

  const renderScheduleForm = () => {
    const handleFrequencyChange = (freq) => {
      let newTimes = []
      if (freq === "1x Daily") newTimes = ["Morning"]
      else if (freq === "2x Daily") newTimes = ["Morning", "Night"]
      else if (freq === "3x Daily") newTimes = ["Morning", "Noon", "Night"]
      else if (freq === "Custom") newTimes = [...form.times]

      setForm((prev) => ({ ...prev, frequency: freq, times: newTimes }))
    }

    const { type } = form
    // Determine units for the limit dropdown: "days" vs. the dosage unit (e.g. "pill", "mg")
    const limitUnitOptions = [form.dosageUnit || "pill", "days"]

    // Helper to get current limit mode from config, or default to quantity (dosageUnit)
    const currentLimitMode =
      form.config.durationMode === "days" ? "days" : "quantity"

    // Helper to switch mode
    const setLimitMode = (mode) => {
      // mode is either "days" or "quantity"
      // We map the dropdown selection back to these internal keys
      updateConfig("durationMode", mode)
    }

    return (
      <View style={styles.subForm}>
        {/* Course Limit Row - Only for Course */}
        {type === "course" && (
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={styles.label}>Duration</Text>
            <View style={{ flexDirection: "row", gap: Spacing.sm, zIndex: 20 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.input}
                  placeholder={
                    currentLimitMode === "days" ? "e.g. 10" : "e.g. 30"
                  }
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textTertiary}
                  value={form.config.courseDuration}
                  onChangeText={(t) => updateConfig("courseDuration", t)}
                />
              </View>
              <Dropdown
                value={
                  currentLimitMode === "days"
                    ? "days"
                    : form.dosageUnit || "pill"
                }
                options={limitUnitOptions}
                onChange={(val) => {
                  if (val === "days") setLimitMode("days")
                  else setLimitMode("quantity")
                }}
                width={110}
              />
            </View>

            {/* Start Date also needs to be here if it's a course */}
            <View style={{ marginTop: Spacing.md }}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textTertiary}
                value={
                  form.config.startDate ||
                  new Date().toISOString().split("T")[0]
                }
                onChangeText={(t) => updateConfig("startDate", t)}
              />
            </View>
          </View>
        )}

        {/* Quick Presets */}
        <View style={styles.optionsRow}>
          {["1x Daily", "2x Daily", "3x Daily", "Custom"].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.optionBtn,
                form.frequency === opt && styles.optionBtnActive,
              ]}
              onPress={() => handleFrequencyChange(opt)}
            >
              <Text
                style={[
                  styles.optionText,
                  form.frequency === opt && styles.optionTextActive,
                ]}
              >
                {opt.replace(" Daily", "")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Slots Editor */}
        {/* Slots Editor */}
        <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
          {form.times.map((time, index) => {
            // Parse time for split inputs
            let timeValue = ""
            let timePeriod = "AM"

            const presets = [
              "Morning",
              "Noon",
              "After Meal",
              "Evening",
              "Night",
            ]

            if (presets.includes(time)) {
              timePeriod = time
            } else {
              // Try to split "8:00 AM" -> val="8:00", unit="AM"
              // If no space, default to AM
              const parts = time.split(" ")
              if (
                parts.length > 1 &&
                ["AM", "PM"].includes(parts[parts.length - 1])
              ) {
                timePeriod = parts.pop()
                timeValue = parts.join(" ")
              } else {
                timeValue = time
              }
            }

            const updateTime = (val, period) => {
              let newTimeStr = ""
              if (presets.includes(period)) {
                newTimeStr = period
              } else {
                newTimeStr = val ? `${val} ${period}` : period
              }

              const newTimes = [...form.times]
              newTimes[index] = newTimeStr
              // FIXED: Do not force frequency to "Custom" when just editing a time slot
              setForm({ ...form, times: newTimes })
            }

            // If it's a preset/named period (not AM/PM), we hide the numeric input
            // and let the dropdown take full width.
            const isPreset = presets.includes(timePeriod)

            return (
              <View
                key={index}
                style={[styles.timeSlotRow, { zIndex: 100 - index }]}
              >
                {/* Only show numeric input for AM/PM */}
                {!isPreset && (
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={styles.input}
                      value={timeValue}
                      placeholder="00:00"
                      placeholderTextColor={Colors.textTertiary}
                      onChangeText={(text) => updateTime(text, timePeriod)}
                    />
                  </View>
                )}

                <View style={isPreset ? { flex: 1 } : { width: 110 }}>
                  <Dropdown
                    value={timePeriod}
                    options={["AM", "PM", ...presets]}
                    onChange={(period) => {
                      let newVal = timeValue

                      if (presets.includes(period)) {
                        newVal = ""
                      } else if (!timeValue && ["AM", "PM"].includes(period)) {
                        // Default to current time
                        const now = new Date()
                        let h = now.getHours()
                        const m = now.getMinutes().toString().padStart(2, "0")
                        if (h > 12) h -= 12
                        if (h === 0) h = 12
                        newVal = `${h}:${m}`
                      }

                      updateTime(newVal, period)
                    }}
                    width={isPreset ? "100%" : 110}
                  />
                </View>

                {form.times.length > 1 && (
                  <TouchableOpacity
                    onPress={() => {
                      const newTimes = form.times.filter((_, i) => i !== index)
                      setForm({ ...form, times: newTimes, frequency: "Custom" })
                    }}
                    style={styles.removeSlotBtn}
                  >
                    <X size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            )
          })}

          {form.frequency === "Custom" && (
            <TouchableOpacity
              style={styles.addSlotBtn}
              onPress={() => {
                setForm({
                  ...form,
                  times: [...form.times, "8:00 AM"], // Default new slot
                  frequency: "Custom",
                })
              }}
            >
              <Text style={styles.addSlotText}>+ Add Time</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  const renderCyclicForm = () => (
    <View style={styles.subForm}>
      <Text style={styles.sectionHeader}>Cycle Settings</Text>
      <View style={{ flexDirection: "row", gap: Spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Cycle Length (Days)</Text>
          <TextInput
            style={styles.input}
            placeholder="28"
            keyboardType="numeric"
            placeholderTextColor={Colors.textTertiary}
            value={form.config.cycleDays}
            onChangeText={(t) => updateConfig("cycleDays", t)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Active Days</Text>
          <TextInput
            style={styles.input}
            placeholder="21"
            keyboardType="numeric"
            placeholderTextColor={Colors.textTertiary}
            value={form.config.activeDays}
            onChangeText={(t) => updateConfig("activeDays", t)}
          />
        </View>
      </View>
    </View>
  )

  const renderIntervalForm = () => (
    <View style={styles.subForm}>
      <Text style={styles.sectionHeader}>Interval Settings</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Repeat Every (Days)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2"
          keyboardType="numeric"
          placeholderTextColor={Colors.textTertiary}
          value={form.config.intervalDays}
          onChangeText={(t) => updateConfig("intervalDays", t)}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Next Due Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.textTertiary}
          value={form.config.nextDueDate}
          onChangeText={(t) => updateConfig("nextDueDate", t)}
        />
      </View>
    </View>
  )

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {isNew ? "Add Medication" : "Edit Medication"}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color={Colors.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Name & Dosage */}
          {/* Name & Dosage */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Metformin"
              placeholderTextColor={Colors.textTertiary}
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
          </View>

          <View style={[styles.formGroup, { marginBottom: Spacing.xxl }]}>
            <Text style={styles.label}>Amount</Text>
            <View style={{ flexDirection: "row", gap: Spacing.sm, zIndex: 10 }}>
              {/* Quantity Input */}
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                  value={form.dosageQuantity}
                  onChangeText={(t) => setForm({ ...form, dosageQuantity: t })}
                  keyboardType="default" // Changed to default to allow "/"
                />
              </View>

              <Dropdown
                value={form.dosageUnit}
                options={["pill", "mg", "ml"]}
                onChange={(val) => setForm({ ...form, dosageUnit: val })}
                width={100}
              />
            </View>

            {/* Quick Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: Spacing.sm }}
              contentContainerStyle={{ gap: Spacing.xs }}
            >
              {(form.dosageUnit === "pill"
                ? ["1/4", "1/2", "1", "2", "3"]
                : ["5", "10", "20", "50", "100", "200", "500", "1000"]
              ).map((val) => {
                const isSelected = form.dosageQuantity === val

                return (
                  <TouchableOpacity
                    key={val}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setForm({ ...form, dosageQuantity: val })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
                      {val}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>

          {/* Tracking Type Selector */}
          <View style={[styles.formGroup, { marginBottom: Spacing.md }]}>
            <Text style={styles.label}>Frequency</Text>
            <Dropdown
              value={MEDICATION_TYPES.find((t) => t.id === form.type)?.label}
              options={MEDICATION_TYPES.map((t) => t.label)}
              onChange={(label) => {
                const selected = MEDICATION_TYPES.find((t) => t.label === label)
                if (selected) setForm({ ...form, type: selected.id })
              }}
              width="100%"
            />
          </View>

          {/* Conditional Sub-Forms */}
          {/* Daily Schedule is used for both Daily and Course types */}
          {(form.type === "daily" || form.type === "course") &&
            renderScheduleForm()}

          {form.type === "cyclic" && renderCyclicForm()}
          {form.type === "interval" && renderIntervalForm()}

          {/* Color Picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Color Tag</Text>
            <View style={styles.colorGrid}>
              {SUPPORTED_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorCell, { backgroundColor: c }]}
                  onPress={() => setForm({ ...form, color: c })}
                >
                  {form.color === c && <Check color="white" size={16} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Icon Picker (Lucide) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconGrid}>
              {ICON_KEYS.map((key) => {
                const IconComp = ICONS[key]
                const isActive = form.icon === key
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.iconCell, isActive && styles.iconCellActive]}
                    onPress={() => setForm({ ...form, icon: key })}
                  >
                    <IconComp
                      size={24}
                      color={isActive ? Colors.primary : Colors.textSecondary}
                    />
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Medication</Text>
          </TouchableOpacity>

          {!isNew && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Trash2 color={Colors.danger} size={20} />
              <Text style={[styles.deleteText, { color: Colors.danger }]}>
                Delete Medication
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: Spacing.xxxl * 2 }} />
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    marginTop: 60,
    borderTopLeftRadius: Layout.radius.xl,
    borderTopRightRadius: Layout.radius.xl,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white10,
  },
  modalTitle: {
    fontSize: Typography.title.fontSize,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: Spacing.sm,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.xl,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  subForm: {
    backgroundColor: Colors.surfaceHighlight,
    padding: Spacing.lg,
    borderRadius: Layout.radius.lg,
    marginBottom: Spacing.xxl,
    borderColor: Colors.white10,
    borderWidth: 1,
  },
  sectionHeader: {
    color: Colors.textPrimary,
    fontWeight: "bold",
    marginBottom: Spacing.md,
    fontSize: Typography.body.fontSize,
  },
  label: {
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontSize: Typography.caption.fontSize,
    fontWeight: "600",
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.body.fontSize,
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  typeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.radius.full,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: {
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: Typography.caption.fontSize,
  },
  typeChipTextActive: {
    color: Colors.textOnPrimary,
  },
  typeDesc: {
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: Typography.caption.fontSize,
    backgroundColor: Colors.surfaceHighlight,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Layout.radius.md,
    overflow: "hidden",
  },
  optionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    alignItems: "center",
  },
  optionBtnActive: {
    backgroundColor: Colors.primary,
  },
  optionText: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  optionTextActive: {
    color: Colors.textOnPrimary,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  colorCell: {
    width: 40,
    height: 40,
    borderRadius: Layout.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCellActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: Layout.radius.lg,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  saveBtnText: {
    color: Colors.textOnPrimary,
    fontWeight: "bold",
    fontSize: Typography.body.fontSize,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: Layout.radius.lg,
    borderWidth: 1,
    borderColor: Colors.dangerSurface,
    backgroundColor: Colors.dangerSurface,
  },
  deleteText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  timeSlotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  removeSlotBtn: {
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    height: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  addSlotBtn: {
    padding: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.white20,
    borderRadius: Layout.radius.md,
    borderStyle: "dashed",
    marginTop: Spacing.sm,
  },
  addSlotText: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Layout.radius.full,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: Typography.caption.fontSize,
    fontWeight: "600",
  },
  chipTextActive: {
    color: Colors.textOnPrimary,
  },
  unitSelector: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.white10,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
  },
  unitText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: Typography.body.fontSize,
  },
})
