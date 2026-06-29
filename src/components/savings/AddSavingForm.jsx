import React, { useEffect, useState } from 'react';
import { View, Platform, Alert } from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { HeroAmount, Field, TextField, NoteField, AppearanceField, DateField, CheckRow, FormActions, formStyles } from '../buckets/BucketFormKit';
import { money } from '../../utils/formatMoney';
import { SAVING_ICONS } from '../../constants/icons';

const colorOptions = ['#A77DDB', '#F9DC5C', '#F38BA0', '#b1c3cb', '#b3e6b3', '#edbcbc'];

const AddSavingForm = ({ onSubmit, onCancel, toEdit }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    total: '',
    icon: SAVING_ICONS[0],
    color: colorOptions[0],
    deadline: new Date(),
    notes: '',
    showable: false,
  });

  useEffect(() => {
    if (toEdit) {
      setFormData({
        name: toEdit.name || '',
        total: toEdit.total || '',
        icon: toEdit.icon || SAVING_ICONS[0],
        color: toEdit.color || colorOptions[0],
        deadline: toEdit.deadline ? new Date(toEdit.deadline) : new Date(),
        notes: toEdit.notes || '',
        showable: toEdit.showable || false,
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
      Alert.alert('Campos requeridos', 'Ingresa el nombre y el monto objetivo del ahorro.');
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
      used: parseFloat(0),
      icon: formData.icon,
      color: formData.color,
      deadline: formData.deadline.toISOString(),
      notes: formData.notes.trim(),
      showable: formData.showable,
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
        <TextField placeholder="Viaje a Cartagena, Nuevo celular..." value={formData.name} onChangeText={(v) => handleInputChange('name', v)} />
      </Field>

      <Field label="Apariencia">
        <AppearanceField
          colors={colorOptions}
          color={formData.color}
          onColor={(c) => handleInputChange('color', c)}
          icon={formData.icon}
          iconList={SAVING_ICONS}
          onIcon={(name) => handleInputChange('icon', name)}
        />
      </Field>

      <Field label="Fecha límite (opcional)">
        <DateField date={formData.deadline} onPress={() => setShowDatePicker(true)} />
      </Field>

      {showDatePicker && (
        <DateTimePicker
          value={formData.deadline}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) handleInputChange('deadline', selectedDate);
          }}
        />
      )}

      <Field label="Balance">
        <CheckRow
          checked={formData.showable}
          label={formData.showable ? 'Se mostrará en el balance' : 'No se mostrará en el balance'}
          onPress={() => handleInputChange('showable', !formData.showable)}
        />
      </Field>

      <Field label="Nota (opcional)">
        <NoteField placeholder="Describe tu objetivo..." value={formData.notes} onChangeText={(v) => handleInputChange('notes', v)} />
      </Field>

      <FormActions submitLabel={toEdit ? 'Actualizar' : 'Guardar'} onSubmit={handleSubmit} onCancel={onCancel} />
    </View>
  );
};

export default AddSavingForm;
