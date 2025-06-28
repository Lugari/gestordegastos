import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import { COLORS, SIZES } from '../constants/theme';

const SecondaryButton = ({ title, onPress }) => (
  <TouchableOpacity style={styles.button} onPressIn={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SIZES.padding * 0.75,
    paddingHorizontal: SIZES.padding * 1.25,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    elevation: 1,
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SecondaryButton;
