import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import { AuthContext } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useIsDesktop } from '../hooks/useResponsive';
import CurrencyModal from '../components/CurrencyModal';
import { importData } from '../services/dataTransfer';
import { COLORS, SIZES } from '../constants/theme';

const USERNAME_KEY = '@username';

const notify = (title, message) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
};

// Fila de opción dentro de un grupo.
const Row = ({ icon, label, value, onPress, danger }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <MaterialIcons name={icon} size={22} color={danger ? COLORS.danger : COLORS.textSecondary} />
    <Text style={[styles.rowLabel, danger && { color: COLORS.danger }]}>{label}</Text>
    {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    <MaterialIcons name="chevron-right" size={22} color={COLORS.neutral} />
  </TouchableOpacity>
);

// Grupo con encabezado (región común / proximidad).
const Group = ({ title, children }) => (
  <View style={styles.group}>
    <Text style={styles.groupTitle}>{title}</Text>
    <View style={styles.groupCard}>{children}</View>
  </View>
);

const MoreScreen = () => {
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);
  const { currency } = useCurrency();

  const [username, setUsername] = useState('Usuario');
  const [nameModal, setNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [currencyModal, setCurrencyModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(USERNAME_KEY).then((v) => {
      if (v) setUsername(v);
    });
  }, []);

  const openNameModal = () => {
    setNewName(username);
    setNameModal(true);
  };

  const saveName = async () => {
    const value = newName.trim() || 'Usuario';
    setUsername(value);
    await AsyncStorage.setItem(USERNAME_KEY, value);
    setNameModal(false);
  };

  const applyImport = async (text) => {
    try {
      const { imported } = await importData(text);
      await queryClient.invalidateQueries();
      notify('Importación exitosa', `Se cargaron: ${imported.join(', ')}.`);
    } catch (e) {
      notify('Error al importar', e.message || 'No se pudo leer el archivo.');
    }
  };

  const handleImport = () => {
    if (Platform.OS === 'web') {
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
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
        {/* Perfil */}
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{username}</Text>
            <TouchableOpacity onPress={openNameModal}>
              <Text style={styles.profileEdit}>Cambiar nombre</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Group title="CUENTAS Y MONEDA">
          <Row icon="account-balance-wallet" label="Cuentas" onPress={() => navigation.navigate('AccountsScreen')} />
          <Row icon="attach-money" label="Moneda" value={currency} onPress={() => setCurrencyModal(true)} />
        </Group>

        <Group title="DATOS">
          <Row icon="file-upload" label="Importar datos" onPress={handleImport} />
        </Group>

        <Group title="SESIÓN">
          <Row icon="logout" label="Cerrar sesión" onPress={logout} danger />
        </Group>
      </ScrollView>

      {/* Overlay cambiar nombre */}
      {nameModal && (
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setNameModal(false)} />
          <View style={styles.nameCard}>
            <Text style={styles.nameTitle}>Cambiar tu nombre</Text>
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Ingresa tu nombre"
              autoFocus
            />
            <View style={styles.nameActions}>
              <TouchableOpacity style={[styles.nameBtn, styles.cancelBtn]} onPress={() => setNameModal(false)}>
                <Text style={styles.nameBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.nameBtn, styles.saveBtn]} onPress={saveName}>
                <Text style={[styles.nameBtnText, { color: '#fff' }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <CurrencyModal visible={currencyModal} onClose={() => setCurrencyModal(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  contentDesktop: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: SIZES.padding,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  profileName: { fontSize: SIZES.font * 1.4, fontWeight: 'bold', color: COLORS.textPrimary },
  profileEdit: { fontSize: SIZES.font, color: COLORS.textSecondary, marginTop: 2 },
  group: { marginTop: SIZES.padding * 1.2 },
  groupTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.neutral, marginBottom: 8, marginLeft: 4 },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.lightGray,
  },
  rowLabel: { flex: 1, fontSize: SIZES.font * 1.05, color: COLORS.textPrimary },
  rowValue: { fontSize: SIZES.font, color: COLORS.textSecondary, fontWeight: '600' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
    elevation: 100,
  },
  nameCard: { width: '100%', maxWidth: 420, backgroundColor: 'white', borderRadius: 12, padding: 20 },
  nameTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  nameInput: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 24, fontSize: 16 },
  nameActions: { flexDirection: 'row', justifyContent: 'space-between' },
  nameBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  saveBtn: { backgroundColor: '#90afbb' },
  cancelBtn: { backgroundColor: '#EAEAEA' },
  nameBtnText: { fontWeight: 'bold', fontSize: 16, color: '#333' },
});

export default MoreScreen;
