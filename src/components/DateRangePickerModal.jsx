import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import { COLORS, SIZES } from '../constants/theme';

// YYYY-MM-DD en hora local, para el <input type="date"> de web.
const toInputValue = (d) => {
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};

const fromInputValue = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatLabel = (d) =>
  d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

// Campo de fecha: en web usa el selector nativo del navegador; en móvil, DateTimePicker.
const DateField = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>

      {Platform.OS === 'web' ? (
        <input
          type="date"
          value={toInputValue(value)}
          onChange={(e) => e.target.value && onChange(fromInputValue(e.target.value))}
          style={webInputStyle}
        />
      ) : (
        <>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShow(true)}>
            <MaterialIcons name="calendar-month" size={20} color={COLORS.textSecondary} />
            <Text style={styles.dateButtonText}>{formatLabel(value)}</Text>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              value={value}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selected) => {
                setShow(false);
                if (selected) onChange(selected);
              }}
            />
          )}
        </>
      )}
    </View>
  );
};

const DateRangePickerModal = ({ visible, initialStart, initialEnd, onApply, onCancel }) => {
  const [start, setStart] = useState(initialStart || new Date());
  const [end, setEnd] = useState(initialEnd || new Date());
  const [error, setError] = useState('');

  // Reinicia los valores cada vez que se abre el modal.
  useEffect(() => {
    if (visible) {
      setStart(initialStart || new Date());
      setEnd(initialEnd || new Date());
      setError('');
    }
  }, [visible]);

  const handleApply = () => {
    if (start > end) {
      setError('La fecha inicial no puede ser posterior a la final.');
      return;
    }
    onApply({ start, end });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card}>
          <Text style={styles.title}>Rango personalizado</Text>

          <DateField label="Desde" value={start} onChange={setStart} />
          <DateField label="Hasta" value={end} onChange={setEnd} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <SecondaryButton title="Cancelar" onPress={onCancel} />
            <PrimaryButton title="Aplicar" onPress={handleApply} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const webInputStyle = {
  border: `1px solid ${COLORS.textSecondary}`,
  borderRadius: SIZES.radius,
  padding: '8px 12px',
  fontSize: SIZES.font,
  color: COLORS.textPrimary,
  backgroundColor: COLORS.background,
  fontFamily: 'inherit',
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.textSecondary + '55',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: SIZES.radius * 1.4,
    padding: SIZES.padding * 1.5,
    shadowColor: COLORS.textPrimary,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: SIZES.font * 1.4,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.padding,
  },
  fieldRow: {
    marginBottom: SIZES.padding,
  },
  fieldLabel: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.6,
    backgroundColor: COLORS.background,
  },
  dateButtonText: {
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
  },
  error: {
    color: COLORS.danger,
    fontSize: SIZES.font * 0.9,
    marginBottom: SIZES.base,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SIZES.padding * 0.5,
  },
});

export default DateRangePickerModal;
