import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useManageBuckets, useGetBuckets } from '../hooks/useBucketData';
import { useGetAccounts } from '../hooks/useAccountsData';
import * as Cards from '../services/cardService';
import * as Investments from '../services/investmentService';
import * as TransactionService from '../services/transactionService';
import { notify } from '../utils/notify';
import { useGetTransactions } from '../hooks/useTransactionData';
import { useIsDesktop } from '../hooks/useResponsive';
import { useCurrency } from '../context/CurrencyContext';
import { KIND } from '../constants/bucketKinds';
import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// Pantalla de detalle única para todos los kinds. Reemplaza a Single{Budget,
// Saving,Debt,Investment}Screen. Se parametriza con `kind` (initialParams),
// conservando los mismos nombres de ruta para no tocar las llamadas existentes.
const DEBT_RED = '#B5453A';

const DEBT_LABELS = {
  'credit card': 'Tarjeta',
  'free investment': 'Libre inversión',
  vehicle: 'Vehículo',
  'mortgage loan': 'Hipoteca',
  estudies: 'Estudios',
  other: 'Otra',
};

const CONFIG = {
  [KIND.BUDGET]: { param: 'budget', add: 'AddBudgetScreen', queryKey: ['budgets'], variant: 'progress', heroLabel: 'Disponible', showTransactions: true, addTxType: 'gasto', kindLabel: 'presupuesto' },
  [KIND.SAVING]: { param: 'saving', add: 'AddSavingScreen', queryKey: ['savings'], variant: 'progress', heroLabel: 'Te falta', showTransactions: true, addTxType: 'ahorro', kindLabel: 'ahorro' },
  [KIND.DEBT]: { param: 'debt', add: 'AddDebtScreen', queryKey: ['debts'], variant: 'debt', kindLabel: 'deuda' },
  [KIND.INVESTMENT]: { param: 'investment', add: 'AddInvestmentScreen', queryKey: ['investments'], variant: 'investment', kindLabel: 'inversión' },
};

const fmtDate = (x) => (x ? new Date(x).toLocaleDateString('es-CO') : '—');

// Metadatos compactos por kind (grilla de mini-tarjetas).
const metaFor = (kind, item, format) => {
  switch (kind) {
    case KIND.BUDGET:
      return [
        { label: 'Período', value: item.period || '—' },
        { label: 'Inicio', value: fmtDate(item.date) },
        { label: 'Actualizado', value: fmtDate(item.updated_at) },
      ];
    case KIND.SAVING:
      return [
        { label: 'Plazo', value: fmtDate(item.deadline) },
        { label: 'Inicio', value: fmtDate(item.created_at) },
        { label: 'Actualizado', value: fmtDate(item.updated_at) },
      ];
    case KIND.INVESTMENT: {
      const INV_LABELS = { fixed: 'Renta fija', variable: 'Renta variable', crypto: 'Cripto', other: 'Inmueble/Otra' };
      return [
        { label: 'Tipo', value: INV_LABELS[item.type] || 'Renta fija' },
        { label: item.type === 'fixed' ? 'Tasa (E.A.)' : 'Rentab. esperada', value: `${item.roi || 0}%` },
        { label: 'Capital invertido', value: format(item.used || 0) },
        item.type === 'fixed'
          ? { label: 'Vencimiento', value: item.maturity_date ? fmtDate(item.maturity_date) : 'Sin fecha' }
          : { label: 'Actualizado', value: fmtDate(item.updated_at) },
      ];
    }
    case KIND.DEBT:
      if (item.type === 'credit card') {
        return [
          { label: 'Día de corte', value: item.cut_day ? `El ${item.cut_day}` : '—' },
          { label: 'Límite de pago', value: item.due_day ? `El ${item.due_day}` : '—' },
          { label: 'Tasa mensual', value: item.interest_enabled ? `${item.interest_rate || 0}%` : 'Sin interés' },
          { label: 'Cuota de manejo', value: format(item.handling_fee || 0) },
        ];
      }
      return [
        { label: 'Tipo', value: DEBT_LABELS[item.type] || item.type || '—' },
        { label: 'Interés', value: `${item.apr || 0}%` },
        { label: 'Cuotas', value: item.fees ? String(item.fees) : '—' },
        { label: 'Inicio', value: fmtDate(item.created_at) },
      ];
    default:
      return [];
  }
};

