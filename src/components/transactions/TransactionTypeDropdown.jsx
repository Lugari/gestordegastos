import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';

import { COLORS, SIZES } from '../../constants/theme';

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
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 0.5,
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedText: {
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
  },
  arrow: {
    width: 16,
    height: 16,
    marginLeft: 8,
    tintColor: COLORS.lightGray,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding * 2.4,
    backgroundColor: '#00000088', // Semi-transparent background
  },
  dropdown: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingVertical:  SIZES.padding * 0.5,
    paddingHorizontal: SIZES.padding,
    elevation: 5,
  },
  option: {
    paddingVertical: SIZES.padding * 0.8,
  },
  optionText: {
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
  },
});

export default TransactionTypeDropdown;
