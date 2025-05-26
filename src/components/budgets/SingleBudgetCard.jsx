import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import BudgetProgressCard from './BudgetProgressCard';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SingleBudgetCard = ({
  name,
  used,
  total,
  color,
  period,
  date,
  lastUpdate,
  notes,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={styles.container}>
      {/* Reemplaza título y círculo por BudgetProgressCard */}
      <BudgetProgressCard
        title={name}
        used={used}
        total={total}
        color={color}
      />

      <Text style={styles.sectionTitle}>PERIODO</Text>
      <Text style={styles.sectionValue}>{period}</Text>

      <Text style={styles.sectionTitle}>FECHA DE INICIO</Text>
      <View style={styles.row}>
        <MaterialIcons name="calendar-month" size={20} color="#000" />
        <Text style={styles.sectionValue}>{date}</Text>
      </View>

      <Text style={styles.sectionTitle}>ULTIMA ACTUALIZACIÓN</Text>
      <View style={styles.row}>
        <MaterialIcons name="calendar-month" size={20} color="#000" />
        <Text style={styles.sectionValue}>{lastUpdate}</Text>
      </View>

      <Text style={styles.sectionTitle}>DESCRIPCION</Text>
      <Text style={styles.description}>{notes}</Text>

      <View style={styles.buttonRow}>
        <PrimaryButton title="Editar" onPress={onEdit} />
        <SecondaryButton title="Eliminar" onPress={onDelete} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    elevation: 3,
  },
  sectionTitle: {
    color: '#7a7d62',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 16,
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 14,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  description: {
    fontSize: 14,
    color: '#000',
    marginTop: 6,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 12,
  },
});

export default SingleBudgetCard;