import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Header = ({ username }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>Hola, {username}!</Text>
      <Image
        source={require('../assets/basic/Avatar.png')}
        style={{ width: 64, height: 64 }}
        />
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
