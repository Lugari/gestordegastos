import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';


const Header = ({ username }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>Hola, {username}!</Text>
      <MaterialIcons name="account-circle" size={64} color="black" />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'flex-start', // Alineado a la izquierda
    flexDirection: 'row', // Elementos en fila
    justifyContent: 'space-between', 
    width: '100%', 
  },
  greeting: {
    fontFamily: 'Poppins',
    fontSize: 44,
    fontWeight: 500,
    color: '#000',
  },
});

export default Header;
