import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import BudgetProgressCard from '../budgets/BudgetProgressCard';


import {COLORS, SIZES} from '../../constants/theme'

const SingleSavingCard = ({
  saving,
  onEdit,
  onDelete
}) => {
    
    const percentage = saving.used / saving.total;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };



    const calculateScheduledSaving = (time) => { // Calcula el ahorro necesario diario, semanal o mensual
      const now = new Date();
      const deadline = new Date(saving.deadline)
      const timeDiff = deadline - now;
      const daysLeft =timeDiff/(1000*60*60*24);
      const weeksLeft = timeDiff / (1000*60*60*24*7)
      const monthsLeft = timeDiff / (1000*60*60*24*30);

      if (time === 'daily') {
        return Math.ceil((saving.total - saving.used) / daysLeft);
      }else if (time === 'weekly') {
        return Math.ceil((saving.total - saving.used) / weeksLeft);
      }else if (time === 'monthly') {
        return Math.ceil((saving.total - saving.used) / monthsLeft);
      }
    }

  return (
    <View style={styles.card}>
      {/* Avatar + Title */}
      

      {/* Progress bar */}
      <BudgetProgressCard
        title={saving.name}
        used={saving.used}
        total={saving.total}
        color={saving.color}
      />

      {/* Info Sections */}

      <View style={styles.section}>
        
        <Text style={styles.sectionTitle}>AHORRO MINIMO</Text>
        
          <View style={styles.row}>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Diario: </Text>
              <View style={styles.iconRow}>
                <Text style={[styles.sectionValue, {fontSize: SIZES.font * 1.3,fontWeight: '600'}]}>${calculateScheduledSaving('daily').toLocaleString('es-CO')}</Text>  
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Semanal</Text>
              <View style={styles.iconRow}>
                <Text style={[styles.sectionValue, {fontSize: SIZES.font * 1.3,fontWeight: '600'}]}> ${calculateScheduledSaving('weekly').toLocaleString('es-CO')} </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mensual: </Text>
              <View style={styles.iconRow}>
            <Text style={[styles.sectionValue, {fontSize: SIZES.font * 1.3,fontWeight: '600'}]}>${calculateScheduledSaving('monthly').toLocaleString('es-CO')}</Text>
              </View>
            </View>

          </View>
      </View>

      <Text style={styles.section}>Te faltan <Text style={{fontSize: SIZES.font *1.2,fontWeight: 'bold'}}>${(saving.total-saving.used).toLocaleString('es-CO')}</Text> para cumplir tu meta de ahorro!</Text>

      <View style={styles.row}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INICIO</Text>
          <View style={styles.iconRow}>
            <MaterialIcons name="calendar-month" size={18} color="#000" />
            <Text style={styles.sectionValue}>{formatDate(saving.created_at)}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ULTIMA ACTUALIZACIÓN</Text>
          <View style={styles.iconRow}>
            <MaterialIcons name="calendar-month" size={18} color="#000" />
            <Text style={styles.sectionValue}>{formatDate(saving.updated_at)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PLAZO MAXIMO</Text>
          <View style={styles.iconRow}>
            <MaterialIcons name="calendar-month" size={18} color="#000" />
            <Text style={styles.sectionValue}>{formatDate(saving.deadline)}</Text>
          </View>
        </View>

      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DESCRIPCIÓN</Text>
        <Text style={styles.description}>{saving.notes}</Text>
      </View>

      {/* Buttons */}

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
 
  percentage: {
    fontWeight: 'bold',
  },
  amount: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: SIZES.font,
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

export default SingleSavingCard;
