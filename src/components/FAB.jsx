import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const FAB = ({onSelect}) => { 
  return (
    <TouchableOpacity style={styles.container} onPressIn={onSelect}>
      <MaterialIcons
                    name="add-circle-outline"
                    size={64}
                    color="#729AA9"
                    style={styles.fab}
                  />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'sticky',
    bottom: 20,
    right: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 28,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
 
});

export default FAB;
