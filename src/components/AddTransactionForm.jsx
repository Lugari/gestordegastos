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

import TransactionTypeDropdown from './TransactionTypeDropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

const AddTransactionForm = ({ onSubmit, onCancel }) => {

  const route = useRoute();
  const [type, setType] = useState(route.params?.transactionType || 'Ingreso');

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);


  const setRelativeDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(d);
  };

  const formattedDate = date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  onSubmit = () => {
    if (!type || !amount) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    console.log({ type, amount, note, date });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Tipo de Transacción */}
      <Text style={styles.sectionTitle}>Tipo de Transacción</Text>
      <TransactionTypeDropdown selected={type} onSelect={(newType)=>setType(newType)}/>

      {/* Monto */}
      <Text style={styles.sectionTitle}>Monto</Text>
      <TextInput
        placeholder="Monto"
        keyboardType="numeric"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
      />

      {/* Presupuesto */}
      <Text style={styles.sectionTitle}>Presupuesto</Text>
      <View style={styles.iconRow}>
        <MaterialIcons name="home" size={30} color="#5f5a67" />
        <MaterialIcons name="receipt" size={30} color="#5f5a67" />
        <MaterialIcons name="commute" size={30} color="#5f5a67" />
        <MaterialIcons name="local-dining" size={30} color="#5f5a67" />
      </View>

      {/* Fecha */}
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
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}
      </View>
      <Text style={styles.dateText}>Seleccionada: {formattedDate}</Text>

      {/* Notas */}
      <Text style={styles.sectionTitle}>Notas</Text>
      <TextInput
        placeholder="Notas..."
        multiline
        numberOfLines={4}
        style={styles.noteInput}
        value={note}
        onChangeText={setNote}
      />

      {/* Botones */}
      <View style={styles.buttonRow}>
        <PrimaryButton title="Añadir Transacción" onPress={() => onSubmit({ type, amount, note, date })} />
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
});

export default AddTransactionForm;
