import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { COLORS, SIZES } from '../constants/theme';

const FAB = ({onPress}) => { 
  return (
    <TouchableOpacity style={styles.container} onPressIn={onPress}>
      <MaterialIcons
                    name="add"
                    size={64}
                    color={COLORS.textPrimary}
                    style={styles.fab}
                  />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'sticky',
    bottom: 30,
    right: 20,

  },

  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius*1.5,
    width: 64,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    elevation: 5,
  },
 
});

export default FAB;
