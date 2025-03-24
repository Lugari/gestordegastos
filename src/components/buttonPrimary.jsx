import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const ButtonPrimary = ({ title = 'Button', onPress }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={styles.text}>{title?.toUpperCase()}</Text>
    </TouchableOpacity>
  );
};

ButtonPrimary.propTypes = {
  title: PropTypes.string,
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#A8BBC4', // Color similar al de la imagen
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start', // Se ajusta al tamaño del texto
  },
  text: {
    color: '#000', // Texto negro
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ButtonPrimary;
