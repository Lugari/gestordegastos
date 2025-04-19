import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const typeColors = {
  ingreso: '#196819',
  gasto: '#D76A61',
  ahorro: '#90afbb',
};

const SingleTransactionCard = ({
  amount,
  type = 'GASTO',
  budget,
  date, 
  icon,
  color,
  note,
  onEdit,
  onDelete,
}) => {

  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });


  return (
    <View style={styles.card}>
      <Text style={[styles.amount, {  color: typeColors[type] }]}>
        {type.toLowerCase === 'ingreso' ? '+' : '-'}${amount.toLocaleString('es-CO')}
      </Text>

      <Text style={[styles.label, { color: typeColors[type] }]}>
        {type.toUpperCase()}
      </Text>

      {/* CATEGORÍA */}
      <Text style={styles.sectionLabel}>CATEGORIA</Text>
      <View style={styles.row}>
        <MaterialIcons
          name={icon}
          size={24}
          color={color}
          style={styles.icon}
        />
        <Text style={styles.rowText}>{budget}</Text>
      </View>

      {/* FECHA */}
      <Text style={styles.sectionLabel}>FECHA</Text>
      <View style={styles.row}>
        <MaterialIcons
                    name="calendar-month"
                    size={18}
                    color="#5f7067"
                    style={styles.icon}
                  />
        <Text style={styles.rowText}>{formattedDate}</Text>
      </View>

      {/* DESCRIPCIÓN */}
      <Text style={styles.sectionLabel}>DESCRIPCION</Text>
      <Text style={styles.descriptionText}>
        {note || 'Sin descripción'}
      </Text>

      {/* BUTTONS */}
      <View style={styles.buttonRow}>
        <PrimaryButton title="Editar" onPress={onEdit} />
        <SecondaryButton title="Eliminar" onPress={onDelete} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#7A7D62',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 14,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  rowText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default SingleTransactionCard;
