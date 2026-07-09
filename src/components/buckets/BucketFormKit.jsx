import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import IconPicker from '../IconPicker';
import { SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

// Kit de UI compartido por los formularios de bucket (presupuesto, ahorro,
// deuda, inversión) para un look consistente: monto como héroe, secciones
// rotuladas, chips/segmentos y botón Guardar verde a todo el ancho.
// Cada componente lee la paleta del tema (claro/oscuro) con useKitStyles().
export const GREEN = '#1C6B52'; // compatibilidad; preferir theme.green

const useKitStyles = () => {
  const { theme } = useTheme();
  return { styles: useMemo(() => makeKitStyles(theme), [theme]), t: theme };
};

export const HeroAmount = ({ label, sublabel, value, onChangeText, placeholder }) => {
  const { styles, t } = useKitStyles();
  return (
    <View style={styles.hero}>
      <Text style={styles.heroLabel}>{label}</Text>
      <TextInput
        style={styles.heroInput}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.neutral}
        textAlign="center"
      />
      {sublabel ? <Text style={styles.heroSub}>{sublabel}</Text> : null}
    </View>
  );
};

export const Field = ({ label, children }) => {
  const { styles } = useKitStyles();
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
};

export const TextField = (props) => {
  const { styles, t } = useKitStyles();
  return <TextInput style={styles.input} placeholderTextColor={t.neutral} {...props} />;
};

export const NoteField = (props) => {
  const { styles, t } = useKitStyles();
  return <TextInput style={styles.noteInput} multiline placeholderTextColor={t.neutral} {...props} />;
};

const optionParts = (o) => (typeof o === 'string' ? { value: o, label: o } : o);

// Segmento (pocas opciones, mutuamente excluyentes).
export const Segment = ({ options, value, onChange }) => {
  const { styles } = useKitStyles();
  return (
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
};

// Chips envolventes (varias opciones visibles).
export const ChipWrap = ({ options, value, onChange }) => {
  const { styles } = useKitStyles();
  return (
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
};

// Apariencia: color + icono agrupados (proximidad).
export const AppearanceField = ({ colors, color, onColor, icon, iconList, onIcon }) => {
  const { styles, t } = useKitStyles();
  // Dedupe defensivo: claves repetidas romperían el render de la lista.
  const icons = [...new Set(iconList)];
  return (
    <View style={styles.appearance}>
      {/* Vista previa grande: el icono elegido sobre el color elegido */}
      <View style={styles.previewRow}>
        <View style={[styles.previewCircle, { backgroundColor: color }]}>
          <MaterialIcons name={icon} size={30} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.previewLabel}>Vista previa</Text>
          <Text style={styles.previewHint}>Elige un color y un icono para tu categoría.</Text>
        </View>
      </View>

      {/* Colores: cuadrícula que fluye, con check en el activo */}
      <Text style={styles.appearanceLabel}>Color</Text>
      <View style={styles.colorRow}>
        {colors.map((c) => (
          <TouchableOpacity key={c} onPress={() => onColor(c)} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}>
            {color === c ? <MaterialIcons name="check" size={16} color="#fff" /> : null}
          </TouchableOpacity>
        ))}
      </View>

      {/* Iconos: tira horizontal de acceso rápido + modal con todos */}
      <View style={styles.iconStripHeader}>
        <Text style={styles.appearanceLabel}>Icono</Text>
        <IconPicker title="Ver todos" iconList={iconList} onSelect={onIcon} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconStrip}>
        {icons.map((name) => {
          const active = icon === name;
          return (
            <TouchableOpacity
              key={name}
              onPress={() => onIcon(name)}
              style={[styles.iconChip, active ? { backgroundColor: color, borderColor: color } : { borderColor: t.border }]}
            >
              <MaterialIcons name={name} size={22} color={active ? '#fff' : t.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export const DateField = ({ date, onPress }) => {
  const { styles, t } = useKitStyles();
  return (
    <TouchableOpacity style={styles.dateChip} onPress={onPress}>
      <MaterialIcons name="calendar-month" size={18} color={t.textSecondary} />
      <Text style={styles.dateChipText}>{date.toLocaleDateString('es-CO')}</Text>
    </TouchableOpacity>
  );
};

export const CheckRow = ({ checked, label, onPress }) => {
  const { styles, t } = useKitStyles();
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onPress}>
      <MaterialIcons name={checked ? 'check-box' : 'check-box-outline-blank'} size={22} color={t.green} />
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

export const FormActions = ({ submitLabel, onSubmit, onCancel }) => {
  const { styles } = useKitStyles();
  return (
    <>
      <TouchableOpacity style={styles.saveBtn} onPress={onSubmit}>
        <Text style={styles.saveText}>{submitLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </>
  );
};

export const formStyles = StyleSheet.create({
  container: { paddingBottom: 8 },
});

const makeKitStyles = (t) => StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 12 },
  heroLabel: { fontSize: SIZES.font * 0.9, color: t.textSecondary },
  heroInput: { fontSize: SIZES.font * 2.6, fontWeight: '700', color: t.textPrimary, minWidth: 160, paddingVertical: 4 },
  heroSub: { fontSize: SIZES.font * 0.9, color: t.textSecondary, marginTop: 2 },

  label: { fontSize: SIZES.font * 0.85, color: t.textSecondary, marginTop: 18, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: t.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: SIZES.font, color: t.textPrimary, backgroundColor: t.inputBg,
  },
  noteInput: {
    borderWidth: 1, borderColor: t.border, borderRadius: 10,
    padding: 12, height: 90, textAlignVertical: 'top', backgroundColor: t.inputBg, fontSize: SIZES.font, color: t.textPrimary,
  },

  segment: { flexDirection: 'row', backgroundColor: t.track, borderRadius: SIZES.radius, padding: 3 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: SIZES.radius * 0.8 },
  segmentItemActive: { backgroundColor: t.green },
  segmentText: { fontSize: SIZES.font * 0.95, fontWeight: '600', color: t.textSecondary },
  segmentTextActive: { color: '#fff' },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: t.border, backgroundColor: t.card },
  wChipActive: { backgroundColor: t.green, borderColor: t.green },
  wChipText: { fontSize: SIZES.font * 0.95, color: t.textSecondary, fontWeight: '500' },
  wChipTextActive: { color: '#fff' },

  appearance: { backgroundColor: t.card, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: t.border },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  previewCircle: {
    width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3,
  },
  previewLabel: { fontSize: SIZES.font, fontWeight: '700', color: t.textPrimary },
  previewHint: { fontSize: SIZES.font * 0.82, color: t.textSecondary, marginTop: 2 },
  appearanceLabel: { fontSize: SIZES.font * 0.85, fontWeight: '600', color: t.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  colorDotActive: { borderColor: t.textPrimary },
  iconStripHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconStrip: { gap: 10, paddingVertical: 2, paddingRight: 8 },
  iconChip: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.inputBg },
  iconPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconPreview: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },

  dateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: t.border, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: t.card,
  },
  dateChipText: { fontSize: SIZES.font * 0.95, color: t.textSecondary },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, marginTop: 2 },
  checkLabel: { fontSize: SIZES.font * 0.95, color: t.textPrimary, flex: 1 },

  saveBtn: { marginTop: 24, backgroundColor: t.green, borderRadius: SIZES.radius * 1.2, paddingVertical: 15, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: SIZES.font * 1.1, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: t.textSecondary, fontSize: SIZES.font },
});

export default { HeroAmount, Field, TextField, NoteField, Segment, ChipWrap, AppearanceField, DateField, CheckRow, FormActions, formStyles, GREEN };
