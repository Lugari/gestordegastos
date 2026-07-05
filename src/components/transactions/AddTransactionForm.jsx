import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { notify } from '../../utils/notify';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SIZES, COLORS } from '../../constants/theme';
import { formatMoney } from '../../utils/formatMoney';
import { useCurrency } from '../../context/CurrencyContext';
import { useGetAccounts } from '../../hooks/useAccountsData';

// Tipos como segmento (Hick): tres opciones visibles, color por significado.
const TYPES = [
  { key: 'gasto', label: 'Gasto', color: '#993C1D' },
  { key: 'ingreso', label: 'Ingreso', color: '#1C6B52' },
  { key: 'ahorro', label: 'Ahorro', color: '#0F6E56' },
];
const GREEN = '#1C6B52';

const AddTransactionForm = ({ onCancel, onSubmit, budgets, savings, transactionToEdit }) => {
  const route = useRoute();
  const { baseCurrency } = useCurrency();
  const { data: accounts = [] } = useGetAccounts();

  const [isEditing, setIsEditing] = useState(false);
  const [activeDate, setActiveDate] = useState(0); // 'Hoy' por defecto
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Recurrencia: clave del chip activo (null = sin repetición; los chips se
  // pueden desmarcar tocándolos de nuevo) + parámetros de las opciones "Cada X".
  const [recKey, setRecKey] = useState(null);
  const [recDays, setRecDays] = useState('2');
  const [recMonthDay, setRecMonthDay] = useState('1');

  const [formData, setFormData] = useState({
    type: route.params?.transactionType || 'gasto',
    account: '',
    amount: '',
    notes: '',
    date: new Date(),
    budget_id: '',
    icon: '',
    color: '#b1c3cb',
    currency: baseCurrency,
  });

  // Categorías visibles según el tipo (gasto→presupuestos, ahorro→ahorros).
  const categoryList = formData.type === 'gasto' ? budgets : formData.type === 'ahorro' ? savings : [];
  const visibleCategories = useMemo(
    () => (showAllCategories ? categoryList : categoryList.slice(0, 3)),
    [showAllCategories, categoryList],
  );

  // Carga datos si es edición.
  useEffect(() => {
    if (transactionToEdit) {
      setFormData({
        type: transactionToEdit.type,
        account: transactionToEdit.account,
        amount: transactionToEdit.amount?.toString(),
        notes: transactionToEdit.notes,
        date: new Date(transactionToEdit.date),
        budget_id: transactionToEdit.budget_id,
        icon: transactionToEdit.icon,
        color: transactionToEdit.color || '#b1c3cb',
        currency: transactionToEdit.currency || baseCurrency,
      });
      setIsEditing(true);
    }
  }, [transactionToEdit]);

  // Selecciona la primera cuenta por defecto (su moneda manda).
  useEffect(() => {
    if (!transactionToEdit && !formData.account && accounts.length > 0) {
      const first = accounts[0];
      setFormData((prev) => ({ ...prev, account: first.id, currency: first.currency }));
    }
  }, [accounts, transactionToEdit, formData.account]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Cambiar de tipo limpia la categoría seleccionada (ya no aplica).
  const handleTypeChange = (type) => {
    if (transactionToEdit) return;
    setShowAllCategories(false);
    setFormData((prev) => ({ ...prev, type, budget_id: '', icon: '', color: '#b1c3cb' }));
  };

  const selectAccount = (account) =>
    setFormData((prev) => ({ ...prev, account: account.id, currency: account.currency }));

  const selectCategory = (cat) =>
    setFormData((prev) => ({ ...prev, budget_id: cat.id, icon: cat.icon, color: cat.color }));

  const setRelativeDate = (daysAgo) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - daysAgo);
    handleInputChange('date', newDate);
    setActiveDate(daysAgo);
  };

  const formatCurrency = (value) => {
    const number = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value;
    if (isNaN(number)) return '';
    return formatMoney(number, formData.currency);
  };

  const handleCurrencyInput = (text) => {
    const numericValue = parseInt(text.replace(/\D/g, ''));
    handleInputChange('amount', isNaN(numericValue) ? 0 : numericValue);
  };

  const handleSubmit = async () => {
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
      notify('Monto inválido', 'Ingresa un monto válido.');
      return;
    }

    const transactionData = {
      type: formData.type.toLowerCase(),
      account: formData.account,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      notes: (formData.notes || '').trim(),
      date: formData.date.toISOString(),
      budget_id: formData.budget_id,
      icon: formData.icon,
      color: formData.color,
    };

    // Recurrencia (si hay chip activo): freq 'days' con intervalo, o 'monthly' con día.
    if (!isEditing && recKey) {
      const day = formData.date.getDate();
      const rec = {
        diario: { freq: 'days', interval: 1 },
        semanal: { freq: 'days', interval: 7 },
        quincenal: { freq: 'days', interval: 15 },
        mensual: { freq: 'monthly', day },
        xdias: { freq: 'days', interval: Math.max(1, parseInt(recDays, 10) || 1) },
        xmes: { freq: 'monthly', day: Math.min(31, Math.max(1, parseInt(recMonthDay, 10) || 1)) },
      }[recKey];
      transactionData.recurrence = rec;
    }

    await onSubmit(transactionData);
    setRecKey(null);

    setFormData({
      type: 'gasto',
      account: '',
      amount: '',
      notes: '',
      date: new Date(),
      icon: '',
      color: '#b1c3cb',
      budget_id: '',
      currency: formData.currency,
    });
  };

  const accountName = accounts.find((a) => a.id === formData.account)?.name;
  const formattedDate = formData.date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Monto (héroe) */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Monto</Text>
        <TextInput
          style={styles.heroInput}
          keyboardType="numeric"
          placeholder={formatMoney(0, formData.currency)}
          placeholderTextColor="#c4c4bc"
          value={formatCurrency(formData.amount)}
          onChangeText={handleCurrencyInput}
          textAlign="center"
        />
        <Text style={styles.heroSub}>
          {formData.currency}
          {accountName ? ` · ${accountName}` : ''}
        </Text>
      </View>

      {/* Tipo (segmentado) */}
      <View style={[styles.segment, transactionToEdit && { opacity: 0.6 }]} pointerEvents={transactionToEdit ? 'none' : 'auto'}>
        {TYPES.map((t) => {
          const active = formData.type === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.segmentItem, active && { backgroundColor: t.color }]}
              onPress={() => handleTypeChange(t.key)}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Categoría (gasto / ahorro) */}
      {(formData.type === 'gasto' || formData.type === 'ahorro') && (
        <>
          <Text style={styles.label}>Categoría</Text>
          {categoryList.length === 0 ? (
            <Text style={styles.hint}>No hay categorías para este tipo. Créalas desde su sección.</Text>
          ) : (
            <View style={styles.chipsRow}>
              {visibleCategories.map((cat) => {
                const active = formData.budget_id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, active && { backgroundColor: cat.color, borderColor: cat.color }]}
                    onPress={() => selectCategory(cat)}
                  >
                    <MaterialIcons name={cat.icon} size={16} color={active ? '#fff' : '#5f6b62'} />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
              {categoryList.length > 3 && (
                <TouchableOpacity style={styles.chip} onPress={() => setShowAllCategories(!showAllCategories)}>
                  <MaterialIcons name={showAllCategories ? 'expand-less' : 'add'} size={16} color="#5f6b62" />
                  <Text style={styles.chipText}>{showAllCategories ? 'Menos' : 'Más'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}

      {/* Cuenta */}
      <Text style={styles.label}>Cuenta</Text>
      {accounts.length === 0 ? (
        <Text style={styles.hint}>Sin cuentas: se usará {formData.currency}. Crea cuentas desde el menú para elegir la moneda.</Text>
      ) : (
        <View style={styles.chipsRow}>
          {accounts.map((a) => {
            const active = formData.account === a.id;
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.chip, active && styles.chipAccountActive]}
                onPress={() => selectAccount(a)}
              >
                <Text style={[styles.chipText, active && styles.chipAccountTextActive]}>{a.name} · {a.currency}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Fecha */}
      <Text style={styles.label}>Fecha</Text>
      <View style={styles.chipsRow}>
        {[{ label: 'Hoy', daysAgo: 0 }, { label: 'Ayer', daysAgo: 1 }, { label: 'Anteayer', daysAgo: 2 }].map((b) => {
          const active = activeDate === b.daysAgo;
          return (
            <TouchableOpacity
              key={b.label}
              style={[styles.chip, active && styles.chipDateActive]}
              onPress={() => setRelativeDate(b.daysAgo)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{b.label}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.calendarBtn} onPress={() => setShowDatePicker(true)}>
          <MaterialIcons name="calendar-month" size={22} color="#5f6b62" />
        </TouchableOpacity>
      </View>
      <Text style={styles.dateText}>{formattedDate}</Text>

      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              handleInputChange('date', selectedDate);
              setActiveDate(-1);
            }
          }}
        />
      )}

      {/* Repetir (solo al crear; los chips se desmarcan tocándolos de nuevo) */}
      {!isEditing && (
        <>
          <Text style={styles.label}>Repetir (opcional)</Text>
          <View style={styles.chipsRow}>
            {[
              { key: 'diario', label: 'Diario' },
              { key: 'semanal', label: 'Semanal' },
              { key: 'quincenal', label: 'Quincenal' },
              { key: 'mensual', label: 'Mensual' },
              { key: 'xdias', label: 'Cada X días' },
              { key: 'xmes', label: 'Cada X del mes' },
            ].map((o) => {
              const active = recKey === o.key;
              return (
                <TouchableOpacity
                  key={o.key}
                  style={[styles.chip, active && styles.chipDateActive]}
                  onPress={() => setRecKey(active ? null : o.key)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {recKey === 'xdias' && (
            <View style={styles.recParamRow}>
              <Text style={styles.recParamLabel}>Cada</Text>
              <TextInput
                style={styles.recParamInput}
                keyboardType="number-pad"
                value={recDays}
                onChangeText={(v) => setRecDays(v.replace(/\D/g, ''))}
                maxLength={3}
              />
              <Text style={styles.recParamLabel}>días</Text>
            </View>
          )}
          {recKey === 'xmes' && (
            <View style={styles.recParamRow}>
              <Text style={styles.recParamLabel}>El día</Text>
              <TextInput
                style={styles.recParamInput}
                keyboardType="number-pad"
                value={recMonthDay}
                onChangeText={(v) => setRecMonthDay(v.replace(/\D/g, ''))}
                maxLength={2}
              />
              <Text style={styles.recParamLabel}>de cada mes</Text>
            </View>
          )}
          {recKey && (
            <Text style={styles.recHint}>
              {new Date(formData.date).setHours(0,0,0,0) > new Date().setHours(0,0,0,0)
                ? `Empezará el ${formattedDate}: nada se registra hoy y desde esa fecha se repite sola.`
                : 'Se registrará automáticamente. Puedes pausarla en Más → Recurrentes.'}
            </Text>
          )}
        </>
      )}

      {/* Nota */}
      <Text style={styles.label}>Nota (opcional)</Text>
      <TextInput
        placeholder="Descripción..."
        placeholderTextColor="#c4c4bc"
        multiline
        numberOfLines={3}
        style={styles.noteInput}
        value={formData.notes}
        onChangeText={(value) => handleInputChange('notes', value)}
      />

      {/* Acciones */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
        <Text style={styles.saveText}>{isEditing ? 'Actualizar' : 'Guardar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  heroLabel: { fontSize: SIZES.font * 0.9, color: COLORS.textSecondary },
  heroInput: {
    fontSize: SIZES.font * 2.6,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 160,
    paddingVertical: 4,
  },
  heroSub: { fontSize: SIZES.font * 0.9, color: COLORS.textSecondary, marginTop: 2 },

  segment: {
    flexDirection: 'row',
    backgroundColor: '#ECECE3',
    borderRadius: SIZES.radius,
    padding: 3,
    marginTop: 8,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: SIZES.radius * 0.8,
  },
  segmentText: { fontSize: SIZES.font, fontWeight: '600', color: COLORS.textSecondary },
  segmentTextActive: { color: '#fff' },

  label: { fontSize: SIZES.font * 0.85, color: COLORS.textSecondary, marginTop: 20, marginBottom: 8 },
  hint: { fontSize: SIZES.font * 0.9, color: COLORS.textSecondary, fontStyle: 'italic' },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d6d6cc',
    backgroundColor: '#fff',
  },
  chipText: { fontSize: SIZES.font * 0.95, color: COLORS.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  chipDateActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipAccountActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipAccountTextActive: { color: '#fff' },
  calendarBtn: { paddingHorizontal: 6, paddingVertical: 6 },

  dateText: { fontSize: SIZES.font * 0.9, color: COLORS.textSecondary, marginTop: 8 },

  recParamRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  recParamLabel: { fontSize: SIZES.font * 0.95, color: COLORS.textSecondary },
  recParamInput: {
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 56,
    textAlign: 'center',
    fontSize: SIZES.font,
    fontWeight: '700',
    color: GREEN,
    backgroundColor: '#fff',
  },
  recHint: { fontSize: SIZES.font * 0.8, color: COLORS.neutral, marginTop: 8 },

  noteInput: {
    borderWidth: 1,
    borderColor: '#e3e3da',
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.8,
    height: 90,
    textAlignVertical: 'top',
    backgroundColor: COLORS.background,
  },

  saveBtn: {
    marginTop: 24,
    backgroundColor: GREEN,
    borderRadius: SIZES.radius * 1.2,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: SIZES.font * 1.1, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: COLORS.textSecondary, fontSize: SIZES.font },
});

export default AddTransactionForm;
