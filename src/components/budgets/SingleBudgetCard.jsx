import { View, Text, StyleSheet, Image } from 'react-native';

import BudgetProgressCard from './BudgetProgressCard';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import {SIZES, COLORS} from '../../constants/theme';

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
      <BudgetProgressCard
        title={name}
        used={used}
        total={total}
        color={color}
      />

      {
        used > total && (
          <View style={{ marginTop: 10, alignItems: 'center' }}>
            <MaterialIcons name="report-problem" size={24} color={COLORS.danger} />
            <Text style={{ color: COLORS.danger, fontSize: SIZES.font }}>
              ¡Presupuesto excedido!
            </Text>
          </View>
        )
      }

      <Text style={styles.sectionTitle}>PERIODO</Text>
      <Text style={styles.sectionValue}>{period}</Text>

      <Text style={styles.sectionTitle}>FECHA DE INICIO</Text>
      <View style={styles.row}>
        <MaterialIcons name="calendar-month" size={20} color="#000" />
        <Text style={styles.sectionValue}>{new Date(date).toLocaleDateString('es-CO')}</Text>
      </View>

      <Text style={styles.sectionTitle}>ULTIMA ACTUALIZACIÓN</Text>
      <View style={styles.row}>
        <MaterialIcons name="calendar-month" size={20} color="#000" />
        <Text style={styles.sectionValue}>{new Date(lastUpdate).toLocaleDateString('es-CO')}</Text>
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
    padding: SIZES.padding * 1.5,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    margin: 20,
    elevation: 3,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    fontSize: SIZES.font ,
    marginTop: 16,
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: SIZES.font *1.1,
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  description: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
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