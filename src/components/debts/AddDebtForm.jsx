import React, { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';

import { notify } from '../../utils/notify';

import DateTimePicker from '@react-native-community/datetimepicker';

import { HeroAmount, Field, TextField, NoteField, ChipWrap, DateField, CheckRow, FormActions, formStyles } from '../buckets/BucketFormKit';
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
    // tarjeta de crédito
    interest_enabled: true,
    interest_rate: '',
    handling_fee: '',
    cut_day: '',
    due_day: '',
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
        interest_enabled: toEdit.interest_enabled !== false,
        interest_rate: toEdit.interest_rate?.toString() || '',
        handling_fee: toEdit.handling_fee?.toString() || '',
        cut_day: toEdit.cut_day?.toString() || '',
        due_day: toEdit.due_day?.toString() || '',
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
      notify('Campos requeridos', 'Completa el nombre y el monto.');
      return;
    }
    const { name, total, date, notes, type, apr, fees } = formData;
    const isCC = type === 'credit card';
    if (isCC && (!formData.cut_day || !formData.due_day)) {
      notify('Fechas de la tarjeta', 'Ingresa el día de corte y el día límite de pago.');
      return;
    }
    onSubmit({
      name,
      total: parseFloat(total),
      date: date.toISOString(),
      notes,
      type,
      apr: parseFloat(apr) || 0,
      fees: parseInt(fees) || 0,
      ...(isCC && {
        interest_enabled: !!formData.interest_enabled,
        interest_rate: parseFloat(formData.interest_rate) || 0,
        handling_fee: parseFloat(formData.handling_fee) || 0,
        cut_day: Math.min(31, Math.max(1, parseInt(formData.cut_day, 10) || 1)),
        due_day: Math.min(31, Math.max(1, parseInt(formData.due_day, 10) || 1)),
      }),
    });
  };

  const isCreditCard = formData.type === 'credit card';

  return (
    <View style={formStyles.container}>
      <HeroAmount
        label={isCreditCard ? 'Cupo de la tarjeta' : 'Monto de la deuda'}
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

      {!isCreditCard && (
        <>
          <Field label="Interés (% E.A.)">
            <TextField placeholder="%" keyboardType="numeric" value={formData.apr} onChangeText={(v) => handleInputChange('apr', v)} />
          </Field>
          <Field label="Cuotas">
            <TextField placeholder="Ej: 12" keyboardType="numeric" value={formData.fees} onChangeText={(v) => handleInputChange('fees', v)} />
          </Field>
          <Field label="Fecha de inicio">
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
        </>
      )}

      {isCreditCard && (
        <>
          <Field label="Intereses">
            <CheckRow
              checked={!!formData.interest_enabled}
              label="Las compras a cuotas generan interés"
              onPress={() => handleInputChange('interest_enabled', !formData.interest_enabled)}
            />
            {formData.interest_enabled && (
              <TextField
                placeholder="Tasa mensual % (ej: 2.1)"
                keyboardType="numeric"
                value={formData.interest_rate}
                onChangeText={(v) => handleInputChange('interest_rate', v.replace(/[^0-9.]/g, ''))}
              />
            )}
          </Field>

          <Field label="Cuota de manejo (mensual)">
            <TextField placeholder="0" keyboardType="numeric" value={formData.handling_fee} onChangeText={(v) => handleInputChange('handling_fee', v.replace(/[^0-9.]/g, ''))} />
          </Field>

          <Field label="Día de corte (1-31)">
            <TextField placeholder="Ej: 15" keyboardType="number-pad" maxLength={2} value={formData.cut_day} onChangeText={(v) => handleInputChange('cut_day', v.replace(/\D/g, ''))} />
          </Field>

          <Field label="Día límite de pago (1-31)">
            <TextField placeholder="Ej: 30" keyboardType="number-pad" maxLength={2} value={formData.due_day} onChangeText={(v) => handleInputChange('due_day', v.replace(/\D/g, ''))} />
          </Field>
        </>
      )}

      <Field label="Nota (opcional)">
        <NoteField placeholder="Notas..." value={formData.notes} onChangeText={(v) => handleInputChange('notes', v)} />
      </Field>

      <FormActions submitLabel={toEdit ? 'Actualizar' : 'Guardar'} onSubmit={handleAddDebt} onCancel={onCancel} />
    </View>
  );
};

export default AddDebtForm;
