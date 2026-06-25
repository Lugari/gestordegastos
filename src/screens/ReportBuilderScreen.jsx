import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Alert, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import DateFilterTabs from '../components/DateFilterTabs';
import DateRangePickerModal from '../components/DateRangePickerModal';
import TypeToggle from '../components/reports/TypeToggle';
import CategoryMultiSelect from '../components/reports/CategoryMultiSelect';
import ReportSummary from '../components/reports/ReportSummary';
import ReportDetailed from '../components/reports/ReportDetailed';
import FreelancerReport from '../components/reports/FreelancerReport';

import { useGetBudgets } from '../hooks/useBudgetsData';
import { useGetSavings } from '../hooks/useSavingsData';
import { useReportData } from '../hooks/useReportData';
import { useSavedReports } from '../hooks/useSavedReports';
import { useIsDesktop } from '../hooks/useResponsive';
import { useCurrency } from '../context/CurrencyContext';
import { defaultReportConfig, freelancerConfig, REPORT_MODES, REPORT_TEMPLATES } from '../constants/reportTypes';
import { exportReport } from '../utils/reportExport';
import { COLORS, SIZES } from '../constants/theme';

const MAX_CONTENT_WIDTH = 760;
const DESKTOP_MAX = 1080;
const LEFT_COL = 300;

const notify = (title, message) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
};

