import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
      <View style={styles.header}>
        <Text style={styles.title}>{saving.name}</Text>
        <MaterialIcons title={saving.selectedIcon}></MaterialIcons>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(percentage, 1) * 100}%`,
                backgroundColor: saving.selectedColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.percentage, { color:saving.selectedColor }]}>{`${Math.round(percentage * 100)}%`}</Text>
      </View>

      {/* Amount */}
      <Text style={[styles.amount, { color: saving.selectedCcolor }]}>
        ${saving.used.toLocaleString('es-CO')} <Text style={styles.total}> / ${saving.total.toLocaleString('es-CO')}</Text>
      </Text>

      {/* Info Sections */}

      <View style={styles.section}>
        <Text style={[styles.title, {marginTop:24}]}>Ahorro minimo</Text>
        <Text style={styles.amount}>Diario: ${calculateScheduledSaving('daily').toLocaleString('es-CO')}</Text>
        <Text style={styles.amount}>Semanal: ${calculateScheduledSaving('weekly').toLocaleString('es-CO')} </Text>
        <Text style={styles.amount}>Mensual: ${calculateScheduledSaving('monthly').toLocaleString('es-CO')}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FECHA DE INICIO</Text>
          <View style={styles.iconRow}>
            <MaterialIcons name="calendar-month" size={18} color="#000" />
            <Text style={styles.sectionValue}>{formatDate(saving.created_at)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PLAZO MAXIMO</Text>
          <View style={styles.iconRow}>
            <MaterialIcons name="calendar-month" size={18} color="#000" />
            <Text style={styles.sectionValue}>{formatDate(saving.deadline)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ULTIMA ACTUALIZACIÓN</Text>
          <View style={styles.iconRow}>
            <MaterialIcons name="calendar-month" size={18} color="#000" />
            <Text style={styles.sectionValue}>{formatDate(saving.updated_at)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DESCRIPCIÓN</Text>
        <Text style={styles.description}>{saving.notes}</Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Text style={styles.editText}>EDITAR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteText}>ELIMINAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    elevation: 3,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C3CDD4',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  progressBarContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E4E4E4',
    borderRadius: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  percentage: {
    fontWeight: 'bold',
  },
  amount: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  total: {
    color: '#6c6c6c',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: '#888A3E',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionValue: {
    fontSize: 14,
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
    fontSize: 13,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#ADC4CD',
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  editText: {
    fontWeight: 'bold',
    color: '#000',
  },
  deleteButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ADC4CD',
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  deleteText: {
    fontWeight: 'bold',
    color: '#000',
  },
});

export default SingleSavingCard;
