import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';

import { useBudgets } from '../../hooks/useBudgets';



const periodOptions = ['Diario', 'Semanal', 'Mensual'];
const colorOptions = ['#b1c3cb', '#f2f1b6', '#b3e6b3', '#edbcbc'];
const iconOptions = ['home', 'receipt', 'shopping-cart'];

const AddBudgetForm = ({ onAdd, onCancel }) => {

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    total: '',
    used: 0,
    selectedColor: colorOptions[0],
    selectedIcon: iconOptions[0],
    period: periodOptions[2], // mensual por defecto
    date: new Date(),
    notes: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  

  const handleAddBudget = () => {
    if (!formData.name || !formData.total) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const { name, total, used, selectedColor, selectedIcon, period, date, notes } = formData;
    const budgetData = {
      name,
      total: parseFloat(total),
      used: parseFloat(used),
      selectedColor,
      selectedIcon,
      period,
      date: date.toISOString(),
      notes,
    };


    onAdd(budgetData);
    
  }

  return (
    <View style={styles.container}>
    
      {/* NOMBRE */}
      <TextInput
        placeholder="Nombre"
        value={formData.name}
        onChangeText={(value)=>handleInputChange('name',value)}
        style={styles.input}
      />

      {/* MONTO */}
      <TextInput
        placeholder="Monto"
        value={formData.total.toString()}
        onChangeText={(value)=>handleInputChange('total',value)}
        keyboardType="numeric"
        style={styles.input}
      />

      {/* SELECCIÓN DE COLOR */}
      <View style={styles.subSection}>
        <Text style={styles.label}>Color:</Text>
        <View style={styles.row}>
          {colorOptions.map((color, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.colorCircle,
                { backgroundColor: color, borderWidth: formData.selectedColor === color ? 2 : 0 },
              ]}
              onPress={() => handleInputChange('selectedColor', color)}
            />
          ))}
        </View>
      </View>

      {/* SELECCIÓN DE ÍCONO */}
      <View style={styles.subSection}>
        <Text style={styles.label}>Icono:</Text>
        <View style={styles.row}>
          {iconOptions.map((icon, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleInputChange('selectedIcon', icon)}
              style={[
                styles.iconButton,
                formData.selectedIcon === icon && styles.iconSelected,
              ]}
            >
              <MaterialIcons name={icon} size={24} color="#333" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* PERÍODO */}
      <View style={styles.subSection}>
        <Text style={styles.label}>Período:</Text>
        <View style={styles.row}>
          {periodOptions.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => handleInputChange('period', option)}
              style={[
                styles.periodButton,
                formData.period === option && styles.periodSelected,
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  formData.period === option && styles.periodTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* FECHA */}
      <View style={[styles.row, { marginTop: 14, marginBottom: 8 }]}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <MaterialIcons name="calendar-month" size={24} color="#5f5a67" />
        </TouchableOpacity>
        <Text style={{ marginLeft: 8, color: '#333' }}>
          Fecha de inicio: {formData.date.toLocaleDateString('es-CO')}
        </Text>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* NOTAS */}
      <TextInput
        placeholder="Notas..."
        value={formData.notes}
        onChangeText={(value)=>handleInputChange('notes',value)}
        multiline
        style={styles.notesInput}
      />

      {/* BOTONES */}
      <View style={styles.buttonRow}>
        <PrimaryButton title="Añadir" onPress={() => handleAddBudget()} />
        <SecondaryButton title="Cancelar" onPress={onCancel} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cdd1c5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  subSection: {
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#5a5a5a',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  iconSelected: {
    backgroundColor: '#d0e6ff',
  },
  periodButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  periodSelected: {
    backgroundColor: '#b1c3cb',
  },
  periodText: {
    color: '#333',
  },
  periodTextSelected: {
    fontWeight: 'bold',
    color: '#fff',
  },
  notesInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#cdd1c5',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
    marginTop: 10,
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
});

export default AddBudgetForm;
