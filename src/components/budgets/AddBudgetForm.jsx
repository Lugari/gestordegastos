import React, { useState, useEffect } from 'react';
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

import { COLORS, SIZES } from '../../constants/theme';
import { BUDGET_ICONS } from '../../constants/icons';

import IconPicker from "react-native-icon-picker";

import { useNavigation } from '@react-navigation/native';


const periodOptions = ['Diario', 'Semanal', 'Mensual'];
const colorOptions = ['#b1c3cb', '#b3e6b3', '#edbcbc', '#d5cde0', '#ffe9b6', '#b6efd2'];


const AddBudgetForm = ({onCancel, onSubmit, toEdit}) => {

  const navigation = useNavigation()

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);  


  const [formData, setFormData] = useState({
    name: '',
    total: '',
    used: 0,
    color: colorOptions[0],
    icon: 'wallet', 
    period: periodOptions[2], // mensual por defecto
    date: new Date(),
    notes: '',
  });

  useEffect(() => {
    if (toEdit) {
      setFormData({
        name: toEdit.name || '',
        total: toEdit.total?.toString() || '',
        used: toEdit.used || 0,
        color: toEdit.color || colorOptions[0],
        icon: toEdit.icon || 'wallet',
        period: toEdit.period || periodOptions[2],
        date: toEdit.date ? new Date(toEdit.date) : new Date(),
        notes: toEdit.notes || '',
      });
    }
  }, [toEdit]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value) => {
  const number = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value;
  if (isNaN(number)) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(number);
};

const handleCurrencyInput = (text) => {
  const numericValue = parseInt(text.replace(/\D/g, '')); // Remove non-numeric
  if (!isNaN(numericValue)) {
    handleInputChange('total', numericValue); // Save the clean value
  } else {
    handleInputChange('total', 0);
  }
};
  

  const handleAddBudget = async () => {
    if (!formData.name || !formData.total) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const { name, total, used, color, icon, period, date, notes } = formData;
    
    const budgetData = {
      name,
      total: parseFloat(total),
      used: parseFloat(used),
      color,
      icon,
      period,
      date: date.toISOString(),
      notes,
    };
    
    onSubmit(budgetData);
    
  }
  
  const onIconPress = (icon) => {
    handleInputChange('icon', icon.icon)
    setShowIconPicker(false)
  }

  return (
    <View style={styles.container}>
    
      {/* NOMBRE */}
      <Text style={styles.label}>Añadir Presupuesto</Text>
      <TextInput
        placeholder="Arriendo, Alimentación, etc."
        value={formData.name}
        onChangeText={(value)=>handleInputChange('name',value)}
        style={styles.input}
      />

      {/* MONTO */}
      <Text style={styles.label}>Monto</Text>
      <TextInput
        placeholder="$ 1.000.000"
        value={formatCurrency(formData.total)}
        onChangeText={(value)=>handleCurrencyInput(value)}
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
                { backgroundColor: color, borderWidth: formData.color === color ? 2 : 0 },
              ]}
              onPress={() => handleInputChange('color', color)}
            />
          ))}
        </View>
      </View>

      {/* SELECCIÓN DE ÍCONO */}

      <View style={styles.subSection}>
        <Text style={styles.label}>Icono:</Text>
        <IconPicker
          headerTitle="Seleccionar Icono"
          showIconPicker={showIconPicker}
          toggleIconPicker={() => setShowIconPicker(!showIconPicker)}
          iconDetails={[
            {
              family: "MaterialIcons",
              icons: BUDGET_ICONS
            },
          ]}
          content={<Text><SecondaryButton title="Seleccionar Icono" onPress={() => setShowIconPicker(true)} /></Text>}
          onSelect={onIconPress}
        />
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
        <Text style={{ marginLeft: 8, color: COLORS.textSecondary }}>
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
        <PrimaryButton title={toEdit? 'Actualizar' : 'Añadir'} onPress={() => handleAddBudget()} />
        <SecondaryButton title="Cancelar" onPress={onCancel} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding *2,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    margin: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    }
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.neutral,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  subSection: {
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: COLORS.textSecondary,
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
  periodButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.background,
    borderColor: COLORS.neutral,
    borderWidth: 1,
    borderRadius: 6,
  },
  periodSelected: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    color: COLORS.textPrimary,
  },
  periodTextSelected: {
    fontWeight: 'bold',
  },
  notesInput: {
    height: 80,
    borderWidth: 1,
    borderColor: COLORS.neutral,
    borderRadius: SIZES.radius,
    padding: 10,
    backgroundColor: COLORS.background,
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