const SingleBucketScreen = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const GREEN = theme.green, INCOME = theme.income, EXPENSE = theme.expense, SAVING_C = theme.saving;
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const { kind, ...rest } = useRoute().params || {};
  const cfg = CONFIG[kind];

  const { format, formatIn, baseCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const { deleteMutation } = useManageBuckets(kind, cfg?.queryKey ?? ['buckets', kind]);
  const { data: transactions = [] } = useGetTransactions();
  const { data: liveBuckets = [] } = useGetBuckets(kind, cfg?.queryKey ?? ['buckets', kind]);
  const { data: accounts = [] } = useGetAccounts();

  const paramItem = cfg ? rest[cfg.param] : null;
  // Datos vivos: la deuda de una tarjeta cambia con compras/abonos.
  const item = useMemo(
    () => (paramItem ? liveBuckets.find((b) => b.id === paramItem.id) || paramItem : null),
    [liveBuckets, paramItem],
  );

  const isCC = kind === KIND.DEBT && Cards.isCreditCard(item);

  // Planes de cuotas de la tarjeta.
  const { data: plans = [] } = useQuery({
    queryKey: ['cardplans', item?.id],
    queryFn: () => Cards.getPlansForCard(item.id),
    enabled: !!isCC,
  });

  // Avance / abono (modales)
  const [ccModal, setCcModal] = useState(null); // null | 'advance' | 'payment'
  const [ccAmount, setCcAmount] = useState('');
  const [ccAccount, setCcAccount] = useState('');
  const [ccBusy, setCcBusy] = useState(false);

  const refreshCard = () => {
    queryClient.invalidateQueries({ queryKey: cfg?.queryKey ?? ['buckets', kind] });
    queryClient.invalidateQueries({ queryKey: ['cardplans', item?.id] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  const submitCcModal = async () => {
    const amount = parseFloat(ccAmount) || 0;
    if (amount <= 0) { notify('Monto inválido', 'Ingresa un monto válido.'); return; }
    setCcBusy(true);
    try {
      if (ccModal === 'advance') {
        if (!ccAccount) { notify('Falta la cuenta', 'Elige la cuenta que recibe el avance.'); setCcBusy(false); return; }
        const acc = accounts.find((a) => a.id === ccAccount);
        await Cards.registerAdvance({ card: item, amount, notes: `Avance · ${item.name}` });
        // El efectivo entra a la cuenta destino (excluido de los ingresos en métricas).
        await TransactionService.addTransaction({
          type: 'ingreso',
          is_advance: true,
          account: ccAccount,
          amount,
          currency: acc?.currency,
          notes: `Avance ${item.name}`,
          date: new Date().toISOString(),
          card_id: item.id,
        }).catch(() => {});
      } else {
        await Cards.applyPaymentToCard(item, amount);
      }
      setCcModal(null);
      setCcAmount('');
      refreshCard();
    } catch (e) {
      notify('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setCcBusy(false);
    }
  };

  const isInv = kind === KIND.INVESTMENT;

  // Movimientos de la inversión (aportes, retiros, dividendos, causación).
  const { data: invMoves = [] } = useQuery({
    queryKey: ['invmoves', item?.id],
    queryFn: () => Investments.getMovesFor(item.id),
    enabled: !!isInv,
  });

  // Operaciones de inversión (modal)
  const [invModal, setInvModal] = useState(null); // 'contribute'|'withdraw'|'dividend'|'revalue'
  const [invAmount, setInvAmount] = useState('');
  const [invAccount, setInvAccount] = useState('');
  const [invReinvest, setInvReinvest] = useState(false);
  const [invBusy, setInvBusy] = useState(false);

  const refreshInv = () => {
    queryClient.invalidateQueries({ queryKey: ['investments'] });
    queryClient.invalidateQueries({ queryKey: ['invmoves', item?.id] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  const openInvModal = (op) => {
    setInvModal(op);
    setInvReinvest(false);
    setInvAccount(accounts[0]?.id || '');
    setInvAmount(op === 'revalue' ? String(Math.round(Investments.currentValue(item))) : '');
  };

  const submitInvModal = async () => {
    const amount = parseFloat(invAmount) || 0;
    if (amount <= 0) { notify('Monto inválido', 'Ingresa un monto válido.'); return; }
    const needsAccount = invModal === 'contribute' || invModal === 'withdraw' || (invModal === 'dividend' && !invReinvest);
    if (needsAccount && !invAccount) { notify('Falta la cuenta', 'Elige una cuenta.'); return; }
    setInvBusy(true);
    try {
      if (invModal === 'contribute') {
        await Investments.registerContribution({ investment: item, amount, currency: baseCurrency, account: invAccount });
      } else if (invModal === 'withdraw') {
        await Investments.registerWithdrawal({ investment: item, amount, currency: baseCurrency, account: invAccount });
      } else if (invModal === 'dividend') {
        await Investments.registerDividend({ investment: item, amount, currency: baseCurrency, account: invAccount, reinvest: invReinvest });
      } else if (invModal === 'revalue') {
        await Investments.revalue({ investment: item, newValue: amount, currency: baseCurrency });
      }
      setInvModal(null);
      setInvAmount('');
      refreshInv();
    } catch (e) {
      notify('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setInvBusy(false);
    }
  };

  const movements = useMemo(() => {
    if (!cfg?.showTransactions || !item) return [];
    return transactions
      .filter((t) => t.budget_id === item.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, item, cfg]);

  const handleEdit = useCallback(() => {
    navigation.navigate(cfg.add, { toEdit: item });
  }, [navigation, cfg, item]);

  const handleDelete = useCallback(() => {
    const doDelete = async () => {
      try {
        await deleteMutation.mutateAsync(item.id);
        navigation.goBack();
      } catch (e) {
        if (Platform.OS === 'web') window.alert('No se pudo eliminar.');
        else Alert.alert('Error', 'No se pudo eliminar.');
      }
    };
    const msg = `¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`;
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) doDelete();
    } else {
      Alert.alert(`Eliminar ${cfg.kindLabel}`, msg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ]);
    }
  }, [deleteMutation, item, cfg, navigation]);

  if (!cfg || !item) return null;

  const used = item.used || 0;
  const total = item.total || 0;
  const remaining = total - used;
  const invValue = Investments.currentValue(item);
  const invGain = invValue - used;
  const invGainPct = used > 0 ? (invGain / used) * 100 : 0;
  const isFixedInv = isInv && item.type === 'fixed';
  const pct = total > 0 ? Math.min(Math.max(used / total, 0), 1) : 0;
  const exceeded = cfg.variant === 'progress' && remaining < 0;
  const meta = metaFor(kind, item, format);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
      {/* Encabezado */}
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <TouchableOpacity onPress={handleEdit} accessibilityLabel="Editar">
          <MaterialIcons name="edit" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Héroe */}
      {cfg.variant === 'investment' ? (
        <View style={[styles.hero, { backgroundColor: invGain >= 0 ? theme.green : DEBT_RED }]}>
          <Text style={styles.heroLabel}>Valor actual</Text>
          <Text style={styles.heroValue}>{format(invValue)}</Text>
          <Text style={styles.heroSub}>
            {invGain >= 0 ? '▲' : '▼'} {format(Math.abs(invGain))} ({invGainPct >= 0 ? '+' : ''}{invGainPct.toFixed(1)}%) · invertido {format(used)}
          </Text>
        </View>
      ) : cfg.variant === 'progress' ? (
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>{exceeded ? 'Excedido' : cfg.heroLabel}</Text>
            {item.period ? <Text style={styles.heroTag}>{item.period}</Text> : null}
          </View>
          <Text style={styles.heroValue}>{format(Math.abs(remaining))}</Text>
          <View style={styles.heroTrack}><View style={[styles.heroFill, { width: `${pct * 100}%`, backgroundColor: exceeded ? '#F2C0B8' : '#fff' }]} /></View>
          <Text style={styles.heroSub}>{format(used)} de {format(total)} · {Math.round((total > 0 ? used / total : 0) * 100)}%</Text>
        </View>
      ) : isCC ? (
        <View style={[styles.hero, { backgroundColor: DEBT_RED }]}>
          <Text style={styles.heroLabel}>Deuda actual</Text>
          <Text style={styles.heroValue}>{format(used)}</Text>
          <View style={styles.heroTrack}><View style={[styles.heroFill, { width: `${pct * 100}%` }]} /></View>
          <Text style={styles.heroSub}>Cupo disponible: {format(Math.max(0, total - used))} de {format(total)}</Text>
        </View>
      ) : (
        <View style={[styles.hero, { backgroundColor: DEBT_RED }]}>
          <Text style={styles.heroLabel}>Saldo total</Text>
          <Text style={styles.heroValue}>{format(total)}</Text>
          <Text style={styles.heroSub}>{DEBT_LABELS[item.type] || item.type || ''}</Text>
        </View>
      )}

      {/* Metadatos (grilla) */}
      <View style={styles.metaGrid}>
        {meta.map((m) => (
          <View key={m.label} style={styles.metaCard}>
            <Text style={styles.metaLabel}>{m.label}</Text>
            <Text style={styles.metaValue}>{m.value}</Text>
          </View>
        ))}
      </View>

      {/* Nota */}
      {item.notes ? (
        <View style={styles.noteCard}>
          <Text style={styles.metaLabel}>Nota</Text>
          <Text style={styles.noteText}>{item.notes}</Text>
        </View>
      ) : null}

      {/* Tarjeta de crédito: avance / abono + planes de cuotas */}
      {isCC && (
        <>
          <View style={styles.ccActions}>
            <TouchableOpacity style={styles.ccBtn} onPress={() => { setCcModal('payment'); setCcAmount(''); }}>
              <MaterialIcons name="savings" size={18} color="#fff" />
              <Text style={styles.ccBtnText}>Abonar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ccBtn, styles.ccBtnAlt]} onPress={() => { setCcModal('advance'); setCcAmount(''); setCcAccount(accounts[0]?.id || ''); }}>
              <MaterialIcons name="local-atm" size={18} color={theme.green} />
              <Text style={[styles.ccBtnText, { color: theme.green }]}>Avance</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Compras a cuotas</Text>
          </View>
          {plans.filter((p) => !p.closed).length === 0 ? (
            <Text style={styles.emptyMov}>Sin planes activos. Paga con la tarjeta desde "+" eligiéndola en "Pagar con".</Text>
          ) : (
            plans.filter((p) => !p.closed).map((p) => {
              const paidN = Math.max(0, p.installments - Math.ceil((p.remaining || 0) / (p.installment_amount || 1)));
              return (
                <View key={p.id} style={styles.planRow}>
                  <View style={[styles.planIcon, { backgroundColor: `${p.kind === 'advance' ? theme.expense : theme.green}22` }]}>
                    <MaterialIcons name={p.kind === 'advance' ? 'local-atm' : 'shopping-bag'} size={16} color={p.kind === 'advance' ? theme.expense : theme.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planName} numberOfLines={1}>{p.notes || (p.kind === 'advance' ? 'Avance' : 'Compra')}</Text>
                    <Text style={styles.planSub}>Cuota {Math.min(paidN + 1, p.installments)} de {p.installments}{p.interest ? ' · con interés' : ''}</Text>
                  </View>
                  <Text style={styles.planAmount}>{format(Math.round(p.remaining || 0))}</Text>
                </View>
              );
            })
          )}
        </>
      )}

      {/* Inversión: aportar / retirar / dividendo / revaluar + historial */}
      {isInv && (
        <>
          <View style={styles.ccActions}>
            <TouchableOpacity style={styles.ccBtn} onPress={() => openInvModal('contribute')}>
              <MaterialIcons name="add" size={18} color="#fff" />
              <Text style={styles.ccBtnText}>Aportar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ccBtn, styles.ccBtnAlt]} onPress={() => openInvModal('withdraw')}>
              <MaterialIcons name="account-balance-wallet" size={18} color={theme.green} />
              <Text style={[styles.ccBtnText, { color: theme.green }]}>Retirar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ccActions}>
            <TouchableOpacity style={[styles.ccBtn, styles.ccBtnAlt]} onPress={() => openInvModal('dividend')}>
              <MaterialIcons name="paid" size={18} color={theme.green} />
              <Text style={[styles.ccBtnText, { color: theme.green }]}>Dividendo</Text>
            </TouchableOpacity>
            {!isFixedInv && (
              <TouchableOpacity style={[styles.ccBtn, styles.ccBtnAlt]} onPress={() => openInvModal('revalue')}>
                <MaterialIcons name="trending-up" size={18} color={theme.green} />
                <Text style={[styles.ccBtnText, { color: theme.green }]}>Revaluar</Text>
              </TouchableOpacity>
            )}
          </View>

          {isFixedInv && (
            <Text style={styles.emptyMov}>
              Renta fija: los rendimientos ({item.roi || 0}% E.A.) se causan automáticamente al abrir la app.
            </Text>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Historial de la inversión</Text>
          </View>
          {invMoves.length === 0 ? (
            <Text style={styles.emptyMov}>Sin movimientos aún. Empieza con un aporte.</Text>
          ) : (
            invMoves.map((m) => {
              const cfgMove = {
                contribution: { label: 'Aporte', icon: 'add', color: theme.green, sign: '+' },
                withdrawal: { label: 'Retiro', icon: 'account-balance-wallet', color: theme.expense, sign: '−' },
                dividend: { label: 'Dividendo', icon: 'paid', color: theme.green, sign: '+' },
                accrual: { label: 'Rendimiento', icon: 'trending-up', color: theme.green, sign: '+' },
                revalue: { label: 'Revaluación', icon: 'sync', color: theme.textSecondary, sign: '→' },
              }[m.kind] || { label: m.kind, icon: 'circle', color: theme.neutral, sign: '' };
              return (
                <View key={m.id} style={styles.planRow}>
                  <View style={[styles.planIcon, { backgroundColor: `${cfgMove.color}22` }]}>
                    <MaterialIcons name={cfgMove.icon} size={16} color={cfgMove.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planName} numberOfLines={1}>{cfgMove.label}{m.note ? ` · ${m.note}` : ''}</Text>
                    <Text style={styles.planSub}>{fmtDate(m.date)}</Text>
                  </View>
                  <Text style={[styles.planAmount, { color: cfgMove.color }]}>{cfgMove.sign} {format(Math.round(m.amount || 0))}</Text>
                </View>
              );
            })
          )}
        </>
      )}

      {/* Movimientos */}
      {cfg.showTransactions && (
        <>
          <View style={styles.movHeader}>
            <Text style={styles.sectionLabel}>Movimientos</Text>
            <TouchableOpacity style={styles.addMov} onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: cfg.addTxType })}>
              <MaterialIcons name="add" size={16} color={GREEN} />
              <Text style={styles.addMovText}>Registrar</Text>
            </TouchableOpacity>
          </View>
          {movements.length === 0 ? (
            <Text style={styles.emptyMov}>Sin movimientos aún.</Text>
          ) : (
            movements.map((t) => {
              const type = (t.type || '').toLowerCase();
              const sign = type === 'ingreso' ? '+' : '−';
              const color = type === 'ingreso' ? INCOME : type === 'gasto' ? EXPENSE : SAVING_C;
              return (
                <View key={t.id} style={styles.movRow}>
                  <View style={[styles.movIcon, { backgroundColor: (item.color || '#D9D9D9') + '33' }]}>
                    <MaterialIcons name={item.icon || 'paid'} size={18} color={item.color || '#5f6b62'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.movName} numberOfLines={1}>{t.notes || item.name}</Text>
                    <Text style={styles.movDate}>{new Date(t.date).toLocaleDateString('es-CO')}</Text>
                  </View>
                  <Text style={[styles.movAmount, { color }]}>{sign}{formatIn(t.amount, t.currency)}</Text>
                </View>
              );
            })
          )}
        </>
      )}

      {/* Acciones */}
      <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
        <Text style={styles.editText}>Editar</Text>
      </TouchableOpacity>
      {ccModal && (
        <View style={styles.ccModalCard}>
          <Text style={styles.ccModalTitle}>{ccModal === 'advance' ? 'Registrar avance' : 'Abonar a la tarjeta'}</Text>
          <Text style={styles.metaLabel}>Monto</Text>
          <TextInput
            style={styles.ccInput}
            keyboardType="numeric"
            value={ccAmount}
            onChangeText={(v) => setCcAmount(v.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            placeholderTextColor={theme.neutral}
            autoFocus
          />
          {ccModal === 'advance' && (
            <>
              <Text style={[styles.metaLabel, { marginTop: 10 }]}>Cuenta que recibe el efectivo</Text>
              <View style={styles.ccAccountRow}>
                {accounts.map((a) => {
                  const active = ccAccount === a.id;
                  return (
                    <TouchableOpacity key={a.id} style={[styles.ccAccountChip, active && styles.ccAccountChipActive]} onPress={() => setCcAccount(a.id)}>
                      <Text style={[styles.ccAccountText, active && { color: '#fff' }]}>{a.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.ccHint}>Se difiere automáticamente a 24 cuotas con interés.</Text>
            </>
          )}
          <View style={styles.ccModalActions}>
            <TouchableOpacity style={[styles.ccModalBtn, styles.ccCancel]} onPress={() => setCcModal(null)} disabled={ccBusy}>
              <Text style={styles.ccModalBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ccModalBtn, styles.ccSave, ccBusy && { opacity: 0.6 }]} onPress={submitCcModal} disabled={ccBusy}>
              <Text style={[styles.ccModalBtnText, { color: '#fff' }]}>{ccBusy ? 'Guardando…' : ccModal === 'advance' ? 'Registrar' : 'Abonar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal de operación de inversión */}
      {invModal && (
        <View style={styles.ccModalCard}>
          <Text style={styles.ccModalTitle}>
            {invModal === 'contribute' ? 'Aportar a la inversión'
              : invModal === 'withdraw' ? 'Retirar / redimir'
              : invModal === 'dividend' ? 'Registrar dividendo'
              : 'Actualizar valor de mercado'}
          </Text>
          <Text style={styles.metaLabel}>{invModal === 'revalue' ? 'Nuevo valor de mercado' : 'Monto'}</Text>
          <TextInput
            style={styles.ccInput}
            keyboardType="numeric"
            value={invAmount}
            onChangeText={(v) => setInvAmount(v.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            placeholderTextColor={theme.neutral}
            autoFocus
          />

          {invModal === 'dividend' && (
            <TouchableOpacity style={styles.invReinvestRow} onPress={() => setInvReinvest((r) => !r)}>
              <MaterialIcons name={invReinvest ? 'check-box' : 'check-box-outline-blank'} size={20} color={theme.green} />
              <Text style={styles.ccAccountText}>Reinvertir (sube el valor, no entra a una cuenta)</Text>
            </TouchableOpacity>
          )}

          {(invModal === 'contribute' || invModal === 'withdraw' || (invModal === 'dividend' && !invReinvest)) && (
            <>
              <Text style={[styles.metaLabel, { marginTop: 10 }]}>
                {invModal === 'contribute' ? 'Cuenta de origen' : 'Cuenta que recibe'}
              </Text>
              <View style={styles.ccAccountRow}>
                {accounts.map((a) => {
                  const active = invAccount === a.id;
                  return (
                    <TouchableOpacity key={a.id} style={[styles.ccAccountChip, active && styles.ccAccountChipActive]} onPress={() => setInvAccount(a.id)}>
                      <Text style={[styles.ccAccountText, active && { color: '#fff' }]}>{a.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {invModal === 'withdraw' && (
                <Text style={styles.ccHint}>Se realiza la ganancia proporcional (cuenta como ingreso).</Text>
              )}
            </>
          )}

          <View style={styles.ccModalActions}>
            <TouchableOpacity style={[styles.ccModalBtn, styles.ccCancel]} onPress={() => setInvModal(null)} disabled={invBusy}>
              <Text style={styles.ccModalBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ccModalBtn, styles.ccSave, invBusy && { opacity: 0.6 }]} onPress={submitInvModal} disabled={invBusy}>
              <Text style={[styles.ccModalBtnText, { color: '#fff' }]}>{invBusy ? 'Guardando…' : 'Confirmar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleteMutation.isPending}>
        <Text style={styles.deleteText}>Eliminar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const makeStyles = (t) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  contentDesktop: { width: '100%', maxWidth: 760, alignSelf: 'center' },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { flex: 1, fontSize: SIZES.font * 1.6, fontWeight: '600', color: t.textPrimary },

  hero: { backgroundColor: t.green, borderRadius: SIZES.radius * 1.4, padding: SIZES.padding },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLabel: { fontSize: SIZES.font * 0.9, color: 'rgba(255,255,255,0.82)' },
  heroTag: { fontSize: SIZES.font * 0.75, color: t.green, backgroundColor: t.card, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  heroValue: { fontSize: SIZES.font * 2, fontWeight: '700', color: '#fff', marginTop: 2 },
  heroTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 10, overflow: 'hidden' },
  heroFill: { height: '100%', borderRadius: 4 },
  heroSub: { fontSize: SIZES.font * 0.85, color: 'rgba(255,255,255,0.85)', marginTop: 8 },

  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  metaCard: { flexBasis: '47%', flexGrow: 1, backgroundColor: t.cardAlt, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11 },
  metaLabel: { fontSize: SIZES.font * 0.78, color: t.neutral },
  metaValue: { fontSize: SIZES.font * 0.95, color: t.textPrimary, marginTop: 2 },

  noteCard: { backgroundColor: t.card, borderRadius: 10, padding: 11, marginTop: 10 },
  noteText: { fontSize: SIZES.font * 0.95, color: t.textPrimary, marginTop: 2 },

  movHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 4 },
  sectionLabel: { fontSize: SIZES.font * 0.9, color: t.textSecondary },
  addMov: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addMovText: { fontSize: SIZES.font * 0.85, color: t.green, fontWeight: '600' },
  emptyMov: { fontSize: SIZES.font * 0.9, color: t.textSecondary, marginTop: 6 },
  movRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  movIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  movName: { fontSize: SIZES.font * 0.95, fontWeight: '500', color: t.textPrimary },
  movDate: { fontSize: SIZES.font * 0.78, color: t.textSecondary, marginTop: 2 },
  movAmount: { fontSize: SIZES.font * 0.95, fontWeight: '600' },

  ccActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  ccBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: t.green, borderRadius: SIZES.radius * 1.2, paddingVertical: 12,
  },
  ccBtnAlt: { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.green },
  ccBtnText: { color: '#fff', fontSize: SIZES.font, fontWeight: '700' },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.card, borderRadius: 10, padding: 10, marginTop: 8 },
  planIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  planName: { fontSize: SIZES.font * 0.95, fontWeight: '500', color: t.textPrimary },
  planSub: { fontSize: SIZES.font * 0.78, color: t.textSecondary, marginTop: 1 },
  planAmount: { fontSize: SIZES.font * 0.95, fontWeight: '700', color: t.textPrimary },
  ccModalCard: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: t.border },
  ccModalTitle: { fontSize: SIZES.font * 1.15, fontWeight: '700', color: t.textPrimary, marginBottom: 10, textAlign: 'center' },
  ccInput: {
    borderWidth: 1, borderColor: t.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9,
    fontSize: SIZES.font * 1.1, color: t.textPrimary, backgroundColor: t.inputBg, marginTop: 4,
  },
  ccAccountRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  ccAccountChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: t.border, backgroundColor: t.card },
  ccAccountChipActive: { backgroundColor: t.green, borderColor: t.green },
  ccAccountText: { fontSize: SIZES.font * 0.9, color: t.textSecondary, fontWeight: '600' },
  ccHint: { fontSize: SIZES.font * 0.8, color: t.neutral, marginTop: 8 },
  invReinvestRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  ccModalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  ccModalBtn: { flex: 1, paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  ccSave: { backgroundColor: t.green },
  ccCancel: { backgroundColor: t.cardAlt },
  ccModalBtnText: { fontWeight: 'bold', fontSize: 14, color: t.textPrimary },
  editBtn: { marginTop: 24, backgroundColor: t.green, borderRadius: SIZES.radius * 1.2, paddingVertical: 14, alignItems: 'center' },
  editText: { color: '#fff', fontSize: SIZES.font * 1.1, fontWeight: '700' },
  deleteBtn: { marginTop: 10, borderWidth: 1, borderColor: '#D4948C', borderRadius: SIZES.radius * 1.2, paddingVertical: 12, alignItems: 'center' },
  deleteText: { color: t.expense, fontSize: SIZES.font, fontWeight: '600' },
});

export default SingleBucketScreen;
