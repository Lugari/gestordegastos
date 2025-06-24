import React, { useState, useEffect } from 'react';
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
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';


const AddTransactionForm = ({ onCancel, onSubmit, budgets, savings, transactionToEdit }) => {

  const route = useRoute();

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    type: route.params?.transactionType || 'gasto',
    account:'',
    amount: '',
    notes: '',
    date: new Date(),
    budget_id: '',
    icon: '',
    color: '#b1c3cb',
  });
  
  
  // Si hay una transacción pasada, cargar sus datos
  useEffect(() => {
    if (transactionToEdit) {
      console.log("Cargando datos para edición:", transactionToEdit);
      setFormData({
        type: transactionToEdit.type,
        account: transactionToEdit.account,
        amount: transactionToEdit.amount?.toString(), 
        notes: transactionToEdit.notes,
        date: new Date(transactionToEdit.date),
        budget_id: transactionToEdit.budget_id,
        icon: transactionToEdit.icon, 
        color: transactionToEdit.color || '#b1c3cb',
    
      });
      setIsEditing(true);
    }
  }, [transactionToEdit]);


  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const setRelativeDate = (daysAgo) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - daysAgo);
    handleInputChange('date', newDate);
  };

  const formatCurrency = (value) => {
  const number = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value;
  if (isNaN(number)) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(number);
};

const handleCurrencyInput = (text) => {
  const numericValue = parseInt(text.replace(/\D/g, '')); // Remove non-numeric
  if (!isNaN(numericValue)) {
    handleInputChange('amount', numericValue); // Save the clean value
  } else {
    handleInputChange('amount', 0);
  }
};

  const handleSubmit = async () => {
    if (!formData.type || !formData.amount) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (isNaN(formData.amount) || formData.amount <= 0) {
      Alert.alert('Monto Inválido', 'Por favor, ingresa un monto total válido.');
      return;
    }

    const transactionData = {
      type: formData.type.toLowerCase(),
      account: formData.account,
      amount: parseFloat(formData.amount),
      notes: formData.notes.trim(),
      date: formData.date.toISOString(),
      budget_id: formData.budget_id,
      icon: formData.icon,
      color: formData.color
    }

    await onSubmit(transactionData)
 
    setFormData({
      type: 'gasto',
      account:'',
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
        value={formatCurrency(formData.amount)}
        onChangeText={(value) => handleCurrencyInput(value)}
      />

      <Text style={styles.sectionTitle}>Categoria</Text>
      
      
      <View style={styles.budgetsContainer}>
  {formData.type.toLowerCase() === 'gasto' ? ( // Convertir a minúscula para comparación robusta
    // --- SECCIÓN PARA GASTOS (mostrar presupuestos) ---
    budgets.map((budget) => (
      <TouchableOpacity
        key={budget.id}
        style={[
          styles.budgetIconWrapper,
          formData.budget_id === budget.id && { backgroundColor: budget.selectedColor },
        ]}
        onPress={() => {
          handleInputChange('budget_id', budget.id);
          handleInputChange('icon', budget.selectedIcon);
          handleInputChange('color', budget.selectedColor);
        }}
      >
        <MaterialIcons name={budget.selectedIcon} size={28} color="#5f5a67" />
        <Text style={styles.budgetLabel}>{budget.name}</Text>
      </TouchableOpacity>
    ))
  ) : formData.type.toLowerCase() === 'ingreso' ? (
    // Por ahora, solo un texto ya que es una cuenta principal.
    // Más adelante, mapear un array de 'accounts' similar a 'budgets'.
    <View style={styles.accountSelectionPlaceholder}>
      <Text>Ingreso a Cuenta Principal</Text>
      {/* Aquí podrías tener un selector si tuvieras múltiples cuentas */}
      {/* Por ejemplo, si tuvieras un estado 'selectedAccountId' y un array 'accounts' */}
      <TouchableOpacity onPress={() => handleInputChange('account', 'ID_CUENTA_PRINCIPAL')}> 
        <Text>Cuenta Principal</Text> 
      </TouchableOpacity> 
    </View>
  ) : formData.type.toLowerCase() === 'ahorro' ? (
    <View style={styles.accountSelectionPlaceholder}>
      <Text>Selecciona tu Objetivo de Ahorro</Text>
        {
          savings.map((saving) => (
            <TouchableOpacity
              key={saving.id}
              style={[
                styles.budgetIconWrapper,
                formData.budget_id === saving.id && { backgroundColor: saving.selectedColor },
              ]}
              onPress={() => {
                handleInputChange('budget_id', saving.id);
                handleInputChange('icon', saving.selectedIcon);
                handleInputChange('color', saving.selectedColor);
        }}
      >
        <MaterialIcons name={saving.selectedIcon} size={28} color="#5f5a67" />
        <Text style={styles.budgetLabel}>{saving.name}</Text>
      </TouchableOpacity>
    ))
        }
    </View>
  ) : null /* O <></> o <View /> si no quieres mostrar nada para otros tipos */}
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
        value={formData.notes}
        onChangeText={(value) => handleInputChange('notes', value)}
      />

      <View style={styles.buttonRow}>
        <PrimaryButton title={isEditing ? 'Actualizar': 'Añadir'} onPress={handleSubmit} />
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

budgetLabel: {
  fontSize: 12,
  marginTop: 4,
  textAlign: 'center',
  color: '#333',
},
});

export default AddTransactionForm;
