import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useCurrency } from '../context/CurrencyContext';
import { CURRENCIES } from '../constants/currencies';
import { COLORS, SIZES } from '../constants/theme';

// Panel de selección de moneda (overlay en línea, no RN Modal) para que el
// cierre funcione de forma fiable también en web. Base, visualización y tasas.
const CurrencyModal = ({ visible, onClose }) => {
  const { currency, setCurrency, baseCurrency, setBaseCurrency, ratesUpdatedAt, refreshRates, loadingRates } = useCurrency();

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      <View style={styles.card}>
        <Text style={styles.title}>Moneda</Text>

        <Text style={styles.section}>MONEDA BASE (TUS DATOS)</Text>
        <View style={styles.codeRow}>
          {CURRENCIES.map((c) => {
            const active = c.code === baseCurrency;
            return (
              <TouchableOpacity
                key={c.code}
                style={[styles.codeChip, active && styles.codeChipActive]}
                onPress={() => setBaseCurrency(c.code)}
              >
                <Text style={[styles.codeChipText, active && styles.codeChipTextActive]}>{c.code}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.section}>MOSTRAR EN</Text>
        {CURRENCIES.map((c) => {
          const active = c.code === currency;
          return (
            <TouchableOpacity
              key={c.code}
              style={[styles.currencyRow, active && styles.currencyRowActive]}
              onPress={() => {
                setCurrency(c.code);
                onClose();
              }}
            >
              <Text style={styles.currencyCode}>{c.symbol} {c.code}</Text>
              <Text style={styles.currencyName}>{c.name}</Text>
              {active && <MaterialIcons name="check" size={20} color={COLORS.success} />}
            </TouchableOpacity>
          );
        })}

        <View style={styles.ratesRow}>
          <Text style={styles.ratesText}>
            {ratesUpdatedAt
              ? `Tasas: ${new Date(ratesUpdatedAt).toLocaleDateString('es-CO')}`
              : 'Tasas: respaldo (sin conexión)'}
          </Text>
          <TouchableOpacity onPress={refreshRates} disabled={loadingRates}>
            <Text style={styles.ratesRefresh}>{loadingRates ? 'Actualizando…' : 'Actualizar'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
          <Text style={styles.doneText}>Listo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
    elevation: 100,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#333' },
  section: { fontSize: 11, fontWeight: 'bold', color: COLORS.neutral, marginTop: 14, marginBottom: 6 },
  codeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  codeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.primary },
  codeChipActive: { backgroundColor: COLORS.primary },
  codeChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  codeChipTextActive: { color: COLORS.textPrimary },
  currencyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 10, borderRadius: SIZES.radius },
  currencyRowActive: { backgroundColor: COLORS.primary + '33' },
  currencyCode: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, width: 70 },
  currencyName: { flex: 1, fontSize: 14, color: COLORS.textSecondary },
  ratesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  ratesText: { fontSize: 12, color: COLORS.textSecondary },
  ratesRefresh: { fontSize: 13, fontWeight: 'bold', color: COLORS.success },
  doneBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneText: { fontSize: SIZES.font, fontWeight: 'bold', color: COLORS.textPrimary },
});

export default CurrencyModal;
