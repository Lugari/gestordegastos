import React, { useCallback } from 'react'
import { StyleSheet, ScrollView, Alert } from 'react-native'
import { useRoute } from '@react-navigation/native'

import { useManageBudgets, useGetBudgets } from '../hooks/useBudgetsData'
import { useManageTransactions } from '../hooks/useTransactionData'


import { useNavigation } from '@react-navigation/native'


import SingleTransactionCard from '../components/transactions/SingleTransactionCard' // ajusta la ruta si es necesario

const SingleTransactionScreen = () => {

  const route = useRoute()
  const { transaction, categoryName, categoryIcon, categoryColor } = route.params

  const { deleteTransaction } = useManageTransactions()
  const { updateBudget } = useManageBudgets()
  const { data: budgets = [], isLoading: isLoadingBudgets, error: budgetsError, refetch: refetchBudgets } = useGetBudgets()

  const navigation = useNavigation() 

  const handleDelete = useCallback(async () => {

    Alert.alert( 
            'Eliminar Transacción',
            `¿Estás seguro de que quieres eliminar el Transacción? Esta acción no se puede deshacer.`,
            [
                { text: 'cancelar', style: 'cancel'},
                { text: 'Eliminar', syle: 'destructive', onPress: async ()=> {
                    
                  try { 
                    await deleteTransaction({
                      transactionId: transaction.id,
                      budgetId: transaction.budget_id,
                      amount: transaction.amount,
                      type: transaction.type,
                    })
                    navigation.popTo('TransactionHistoryScreen')
                    return
                  } catch (error) {
                    console.error('Error deleting transaction:', error)
                  }

                }}
            ]
        )
  }, [transaction, deleteTransaction, updateBudget, budgets, navigation])
 
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SingleTransactionCard
        id={transaction.id}
        amount={transaction.amount}
        type={transaction.type}
        budget={categoryName}
        date={transaction.date}
        icon={categoryIcon}
        color={categoryColor}

        notes={transaction.notes}
        onEdit={() => {navigation.navigate('AddTransactionScreen', {transaction})}}
        onDelete={() => {handleDelete()}}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
})

export default SingleTransactionScreen
