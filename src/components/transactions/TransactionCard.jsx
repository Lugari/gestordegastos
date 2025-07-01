import { View, Text, StyleSheet, Image } from 'react-native';

import { SIZES, COLORS } from '../../constants/theme';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';



const typeColors = {
  ingreso: COLORS.secondary,
  gasto: COLORS.danger,
  ahorro: COLORS.primary,
};

const TransactionCard = ({ name, date, amount, type = 'gasto', icon, color}) => {



  return (
    <View style={styles.card}>
      {/* Placeholder for image or icon */}
      <View style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', backgroundColor: color, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
      <MaterialIcons
        name={icon}
        size={48}
        color="#000"
      />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.topRow}>
          <Text style={styles.budgetText}>{name}</Text>
        <Text style={styles.subInfoText}>{type.toUpperCase()} • {date}</Text>
        </View>
      </View>
      <Text style={[styles.amountText, { color: typeColors[type.toLowerCase()] ?? '#000' }]}>{type.toLowerCase() === 'gasto' ? '-' : '+'}${amount.toLocaleString('es-CO')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.8,
    alignItems: 'center',
    justifyContent: 'space-between',    marginVertical: 6,
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: SIZES.radius,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  topRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  budgetText: {
    fontSize: SIZES.font * 1.2,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  subInfoText: {
    marginTop: 4,
    fontSize: SIZES.font * 0.9,
    color: COLORS.textSecondary,
  },
  amountText: {
    fontSize: SIZES.font * 1.3,
    fontWeight: '600',
  },
});

export default TransactionCard;
