import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';

import DateFilterTabs from '../components/DateFilterTabs';
import DateRangePickerModal from '../components/DateRangePickerModal';
import TypeToggle from '../components/reports/TypeToggle';
import CategoryMultiSelect from '../components/reports/CategoryMultiSelect';
import ReportSummary from '../components/reports/ReportSummary';
import ReportDetailed from '../components/reports/ReportDetailed';

import { useGetBudgets } from '../hooks/useBudgetsData';
import { useGetSavings } from '../hooks/useSavingsData';
import { useReportData } from '../hooks/useReportData';
import { useIsDesktop } from '../hooks/useResponsive';
import { defaultReportConfig, REPORT_MODES } from '../constants/reportTypes';
import { COLORS, SIZES } from '../constants/theme';

const MAX_CONTENT_WIDTH = 760;

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

  const patch = (changes) => setConfig((prev) => ({ ...prev, ...changes }));

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

        {/* Modo */}
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

        {/* Reporte en vivo según el modo */}
        <View style={styles.divider} />
        {config.mode === 'simple' ? (
          <ReportSummary report={report} chartWidth={chartWidth} />
        ) : (
          <ReportDetailed report={report} chartWidth={chartWidth} />
        )}

        <Text style={styles.note}>La exportación (CSV/PDF) llega en la siguiente fase.</Text>
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
