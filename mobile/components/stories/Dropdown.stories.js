import React, { useState } from "react"
import { View } from "react-native"
import Dropdown from "../Dropdown"
import { Colors } from "../../theme"

const DropdownWrapper = (props) => {
  const [value, setValue] = useState(props.value || "pill")
  return <Dropdown {...props} value={value} onChange={setValue} />
}

export default {
  title: "Dropdown",
  component: Dropdown,
  decorators: [
    (Story) => (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          padding: 40,
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Story />
      </View>
    ),
  ],
}

export const Default = {
  render: (args) => <DropdownWrapper {...args} />,
  args: {
    options: ["pill", "mg", "ml"],
    label: "Unit",
    width: 120,
  },
}

export const LongList = {
  render: (args) => <DropdownWrapper {...args} />,
  args: {
    options: ["Daily", "Weekly", "Monthly", "Yearly", "Custom Interval"],
    label: "Frequency",
    width: 200,
  },
}

export const WithoutLabel = {
  render: (args) => <DropdownWrapper {...args} />,
  args: {
    options: ["Option 1", "Option 2", "Option 3"],
    width: 150,
    placeholder: "Choose...",
    value: null,
  },
}
