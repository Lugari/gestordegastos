import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const options = ['ingreso', 'gasto', 'ahorro'];

const TransactionTypeDropdown = ({ selected, onSelect }) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (option) => {
    onSelect(option);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.selectedText}>
          {selected.toUpperCase() || 'Selecciona tipo'}
        </Text>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={24}
          color="#5f7067"
          style={styles.arrow}
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.modalBackground} onPress={() => setVisible(false)}>
          <View style={styles.dropdown}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => handleSelect(option)}
                style={styles.option}
              >
                <Text style={styles.optionText}>{option.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#cdd1c5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f4f7f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedText: {
    fontSize: 14,
    color: '#000',
  },
  arrow: {
    width: 16,
    height: 16,
    marginLeft: 8,
    tintColor: '#5f7067',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 5,
  },
  option: {
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
});

export default TransactionTypeDropdown;
