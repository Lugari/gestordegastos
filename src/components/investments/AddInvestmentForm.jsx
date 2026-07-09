import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { notify } from '../../utils/notify';

import { HeroAmount, Field, TextField, NoteField, ChipWrap, DateField, AppearanceField, FormActions, formStyles } from '../buckets/BucketFormKit';
import { money } from '../../utils/formatMoney';
import { INVESTMENT_ICONS } from '../../constants/icons';

const colorOptions = ['#A77DDB', '#F9DC5C', '#F38BA0', '#b1c3cb', '#b3e6b3', '#edbcbc'];

// Tipos de inversión. La renta fija causa rendimientos automáticamente; el
// resto se revalúa a mano.
const INVESTMENT_TYPES = [
  { value: 'fixed', label: 'Renta fija' },
  { value: 'variable', label: 'Renta variable' },
  { value: 'crypto', label: 'Cripto' },
  { value: 'other', label: 'Inmueble/Otra' },
];

const toDate = (s) => (s ? new Date(`${s}T12:00:00`) : new Date());
const toDay = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

const AddInvestmentForm = ({ onSubmit, onCancel, toEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    total: '',
    type: 'fixed',
    roi: '',
    openDate: new Date(),
    maturityDate: null,
    icon: INVESTMENT_ICONS[0],
    color: colorOptions[0],
    notes: '',
  });
  const [showOpen, setShowOpen] = useState(false);
  const [showMaturity, setShowMaturity] = useState(false);

  useEffect(() => {
    if (toEdit) {
      setFormData({
        name: toEdit.name || '',
        total: toEdit.total || '',
        type: toEdit.type || 'fixed',
        roi: toEdit.roi?.toString() || '',
        openDate: toEdit.open_date ? toDate(toEdit.open_date) : new Date(toEdit.created_at || Date.now()),
        maturityDate: toEdit.maturity_date ? toDate(toEdit.maturity_date) : null,
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

  const isFixed = formData.type === 'fixed';

  const handleSubmit = () => {
    if (!formData.name) {
      notify('Campos requeridos', 'Ingresa el nombre de la inversión.');
      return;
    }
    if (isFixed && !formData.roi) {
      notify('Falta la tasa', 'La renta fija necesita una tasa de rentabilidad (% E.A.).');
      return;
    }
    onSubmit({
      name: formData.name.trim(),
      total: parseFloat(formData.total) || 0, // meta opcional
      type: formData.type,
      roi: parseFloat(formData.roi) || 0,
      open_date: toDay(formData.openDate),
      maturity_date: isFixed && formData.maturityDate ? toDay(formData.maturityDate) : undefined,
      icon: formData.icon,
      color: formData.color,
      notes: formData.notes.trim(),
      // El capital y el valor arrancan en 0: se construyen con aportes.
      used: toEdit?.used ?? 0,
      current_value: toEdit?.current_value ?? toEdit?.used ?? 0,
    });
  };

  return (
    <View style={formStyles.container}>
      <HeroAmount
        label="Meta (opcional)"
        value={formatCurrency(formData.total)}
        onChangeText={handleCurrencyInput}
        placeholder={money(0)}
      />

      <Field label="Nombre">
        <TextField placeholder="Acciones, Fondo indexado, CDT..." value={formData.name} onChangeText={(v) => handleInputChange('name', v)} />
      </Field>

      <Field label="Tipo de inversión">
        <ChipWrap options={INVESTMENT_TYPES} value={formData.type} onChange={(v) => handleInputChange('type', v)} />
      </Field>

      <Field label={isFixed ? 'Rentabilidad (% E.A.)' : 'Rentabilidad esperada (% anual)'}>
        <TextField placeholder="Ej: 12" keyboardType="numeric" value={formData.roi} onChangeText={(v) => handleInputChange('roi', v.replace(/[^0-9.]/g, ''))} />
      </Field>

      {isFixed && (
        <>
          <Field label="Fecha de apertura">
            <DateField date={formData.openDate} onPress={() => setShowOpen(true)} />
          </Field>
          <Field label="Fecha de vencimiento (opcional)">
            <DateField date={formData.maturityDate || formData.openDate} onPress={() => setShowMaturity(true)} />
          </Field>
          {showOpen && (
            <DateTimePicker
              value={formData.openDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => { setShowOpen(false); if (d) handleInputChange('openDate', d); }}
            />
          )}
          {showMaturity && (
            <DateTimePicker
              value={formData.maturityDate || formData.openDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => { setShowMaturity(false); if (d) handleInputChange('maturityDate', d); }}
            />
          )}
        </>
      )}

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
