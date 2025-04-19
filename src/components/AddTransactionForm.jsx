import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TransactionTypeDropdown from './TransactionTypeDropdown';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';



const AddTransactionForm = ({ onCancel }) => {
  const { addTransaction } = useTransactions();
  const route = useRoute();

  const { budgets, updateBudget } = useBudgets();
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);

  const [formData, setFormData] = useState({
    type: route.params?.transactionType || 'GASTO',
    amount: '',
    note: '',
    date: new Date(),
    color: '#b1c3cb',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const setRelativeDate = (daysAgo) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - daysAgo);
    handleInputChange('date', newDate);
  };

  const handleSubmit = () => {
    if (!formData.type || !formData.amount) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    addTransaction({
      type: formData.type,
      amount: parseFloat(formData.amount),
      note: formData.note,
      date: formData.date.toISOString(),
      icon: formData.icon,
      color: formData.color,
      budget_id: selectedBudgetId,
    });

    console.log(formData)

    const usedBudget = budgets.find(b => b.id === selectedBudgetId)
    if (usedBudget) {
      usedBudget.used += parseFloat(formData.amount);
      usedBudget.updated_at = new Date().toISOString();
    }

    // Guardar el presupuesto actualizado

    updateBudget(selectedBudgetId, usedBudget);
    console.log('Presupuesto actualizado con éxito.');



    

    alert('Transacción añadida con éxito.');
    setFormData({
      type: 'INGRESO',
      amount: '',
      note: '',
      date: new Date(),
      icon: '',
      color: '#b1c3cb',
      budget_id: null,
    });
  };

  const formattedDate = formData.date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Tipo de Transacción</Text>
      <TransactionTypeDropdown 
        selected={formData.type} 
        onSelect={(newType) => handleInputChange('type', newType)}
      />

      <Text style={styles.sectionTitle}>Monto</Text>
      <TextInput
        placeholder="Monto"
        keyboardType="numeric"
        style={styles.input}
        value={formData.amount}
        onChangeText={(value) => handleInputChange('amount', value)}
      />

      <Text style={styles.sectionTitle}>Presupuesto</Text>
      
      
      <View style={styles.budgetsContainer}>
  {budgets.map((budget) => (
    <TouchableOpacity
      key={budget.id}
      style={[
        styles.budgetIconWrapper,
        selectedBudgetId === budget.id && { backgroundColor: budget.selectedColor },
      ]}
      onPress={() => {
        setSelectedBudgetId(budget.id);
        handleInputChange('icon', budget.selectedIcon); // opcional
        handleInputChange('color', budget.selectedColor); // opcional
      }}
    >
      <MaterialIcons name={budget.selectedIcon} size={28} color="#5f5a67" />
      <Text style={styles.budgetLabel}>{budget.name}</Text>
    </TouchableOpacity>
  ))}
</View>




      <Text style={styles.sectionTitle}>Fecha</Text>
      <View style={styles.dateButtonsRow}>
        <TouchableOpacity onPress={() => setRelativeDate(0)} style={styles.dateQuickBtn}>
          <Text style={styles.dateQuickBtnText}>Hoy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRelativeDate(1)} style={styles.dateQuickBtn}>
          <Text style={styles.dateQuickBtnText}>Ayer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRelativeDate(2)} style={styles.dateQuickBtn}>
          <Text style={styles.dateQuickBtnText}>Anteayer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <MaterialIcons name="calendar-month" size={24} color="#5f5a67" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) handleInputChange('date', selectedDate);
            }}
          />
        )}
      </View>
      <Text style={styles.dateText}>Seleccionada: {formattedDate}</Text>

      <Text style={styles.sectionTitle}>Notas</Text>
      <TextInput
        placeholder="Notas..."
        multiline
        numberOfLines={4}
        style={styles.noteInput}
        value={formData.note}
        onChangeText={(value) => handleInputChange('note', value)}
      />

      <View style={styles.buttonRow}>
        <PrimaryButton title="Añadir Transacción" onPress={handleSubmit} />
        <SecondaryButton title="Cancelar" onPress={onCancel} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5f5a67',
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cdd1c5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dateButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dateQuickBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f3f2',
    borderRadius: 8,
  },
  dateQuickBtnText: {
    color: '#333',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 12,
    textAlign: 'center',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#cdd1c5',
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  budgetsContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12,
  justifyContent: 'space-between',
  marginBottom: 10,
},

budgetIconWrapper: {
  alignItems: 'center',
  padding: 8,
  borderRadius: 10,
  backgroundColor: '#f1f1f1',
  width: '30%',
},

//budgetIconSelected: {
//  backgroundColor: '#D0E8FF',
//},

budgetLabel: {
  fontSize: 12,
  marginTop: 4,
  textAlign: 'center',
  color: '#333',
},
});

export default AddTransactionForm;
