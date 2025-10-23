import React, { useState, useEffect, useContext } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Modal, 
    Pressable, 
    Dimensions,
    TextInput
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';

import { useNavigation } from '@react-navigation/native';

import { COLORS, SIZES, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

const Header = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [username, setUsername] = useState('Usuario');
  const [newName, setNewName] = useState(username);
  const { logout } = useContext(AuthContext);

  const navigation = useNavigation();


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