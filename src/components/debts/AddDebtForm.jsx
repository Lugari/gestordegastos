import React, { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { HeroAmount, Field, TextField, NoteField, ChipWrap, DateField, FormActions, formStyles } from '../buckets/BucketFormKit';
import { money } from '../../utils/formatMoney';

const DEBT_TYPES = [
  { value: 'credit card', label: 'Tarjeta' },
  { value: 'free investment', label: 'Libre inversión' },
  { value: 'vehicle', label: 'Vehículo' },
  { value: 'mortgage loan', label: 'Hipoteca' },
  { value: 'estudies', label: 'Estudios' },
  { value: 'other', label: 'Otra' },
];

const AddDebtForm = ({ onCancel, onSubmit, toEdit }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    total: '',
    notes: '',
    date: new Date(),
    type: DEBT_TYPES[0].value,
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
        type: toEdit.type || DEBT_TYPES[0].value,
        apr: toEdit.apr?.toString() || '',
        fees: toEdit.fees?.toString() || '',
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

  const handleAddDebt = () => {
    if (!formData.name || !formData.total) {
      alert('Por favor, completa el nombre y el monto.');
      return;
    }
    const { name, total, date, notes, type, apr, fees } = formData;
    onSubmit({
      name,
      total: parseFloat(total),
      date: date.toISOString(),
      notes,
      type,
      apr: parseFloat(apr) || 0,
      fees: parseInt(fees) || 0,
    });
  };

  const isCreditCard = formData.type === 'credit card';

  return (
    <View style={formStyles.container}>
      <HeroAmount
        label="Monto de la deuda"
        value={formatCurrency(formData.total)}
        onChangeText={handleCurrencyInput}
        placeholder={money(0)}
      />

      <Field label="Tipo de deuda">
        <ChipWrap options={DEBT_TYPES} value={formData.type} onChange={(v) => handleInputChange('type', v)} />
      </Field>

      <Field label="Nombre">
        <TextField placeholder="Nombre de la deuda" value={formData.name} onChangeText={(v) => handleInputChange('name', v)} />
      </Field>

      <Field label="Interés (% E.A.)">
        <TextField placeholder="%" keyboardType="numeric" value={formData.apr} onChangeText={(v) => handleInputChange('apr', v)} />
      </Field>

      {!isCreditCard && (
        <Field label="Cuotas">
          <TextField placeholder="Ej: 12" keyboardType="numeric" value={formData.fees} onChangeText={(v) => handleInputChange('fees', v)} />
        </Field>
      )}

      <Field label={isCreditCard ? 'Fecha de facturación' : 'Fecha de inicio'}>
        <DateField date={formData.date} onPress={() => setShowDatePicker(true)} />
      </Field>

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

      <Field label="Nota (opcional)">
        <NoteField placeholder="Notas..." value={formData.notes} onChangeText={(v) => handleInputChange('notes', v)} />
      </Field>

      <FormActions submitLabel={toEdit ? 'Actualizar' : 'Guardar'} onSubmit={handleAddDebt} onCancel={onCancel} />
    </View>
  );
};

export default AddDebtForm;
