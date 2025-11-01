import { View, Text, StyleSheet } from 'react-native';

import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import BudgetProgressCard from '../budgets/BudgetProgressCard';


import {COLORS, SIZES} from '../../constants/theme'
import { MaterialIcons } from '@expo/vector-icons';

const SingleCategoryCard = ({
    category,
    onEdit,
    onDelete,
}) => {

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const calculateScheduledSaving = (time) => {
        const now = new Date();
        const deadline = new Date(category.deadline);
        const timeDiff = deadline - now;
        const daysLeft = timeDiff / (1000 * 60 * 60 * 24);
        const weeksLeft = timeDiff / (1000 * 60 * 60 * 24 * 7);
        const monthsLeft = timeDiff / (1000 * 60 * 60 * 24 * 30);

        if (time === 'daily') {
            return Math.ceil((category.total - category.used) / daysLeft);
        } else if (time === 'weekly') {
            return Math.ceil((category.total - category.used) / weeksLeft);
        } else if (time === 'monthly') {
            return Math.ceil((category.total - category.used) / monthsLeft);
        }
    };

    // Render for BUDGETS
    if (category.subCategory === 'budgets') {
        return (
            <View style={styles.card}>
                <BudgetProgressCard
                    title={category.name}
                    used={category.used || 0}
                    total={category.total}
                    color={category.color}
                />

                {category.used > category.total && (
                    <View style={styles.warningContainer}>
                        <MaterialIcons name="report-problem" size={24} color={COLORS.danger} />
                        <Text style={styles.warningText}>¡Presupuesto excedido!</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PERIODO</Text>
                    <Text style={styles.sectionValue}>{category.period}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FECHA DE INICIO</Text>
                    <View style={styles.iconRow}>
                        <MaterialIcons name="calendar-month" size={18} color="#000" />
                        <Text style={styles.sectionValue}>{formatDate(category.date || category.created_at)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ULTIMA ACTUALIZACIÓN</Text>
                    <View style={styles.iconRow}>
                        <MaterialIcons name="calendar-month" size={18} color="#000" />
                        <Text style={styles.sectionValue}>{formatDate(category.updated_at)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DESCRIPCIÓN</Text>
                    <Text style={styles.description}>{category.notes}</Text>
                </View>

                <View style={styles.buttonRow}>
                    <PrimaryButton title="Editar" onPress={onEdit} />
                    <SecondaryButton title="Eliminar" onPress={onDelete} />
                </View>
            </View>
        );
    }

    // Render for SAVINGS
    if (category.subCategory === 'savings') {
        return (
            <View style={styles.card}>
                <BudgetProgressCard
                    title={category.name}
                    used={category.used || 0}
                    total={category.total}
                    color={category.color}
                />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>AHORRO MÍNIMO</Text>

                    <View style={styles.row}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Diario:</Text>
                            <View style={styles.iconRow}>
                                <Text style={[styles.sectionValue, styles.boldValue]}>
                                    ${calculateScheduledSaving('daily').toLocaleString('es-CO')}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Semanal:</Text>
                            <View style={styles.iconRow}>
                                <Text style={[styles.sectionValue, styles.boldValue]}>
                                    ${calculateScheduledSaving('weekly').toLocaleString('es-CO')}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Mensual:</Text>
                            <View style={styles.iconRow}>
                                <Text style={[styles.sectionValue, styles.boldValue]}>
                                    ${calculateScheduledSaving('monthly').toLocaleString('es-CO')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={styles.section}>
                    Te faltan <Text style={styles.highlightText}>
                        ${(category.total - category.used).toLocaleString('es-CO')}
                    </Text> para cumplir tu meta de ahorro!
                </Text>

                <View style={styles.row}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INICIO</Text>
                        <View style={styles.iconRow}>
                            <MaterialIcons name="calendar-month" size={18} color="#000" />
                            <Text style={styles.sectionValue}>{formatDate(category.created_at)}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ÚLTIMA ACTUALIZACIÓN</Text>
                        <View style={styles.iconRow}>
                            <MaterialIcons name="calendar-month" size={18} color="#000" />
                            <Text style={styles.sectionValue}>{formatDate(category.updated_at)}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>PLAZO MÁXIMO</Text>
                        <View style={styles.iconRow}>
                            <MaterialIcons name="calendar-month" size={18} color="#000" />
                            <Text style={styles.sectionValue}>{formatDate(category.deadline)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DESCRIPCIÓN</Text>
                    <Text style={styles.description}>{category.notes}</Text>
                </View>

                <View style={styles.buttonRow}>
                    <PrimaryButton title="Editar" onPress={onEdit} />
                    <SecondaryButton title="Eliminar" onPress={onDelete} />
                </View>
            </View>
        );
    }

    // Render for DEBTS
    if (category.subCategory === 'debts') {
        return (
            <View style={styles.card}>
                <Text style={styles.title}>{category.name.toUpperCase()}</Text>
                <Text style={styles.debtAmount}>${category.total.toLocaleString('es-CO')}</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TIPO</Text>
                    <Text style={styles.sectionValue}>{category.type}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>APR</Text>
                    <Text style={styles.sectionValue}>{category.apr}%</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CUOTAS</Text>
                    <Text style={styles.sectionValue}>{category.fees}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FECHA DE INICIO</Text>
                    <View style={styles.iconRow}>
                        <MaterialIcons name="calendar-month" size={18} color="#000" />
                        <Text style={styles.sectionValue}>{formatDate(category.created_at)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DESCRIPCIÓN</Text>
                    <Text style={styles.description}>{category.notes}</Text>
                </View>

                <View style={styles.buttonRow}>
                    <PrimaryButton title="Editar" onPress={onEdit} />
                    <SecondaryButton title="Eliminar" onPress={onDelete} />
                </View>
            </View>
        );
    }

    // Default render if no subCategory match
    return (
        <View style={styles.card}>
            <Text style={styles.sectionValue}>Tipo de categoría no reconocido</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.background,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        elevation: 3,
        width: '100%',
    },
    title: {
        fontWeight: 'bold',
        fontSize: SIZES.font * 1.5,
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    debtAmount: {
        fontSize: SIZES.font * 2,
        fontWeight: 'bold',
        color: COLORS.danger || '#e74c3c',
        marginBottom: SIZES.padding,
    },
    section: {
        marginTop: 20,
        fontSize: SIZES.font,
    },
    sectionTitle: {
        color: '#888A3E',
        fontWeight: 'bold',
        fontSize: 12,
    },
    sectionValue: {
        fontSize: SIZES.font,
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    description: {
        marginTop: 6,
        fontSize: SIZES.font,
        color: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        gap: 12,
    },
    warningContainer: {
        marginTop: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    warningText: {
        color: COLORS.danger || '#e74c3c',
        fontSize: SIZES.font,
    },
    boldValue: {
        fontSize: SIZES.font * 1.3,
        fontWeight: '600',
    },
    highlightText: {
        fontSize: SIZES.font * 1.2,
        fontWeight: 'bold',
    },
});

export default SingleCategoryCard;