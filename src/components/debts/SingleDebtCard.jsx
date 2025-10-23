import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import { COLORS, SIZES } from '../../constants/theme';

const SingleDebtCard = ({ debt, onEdit, onDelete }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{debt.name.toUpperCase()}</Text>
      <Text style={styles.amount}>${debt.total.toLocaleString('es-CO')}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TIPO</Text>
        <Text style={styles.sectionValue}>{debt.type}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>APR</Text>
        <Text style={styles.sectionValue}>{debt.apr}%</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CUOTAS</Text>
        <Text style={styles.sectionValue}>{debt.fees}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FECHA DE INICIO</Text>
        <View style={styles.iconRow}>
          <MaterialIcons name="calendar-month" size={18} color="#000" />
          <Text style={styles.sectionValue}>{formatDate(debt.created_at)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DESCRIPCIÓN</Text>
        <Text style={styles.description}>{debt.notes}</Text>
      </View>

      <View style={styles.buttonRow}>
        <PrimaryButton title="Editar" onPress={onEdit} />
        <SecondaryButton title="Eliminar" onPress={onDelete} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    elevation: 3,
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
    fontSize: SIZES.font * 1.5,
    color: COLORS.textPrimary,
  },
  amount: {
    fontSize: SIZES.font * 2,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginBottom: SIZES.padding,
  },
  section: {
    marginTop: SIZES.padding,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionValue: {
    fontSize: SIZES.font,
    marginTop: 4,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  description: {
    marginTop: 6,
    fontSize: SIZES.font,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 12,
  },
});

export default SingleDebtCard;