import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
    Dimensions,
    TextInput,
    Platform,
    Alert
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';

import { useNavigation } from '@react-navigation/native';

import { importData } from '../services/dataTransfer';
import { useCurrency } from '../context/CurrencyContext';
import { CURRENCIES } from '../constants/currencies';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Feedback multiplataforma (Alert.alert es no-op en react-native-web).
const notify = (title, message) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
};

const Header = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [username, setUsername] = useState('Usuario');
  const [newName, setNewName] = useState(username);
  const { logout } = useContext(AuthContext);
  const { currency, setCurrency } = useCurrency();

  const navigation = useNavigation();
  const queryClient = useQueryClient();


   useEffect(() => {
    setNewName(username);
  }, [username]);

  const openChangeNameModal = () => {
    setModalVisible(false); // Cierra el menú lateral
    setNameModalVisible(true); // Abre el modal para cambiar nombre
  };

  const handleSaveName = () => {
    // Aquí iría la lógica para guardar el nombre permanentemente.
    // Por ejemplo, llamar a una función del contexto de usuario o de un estado superior.
    console.log(`El nombre se ha cambiado a: ${newName}`);
    setUsername(newName)
    // En una app real, llamarías a una función como: onUsernameUpdate(newName);
    setNameModalVisible(false);
  };


  // Aquí puedes añadir la navegación o lógica para cada opción
  const handleChangeName = () => {
    setNewName()
  };
  const handleAddAccount = () => {
    console.log('Navegar a Añadir Cuentas');
    setModalVisible(false);
  };
  const handleGoToSettings = () => {
    console.log('Navegar a Configuración');
    setModalVisible(false);
  };
  const handleGoToReports = () => {
    navigation.navigate("ReportsScreen")
    setModalVisible(false);
  }

  const openCurrencyModal = () => {
    setModalVisible(false);
    setCurrencyModalVisible(true);
  };

  const handleSelectCurrency = (code) => {
    setCurrency(code);
    setCurrencyModalVisible(false);
  };

  // Aplica el contenido del JSON y refresca la UI.
  const applyImport = async (text) => {
    try {
      const { imported } = await importData(text);
      await queryClient.invalidateQueries(); // refresca presupuestos, ahorros, etc.
      notify('Importación exitosa', `Se cargaron: ${imported.join(', ')}.`);
    } catch (e) {
      notify('Error al importar', e.message || 'No se pudo leer el archivo.');
    }
  };

  const handleImportData = () => {
    setModalVisible(false);

    if (Platform.OS === 'web') {
      // En web usamos el selector de archivos nativo del navegador.
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => applyImport(reader.result);
        reader.onerror = () => notify('Error al importar', 'No se pudo leer el archivo.');
        reader.readAsText(file);
      };
      input.click();
      return;
    }

    // En móvil usamos el document picker de Expo.
    (async () => {
      try {
        const DocumentPicker = require('expo-document-picker');
        const FileSystem = require('expo-file-system');
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
        if (result.canceled) return;
        const uri = result.assets?.[0]?.uri;
        if (!uri) return;
        const text = await FileSystem.readAsStringAsync(uri);
        await applyImport(text);
      } catch (e) {
        notify('Error al importar', e.message || 'No se pudo abrir el archivo.');
      }
    })();
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {username}!</Text>
        {/* El icono ahora es presionable para abrir el modal */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <MaterialIcons name="account-circle" size={64} color="black" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade" 
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        {/* Fondo oscuro semi-transparente que al presionarse cierra el modal */}
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          
          {/* Contenido del modal que aparece a la derecha */}
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>{username}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionRow} onPress={openChangeNameModal}>
                <MaterialIcons name="edit" size={24} color="#555" />
                <Text style={styles.optionText}>Cambiar nombre</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionRow} onPress={handleAddAccount}>
                <MaterialIcons name="account-balance" size={24} color="#555" />
                <Text style={styles.optionText}>Añadir cuentas</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionRow} onPress={handleGoToSettings}>
                <MaterialIcons name="settings" size={24} color="#555" />
                <Text style={styles.optionText}>Configuración</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionRow} onPress={handleGoToReports}>
                <MaterialIcons name="settings" size={24} color="#555" />
                <Text style={styles.optionText}>Reportes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionRow} onPress={openCurrencyModal}>
                <MaterialIcons name="attach-money" size={24} color="#555" />
                <Text style={styles.optionText}>Moneda ({currency})</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionRow} onPress={handleImportData}>
                <MaterialIcons name="file-upload" size={24} color="#555" />
                <Text style={styles.optionText}>Importar datos</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionRow} onPress={logout}>
                <MaterialIcons name="logout" size={24} color="#555" />
                <Text style={styles.optionText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isNameModalVisible}
        onRequestClose={() => setNameModalVisible(false)}
      >
        <Pressable style={styles.centeredOverlay} onPress={() => setNameModalVisible(false)}>
          <Pressable style={styles.nameModalContent}>
            <Text style={styles.nameModalTitle}>Cambiar tu nombre</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Ingresa tu nombre"
              autoFocus={true}
            />
            <View style={styles.nameModalActions}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setNameModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveName}>
                <Text style={[styles.buttonText, { color: '#fff' }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isCurrencyModalVisible}
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <Pressable style={styles.centeredOverlay} onPress={() => setCurrencyModalVisible(false)}>
          <Pressable style={styles.nameModalContent}>
            <Text style={styles.nameModalTitle}>Seleccionar moneda</Text>
            {CURRENCIES.map((c) => {
              const active = c.code === currency;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.currencyRow, active && styles.currencyRowActive]}
                  onPress={() => handleSelectCurrency(c.code)}
                >
                  <Text style={styles.currencyCode}>{c.symbol} {c.code}</Text>
                  <Text style={styles.currencyName}>{c.name}</Text>
                  {active && <MaterialIcons name="check" size={20} color={COLORS.success} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width,
  },
  greeting: {
    fontFamily: FONTS.subheading.fontFamily, 
    fontSize: SIZES.font * 2.8,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  // --- Estilos para el Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.textSecondary + '55',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: width * 0.8, // El modal ocupa el 80% del ancho de la pantalla
    height: '100%',
    backgroundColor: COLORS.background, // Un color de fondo claro
    shadowColor: COLORS.textPrimary,
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2, // Espacio para la barra de estado del teléfono
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalHeaderText: {
    fontSize: SIZES.font * 1.4,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  optionsContainer: {
    padding: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: SIZES.radius,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  //--- Estilos para Modal Centrado (Cambiar Nombre) ---
  centeredOverlay: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  nameModalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
  },
  nameModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: SIZES.radius,
  },
  currencyRowActive: {
    backgroundColor: COLORS.primary + '33',
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    width: 70,
  },
  currencyName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 24,
    fontSize: 16,
  },
  nameModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#90afbb',
  },
  cancelButton: {
    backgroundColor: '#EAEAEA',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
});

export default Header;