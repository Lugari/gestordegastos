import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';

import { HeroAmount, Field, TextField, NoteField, AppearanceField, FormActions, formStyles } from '../buckets/BucketFormKit';
import { money } from '../../utils/formatMoney';
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

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const formatCurrency = (value) => {
    const number = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value;
    if (isNaN(number)) return '';
    return money(number);
  };

  const handleCurrencyInput = (text) => {
    const numericValue = parseInt(text.replace(/\D/g, ''));
    handleInputChange('total', isNaN(numericValue) ? 0 : numericValue);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.total) {
      Alert.alert('Campos requeridos', 'Ingresa el nombre y el monto objetivo de la inversión.');
      return;
    }
    const totalAmount = parseFloat(formData.total);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto objetivo válido.');
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
    <View style={formStyles.container}>
      <HeroAmount
        label="Monto objetivo"
        value={formatCurrency(formData.total)}
        onChangeText={handleCurrencyInput}
        placeholder={money(0)}
      />

      <Field label="Nombre">
        <TextField placeholder="Acciones, Fondo indexado, CDT..." value={formData.name} onChangeText={(v) => handleInputChange('name', v)} />
      </Field>

      <Field label="Rentabilidad esperada (% anual)">
        <TextField placeholder="Ej: 8" keyboardType="numeric" value={formData.roi} onChangeText={(v) => handleInputChange('roi', v.replace(/[^0-9.]/g, ''))} />
      </Field>

      <Field label="Apariencia">
        <AppearanceField
          colors={colorOptions}
          color={formData.color}
          onColor={(c) => handleInputChange('color', c)}
          icon={formData.icon}
          iconList={INVESTMENT_ICONS}
          onIcon={(name) => handleInputChange('icon', name)}
        />
      </Field>

      <Field label="Nota (opcional)">
        <NoteField placeholder="Describe tu inversión..." value={formData.notes} onChangeText={(v) => handleInputChange('notes', v)} />
      </Field>

      <FormActions submitLabel={toEdit ? 'Actualizar' : 'Guardar'} onSubmit={handleSubmit} onCancel={onCancel} />
    </View>
  );
};

export default AddInvestmentForm;
