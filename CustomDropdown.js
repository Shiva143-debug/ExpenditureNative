// import React, { useState } from "react";
// import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native";

// const CustomDropdown = ({ selectedValue, setSelectedValue, placeholder }) => {

//     let data = [
//         { label: 'January', value: '1' },
//         { label: 'February', value: '2' },
//         { label: 'March', value: '3' },
//         { label: 'April', value: '4' },
//         { label: 'May', value: '5' },
//         { label: 'June', value: '6' },
//         { label: 'July', value: '7' },
//         { label: 'August', value: '8' },
//         { label: 'September', value: '9' },
//         { label: 'October', value: '10' },
//         { label: 'November', value: '11' },
//         { label: 'December', value: '12' },
//       ]
//   const [isModalVisible, setModalVisible] = useState(false);

//   const selectItem = (item) => {
//     setSelectedValue(item);
//     setModalVisible(false);
//   };

//   return (
//     <View>
//       <TouchableOpacity style={styles.dropdownButton} onPress={() => setModalVisible(true)}>
//         <Text style={styles.dropdownButtonText}>{selectedValue || placeholder}</Text>
//       </TouchableOpacity>
//       <Modal visible={isModalVisible} transparent>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <FlatList
//               data={data}
//               keyExtractor={(item) => item.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity style={styles.modalItem} onPress={() => selectItem(item)}>
//                   <Text style={styles.modalItemText}>{item}</Text>
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   dropdownButton: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 10,
//     borderRadius: 5,
//     width: "50%",
//     marginBottom: 10,
//   },
//   dropdownButtonText: {
//     color: "#000",
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContent: {
//     width: "80%",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 10,
//   },
//   modalItem: {
//     padding: 15,
//   },
//   modalItemText: {
//     fontSize: 16,
//     color: "#000",
//   },
// });

// export default CustomDropdown;



import React from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { StyleSheet } from "react-native";

const CustomDropdown = ({ open, value, items, setOpen, setValue, setItems, placeholder }) => {
  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      placeholder={placeholder}
      style={styles.dropdown}
      dropDownContainerStyle={styles.dropdownList}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    borderColor: "#ccc",
    width: "100%",
    marginBottom: 10,
  },
  dropdownList: {
    zIndex: 1,
  },
});

export default CustomDropdown;
