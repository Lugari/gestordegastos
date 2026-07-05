import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import {COLORS, SIZES} from '../constants/theme'

const PrimaryButton = ({ title, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

// Verde de marca (mismo de los botones primarios de formularios).
const GREEN = '#1C6B52';

const styles = StyleSheet.create({
  button: {
    backgroundColor: GREEN,
    paddingVertical: SIZES.padding* 0.75,
    paddingHorizontal: SIZES.padding * 1.25,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 1,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: SIZES.font,
  },
});

export default PrimaryButton;
