import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import { SIZES, COLORS } from '../../constants/theme';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const typeColors = {
  ingreso: COLORS.secondary,
  gasto: COLORS.danger,
  ahorro: COLORS.primary,
};

const SingleTransactionCard = ({
  amount,
  type = 'gasto',
  budget,
  date, 
  icon,
  color,
  notes,
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
        {type.toLowerCase === 'gasto' ? '-' : '+'}${amount.toLocaleString('es-CO')}
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
        {notes || 'Sin descripción'}
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
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    margin: 20,
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 4,
  },
  amount: {
    fontSize: SIZES.font *2,
    fontWeight: 'bold',
  },
  label: {
    fontSize: SIZES.font * 1.2,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: SIZES.font,
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
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default SingleTransactionCard;
