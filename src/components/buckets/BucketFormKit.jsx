import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import IconPicker from '../IconPicker';
import { COLORS, SIZES } from '../../constants/theme';

// Kit de UI compartido por los formularios de bucket (presupuesto, ahorro,
// deuda, inversión) para un look consistente: monto como héroe, secciones
// rotuladas, chips/segmentos y botón Guardar verde a todo el ancho.
export const GREEN = '#1C6B52';

export const HeroAmount = ({ label, sublabel, value, onChangeText, placeholder }) => (
  <View style={styles.hero}>
    <Text style={styles.heroLabel}>{label}</Text>
    <TextInput
      style={styles.heroInput}
      keyboardType="numeric"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#c4c4bc"
      textAlign="center"
    />
    {sublabel ? <Text style={styles.heroSub}>{sublabel}</Text> : null}
  </View>
);

export const Field = ({ label, children }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

export const TextField = (props) => <TextInput style={styles.input} placeholderTextColor="#c4c4bc" {...props} />;
export const NoteField = (props) => <TextInput style={styles.noteInput} multiline placeholderTextColor="#c4c4bc" {...props} />;

const optionParts = (o) => (typeof o === 'string' ? { value: o, label: o } : o);

// Segmento (pocas opciones, mutuamente excluyentes).
export const Segment = ({ options, value, onChange }) => (
  <View style={styles.segment}>
    {options.map((o) => {
      const { value: v, label } = optionParts(o);
      const active = value === v;
      return (
        <TouchableOpacity key={v} style={[styles.segmentItem, active && styles.segmentItemActive]} onPress={() => onChange(v)}>
          <Text style={[styles.segmentText, active && styles.segmentTextActive]} numberOfLines={1}>{label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// Chips envolventes (varias opciones visibles).
export const ChipWrap = ({ options, value, onChange }) => (
  <View style={styles.chipWrap}>
    {options.map((o) => {
      const { value: v, label } = optionParts(o);
      const active = value === v;
      return (
        <TouchableOpacity key={v} style={[styles.wChip, active && styles.wChipActive]} onPress={() => onChange(v)}>
          <Text style={[styles.wChipText, active && styles.wChipTextActive]}>{label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// Apariencia: color + icono agrupados (proximidad).
export const AppearanceField = ({ colors, color, onColor, icon, iconList, onIcon }) => (
  <View style={styles.appearance}>
    <View style={styles.colorRow}>
      {colors.map((c) => (
        <TouchableOpacity key={c} onPress={() => onColor(c)} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]} />
      ))}
    </View>
    <View style={styles.iconPreviewRow}>
      <View style={[styles.iconPreview, { backgroundColor: color }]}>
        <MaterialIcons name={icon} size={20} color="#5f5a67" />
      </View>
      <IconPicker title="Elegir icono" iconList={iconList} onSelect={onIcon} />
    </View>
  </View>
);

export const DateField = ({ date, onPress }) => (
  <TouchableOpacity style={styles.dateChip} onPress={onPress}>
    <MaterialIcons name="calendar-month" size={18} color="#5f6b62" />
    <Text style={styles.dateChipText}>{date.toLocaleDateString('es-CO')}</Text>
  </TouchableOpacity>
);

export const CheckRow = ({ checked, label, onPress }) => (
  <TouchableOpacity style={styles.checkRow} onPress={onPress}>
    <MaterialIcons name={checked ? 'check-box' : 'check-box-outline-blank'} size={22} color={GREEN} />
    <Text style={styles.checkLabel}>{label}</Text>
  </TouchableOpacity>
);

export const FormActions = ({ submitLabel, onSubmit, onCancel }) => (
  <>
    <TouchableOpacity style={styles.saveBtn} onPress={onSubmit}>
      <Text style={styles.saveText}>{submitLabel}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
      <Text style={styles.cancelText}>Cancelar</Text>
    </TouchableOpacity>
  </>
);

export const formStyles = StyleSheet.create({
  container: { paddingBottom: 8 },
});

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 12 },
  heroLabel: { fontSize: SIZES.font * 0.9, color: COLORS.textSecondary },
  heroInput: { fontSize: SIZES.font * 2.6, fontWeight: '700', color: COLORS.textPrimary, minWidth: 160, paddingVertical: 4 },
  heroSub: { fontSize: SIZES.font * 0.9, color: COLORS.textSecondary, marginTop: 2 },

  label: { fontSize: SIZES.font * 0.85, color: COLORS.textSecondary, marginTop: 18, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#d6d6cc', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: SIZES.font, color: COLORS.textPrimary, backgroundColor: '#fff',
  },
  noteInput: {
    borderWidth: 1, borderColor: '#e3e3da', borderRadius: 10,
    padding: 12, height: 90, textAlignVertical: 'top', backgroundColor: COLORS.background, fontSize: SIZES.font,
  },

  segment: { flexDirection: 'row', backgroundColor: '#ECECE3', borderRadius: SIZES.radius, padding: 3 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: SIZES.radius * 0.8 },
  segmentItemActive: { backgroundColor: GREEN },
  segmentText: { fontSize: SIZES.font * 0.95, fontWeight: '600', color: COLORS.textSecondary },
  segmentTextActive: { color: '#fff' },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: '#d6d6cc', backgroundColor: '#fff' },
  wChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  wChipText: { fontSize: SIZES.font * 0.95, color: COLORS.textSecondary, fontWeight: '500' },
  wChipTextActive: { color: '#fff' },

  appearance: { backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 12, borderWidth: 1, borderColor: '#ececdf' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: '#1b1b18' },
  iconPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconPreview: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },

  dateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#d6d6cc', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff',
  },
  dateChipText: { fontSize: SIZES.font * 0.95, color: COLORS.textSecondary },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, marginTop: 2 },
  checkLabel: { fontSize: SIZES.font * 0.95, color: COLORS.textPrimary, flex: 1 },

  saveBtn: { marginTop: 24, backgroundColor: GREEN, borderRadius: SIZES.radius * 1.2, paddingVertical: 15, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: SIZES.font * 1.1, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: COLORS.textSecondary, fontSize: SIZES.font },
});

export default { HeroAmount, Field, TextField, NoteField, Segment, ChipWrap, AppearanceField, DateField, CheckRow, FormActions, formStyles, GREEN };
