import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PrimaryButton from '../PrimaryButton'; 
import SecondaryButton from '../SecondaryButton';


const iconOptions = ['savings', 'credit-card', 'account-balance', 'travel-explore', 'home', 'directions-car'];
const colorOptions = ['#A77DDB', '#F9DC5C', '#F38BA0', '#b1c3cb', '#b3e6b3', '#edbcbc'];

// -----------------------------

const AddSavingForm = ({ onSubmit, onCancel }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estado para todos los campos del formulario
  const [formData, setFormData] = useState({
    name: '',
    total: '', 
    selectedIcon: iconOptions[0], 
    selectedColor: colorOptions[0], 
    deadline: new Date(),
    notes: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleInputChange('deadline', selectedDate);
    }
  };

  // Manejador para enviar el formulario
  const handleSubmit = () => {
    // Validación simple
    if (!formData.name.trim() || !formData.total.trim()) {
      Alert.alert('Campos Requeridos', 'Por favor, ingresa el nombre y el monto total del ahorro.');
      return;
    }
    const totalAmount = parseFloat(formData.total);
    if (isNaN(totalAmount) || totalAmount <= 0) {
        Alert.alert('Monto Inválido', 'Por favor, ingresa un monto total válido.');
        return;
    }

    // Prepara los datos a enviar (ajusta según lo que necesite tu lógica de guardado)
    const savingData = {
      name: formData.name.trim(),
      total: parseFloat(totalAmount),
      used: parseFloat(0),
      selectedIcon: formData.selectedIcon,
      selectedColor: formData.selectedColor,
      deadline: formData.deadline.toISOString(), // Guarda fecha en formato estándar
      notes: formData.notes.trim(),
    };
    
    onSubmit(savingData)
    
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Nombre del Ahorro */}
      <Text style={styles.label}>Nombre del Objetivo</Text>
      <TextInput
        placeholder="Ej: Viaje a Cartagena, Nuevo Celular..."
        value={formData.name}
        onChangeText={(value) => handleInputChange('name', value)}
        style={styles.input}
        placeholderTextColor="#B5B77E"
      />

      {/* Monto Total */}
      <Text style={styles.label}>Monto Total Objetivo</Text>
      <TextInput
        placeholder="Ej: 1500000"
        value={formData.total.toL}
        onChangeText={(value) => handleInputChange('total', value)}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor="#B5B77E"
      />

      {/* Selección de Ícono */}
      <Text style={styles.label}>Ícono</Text>
      <View style={styles.optionsRow}>
        {iconOptions.map((icon) => (
          <TouchableOpacity
            key={icon}
            onPress={() => handleInputChange('selectedIcon', icon)}
            style={[
              styles.iconButton,
              formData.selectedIcon === icon && styles.optionSelected, // Estilo cuando está seleccionado
            ]}
          >
            <MaterialIcons name={icon} size={28} color="#333" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Selección de Color */}
      <Text style={styles.label}>Color</Text>
      <View style={styles.optionsRow}>
        {colorOptions.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => handleInputChange('selectedColor', color)}
            style={[
              styles.colorCircle,
              { backgroundColor: color },
              // Borde más grueso si está seleccionado
              formData.selectedColor === color && styles.optionSelected
            ]}
          />
        ))}
      </View>

      {/* Fecha Límite */}
      <Text style={styles.label}>Fecha Límite (Opcional)</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateDisplay}>
         <MaterialIcons name="calendar-month" size={20} color="#5f5a67" style={{marginRight: 8}}/>
         <Text>{formData.deadline.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </TouchableOpacity>

      {/* DateTimePicker Modal/Component */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.deadline}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()} // Opcional: no permitir fechas pasadas
        />
      )}

      {/* Notas */}
      <Text style={styles.label}>Notas (Opcional)</Text>
      <TextInput
        placeholder="Describe tu objetivo..."
        value={formData.notes}
        onChangeText={(value) => handleInputChange('notes', value)}
        multiline
        numberOfLines={4}
        style={styles.notesInput}
        placeholderTextColor="#B5B77E"
      />

      {/* Botones de Acción */}
      <View style={styles.buttonRow}>
        <PrimaryButton title="Añadir Ahorro" onPress={handleSubmit} />
        <SecondaryButton title="Cancelar" onPress={onCancel} />
      </View>
    </ScrollView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40, // Espacio extra al final para el scroll
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5f5a67', // Un color estándar para labels
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E3E3C4', // Color del borde como en tu imagen
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
  },
  notesInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DADDBB',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#000',
    minHeight: 80,
    textAlignVertical: 'top', // Para Android
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Permite que los items pasen a la siguiente línea
    gap: 12, // Espacio entre items
    marginBottom: 10,
  },
  iconButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0', // Fondo gris claro
    borderWidth: 2,
    borderColor: 'transparent', // Borde transparente por defecto
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20, // Círculo perfecto
    borderWidth: 2,
    borderColor: 'transparent', // Borde transparente por defecto
  },
  optionSelected: {
    borderColor: '#007AFF', // Color de borde para indicar selección (azul iOS como ejemplo)
    // Puedes añadir un shadow o un background diferente si prefieres
  },
   dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E3E3C4',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Centra los botones
    marginTop: 30,
    gap: 12, // Espacio entre botones
  },
});

export default AddSavingForm;