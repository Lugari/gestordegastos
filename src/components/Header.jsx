import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { COLORS, SIZES, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Header simplificado: saludo + avatar que lleva a "Más" (perfil/ajustes).
// El menú desbordado se movió a la pestaña "Más".
const Header = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('Usuario');

  // Refresca el nombre al volver a enfocar (puede cambiarse en "Más").
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@username').then((v) => {
        if (v) setUsername(v);
      });
    }, []),
  );

  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>Hola, {username}!</Text>
      <TouchableOpacity onPress={() => navigation.navigate('MoreScreen')} accessibilityLabel="Perfil y ajustes">
        <MaterialIcons name="account-circle" size={64} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width,
  },
  greeting: {
    fontFamily: FONTS.subheading.fontFamily,
    fontSize: SIZES.font * 2.8,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
});

export default Header;
