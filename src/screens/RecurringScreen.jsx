import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as Recurring from '../services/recurringService';
import { confirmAsync } from '../utils/notify';
import { useCurrency } from '../context/CurrencyContext';
import { useIsDesktop } from '../hooks/useResponsive';
import { COLORS, SIZES } from '../constants/theme';

const GREEN = '#1C6B52';
const TYPE_COLOR = { ingreso: '#3B6D11', gasto: '#A32D2D', ahorro: '#0F6E56' };

// Gestión de transacciones recurrentes: pausar/reanudar o eliminar cada regla.
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
              <View key={r.id} style={[styles.card, !r.active && styles.cardPaused]}>
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
              </View>
            );
          })
        )}
      </ScrollView>
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
});

export default RecurringScreen;
