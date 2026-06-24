import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import BudgetProgressCard from '../budgets/BudgetProgressCard';

import { COLORS, SIZES } from '../../constants/theme';

const SingleInvestmentCard = ({ investment, onEdit, onDelete }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const remaining = (investment.total || 0) - (investment.used || 0);
  const estimatedReturn = Math.round(((investment.used || 0) * (investment.roi || 0)) / 100);

  return (
    <View style={styles.card}>
      <BudgetProgressCard
        title={investment.name}
        used={investment.used}
        total={investment.total}
        color={investment.color}
      />

      <View style={styles.row}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RENTABILIDAD</Text>
          <Text style={styles.sectionValue}>{investment.roi || 0}% anual</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RETORNO EST. / AÑO</Text>
          <Text style={styles.sectionValue}>${estimatedReturn.toLocaleString('es-CO')}</Text>
        </View>
      </View>

      <Text style={styles.section}>
        Te faltan{' '}
        <Text style={{ fontSize: SIZES.font * 1.2, fontWeight: 'bold' }}>
          ${remaining.toLocaleString('es-CO')}
        </Text>{' '}
        para alcanzar tu meta de inversión.
      </Text>

      <View style={styles.row}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INICIO</Text>
          <View style={styles.iconRow}>
            <MaterialIcons name="calendar-month" size={18} color="#000" />
            <Text style={styles.sectionValue}>{formatDate(investment.created_at)}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ÚLTIMA ACTUALIZACIÓN</Text>
          <View style={styles.iconRow}>
            <MaterialIcons name="calendar-month" size={18} color="#000" />
            <Text style={styles.sectionValue}>{formatDate(investment.updated_at)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DESCRIPCIÓN</Text>
        <Text style={styles.description}>{investment.notes || 'Sin descripción'}</Text>
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
  section: {
    marginTop: 20,
    fontSize: SIZES.font,
  },
  sectionTitle: {
    color: '#888A3E',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionValue: {
    fontSize: SIZES.font,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
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

export default SingleInvestmentCard;
