import React from "react"
import { View, Button } from "react-native"
import EditMedicationModal from "../EditMedicationModal"
import { Colors } from "../../theme"

// Wrapper to handle visibility state for the story
const ModalWrapper = (props) => {
  const [visible, setVisible] = React.useState(true) // Start visible for story

  return (
    <View style={{ flex: 1 }}>
      <Button title="Open Modal" onPress={() => setVisible(true)} />
      <EditMedicationModal
        {...props}
        visible={visible}
        onClose={() => {
          console.log("onClose triggered")
          setVisible(false)
          props.onClose?.()
        }}
        onSave={(data) => {
          console.log("onSave triggered", data)
          props.onSave?.(data)
        }}
      />
    </View>
  )
}

export default {
  title: "EditMedicationModal",
  component: EditMedicationModal,
  render: (args) => <ModalWrapper {...args} />,
  decorators: [
    (Story) => (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          padding: 20,
          justifyContent: "center",
        }}
      >
        <Story />
      </View>
    ),
  ],
  argTypes: {
    onSave: { action: "onSave" },
    onDelete: { action: "onDelete" },
    onClose: { action: "onClose" },
  },
}

const mockDaily = {
  id: 1,
  name: "Minoxidil",
  dosage: "5mg",
  type: "daily",
  frequency: "2x Daily",
  times: ["Morning", "Night"],
  color: "#FF6B6B",
  icon: "Pill",
  config: {},
}

const mockCourse = {
  id: 3,
  name: "Amoxicillin",
  dosage: "500mg",
  type: "course",
  color: "#45B7D1",
  icon: "Tablet",
  config: { totalDoses: "21", startDate: "2023-10-01" },
}

export const NewMedication = {
  args: {
    medication: null,
  },
}

export const EditDaily = {
  args: {
    medication: mockDaily,
  },
}

export const EditCourse = {
  args: {
    medication: mockCourse,
  },
}
