import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import IconPicker from '../IconPicker';
import { SIZES, COLORS } from '../../constants/theme';
import { INVESTMENT_ICONS } from '../../constants/icons';

const colorOptions = ['#A77DDB', '#F9DC5C', '#F38BA0', '#b1c3cb', '#b3e6b3', '#edbcbc'];

const AddInvestmentForm = ({ onSubmit, onCancel, toEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    total: '',
    roi: '',
    icon: INVESTMENT_ICONS[0],
    color: colorOptions[0],
    notes: '',
  });

  useEffect(() => {
    if (toEdit) {
      setFormData({
        name: toEdit.name || '',
        total: toEdit.total || '',
        roi: toEdit.roi?.toString() || '',
        icon: toEdit.icon || INVESTMENT_ICONS[0],
        color: toEdit.color || colorOptions[0],
        notes: toEdit.notes || '',
      });
    }
  }, [toEdit]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    handleInputChange('total', isNaN(numericValue) ? 0 : numericValue);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.total) {
      Alert.alert('Campos Requeridos', 'Ingresa el nombre y el monto objetivo de la inversión.');
      return;
    }
    const totalAmount = parseFloat(formData.total);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      Alert.alert('Monto Inválido', 'Ingresa un monto objetivo válido.');
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      total: totalAmount,
      used: toEdit?.used ?? 0,
      roi: parseFloat(formData.roi) || 0,
      icon: formData.icon,
      color: formData.color,
      notes: formData.notes.trim(),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre de la Inversión</Text>
      <TextInput
        placeholder="Ej: Acciones, Fondo indexado, CDT..."
        value={formData.name}
        onChangeText={(value) => handleInputChange('name', value)}
        style={styles.input}
        placeholderTextColor="#B5B77E"
      />

      <Text style={styles.label}>Monto objetivo</Text>
      <TextInput
        placeholder="Ej: $5'000.000"
        value={formatCurrency(formData.total)}
        onChangeText={(value) => handleCurrencyInput(value)}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor="#B5B77E"
      />

      <Text style={styles.label}>Rentabilidad esperada (% anual)</Text>
      <TextInput
        placeholder="Ej: 8"
        value={formData.roi}
        onChangeText={(value) => handleInputChange('roi', value.replace(/[^0-9.]/g, ''))}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor="#B5B77E"
      />

      <Text style={styles.label}>Color</Text>
      <View style={styles.optionsRow}>
        {colorOptions.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => handleInputChange('color', color)}
            style={[styles.colorCircle, { backgroundColor: color }, formData.color === color && styles.optionSelected]}
          />
        ))}
      </View>

      <View style={styles.subSection}>
        <Text style={styles.label}>Icono:</Text>
        <IconPicker title="Seleccionar Icono" iconList={INVESTMENT_ICONS} onSelect={(name) => handleInputChange('icon', name)} />
      </View>

      <Text style={styles.label}>Notas (Opcional)</Text>
      <TextInput
        placeholder="Describe tu inversión..."
        value={formData.notes}
        onChangeText={(value) => handleInputChange('notes', value)}
        multiline
        numberOfLines={4}
        style={[styles.input, styles.notesInput]}
        placeholderTextColor="#B5B77E"
      />

      <View style={styles.buttonRow}>
        <PrimaryButton title={toEdit ? 'Actualizar' : 'Añadir Inversión'} onPress={handleSubmit} />
        <SecondaryButton title="Cancelar" onPress={onCancel} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  label: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.neutral,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: COLORS.secondary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    gap: 12,
  },
});

export default AddInvestmentForm;
