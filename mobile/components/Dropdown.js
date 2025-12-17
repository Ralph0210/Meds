import React, { useState, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from "react-native"
import { ChevronDown, Check } from "lucide-react-native"
import { Colors, Spacing, Layout, Typography } from "../theme"

export default function Dropdown({
  value,
  options = [],
  onChange,
  placeholder = "Select...",
  label,
  width = 120, // Default width
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const buttonRef = useRef(null)

  const handleSelect = (option) => {
    onChange(option)
    setIsOpen(false)
  }

  const toggleDropdown = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, w, h) => {
        setButtonLayout({ x, y, w, h })
        setIsOpen(!isOpen)
      })
    }
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        ref={buttonRef}
        style={[styles.button, isOpen && styles.buttonActive, { width }]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>{value || placeholder}</Text>
        <ChevronDown
          size={16}
          color={isOpen ? Colors.primary : Colors.textSecondary}
          style={{
            transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
          }}
        />
      </TouchableOpacity>

      {/* 
        Using a transparent Modal to handle the overlay and positioning. 
        This ensures the dropdown behaves correctly regardless of z-index contexts.
      */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                top: buttonLayout.y + buttonLayout.h + 4,
                left: buttonLayout.x,
                width: Math.max(width, 80), // Min width for dropdown list
              },
            ]}
          >
            {options.map((option) => {
              const isSelected = option === value
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => handleSelect(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {isSelected && <Check size={14} color={Colors.primary} />}
                </TouchableOpacity>
              )
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // Container styles if needed
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.caption.fontSize,
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  buttonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)", // subtle scrim
  },
  dropdown: {
    position: "absolute",
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.white10,
    padding: Spacing.xs,
    // Shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Layout.radius.sm,
  },
  optionSelected: {
    backgroundColor: Colors.surfaceHighlight,
  },
  optionText: {
    color: Colors.textSecondary,
    fontSize: Typography.body.fontSize,
  },
  optionTextSelected: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
})
