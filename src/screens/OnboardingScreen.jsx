import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';


// Presentación inicial de la app (se muestra una sola vez por dispositivo).
const SLIDES = [
  {
    icon: 'add-circle-outline',
    title: 'Registra en segundos',
    text: 'Anota gastos, ingresos y ahorros con el botón "+". Cada movimiento puede vincularse a una cuenta y a un presupuesto.',
  },
  {
    icon: 'flag',
    title: 'Presupuestos y metas',
    text: 'Crea presupuestos por categoría, metas de ahorro, deudas e inversiones, y sigue su progreso desde Inicio.',
  },
  {
    icon: 'autorenew',
    title: 'Automatiza tu rutina',
    text: 'Las transacciones recurrentes se registran solas, y las facturas te avisan antes de vencer con su calendario.',
  },
  {
    icon: 'cloud-done',
    title: 'Seguro y sincronizado',
    text: 'Tus datos viven cifrados en la nube y se sincronizan entre tus dispositivos. Actívalo todo desde Más.',
  },
];

const OnboardingScreen = ({ onDone }) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  // El botón avanza el índice directamente (onMomentumScrollEnd no dispara en
  // web); el evento de scroll queda para los deslizamientos manuales en móvil.
  const goNext = () => {
    if (last) {
      onDone();
      return;
    }
    const next = index + 1;
    setIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  return (
    <View style={styles.root}>
      <TouchableOpacity style={styles.skip} onPress={onDone} accessibilityLabel="Saltar presentación">
        <Text style={styles.skipText}>Saltar</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.title}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.iconWrap}>
              <MaterialIcons name={item.icon} size={54} color={theme.green} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
          <Text style={styles.nextText}>{last ? 'Comenzar' : 'Siguiente'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const makeStyles = (t) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background },
  skip: { position: 'absolute', top: 54, right: 24, zIndex: 10, padding: 6 },
  skipText: { fontSize: SIZES.font, color: t.textSecondary, fontWeight: '600' },

  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconWrap: {
    width: 110, height: 110, borderRadius: 55, backgroundColor: t.greenSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 28,
  },
  title: { fontSize: SIZES.font * 1.5, fontWeight: '700', color: t.textPrimary, marginBottom: 12, textAlign: 'center' },
  text: { fontSize: SIZES.font * 1.02, color: t.textSecondary, textAlign: 'center', lineHeight: SIZES.font * 1.55, maxWidth: 320 },

  footer: { paddingHorizontal: 32, paddingBottom: 40, gap: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: t.track },
  dotActive: { backgroundColor: t.green, width: 22 },
  nextBtn: { backgroundColor: t.green, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  nextText: { color: '#fff', fontSize: SIZES.font * 1.1, fontWeight: '700' },
});

export default OnboardingScreen;
