import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import {COLORS, SIZES} from '../constants/theme'

const PrimaryButton = ({ title, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding* 0.75,
    paddingHorizontal: SIZES.padding * 1.25,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 1,
  },
  text: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: SIZES.font,
  },
});

export default PrimaryButton;
