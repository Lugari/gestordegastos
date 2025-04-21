import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const AddSavingForm = ({ onSubmit }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ADC4CD');
  const [period, setPeriod] = useState(null);
  const [type, setType] = useState(null);
  const [deadline, setDeadline] = useState(null);

  const colorsList = ['#ADC4CD', '#F9DC5C', '#F38BA0'];
  const deadlines = ['Trimestre', 'Semestre', 'Año'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Nombre */}
      <TextInput
        style={styles.input}
        placeholder={t('nombre')}
        value={name}
        onChangeText={setName}
        placeholderTextColor="#B5B77E"
      />

      {/* Monto */}
      <TextInput
        style={styles.input}
        placeholder={t('monto')}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholderTextColor="#B5B77E"
      />

      {/* Icono + Periodo + Color + Tipo */}
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <MaterialIcons name="savings" size={24} color="#ADC4CD" />
        </View>

        <TouchableOpacity style={styles.selector}>
          <Text style={styles.selectorText}>
            {period || t('seleccionar')}
          </Text>
        </TouchableOpacity>

        <View style={[styles.colorBox, { backgroundColor: selectedColor }]} />

        <TouchableOpacity style={styles.selector}>
          <Text style={styles.selectorText}>
            {type || t('seleccionar')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Deadlines */}
      <View style={styles.row}>
        {deadlines.map((label, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.deadlineOption,
              deadline === label && styles.deadlineSelected,
            ]}
            onPress={() => setDeadline(label)}
          >
            <Text style={styles.deadlineText}>{label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity>
          <MaterialIcons name="calendar-month" size={24} color="#1C1427" />
        </TouchableOpacity>
      </View>

      {/* Notas */}
      <TextInput
        style={styles.notes}
        placeholder={t('notas')}
        value={notes}
        onChangeText={setNotes}
        placeholderTextColor="#B5B77E"
        multiline
      />

      {/* Botón */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          onSubmit({
            name,
            amount,
            notes,
            selectedColor,
            period,
            type,
            deadline,
          })
        }
      >
        <Text style={styles.addText}>{t('añadir')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E3E3C4',
    padding: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selector: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F8F8F8',
    borderRadius: 4,
  },
  selectorText: {
    fontSize: 12,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  deadlineOption: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deadlineSelected: {
    borderColor: '#ADC4CD',
    backgroundColor: '#F0FFF3',
  },
  deadlineText: {
    fontSize: 12,
  },
  notes: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DADDBB',
    padding: 10,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#ADC4CD',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddSavingForm;
