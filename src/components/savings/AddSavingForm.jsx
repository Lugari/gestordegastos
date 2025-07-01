import React, { useEffect, useState } from 'react';
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

import PrimaryButton from '../PrimaryButton'; 
import SecondaryButton from '../SecondaryButton';
import { SIZES, COLORS} from '../../constants/theme';

import DateTimePicker from '@react-native-community/datetimepicker';
import IconPicker from "react-native-icon-picker";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const iconOptions = ['savings', 'credit-card', 'account-balance', 'travel-explore', 'home', 'directions-car'];
const colorOptions = ['#A77DDB', '#F9DC5C', '#F38BA0', '#b1c3cb', '#b3e6b3', '#edbcbc'];

// -----------------------------

const AddSavingForm = ({ onSubmit, onCancel, toEdit }) => {

  const [showIconPicker, setShowIconPicker] = useState(false);  
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

  useEffect(() => {

    if (toEdit) {
      setFormData({
        name: toEdit.name || '',
        total: toEdit.total || '',
        selectedIcon: toEdit.selectedIcon || iconOptions[0],
        selectedColor: toEdit.selectedColor || colorOptions[0],
        deadline: new Date(toEdit.deadline) || new Date(),
        notes: toEdit.notes || '',
      });
    }
  
  }, [toEdit])


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    handleInputChange('total', numericValue); // Save the clean value
  } else {
    handleInputChange('total', 0);
  }
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
    if (!formData.name || !formData.total) {
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
  const onSelect = (icon) => {
    setShowIconPicker(false)
  }


  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Nombre del Ahorro */}
      <Text style={styles.label}>Nombre del Ahorro</Text>
      <TextInput
        placeholder="Ej: Viaje a Cartagena, Nuevo Celular..."
        value={formData.name}
        onChangeText={(value) => handleInputChange('name', value)}
        style={styles.input}
        placeholderTextColor="#B5B77E"
      />

      {/* Monto Total */}
      <Text style={styles.label}>Monto Total</Text>
      <TextInput
        placeholder="Ej: $1'500.000"
        value={formatCurrency(formData.total)}
        onChangeText={(value) => handleCurrencyInput(value)}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor="#B5B77E"
      />


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

      {/* Selección de Ícono */}
      <View style={styles.subSection}>
        <Text style={styles.label}>Icono:</Text>
        <IconPicker
          headerTitle="Seleccionar Icono"
          showIconPicker={showIconPicker}
          toggleIconPicker={() => setShowIconPicker(!showIconPicker)}
          iconDetails={[
            {
              family: "MaterialIcons",
              icons: [ 'home', 'receipt', 'shopping-cart', 'favorite', 'search', 'warning', 'edit',],
            },
            {
              family: "AntDesign",
              color: "blue",
              icons: [
                "wallet",
                "user",
                "addusergroup",
                "deleteuser",
                "deleteusergroup",
                "adduser",
              ],
            },
            { family: "Entypo", icons: ["wallet"] },
            { family: "FontAwesome", icons: ["google-wallet"] },
            {
              family: "FontAwesome5",
              icons: [
                "wallet",
                "hospital-user",
                "house-user",
                "user-alt-slash",
                "user-cog",
                "user-md",
                "user-tag",
                "user-slash",
              ],
            },
            { family: "Fontisto", icons: ["wallet"] },
            {
              family: "MaterialCommunityIcons",
              icons: ["wallet-membership"],
            },
          ]}
          content={<Text><SecondaryButton title="Seleccionar Icono" onPress={() => setShowIconPicker(true)} /></Text>}
          onSelect={onSelect}
        />
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
          minimumDate={new Date()}

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
        style={[styles.input, styles.notesInput]}
        placeholderTextColor="#B5B77E"
      />

      {/* Botones de Acción */}
      <View style={styles.buttonRow}>
        <PrimaryButton title={toEdit? "Actualizar" : "Añadir Ahorro"} onPress={handleSubmit} />
        <SecondaryButton title="Cancelar" onPress={onCancel} />
      </View>
    </ScrollView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    paddingBottom: 40, 
  },
  label: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.textSecondary, // Un color estándar para labels
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.neutral, 
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top', // Para Android
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Permite que los items pasen a la siguiente línea
    gap: 12, // Espacio entre items
    marginBottom: 10,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20, 
    borderWidth: 2,
    borderColor: 'transparent', // Borde transparente por defecto
  },
  optionSelected: {
    borderColor: COLORS.secondary,
  },
   dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.neutral,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
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