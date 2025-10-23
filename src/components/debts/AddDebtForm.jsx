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
import TransactionTypeDropdown from '../transactions/TransactionTypeDropdown';

import { COLORS, SIZES } from '../../constants/theme';

const debtTypes = ['credit card', 'free investment', 'vehicle', 'mortgage loan', 'estudies', 'other'];

const AddDebtForm = ({ onCancel, onSubmit, toEdit }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    total: '',
    notes: '',
    date: new Date(),
    type: debtTypes[0],
    apr: '',
    fees: '',
  });

  useEffect(() => {
    if (toEdit) {
      setFormData({
        name: toEdit.name || '',
        total: toEdit.total?.toString() || '',
        notes: toEdit.notes || '',
        date: toEdit.date ? new Date(toEdit.date) : new Date(),
        type: toEdit.type || debtTypes[0],
        apr: toEdit.apr?.toString() || '',
        fees: toEdit.fees?.toString() || '',
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
    const numericValue = parseInt(text.replace(/\D/g, ''));
    if (!isNaN(numericValue)) {
      handleInputChange('total', numericValue);
    } else {
      handleInputChange('total', 0);
    }
  };

  const handleAddDebt = async () => {
    if (!formData.name || !formData.total) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const { name, total, date, notes, type, apr, fees } = formData;

    const debtData = {
      name,
      total: parseFloat(total),
      date: date.toISOString(),
      notes,
      type,
      apr: parseFloat(apr),
      fees: parseInt(fees),
    };

    onSubmit(debtData);
  }

  return (
    <View style={styles.container}>
      
       <Text style={styles.label}>Tipo de Deuda</Text>
      <TransactionTypeDropdown
        options={debtTypes}
        selected={formData.type}
        onPress={(value) => handleInputChange('type', value)}
      />
      
      <Text style={styles.label}>Añadir Deuda</Text>
      <TextInput
        placeholder="Nombre de la deuda"
        value={formData.name}
        onChangeText={(value) => handleInputChange('name', value)}
        style={styles.input}
      />

      <Text style={styles.label}>Monto</Text>
      <TextInput
        placeholder="$ 1.000.000"
        value={formatCurrency(formData.total)}
        onChangeText={(value) => handleCurrencyInput(value)}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Interes (%E.A.)</Text>
      <TextInput
        placeholder="%"
        value={formData.apr}
        onChangeText={(value) => handleInputChange('apr', value)}
        keyboardType="numeric"
        style={styles.input}
      />

      {
        formData.type !== 'credit card' ? (
          <>
            <Text style={styles.label}>Cuotas</Text>
            <TextInput
              placeholder="e.g., 12"
              value={formData.fees}
              onChangeText={(value) => handleInputChange('fees', value)}
              keyboardType="numeric"
              style={styles.input}
            />
          
          </>
        ):(
          
          <View style={[styles.row, { marginTop: 14, marginBottom: 8 }]}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <MaterialIcons name="calendar-month" size={24} color="#5f5a67" />
            </TouchableOpacity>
            <Text style={{ marginLeft: 8, color: COLORS.textSecondary }}>
              Fecha de corte: {formData.date.toLocaleDateString('es-CO')}
            </Text>
          </View>
          
        )
      }


      <View style={[styles.row, { marginTop: 14, marginBottom: 8 }]}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <MaterialIcons name="calendar-month" size={24} color="#5f5a67" />
        </TouchableOpacity>
        <Text style={{ marginLeft: 8, color: COLORS.textSecondary }}>
          Fecha de facturación: {formData.date.toLocaleDateString('es-CO')}
        </Text>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) handleInputChange('date', selectedDate);
          }}
        />
      )}

      <TextInput
        placeholder="Notas..."
        value={formData.notes}
        onChangeText={(value) => handleInputChange('notes', value)}
        multiline
        style={styles.notesInput}
      />

      <View style={styles.buttonRow}>
        <PrimaryButton title={toEdit ? 'Actualizar' : 'Añadir'} onPress={() => handleAddDebt()} />
        <SecondaryButton title="Cancelar" onPress={onCancel} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding * 2,
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

export default AddDebtForm;