const ReportBuilderScreen = () => {
  const isDesktop = useIsDesktop();
  const { width } = useWindowDimensions();

  // Ancho del área del reporte (columna derecha en escritorio).
  const reportAreaWidth = isDesktop
    ? Math.min(width, DESKTOP_MAX) - LEFT_COL - SIZES.padding * 3
    : Math.min(width, MAX_CONTENT_WIDTH) - SIZES.padding * 2;
  const chartWidth = Math.max(240, reportAreaWidth);

  const { currency } = useCurrency();

  const [config, setConfig] = useState(defaultReportConfig);
  const [rangeModalVisible, setRangeModalVisible] = useState(false);
  const [reportName, setReportName] = useState('');

  const { data: budgets = [] } = useGetBudgets();
  const { data: savings = [] } = useGetSavings();
  const { reports, saveReport, deleteReport } = useSavedReports();

  const categoryItems = useMemo(
    () => [...budgets, ...savings].map((b) => ({ id: b.id, name: b.name, color: b.color, icon: b.icon })),
    [budgets, savings],
  );

  const report = useReportData(config);
  const isFreelancer = config.template === 'freelancer';

  // Cálculo fiscal de la plantilla freelancer.
  const expenseCategories = useMemo(() => report.byCategory.filter((c) => c.type === 'gasto'), [report.byCategory]);
  const freelancer = useMemo(() => {
    const deductibleSet = new Set(config.deductibleCategoryIds);
    const deductibleTotal = expenseCategories
      .filter((c) => deductibleSet.has(c.id))
      .reduce((a, c) => a + c.total, 0);
    const grossIncome = report.totalIncome;
    const taxableBase = Math.max(0, grossIncome - deductibleTotal);
    const tax = Math.round((taxableBase * (Number(config.taxRate) || 0)) / 100);
    return { grossIncome, deductibleTotal, taxableBase, tax, afterTax: grossIncome - report.totalExpense - tax, count: report.count };
  }, [expenseCategories, config.deductibleCategoryIds, config.taxRate, report.totalIncome, report.totalExpense, report.count]);

  const periodLabel =
    config.range.preset === 'Personalizado' && config.range.start
      ? `${new Date(config.range.start).toLocaleDateString('es-CO')} — ${new Date(config.range.end).toLocaleDateString('es-CO')}`
      : config.range.preset;

  const handleExport = async (format) => {
    try {
      const taxRows = isFreelancer
        ? [
            ['Ingreso bruto', freelancer.grossIncome],
            ['Gastos deducibles', freelancer.deductibleTotal],
            ['Base gravable', freelancer.taxableBase],
            ['Tasa', `${config.taxRate}%`],
            ['Impuesto estimado', freelancer.tax],
            ['Resultado después de impuestos', freelancer.afterTax],
          ]
        : undefined;
      const title = isFreelancer ? 'Reporte freelancer (impuestos)' : 'Reporte personalizado';
      await exportReport(format, report, { title, period: periodLabel, taxRows, currency });
    } catch (e) {
      notify('No se pudo exportar', e.message || 'Error desconocido.');
    }
  };

  const patch = (changes) => setConfig((prev) => ({ ...prev, ...changes }));

  const onSelectTemplate = (value) => {
    if (value === 'freelancer') setConfig(freelancerConfig(budgets.map((b) => b.id)));
    else patch({ template: null });
  };

  const toggleDeductible = (id) =>
    setConfig((prev) => ({
      ...prev,
      deductibleCategoryIds: prev.deductibleCategoryIds.includes(id)
        ? prev.deductibleCategoryIds.filter((v) => v !== id)
        : [...prev.deductibleCategoryIds, id],
    }));

  const onSelectPreset = (value) => {
    if (value === 'Personalizado') setRangeModalVisible(true);
    else patch({ range: { preset: value, start: null, end: null } });
  };

  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      notify('Nombre requerido', 'Escribe un nombre para el reporte.');
      return;
    }
    await saveReport({ name: reportName, config });
    setReportName('');
    notify('Reporte guardado', 'Podrás re-ejecutarlo cuando quieras.');
  };

  // Re-hidrata las fechas (guardadas como ISO) y completa campos faltantes.
  const loadReport = (saved) => {
    const c = saved.config || {};
    const range = c.range?.start
      ? { ...c.range, start: new Date(c.range.start), end: new Date(c.range.end) }
      : c.range;
    setConfig({ ...defaultReportConfig(), ...c, range });
  };

  // --- Bloques de UI ---
  const controls = (
    <View style={isDesktop ? styles.leftCol : undefined}>
      <Text style={styles.section}>PLANTILLA</Text>
      <View style={styles.chipRow}>
        {REPORT_TEMPLATES.map((tpl) => {
          const active = config.template === tpl.value;
          return (
            <TouchableOpacity key={tpl.label} style={[styles.chip, active && styles.chipActive]} onPress={() => onSelectTemplate(tpl.value)}>
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{tpl.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.section}>PERÍODO</Text>
      <DateFilterTabs activeFilter={config.range.preset} onSelectFilter={onSelectPreset} showCustom />
      {config.range.preset === 'Personalizado' && config.range.start && (
        <TouchableOpacity style={styles.rangeChip} onPress={() => setRangeModalVisible(true)}>
          <Text style={styles.rangeChipText}>
            {new Date(config.range.start).toLocaleDateString('es-CO')} — {new Date(config.range.end).toLocaleDateString('es-CO')}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.section}>TIPOS</Text>
      <TypeToggle selected={config.types} onChange={(types) => patch({ types })} />

      <Text style={styles.section}>CATEGORÍAS (opcional)</Text>
      <CategoryMultiSelect items={categoryItems} selected={config.categoryIds} onChange={(categoryIds) => patch({ categoryIds })} />

      {!isFreelancer && (
        <>
          <Text style={styles.section}>MODO</Text>
          <View style={styles.chipRow}>
            {REPORT_MODES.map((m) => {
              const active = config.mode === m.value;
              return (
                <TouchableOpacity key={m.value} style={[styles.chip, active && styles.chipActive]} onPress={() => patch({ mode: m.value })}>
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {/* Reportes guardados */}
      <Text style={styles.section}>REPORTES GUARDADOS</Text>
      <View style={styles.saveRow}>
        <TextInput
          style={styles.nameInput}
          placeholder="Nombre del reporte"
          placeholderTextColor={COLORS.neutral}
          value={reportName}
          onChangeText={setReportName}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveReport}>
          <MaterialIcons name="save" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
      {reports.length === 0 ? (
        <Text style={styles.savedEmpty}>No has guardado reportes.</Text>
      ) : (
        reports.map((r) => (
          <View key={r.id} style={styles.savedRow}>
            <TouchableOpacity style={styles.savedLoad} onPress={() => loadReport(r)}>
              <MaterialIcons name="play-arrow" size={18} color={COLORS.textSecondary} />
              <Text style={styles.savedName} numberOfLines={1}>{r.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteReport(r.id)}>
              <MaterialIcons name="delete-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  const reportView = (
    <View style={isDesktop ? styles.rightCol : undefined}>
      {!isDesktop && <View style={styles.divider} />}
      <Text style={styles.currencyNote}>Mostrando en {currency}</Text>
      {isFreelancer ? (
        <FreelancerReport
          summary={freelancer}
          expenseCategories={expenseCategories}
          deductibleIds={config.deductibleCategoryIds}
          taxRate={config.taxRate}
          onToggleDeductible={toggleDeductible}
          onChangeRate={(rate) => patch({ taxRate: rate })}
        />
      ) : config.mode === 'simple' ? (
        <ReportSummary report={report} chartWidth={chartWidth} />
      ) : (
        <ReportDetailed report={report} chartWidth={chartWidth} />
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
        <Text style={styles.title}>Reporte personalizado</Text>

        {/* Exportar */}
        <View style={styles.exportRow}>
          <TouchableOpacity style={[styles.exportBtn, report.count === 0 && styles.exportBtnDisabled]} disabled={report.count === 0} onPress={() => handleExport('csv')}>
            <MaterialIcons name="table-chart" size={18} color={COLORS.textPrimary} />
            <Text style={styles.exportText}>Exportar CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, report.count === 0 && styles.exportBtnDisabled]} disabled={report.count === 0} onPress={() => handleExport('pdf')}>
            <MaterialIcons name="picture-as-pdf" size={18} color={COLORS.textPrimary} />
            <Text style={styles.exportText}>Exportar PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={isDesktop ? styles.columns : undefined}>
          {controls}
          {reportView}
        </View>
      </ScrollView>

      <DateRangePickerModal
        visible={rangeModalVisible}
        initialStart={config.range.start}
        initialEnd={config.range.end}
        onCancel={() => setRangeModalVisible(false)}
        onApply={({ start, end }) => {
          patch({ range: { preset: 'Personalizado', start, end } });
          setRangeModalVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  contentDesktop: { width: '100%', maxWidth: DESKTOP_MAX, alignSelf: 'center' },
  columns: { flexDirection: 'row', gap: SIZES.padding, alignItems: 'flex-start' },
  leftCol: { width: LEFT_COL },
  rightCol: { flex: 1 },
  title: { fontSize: SIZES.font * 1.8, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SIZES.padding },
  exportRow: { flexDirection: 'row', gap: 10, marginBottom: SIZES.padding * 0.5 },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 0.6,
  },
  exportBtnDisabled: { opacity: 0.4 },
  exportText: { fontSize: SIZES.font, fontWeight: 'bold', color: COLORS.textPrimary },
  section: { fontSize: SIZES.font, fontWeight: 'bold', color: COLORS.neutral, marginTop: SIZES.padding * 1.5, marginBottom: SIZES.base },
  rangeChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '40',
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding * 0.4,
    marginTop: 8,
  },
  rangeChipText: { fontSize: SIZES.font * 0.95, color: COLORS.textSecondary, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipLabel: { fontSize: SIZES.font, color: COLORS.textSecondary, fontWeight: '600' },
  chipLabelActive: { color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.lightGray, marginTop: SIZES.padding * 1.5 },
  currencyNote: {
    fontSize: SIZES.font * 0.85,
    color: COLORS.neutral,
    fontWeight: '600',
    marginTop: SIZES.padding,
    marginBottom: SIZES.base,
  },
  saveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.neutral,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding * 0.6,
    paddingVertical: 8,
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
    backgroundColor: '#fff',
  },
  saveBtn: { backgroundColor: COLORS.secondary, borderRadius: SIZES.radius, padding: 10 },
  savedEmpty: { fontSize: SIZES.font * 0.9, color: COLORS.textSecondary, marginTop: 6 },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  savedLoad: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  savedName: { flex: 1, fontSize: SIZES.font, color: COLORS.textPrimary },
});

export default ReportBuilderScreen;
