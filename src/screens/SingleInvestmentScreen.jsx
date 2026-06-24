import { useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import SingleInvestmentCard from '../components/investments/SingleInvestmentCard';
import { useManageInvestments } from '../hooks/useInvestmentsData';
import { useIsDesktop } from '../hooks/useResponsive';

const SingleInvestmentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();

  const { deleteInvestment } = useManageInvestments();
  const { investment } = route.params;

  const handleDelete = useCallback(async () => {
    Alert.alert(
      'Eliminar Inversión',
      `¿Estás seguro de que quieres eliminar la inversión "${investment.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInvestment(investment.id);
              navigation.goBack();
            } catch (e) {
              console.log('Error al eliminar la inversión', e);
            }
          },
        },
      ],
    );
  }, [investment, deleteInvestment, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
        <SingleInvestmentCard
          investment={investment}
          onEdit={() => navigation.navigate('AddInvestmentScreen', { toEdit: investment })}
          onDelete={handleDelete}
        />
      </ScrollView>
    </View>
  );
};

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

export default SingleInvestmentScreen;
