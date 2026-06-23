import { useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import SingleDebtCard from '../components/debts/SingleDebtCard';
import { useManageDebts } from '../hooks/useDebtsData';
import { useIsDesktop } from '../hooks/useResponsive';

const SingleDebtScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const isDesktop = useIsDesktop();
    const { deleteDebt } = useManageDebts();
    const { debt } = route.params;

    const handleDelete = useCallback(async () => {
        Alert.alert(
            'Eliminar Deuda',
            `¿Estás seguro de que quieres eliminar la deuda "${debt.name}"? Esta acción no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar', style: 'destructive', onPress: async () => {
                        try {
                            await deleteDebt(debt.id);
                            navigation.goBack();
                            console.log("Deuda eliminada:", debt.name);
                        } catch (error) {
                            console.log("Error al eliminar la deuda", error);
                        }
                    }
                }
            ]
        )
    }, [debt, deleteDebt, navigation]);

    return (
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
                <SingleDebtCard
                    debt={debt}
                    onEdit={() => navigation.navigate('AddDebtScreen', { toEdit: debt })}
                    onDelete={handleDelete}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingVertical: 24,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        flexGrow: 1,
    },
    contentDesktop: {
        width: '100%',
        maxWidth: 640,
        alignSelf: 'center',
    },
});

export default SingleDebtScreen;