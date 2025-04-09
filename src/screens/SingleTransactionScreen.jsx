import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';



import SingleTransactionCard from '../components/SingleTransactionCard'; // ajusta la ruta si es necesario

const SingleTransactionScreen = () => {

  const route = useRoute();
  const { transaction } = route.params;
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SingleTransactionCard
        amount={transaction.amount}
        type={transaction.type}
        category={transaction.category}
        date={transaction.date}
        description={transaction.description}
        onEdit={() => console.log('Editar transacción')}
        onDelete={() => console.log('Eliminar transacción')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
});

export default SingleTransactionScreen;
