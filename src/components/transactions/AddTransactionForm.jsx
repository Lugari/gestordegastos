import React, { useState, useEffect, useMemo } from 'react';
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
import { SIZES, COLORS } from '../../constants/theme';


const AddTransactionForm = ({ onCancel, onSubmit, budgets, savings, transactionToEdit }) => {

  const route = useRoute();

  const [isEditing, setIsEditing] = useState(false);
  const [activeDate, setActiveDate] = useState(0); // 'Hoy' es el botón activo por defecto


  const [showAllCategories, setShowAllCategories] = useState(false)

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

   const visibleCategory = useMemo(() => {
    if (showAllCategories){
      if(formData.type === 'gasto'){
        return budgets
      }else if(formData.type === 'ahorro' ){
        return savings
      }
    }else if (!showAllCategories){
      if(formData.type === 'gasto'){
        return budgets.slice(0,2)
      }else if(formData.type === 'ahorro' ){
        return savings.slice(0,2)
      }
    }
  })
  
  
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
    setActiveDate(daysAgo); // Actualiza el botón activo
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
      notes: '',
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
      <View pointerEvents={transactionToEdit ? 'none' : 'auto'}>
        <TransactionTypeDropdown 
          selected={formData.type} 
          onPress={(newType) => handleInputChange('type', newType)} 
        />
        {transactionToEdit && <View style={styles.disabledOverlay}/>}
      </View>

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
        {formData.type.toLowerCase() === 'gasto' && ( 
          // --- SECCIÓN PARA GASTOS (mostrar presupuestos) ---
          <>
            {
              visibleCategory.map((budget) => (
                <TouchableOpacity
                  key={budget.id}
                  style={[
                    styles.budgetIconWrapper,
                    formData.budget_id === budget.id && { backgroundColor: budget.color },
                  ]}
                  onPress={() => {
                    handleInputChange('budget_id', budget.id);
                    handleInputChange('icon', budget.icon);
                    handleInputChange('color', budget.color);
                  }}
                >
                  <MaterialIcons name={budget.icon} size={28} color="#5f5a67" />
                  <Text style={styles.budgetLabel}>{budget.name}</Text>
                </TouchableOpacity>
              
              ))             
            }
            {
              budgets.length > 2 && (
                <TouchableOpacity style={styles.showMoreButton} onPress={()=> setShowAllCategories(!showAllCategories)}>
                  <MaterialIcons name={showAllCategories ? "navigate-before" : "add"} size={28} color={COLORS.textPrimary}/>
                  <Text style={styles.budgetLabel}>{showAllCategories ? "Ver menos" : "Ver más"}</Text>
                </TouchableOpacity>
            )}
          </>
          )
        }
            
        {formData.type.toLowerCase() === 'ingreso' && (
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
            ) 
        }
        
        {formData.type.toLowerCase() === 'ahorro' && (
          <View style={styles.budgetsContainer}>
            {
              visibleCategory.map((saving) => (
                <TouchableOpacity
                  key={saving.id}
                  style={[
                    styles.budgetIconWrapper,
                    formData.budget_id === saving.id && { backgroundColor: saving.color },
                  ]}
                  onPress={() => {
                    handleInputChange('budget_id', saving.id);
                    handleInputChange('icon', saving.icon);
                    handleInputChange('color', saving.color);
                  }}
                >
            <MaterialIcons name={saving.icon} size={28} color="#5f5a67" />
            <Text style={styles.budgetLabel}>{saving.name}</Text>
            </TouchableOpacity>
            ))}
              {savings.length > 2 && (
                <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAllSavings(true)}>
                    <MaterialIcons name={showAllCategories ? "navigate-before" : "add"} size={28} color="#5f5a67" />
                    <Text style={styles.budgetLabel}>{showAllCategories ? "Ver menos" : "Ver más"}</Text>
                </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/** SELECCIONAR FECHA */}

      <Text style={styles.sectionTitle}>Fecha</Text>
      <View style={styles.dateButtonsRow}>

         {[ { label: 'Hoy', daysAgo: 0 },
            { label: 'Ayer', daysAgo: 1 },
            { label: 'Anteayer', daysAgo: 2 },].map((buttonInfo) => (
          <TouchableOpacity
            key={buttonInfo.label}
            onPress={() => setRelativeDate(buttonInfo.daysAgo)}
            style={[
              styles.dateQuickBtn,
              activeDate === buttonInfo.daysAgo && styles.dateQuickBtn_selected,
            ]}
          >
            <Text
              style={[
                styles.dateQuickBtnText,
                activeDate === buttonInfo.daysAgo && styles.activeBtnText,
              ]}
            >
              {buttonInfo.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <MaterialIcons name="calendar-month" size={32} color="#5f5a67" />
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
      <Text style={styles.dateText}>Fecha: {formattedDate}</Text>

      <Text style={styles.sectionTitle}>Notas</Text>
      <TextInput
        placeholder="Descripción..."
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
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  sectionTitle: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.6,
    backgroundColor: COLORS.background,
  },
  dateButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dateQuickBtn: {
    paddingVertical: SIZES.padding * 0.5,
    paddingHorizontal: SIZES.padding * 0.66,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius * 0.8,
  },
  dateQuickBtn_selected: {
    backgroundColor: COLORS.primary,

  },
  dateQuickBtnText: {
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  dateText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginVertical: 12,
    textAlign: 'center',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius * 0.8,
    padding: SIZES.padding * 0.8,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: COLORS.background,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 24,
  },
  budgetsContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-evenly',
  alignContent: 'flex-start',
  gap: 12,
  marginBottom: 10,
},

budgetIconWrapper: {
  alignItems: 'center',
  paddingHorizontal: SIZES.padding *1.5,
  paddingVertical: SIZES.padding * 0.5,
  borderRadius: SIZES.radius,
  backgroundColor: COLORS.lightGray,
  
},

budgetLabel: {
  fontSize: SIZES.font,
  marginTop: 4,
  textAlign: 'center',
  color: COLORS.textSecondary,
},
disabledOverlay: {
    ...StyleSheet.absoluteFillObject, // Cubre completamente el componente padre
    backgroundColor: 'rgba(230, 230, 230, 0.6)', // Un color gris semi-transparente
    borderRadius: 8, // Para que coincida con el borde del dropdown
  },
  showMoreButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 10,
        backgroundColor: '#e8e8e8',
        width: '22%', // Para que ocupe el mismo espacio que un ítem de presupuesto
        minHeight: 70, // Para mantener la altura consistente
    },

});

export default AddTransactionForm;
