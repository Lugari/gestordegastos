import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS, SIZES, FONTS } from '../constants/theme';


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
    width: '100%', 
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 1.25,
    alignItems: 'flex-start', 
    flexDirection: 'row',
    justifyContent: 'space-between', 
  },
  greeting: {
    fontFamily: FONTS.body.fontFamily,
    fontSize: SIZES.font * 3,
    fontWeight: 500,
    color: COLORS.textPrimary,
  },
});

export default Header;
