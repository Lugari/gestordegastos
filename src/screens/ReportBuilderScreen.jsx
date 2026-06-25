import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Alert, useWindowDimensions } from 'react-native';
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
import { useIsDesktop } from '../hooks/useResponsive';
import { defaultReportConfig, freelancerConfig, REPORT_MODES, REPORT_TEMPLATES } from '../constants/reportTypes';
import { exportReport } from '../utils/reportExport';
import { COLORS, SIZES } from '../constants/theme';

const MAX_CONTENT_WIDTH = 760;

// Feedback multiplataforma (Alert.alert es no-op en react-native-web).
const notify = (title, message) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
};

const money = (n) => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('es-CO');

const ReportBuilderScreen = () => {
  const isDesktop = useIsDesktop();
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width, MAX_CONTENT_WIDTH) - SIZES.padding * 2;

  const [config, setConfig] = useState(defaultReportConfig);
  const [rangeModalVisible, setRangeModalVisible] = useState(false);

  const { data: budgets = [] } = useGetBudgets();
  const { data: savings = [] } = useGetSavings();

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
    return {
      grossIncome,
      deductibleTotal,
      taxableBase,
      tax,
      afterTax: grossIncome - report.totalExpense - tax,
      count: report.count,
    };
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
      await exportReport(format, report, { title, period: periodLabel, taxRows });
    } catch (e) {
      notify('No se pudo exportar', e.message || 'Error desconocido.');
    }
  };

  const patch = (changes) => setConfig((prev) => ({ ...prev, ...changes }));

  const onSelectTemplate = (value) => {
    if (value === 'freelancer') {
      // Por defecto, todas las categorías de gasto se marcan como deducibles.
      setConfig(freelancerConfig(budgets.map((b) => b.id)));
    } else {
      patch({ template: null });
    }
  };

  const toggleDeductible = (id) =>
    setConfig((prev) => ({
      ...prev,
      deductibleCategoryIds: prev.deductibleCategoryIds.includes(id)
        ? prev.deductibleCategoryIds.filter((v) => v !== id)
        : [...prev.deductibleCategoryIds, id],
    }));

  const onSelectPreset = (value) => {
    if (value === 'Personalizado') {
      setRangeModalVisible(true);
    } else {
      patch({ range: { preset: value, start: null, end: null } });
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
        <Text style={styles.title}>Reporte personalizado</Text>

        {/* Exportar */}
        <View style={styles.exportRow}>
          <TouchableOpacity
            style={[styles.exportBtn, report.count === 0 && styles.exportBtnDisabled]}
            disabled={report.count === 0}
            onPress={() => handleExport('csv')}
          >
            <MaterialIcons name="table-chart" size={18} color={COLORS.textPrimary} />
            <Text style={styles.exportText}>Exportar CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportBtn, report.count === 0 && styles.exportBtnDisabled]}
            disabled={report.count === 0}
            onPress={() => handleExport('pdf')}
          >
            <MaterialIcons name="picture-as-pdf" size={18} color={COLORS.textPrimary} />
            <Text style={styles.exportText}>Exportar PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Plantilla */}
        <Text style={styles.section}>PLANTILLA</Text>
        <View style={styles.modeRow}>
          {REPORT_TEMPLATES.map((tpl) => {
            const active = config.template === tpl.value;
            return (
              <TouchableOpacity
                key={tpl.label}
                style={[styles.modeChip, active && styles.modeChipActive]}
                onPress={() => onSelectTemplate(tpl.value)}
              >
                <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{tpl.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Período */}
        <Text style={styles.section}>PERÍODO</Text>
        <DateFilterTabs activeFilter={config.range.preset} onSelectFilter={onSelectPreset} showCustom />
        {config.range.preset === 'Personalizado' && config.range.start && (
          <TouchableOpacity style={styles.rangeChip} onPress={() => setRangeModalVisible(true)}>
            <Text style={styles.rangeChipText}>
              {new Date(config.range.start).toLocaleDateString('es-CO')} —{' '}
              {new Date(config.range.end).toLocaleDateString('es-CO')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Tipos */}
        <Text style={styles.section}>TIPOS</Text>
        <TypeToggle selected={config.types} onChange={(types) => patch({ types })} />

        {/* Categorías */}
        <Text style={styles.section}>CATEGORÍAS (opcional)</Text>
        <CategoryMultiSelect
          items={categoryItems}
          selected={config.categoryIds}
          onChange={(categoryIds) => patch({ categoryIds })}
        />

        {/* Modo (oculto con la plantilla freelancer, que define su propia vista) */}
        {!isFreelancer && (
          <>
            <Text style={styles.section}>MODO</Text>
            <View style={styles.modeRow}>
              {REPORT_MODES.map((m) => {
                const active = config.mode === m.value;
                return (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.modeChip, active && styles.modeChipActive]}
                    onPress={() => patch({ mode: m.value })}
                  >
                    <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Reporte en vivo */}
        <View style={styles.divider} />
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
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  contentDesktop: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  title: {
    fontSize: SIZES.font * 1.8,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.padding,
  },
  exportRow: {
    flexDirection: 'row',
    gap: 10,
  },
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
  exportBtnDisabled: {
    opacity: 0.4,
  },
  exportText: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  section: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.neutral,
    marginTop: SIZES.padding * 1.5,
    marginBottom: SIZES.base,
  },
  rangeChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '40',
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding * 0.4,
    marginTop: 8,
  },
  rangeChipText: {
    fontSize: SIZES.font * 0.95,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeChip: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  modeChipActive: {
    backgroundColor: COLORS.primary,
  },
  modeLabel: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modeLabelActive: {
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginTop: SIZES.padding * 1.5,
  },
  summary: {
    marginTop: SIZES.padding * 1.5,
    backgroundColor: '#fff',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  summaryCount: {
    fontSize: SIZES.font * 1.1,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryItem: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  summaryNet: {
    fontSize: SIZES.font * 1.2,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  note: {
    marginTop: SIZES.padding,
    fontSize: SIZES.font * 0.9,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

export default ReportBuilderScreen;
