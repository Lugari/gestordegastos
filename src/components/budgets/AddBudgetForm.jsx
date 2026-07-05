import { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';

import { notify } from '../../utils/notify';

import DateTimePicker from '@react-native-community/datetimepicker';

import { HeroAmount, Field, TextField, NoteField, Segment, AppearanceField, DateField, FormActions, formStyles } from '../buckets/BucketFormKit';
import { money } from '../../utils/formatMoney';
import { BUDGET_ICONS } from '../../constants/icons';

const periodOptions = ['Diario', 'Semanal', 'Mensual'];
const colorOptions = ['#b1c3cb', '#b3e6b3', '#edbcbc', '#d5cde0', '#ffe9b6', '#b6efd2'];

const AddBudgetForm = ({ onCancel, onSubmit, toEdit }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const handleAddBudget = () => {
    if (!formData.name || !formData.total) {
      notify('Campos requeridos', 'Completa el nombre y el monto.');
      return;
    }
    const { name, total, used, color, icon, period, date, notes } = formData;
    onSubmit({
      name,
      total: parseFloat(total),
      used: parseFloat(used),
      color,
      icon,
      period,
      date: date.toISOString(),
      notes,
    });
  };

  return (
    <View style={formStyles.container}>
      <HeroAmount
        label="Monto del presupuesto"
        value={formatCurrency(formData.total)}
        onChangeText={handleCurrencyInput}
        placeholder={money(0)}
      />

      <Field label="Nombre">
        <TextField placeholder="Arriendo, Alimentación, etc." value={formData.name} onChangeText={(v) => handleInputChange('name', v)} />
      </Field>

      <Field label="Período">
        <Segment options={periodOptions} value={formData.period} onChange={(v) => handleInputChange('period', v)} />
      </Field>

      <Field label="Apariencia">
        <AppearanceField
          colors={colorOptions}
          color={formData.color}
          onColor={(c) => handleInputChange('color', c)}
          icon={formData.icon}
          iconList={BUDGET_ICONS}
          onIcon={(name) => handleInputChange('icon', name)}
        />
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

      <Field label="Nota (opcional)">
        <NoteField placeholder="Descripción..." value={formData.notes} onChangeText={(v) => handleInputChange('notes', v)} />
      </Field>

      <FormActions submitLabel={toEdit ? 'Actualizar' : 'Guardar'} onSubmit={handleAddBudget} onCancel={onCancel} />
    </View>
  );
};

export default AddBudgetForm;
