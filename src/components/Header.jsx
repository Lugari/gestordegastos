import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { COLORS, SIZES } from '../constants/theme';

// Header compacto (mockup): avatar con inicial + saludo + mes actual.
// Todo el bloque lleva a "Más" (perfil/ajustes).
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

  const month = new Date()
    .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    .replace(' de ', ' ');
  const initial = username.trim().charAt(0).toUpperCase() || 'U';

  return (
    <TouchableOpacity
      style={styles.header}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('MoreScreen')}
      accessibilityLabel="Perfil y ajustes"
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View>
        <Text style={styles.greeting}>Hola, {username}</Text>
        <Text style={styles.month}>{month}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: SIZES.padding,
    alignSelf: 'stretch',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCE3F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B5BA5',
  },
  greeting: {
    fontSize: SIZES.font * 1.6,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  month: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default Header;
