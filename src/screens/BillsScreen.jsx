import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, TextInput, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as Bills from '../services/billsService';
import * as TransactionService from '../services/transactionService';
import * as Cards from '../services/cardService';
import { useGetDebts } from '../hooks/useDebtsData';
import { syncBillReminders } from '../services/billsReminders';
import { toDayString } from '../services/recurringService';
import { confirmAsync, notify } from '../utils/notify';
import { useCurrency } from '../context/CurrencyContext';
import { useIsDesktop } from '../hooks/useResponsive';
import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];


const BillsScreen = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const GREEN = theme.green, RED = theme.expense, GRAY = theme.neutral;
  // Estado de una ocurrencia: pagada (verde), vencida sin pagar (rojo), futura (gris).
  const occurrenceColor = (bill, occ, day) => {
    if (Bills.isPaid(bill, occ)) return GREEN;
    return occ < day ? RED : GRAY;
  };
  const isDesktop = useIsDesktop();
  const queryClient = useQueryClient();
  const { baseCurrency, formatIn } = useCurrency();
  const today = toDayString(new Date());

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1..12

  const { data: bills = [], isLoading } = useQuery({ queryKey: ['bills'], queryFn: Bills.getAllBills });
  const { data: debts = [] } = useGetDebts();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    syncBillReminders().catch(() => {});
  };

  // --- Facturas del mes visible, con su vencimiento ---
  const monthBills = useMemo(
    () =>
      bills
        .map((b) => ({ bill: b, occ: Bills.occurrenceInMonth(b, year, month) }))
        .filter((x) => x.occ)
        .sort((a, b) => a.occ.localeCompare(b.occ)),
    [bills, year, month],
  );

  // Puntos del calendario: día del mes → colores.
  const dots = useMemo(() => {
    const map = {};
    for (const { bill, occ } of monthBills) {
      const d = Number(occ.split('-')[2]);
      (map[d] ??= []).push(occurrenceColor(bill, occ, today));
    }
    return map;
  }, [monthBills, today]);

  const changeMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m); setYear(y);
  };

  // --- Cuadrícula del calendario (semana inicia en lunes) ---
  const grid = useMemo(() => {
    const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7; // 0 = lunes
    const total = new Date(year, month, 0).getDate();
    const cells = Array(firstWeekday).fill(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const todayDay = now.getDate();

  // --- Pagar / despagar ---
  // Al pagar se abre el modal de pago (permite editar el monto real del recibo).
  const [paying, setPaying] = useState(null); // null | { bill, occ }
  const [payAmount, setPayAmount] = useState('');
  const [payBusy, setPayBusy] = useState(false);

  const togglePaid = async (bill, occ) => {
    const isNowPaying = !Bills.isPaid(bill, occ);
    if (isNowPaying) {
      setPayAmount(String(bill.amount || ''));
      setPaying({ bill, occ });
      return; // el modal completa el flujo
    }
    try {
      await Bills.setPaid(bill, occ, false);
      invalidate();
    } catch {
      notify('No se pudo actualizar', 'Revisa tu conexión e inténtalo de nuevo.');
    }
  };

  // Cierra el modal de pago marcando pagada; con `record`, registra además el
  // gasto por el monto editado (y actualiza el estimado de la factura si cambió).
  const confirmPay = async (record) => {
    const { bill, occ } = paying;
    const amount = parseFloat(payAmount) || 0;
    if (record && amount <= 0) {
      notify('Monto inválido', 'Ingresa el monto pagado.');
      return;
    }
    setPayBusy(true);
    try {
      await Bills.setPaid(bill, occ, true);

      // Factura de tarjeta de crédito: el pago es un ABONO (baja la deuda y
      // libera cupo); no se registra gasto para no duplicar (las compras ya
      // fueron gasto y los intereses los registró el corte).
      if (bill.card_id) {
        const card = debts.find((d) => d.id === bill.card_id);
        if (card) {
          await Cards.applyPaymentToCard(card, amount);
          queryClient.invalidateQueries({ queryKey: ['debts'] });
          queryClient.invalidateQueries({ queryKey: ['cardplans', card.id] });
        }
        setPaying(null);
        invalidate();
        setPayBusy(false);
        return;
      }

      if (record) {
        try {
          await TransactionService.addTransaction({
            id: `bill-${bill.id}-${occ}`, // determinístico: no se duplica
            type: 'gasto',
            amount,
            currency: bill.currency || baseCurrency,
            notes: bill.name,
            date: new Date().toISOString(),
            bill_id: bill.id,
          });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        } catch {
          // ya registrado antes (id duplicado): no pasa nada
        }
        if (amount !== (bill.amount || 0)) {
          await Bills.updateBill(bill.id, { amount }).catch(() => {});
        }
      }
      setPaying(null);
      invalidate();
    } catch {
      notify('No se pudo actualizar', 'Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setPayBusy(false);
    }
  };

  // --- Alta / edición (modal) ---
  const [editing, setEditing] = useState(null); // null | 'new' | bill
  const [fName, setFName] = useState('');
  const [fAmount, setFAmount] = useState('');
  const [fKind, setFKind] = useState('monthly');
  const [fDay, setFDay] = useState('1');
  const [fDate, setFDate] = useState(new Date());
  const [fRemind, setFRemind] = useState('1');
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setFName(''); setFAmount(''); setFKind('monthly'); setFDay('1');
    setFDate(new Date()); setFRemind('1'); setEditing('new');
  };

  const openEdit = (bill) => {
    setFName(bill.name); setFAmount(String(bill.amount || ''));
    setFKind(bill.kind); setFDay(String(bill.day || 1));
    setFDate(bill.date ? new Date(`${bill.date}T12:00:00`) : new Date());
    setFRemind(String(bill.remind_days_before ?? 1));
    setEditing(bill);
  };

  const saveBill = async () => {
    if (!fName.trim()) { notify('Falta el nombre', 'Escribe el nombre de la factura.'); return; }
    setSaving(true);
    const data = {
      name: fName.trim(),
      amount: parseFloat(fAmount) || 0,
      currency: baseCurrency,
      kind: fKind,
      day: Math.min(31, Math.max(1, parseInt(fDay, 10) || 1)),
      date: toDayString(fDate),
      remindDaysBefore: Math.max(0, parseInt(fRemind, 10) || 0),
    };
    try {
      if (editing === 'new') {
        await Bills.addBill(data);
      } else {
        await Bills.updateBill(editing.id, {
          name: data.name, amount: data.amount, kind: data.kind,
          day: data.kind === 'monthly' ? data.day : undefined,
          date: data.kind === 'once' ? data.date : undefined,
          remind_days_before: data.remindDaysBefore,
        });
      }
      setEditing(null);
      invalidate();
    } catch {
      notify('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (bill) => {
    const ok = await confirmAsync('Eliminar factura', `¿Eliminar "${bill.name}" y sus recordatorios?`, 'Eliminar');
    if (ok) {
      await Bills.deleteBill(bill.id).catch(() => {});
      invalidate();
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
        {/* Calendario */}
        <View style={styles.calCard}>
          <View style={styles.calHeader}>
            <TouchableOpacity style={styles.calNav} onPress={() => changeMonth(-1)} accessibilityLabel="Mes anterior">
              <MaterialIcons name="chevron-left" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.calTitle}>{MONTHS[month - 1]} {year}</Text>
            <TouchableOpacity style={styles.calNav} onPress={() => changeMonth(1)} accessibilityLabel="Mes siguiente">
              <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.calWeekRow}>
            {WEEKDAYS.map((w, i) => <Text key={i} style={styles.calWeekday}>{w}</Text>)}
          </View>
          <View style={styles.calGrid}>
            {grid.map((d, i) => (
              <View key={i} style={styles.calCell}>
                {d && (
                  <View style={[styles.calDay, isCurrentMonth && d === todayDay && styles.calToday]}>
                    <Text style={[styles.calDayText, isCurrentMonth && d === todayDay && styles.calTodayText]}>{d}</Text>
                    <View style={styles.dotRow}>
                      {(dots[d] || []).slice(0, 3).map((c, j) => (
                        <View key={j} style={[styles.dot, { backgroundColor: c }]} />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: theme.green }]} /><Text style={styles.legend}>Pagada</Text>
            <View style={[styles.dot, { backgroundColor: RED }]} /><Text style={styles.legend}>Vencida</Text>
            <View style={[styles.dot, { backgroundColor: GRAY }]} /><Text style={styles.legend}>Por vencer</Text>
          </View>
        </View>

        {/* Lista del mes */}
        <Text style={styles.sectionTitle}>Facturas de {MONTHS[month - 1]}</Text>
        {isLoading ? (
          <Text style={styles.empty}>Cargando…</Text>
        ) : monthBills.length === 0 ? (
          <Text style={styles.empty}>Sin facturas este mes. Agrega una abajo.</Text>
        ) : (
          monthBills.map(({ bill, occ }) => {
            const paid = Bills.isPaid(bill, occ);
            const color = occurrenceColor(bill, occ, today);
            return (
              <TouchableOpacity key={bill.id} style={styles.card} activeOpacity={0.7} onPress={() => openEdit(bill)}>
                <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
                  <MaterialIcons name="receipt-long" size={20} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{bill.name}</Text>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {paid ? `Pagada · vencía el ${Number(occ.split('-')[2])}` : `Vence el ${Number(occ.split('-')[2])}`}
                    {bill.kind === 'monthly' ? ' · mensual' : ''}
                  </Text>
                </View>
                {bill.amount ? <Text style={[styles.cardAmount, { color }]}>{formatIn(bill.amount, bill.currency || baseCurrency)}</Text> : null}
                <Switch
                  value={paid}
                  onValueChange={() => togglePaid(bill, occ)}
                  trackColor={{ true: theme.green, false: theme.track }}
                  thumbColor="#fff"
                />
                <TouchableOpacity onPress={() => confirmDelete(bill)} accessibilityLabel={`Eliminar ${bill.name}`}>
                  <MaterialIcons name="delete-outline" size={22} color={theme.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}

        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Agregar factura</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de pago (monto editable) */}
      {paying && (
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setPaying(null)} />
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Pagar "{paying.bill.name}"</Text>

            <Text style={styles.editLabel}>Monto pagado ({paying.bill.currency || baseCurrency})</Text>
            <TextInput
              style={styles.editInput}
              keyboardType="numeric"
              value={payAmount}
              onChangeText={(v) => setPayAmount(v.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              placeholderTextColor={theme.neutral}
              autoFocus
            />
            <Text style={styles.payHint}>
              {paying.bill.card_id
                ? 'El pago abona a la tarjeta: baja la deuda y libera cupo. Puedes pagar más o menos que la cuota.'
                : 'Puedes ajustarlo si el recibo llegó distinto al estimado.'}
            </Text>

            <View style={styles.editActions}>
              {paying.bill.card_id ? (
                <>
                  <TouchableOpacity style={[styles.editBtn, styles.cancelBtn]} onPress={() => setPaying(null)} disabled={payBusy}>
                    <Text style={styles.editBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.editBtn, styles.saveBtn, payBusy && { opacity: 0.6 }]} onPress={() => confirmPay(false)} disabled={payBusy}>
                    <Text style={[styles.editBtnText, { color: '#fff' }]}>{payBusy ? 'Guardando…' : 'Pagar tarjeta'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={[styles.editBtn, styles.cancelBtn]} onPress={() => confirmPay(false)} disabled={payBusy}>
                    <Text style={styles.editBtnText}>Solo marcar pagada</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.editBtn, styles.saveBtn, payBusy && { opacity: 0.6 }]} onPress={() => confirmPay(true)} disabled={payBusy}>
                    <Text style={[styles.editBtnText, { color: '#fff' }]}>{payBusy ? 'Guardando…' : 'Registrar gasto'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Modal alta/edición */}
      {editing && (
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setEditing(null)} />
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>{editing === 'new' ? 'Nueva factura' : 'Editar factura'}</Text>

            <Text style={styles.editLabel}>Nombre</Text>
            <TextInput style={styles.editInput} value={fName} onChangeText={setFName} placeholder="Internet, Arriendo…" placeholderTextColor={theme.neutral} />

            <Text style={styles.editLabel}>Monto estimado ({baseCurrency})</Text>
            <TextInput style={styles.editInput} keyboardType="numeric" value={fAmount} onChangeText={(v) => setFAmount(v.replace(/[^0-9.]/g, ''))} placeholder="0" placeholderTextColor={theme.neutral} />

            <Text style={styles.editLabel}>Vencimiento</Text>
            <View style={styles.chipsRow}>
              {[{ k: 'monthly', l: 'Mensual' }, { k: 'once', l: 'Fecha única' }].map((o) => {
                const active = fKind === o.k;
                return (
                  <TouchableOpacity key={o.k} style={[styles.chip, active && styles.chipActive]} onPress={() => setFKind(o.k)}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {fKind === 'monthly' ? (
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>El día</Text>
                <TextInput style={styles.paramInput} keyboardType="number-pad" value={fDay} onChangeText={(v) => setFDay(v.replace(/\D/g, ''))} maxLength={2} />
                <Text style={styles.paramLabel}>de cada mes</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
                <MaterialIcons name="calendar-month" size={18} color={GREEN} />
                <Text style={styles.dateBtnText}>{toDayString(fDate)}</Text>
              </TouchableOpacity>
            )}
            {showPicker && (
              <DateTimePicker
                value={fDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, d) => { setShowPicker(false); if (d) setFDate(d); }}
              />
            )}

            <Text style={styles.editLabel}>Avisarme (días antes)</Text>
            <TextInput style={[styles.editInput, { maxWidth: 90 }]} keyboardType="number-pad" value={fRemind} onChangeText={(v) => setFRemind(v.replace(/\D/g, ''))} maxLength={2} />

            <View style={styles.editActions}>
              <TouchableOpacity style={[styles.editBtn, styles.cancelBtn]} onPress={() => setEditing(null)} disabled={saving}>
                <Text style={styles.editBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.editBtn, styles.saveBtn, saving && { opacity: 0.6 }]} onPress={saveBill} disabled={saving}>
                <Text style={[styles.editBtnText, { color: '#fff' }]}>{saving ? 'Guardando…' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const makeStyles = (t) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  contentDesktop: { width: '100%', maxWidth: 640, alignSelf: 'center' },

  calCard: { backgroundColor: t.card, borderRadius: SIZES.radius * 1.2, padding: SIZES.padding, marginBottom: 14 },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  calNav: { padding: 8 },
  calTitle: { fontSize: SIZES.font * 1.1, fontWeight: '600', color: t.textPrimary, textTransform: 'capitalize' },
  calWeekRow: { flexDirection: 'row' },
  calWeekday: { flex: 1, textAlign: 'center', fontSize: SIZES.font * 0.75, color: t.neutral, fontWeight: '600', marginBottom: 4 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  calDay: { width: 34, height: 40, alignItems: 'center', borderRadius: 10, paddingTop: 3 },
  calToday: { backgroundColor: t.greenSoft },
  calDayText: { fontSize: SIZES.font * 0.9, color: t.textPrimary },
  calTodayText: { fontWeight: '700', color: t.green },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'center' },
  legend: { fontSize: SIZES.font * 0.78, color: t.textSecondary, marginRight: 8 },

  sectionTitle: { fontSize: SIZES.font * 0.85, color: t.textSecondary, marginBottom: 8 },
  empty: { fontSize: SIZES.font * 0.95, color: t.textSecondary, marginVertical: 8 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: t.card, borderRadius: SIZES.radius * 1.2, padding: 12, marginBottom: 8,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: SIZES.font * 1.02, fontWeight: '500', color: t.textPrimary },
  cardSub: { fontSize: SIZES.font * 0.8, color: t.textSecondary, marginTop: 2 },
  cardAmount: { fontSize: SIZES.font * 0.95, fontWeight: '700', marginRight: 2 },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: t.green, borderRadius: SIZES.radius * 1.2, paddingVertical: 12, marginTop: 8,
  },
  addBtnText: { fontSize: SIZES.font, fontWeight: '700', color: '#fff' },

  overlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: t.overlay,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, zIndex: 100, elevation: 100,
  },
  editCard: { width: '100%', maxWidth: 440, backgroundColor: t.card, borderRadius: 12, padding: 20 },
  editTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: t.textPrimary },
  editLabel: { fontSize: SIZES.font * 0.85, color: t.textSecondary, marginTop: 12, marginBottom: 6 },
  editInput: {
    borderWidth: 1, borderColor: t.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9,
    fontSize: SIZES.font, color: t.textPrimary, backgroundColor: t.card,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: t.border, backgroundColor: t.card },
  chipActive: { backgroundColor: t.green, borderColor: t.green },
  chipText: { fontSize: SIZES.font * 0.9, color: t.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  paramRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  paramLabel: { fontSize: SIZES.font * 0.95, color: t.textSecondary },
  paramInput: {
    borderWidth: 1, borderColor: t.green, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
    minWidth: 56, textAlign: 'center', fontSize: SIZES.font, fontWeight: '700', color: t.green, backgroundColor: t.card,
  },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: t.green, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  dateBtnText: { fontSize: SIZES.font, color: t.green, fontWeight: '600' },
  payHint: { fontSize: SIZES.font * 0.8, color: t.neutral, marginTop: 8 },
  editActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, gap: 10 },
  editBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  saveBtn: { backgroundColor: t.green },
  cancelBtn: { backgroundColor: t.cardAlt },
  editBtnText: { fontWeight: 'bold', fontSize: 15, color: '#333' },
});

export default BillsScreen;
