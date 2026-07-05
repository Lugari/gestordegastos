import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as Recurring from '../services/recurringService';
import { confirmAsync, notify } from '../utils/notify';
import { useCurrency } from '../context/CurrencyContext';
import { useIsDesktop } from '../hooks/useResponsive';
import { COLORS, SIZES } from '../constants/theme';

const GREEN = '#1C6B52';
const TYPE_COLOR = { ingreso: '#3B6D11', gasto: '#A32D2D', ahorro: '#0F6E56' };

const FREQ_OPTIONS = [
  { key: 'diario', label: 'Diario' },
  { key: 'semanal', label: 'Semanal' },
  { key: 'quincenal', label: 'Quincenal' },
  { key: 'mensual', label: 'Mensual' },
  { key: 'xdias', label: 'Cada X días' },
  { key: 'xmes', label: 'Cada X del mes' },
];

// Clave de chip a partir de una regla guardada (para preseleccionar al editar).
const keyFromRule = (r) => {
  if (r.freq === 'monthly') return 'xmes';
  const n = Number(r.interval) || 1;
  return n === 1 ? 'diario' : n === 7 ? 'semanal' : n === 15 ? 'quincenal' : 'xdias';
};

// Gestión de transacciones recurrentes: editar, pausar/reanudar o eliminar.
const RecurringScreen = () => {
  const isDesktop = useIsDesktop();
  const queryClient = useQueryClient();
  const { formatIn } = useCurrency();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: Recurring.getAllRules,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['recurring'] });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => Recurring.updateRule(id, { active }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => Recurring.deleteRule(id),
    onSuccess: invalidate,
  });

  // --- Edición ---
  const [editing, setEditing] = useState(null); // regla en edición o null
  const [eAmount, setEAmount] = useState('');
  const [eNotes, setENotes] = useState('');
  const [eKey, setEKey] = useState('diario');
  const [eDays, setEDays] = useState('2');
  const [eMonthDay, setEMonthDay] = useState('1');
  const [saving, setSaving] = useState(false);

  const openEdit = (rule) => {
    const t = rule.template || {};
    setEAmount(String(t.amount ?? ''));
    setENotes(t.notes || '');
    const k = keyFromRule(rule);
    setEKey(k);
    setEDays(k === 'xdias' ? String(rule.interval || 2) : '2');
    setEMonthDay(rule.freq === 'monthly' ? String(rule.day || 1) : '1');
    setEditing(rule);
  };

  const saveEdit = async () => {
    const amount = parseFloat(eAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      notify('Monto inválido', 'Ingresa un monto válido.');
      return;
    }
    const rec = {
      diario: { freq: 'days', interval: 1 },
      semanal: { freq: 'days', interval: 7 },
      quincenal: { freq: 'days', interval: 15 },
      mensual: { freq: 'monthly', day: Number((editing.next_run || '').split('-')[2]) || new Date().getDate() },
      xdias: { freq: 'days', interval: Math.max(1, parseInt(eDays, 10) || 1) },
      xmes: { freq: 'monthly', day: Math.min(31, Math.max(1, parseInt(eMonthDay, 10) || 1)) },
    }[eKey];

    setSaving(true);
    try {
      const freqChanged = rec.freq !== editing.freq || rec.interval !== editing.interval || rec.day !== editing.day;
      const updates = {
        template: { ...(editing.template || {}), amount, notes: eNotes.trim() },
        ...rec,
        interval: rec.freq === 'days' ? rec.interval : undefined,
        day: rec.freq === 'monthly' ? rec.day : undefined,
      };
      // Si cambió la frecuencia, la próxima fecha se recalcula desde hoy;
      // si no, se respeta la programada.
      if (freqChanged) {
        updates.next_run = Recurring.advanceNextRun(rec, Recurring.toDayString(new Date()));
      }
      await Recurring.updateRule(editing.id, updates);
      setEditing(null);
      invalidate();
    } catch (e) {
      notify('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (rule) => {
    const name = rule.template?.notes || rule.template?.type || 'esta recurrencia';
    const ok = await confirmAsync(
      'Eliminar recurrente',
      `¿Eliminar "${name}"? Las transacciones ya registradas no se borran.`,
      'Eliminar',
    );
    if (ok) deleteMutation.mutate(rule.id);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
        {isLoading ? (
          <Text style={styles.empty}>Cargando…</Text>
        ) : rules.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialIcons name="repeat" size={44} color={COLORS.neutral} />
            <Text style={styles.empty}>No tienes transacciones recurrentes.</Text>
            <Text style={styles.emptyHint}>
              Crea una desde "Añadir transacción" eligiendo una opción en "Repetir".
            </Text>
          </View>
        ) : (
          rules.map((r) => {
            const t = r.template || {};
            const color = TYPE_COLOR[t.type] || COLORS.textPrimary;
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.card, !r.active && styles.cardPaused]}
                activeOpacity={0.7}
                onPress={() => openEdit(r)}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
                  <MaterialIcons name="repeat" size={20} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {t.notes || (t.type ? t.type[0].toUpperCase() + t.type.slice(1) : 'Recurrente')}
                  </Text>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {Recurring.freqLabel(r)} · próxima: {r.next_run || '—'}
                    {!r.active ? ' · pausada' : ''}
                  </Text>
                </View>
                <Text style={[styles.cardAmount, { color }]}>
                  {formatIn ? formatIn(t.amount, t.currency) : `${t.amount} ${t.currency}`}
                </Text>
                <Switch
                  value={!!r.active}
                  onValueChange={(v) => toggleMutation.mutate({ id: r.id, active: v })}
                  trackColor={{ true: GREEN, false: '#c9c9c0' }}
                  thumbColor="#fff"
                />
                <TouchableOpacity onPress={() => confirmDelete(r)} accessibilityLabel="Eliminar recurrente">
                  <MaterialIcons name="delete-outline" size={22} color={COLORS.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Overlay de edición */}
      {editing && (
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setEditing(null)} />
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Editar recurrente</Text>

            <Text style={styles.editLabel}>Monto</Text>
            <TextInput
              style={styles.editInput}
              keyboardType="numeric"
              value={eAmount}
              onChangeText={(v) => setEAmount(v.replace(/[^0-9.]/g, ''))}
            />

            <Text style={styles.editLabel}>Nota</Text>
            <TextInput
              style={styles.editInput}
              value={eNotes}
              onChangeText={setENotes}
              placeholder="Descripción..."
              placeholderTextColor="#c4c4bc"
            />

            <Text style={styles.editLabel}>Frecuencia</Text>
            <View style={styles.chipsRow}>
              {FREQ_OPTIONS.map((o) => {
                const active = eKey === o.key;
                return (
                  <TouchableOpacity
                    key={o.key}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setEKey(o.key)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {eKey === 'xdias' && (
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Cada</Text>
                <TextInput style={styles.paramInput} keyboardType="number-pad" value={eDays} onChangeText={(v) => setEDays(v.replace(/\D/g, ''))} maxLength={3} />
                <Text style={styles.paramLabel}>días</Text>
              </View>
            )}
            {eKey === 'xmes' && (
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>El día</Text>
                <TextInput style={styles.paramInput} keyboardType="number-pad" value={eMonthDay} onChangeText={(v) => setEMonthDay(v.replace(/\D/g, ''))} maxLength={2} />
                <Text style={styles.paramLabel}>de cada mes</Text>
              </View>
            )}

            <View style={styles.editActions}>
              <TouchableOpacity style={[styles.editBtn, styles.cancelBtn]} onPress={() => setEditing(null)} disabled={saving}>
                <Text style={styles.editBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.editBtn, styles.saveBtn, saving && { opacity: 0.6 }]} onPress={saveEdit} disabled={saving}>
                <Text style={[styles.editBtnText, { color: '#fff' }]}>{saving ? 'Guardando…' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  contentDesktop: { width: '100%', maxWidth: 640, alignSelf: 'center' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: SIZES.radius * 1.2,
    padding: 12,
    marginBottom: 8,
  },
  cardPaused: { opacity: 0.55 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: SIZES.font * 1.02, fontWeight: '500', color: COLORS.textPrimary },
  cardSub: { fontSize: SIZES.font * 0.8, color: COLORS.textSecondary, marginTop: 2 },
  cardAmount: { fontSize: SIZES.font * 0.95, fontWeight: '700', marginRight: 2 },

  emptyWrap: { alignItems: 'center', gap: 8, marginTop: 60, paddingHorizontal: 24 },
  empty: { fontSize: SIZES.font, color: COLORS.textSecondary, textAlign: 'center' },
  emptyHint: { fontSize: SIZES.font * 0.85, color: COLORS.neutral, textAlign: 'center' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
    elevation: 100,
  },
  editCard: { width: '100%', maxWidth: 440, backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  editTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', color: COLORS.textPrimary },
  editLabel: { fontSize: SIZES.font * 0.85, color: COLORS.textSecondary, marginTop: 12, marginBottom: 6 },
  editInput: {
    borderWidth: 1,
    borderColor: '#d6d6cc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
    backgroundColor: '#fff',
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d6d6cc',
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: SIZES.font * 0.9, color: COLORS.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  paramRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  paramLabel: { fontSize: SIZES.font * 0.95, color: COLORS.textSecondary },
  paramInput: {
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 56,
    textAlign: 'center',
    fontSize: SIZES.font,
    fontWeight: '700',
    color: GREEN,
    backgroundColor: '#fff',
  },
  editActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, gap: 10 },
  editBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  saveBtn: { backgroundColor: GREEN },
  cancelBtn: { backgroundColor: '#EAEAEA' },
  editBtnText: { fontWeight: 'bold', fontSize: 15, color: '#333' },
});

export default RecurringScreen;
