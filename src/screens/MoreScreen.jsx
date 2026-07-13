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
  Switch,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import { useQuery } from '@tanstack/react-query';

import { AuthContext } from '../context/AuthContext';
import * as authService from '../services/authService';
import * as Bills from '../services/billsService';
import { toDayString } from '../services/recurringService';
import { useCurrency } from '../context/CurrencyContext';
import { useIsDesktop } from '../hooks/useResponsive';
import CurrencyModal from '../components/CurrencyModal';
import { importData } from '../services/dataTransfer';
import { notificationsEnabled, enableNotifications, disableNotifications } from '../services/notificationsService';
import { getCachedName, fetchCloudName, saveName } from '../services/profileService';
import { COLORS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const GREEN = '#1C6B52';

const notify = (title, message) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
};

// Fila de opción dentro de un grupo.
const Row = ({ icon, label, value, onPress, danger, styles, t }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <MaterialIcons name={icon} size={22} color={danger ? t.danger : t.textSecondary} />
    <Text style={[styles.rowLabel, danger && { color: t.danger }]}>{label}</Text>
    {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    <MaterialIcons name="chevron-right" size={22} color={t.neutral} />
  </TouchableOpacity>
);

// Grupo con encabezado (región común / proximidad).
const Group = ({ title, children, styles }) => (
  <View style={styles.group}>
    <Text style={styles.groupTitle}>{title}</Text>
    <View style={styles.groupCard}>{children}</View>
  </View>
);

const MoreScreen = () => {
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const queryClient = useQueryClient();
  const { logout, isGuest, irAcrearCuenta } = useContext(AuthContext);
  const { currency } = useCurrency();
  const { theme, mode, setMode } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const [username, setUsername] = useState('Usuario');
  const [nameModal, setNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [currencyModal, setCurrencyModal] = useState(false);

  // Verificación en dos pasos (TOTP)
  const [twoFAModal, setTwoFAModal] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [twoFADone, setTwoFADone] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFABusy, setTwoFABusy] = useState(false);

  // Notificaciones
  const [notifsOn, setNotifsOn] = useState(false);

  // Facturas por vencer en los próximos 7 días (badge de la fila).
  const { data: bills = [] } = useQuery({ queryKey: ['bills'], queryFn: Bills.getAllBills });
  const dueSoon = (() => {
    const today = toDayString(new Date());
    const limit = toDayString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    return bills.filter((b) => {
      const occ = Bills.nextUnpaidOccurrence(b, today);
      return occ && occ <= limit;
    }).length;
  })();

  useEffect(() => {
    getCachedName().then(setUsername);
    fetchCloudName().then((n) => { if (n) setUsername(n); });
    notificationsEnabled().then(setNotifsOn);
  }, []);

  // Activa/desactiva notificaciones (alertas de presupuesto y recordatorios).
  const toggleNotifs = async (value) => {
    if (value) {
      const ok = await enableNotifications();
      setNotifsOn(ok);
      if (!ok) notify('Permiso necesario', 'Activa las notificaciones para esta app desde los ajustes del sistema.');
    } else {
      await disableNotifications();
      setNotifsOn(false);
    }
  };

  const openNameModal = () => {
    setNewName(username);
    setNameModal(true);
  };

  const handleSaveName = async () => {
    const value = await saveName(newName); // guarda en la nube (Cognito) + caché
    setUsername(value);
    setNameModal(false);
  };

  // Abre el modal de 2FA y pide a Cognito el secreto para la app authenticator.
  const openTwoFA = async () => {
    setTwoFAError('');
    setTwoFADone(false);
    setTotpCode('');
    setTotpSecret('');
    setTwoFAModal(true);
    try {
      const details = await authService.iniciarTOTP();
      setTotpSecret(details.sharedSecret);
    } catch (e) {
      setTwoFAError(e?.message || 'No se pudo iniciar la configuración.');
    }
  };

  // Verifica el código de la app y deja el TOTP como método preferido.
  const confirmTwoFA = async () => {
    if (!totpCode.trim()) return;
    setTwoFABusy(true);
    setTwoFAError('');
    try {
      await authService.verificarTOTP(totpCode.trim());
      await authService.activarTOTPComoPreferido();
      setTwoFADone(true);
    } catch (e) {
      setTwoFAError(e?.name === 'CodeMismatchException' ? 'El código no es correcto.' : (e?.message || 'No se pudo verificar.'));
    } finally {
      setTwoFABusy(false);
    }
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

        {/* Banner de modo invitado: los datos viven solo en el dispositivo */}
        {isGuest && (
          <View style={styles.guestCard}>
            <View style={styles.guestHeader}>
              <MaterialIcons name="cloud-off" size={20} color={theme.green} />
              <Text style={styles.guestTitle}>Estás usando la app sin cuenta</Text>
            </View>
            <Text style={styles.guestBody}>
              Tus datos se guardan solo en este teléfono. Crea una cuenta para respaldarlos y
              sincronizarlos entre dispositivos.
            </Text>
            <TouchableOpacity style={styles.guestBtn} onPress={irAcrearCuenta}>
              <Text style={styles.guestBtnText}>Crear cuenta y respaldar</Text>
            </TouchableOpacity>
          </View>
        )}

        <Group styles={styles} title="Cuentas y moneda">
          <Row styles={styles} t={theme} icon="account-balance-wallet" label="Cuentas" onPress={() => navigation.navigate('AccountsScreen')} />
          <Row styles={styles} t={theme} icon="attach-money" label="Moneda" value={currency} onPress={() => setCurrencyModal(true)} />
        </Group>

        <Group styles={styles} title="Datos">
          <Row styles={styles} t={theme}             icon="receipt-long"
            label="Facturas"
            value={dueSoon > 0 ? `${dueSoon} por vencer` : undefined}
            onPress={() => navigation.navigate('BillsScreen')}
          />
          <Row styles={styles} t={theme} icon="repeat" label="Recurrentes" onPress={() => navigation.navigate('RecurringScreen')} />
          <Row styles={styles} t={theme} icon="file-upload" label="Importar datos" onPress={handleImport} />
        </Group>

        <Group styles={styles} title="Apariencia">
          <View style={styles.themeRow}>
            <MaterialIcons name="dark-mode" size={22} color={theme.textSecondary} />
            <Text style={styles.rowLabel}>Tema</Text>
            <View style={styles.themeChips}>
              {[{ k: 'auto', l: 'Auto' }, { k: 'light', l: 'Claro' }, { k: 'dark', l: 'Oscuro' }].map((o) => {
                const active = mode === o.k;
                return (
                  <TouchableOpacity key={o.k} style={[styles.themeChip, active && styles.themeChipActive]} onPress={() => setMode(o.k)}>
                    <Text style={[styles.themeChipText, active && styles.themeChipTextActive]}>{o.l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Group>

        <Group styles={styles} title="Notificaciones">
          <View style={styles.row}>
            <MaterialIcons name="notifications-none" size={22} color={theme.textSecondary} />
            <Text style={styles.rowLabel}>Alertas y recordatorios</Text>
            <Switch
              value={notifsOn}
              onValueChange={toggleNotifs}
              trackColor={{ true: theme.green, false: theme.track }}
              thumbColor="#fff"
            />
          </View>
        </Group>

        {/* 2FA solo aplica a cuentas en la nube (Cognito) */}
        {!isGuest && (
          <Group styles={styles} title="Seguridad">
            <Row styles={styles} t={theme} icon="verified-user" label="Verificación en dos pasos" onPress={openTwoFA} />
          </Group>
        )}

        <Group styles={styles} title="Sesión">
          <Row
            styles={styles}
            t={theme}
            icon={isGuest ? 'login' : 'logout'}
            label={isGuest ? 'Salir del modo sin cuenta' : 'Cerrar sesión'}
            onPress={logout}
            danger
          />
        </Group>

        <Text style={styles.version}>Gestor de Gastos · v1.0</Text>
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
              <TouchableOpacity style={[styles.nameBtn, styles.saveBtn]} onPress={handleSaveName}>
                <Text style={[styles.nameBtnText, { color: '#fff' }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Overlay verificación en dos pasos */}
      {twoFAModal && (
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setTwoFAModal(false)} />
          <View style={styles.nameCard}>
            {twoFADone ? (
              <>
                <MaterialIcons name="verified-user" size={40} color={theme.green} style={{ alignSelf: 'center', marginBottom: 8 }} />
                <Text style={styles.nameTitle}>2FA activada</Text>
                <Text style={styles.twoFAText}>La próxima vez que inicies sesión te pediremos el código de tu app.</Text>
                <TouchableOpacity style={[styles.nameBtn, styles.saveBtn]} onPress={() => setTwoFAModal(false)}>
                  <Text style={[styles.nameBtnText, { color: '#fff' }]}>Listo</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.nameTitle}>Verificación en dos pasos</Text>
                <Text style={styles.twoFAText}>
                  1. Abre tu app de autenticación (Google Authenticator, Authy…) y agrega esta clave:
                </Text>
                <Text selectable style={styles.totpSecret}>{totpSecret || '…'}</Text>
                <Text style={styles.twoFAText}>2. Escribe el código de 6 dígitos que aparece:</Text>
                <TextInput
                  style={styles.nameInput}
                  value={totpCode}
                  onChangeText={setTotpCode}
                  placeholder="000000"
                  keyboardType="number-pad"
                />
                {twoFAError ? <Text style={styles.twoFAError}>{twoFAError}</Text> : null}
                <View style={styles.nameActions}>
                  <TouchableOpacity style={[styles.nameBtn, styles.cancelBtn]} onPress={() => setTwoFAModal(false)}>
                    <Text style={styles.nameBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.nameBtn, styles.saveBtn, (!totpSecret || twoFABusy) && { opacity: 0.5 }]} disabled={!totpSecret || twoFABusy} onPress={confirmTwoFA}>
                    <Text style={[styles.nameBtnText, { color: '#fff' }]}>{twoFABusy ? 'Verificando…' : 'Verificar'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      )}

      <CurrencyModal visible={currencyModal} onClose={() => setCurrencyModal(false)} />
    </View>
  );
};

const makeStyles = (t) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background },
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
    backgroundColor: t.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  profileName: { fontSize: SIZES.font * 1.4, fontWeight: 'bold', color: t.textPrimary },
  profileEdit: { fontSize: SIZES.font, color: t.green, marginTop: 2, fontWeight: '600' },

  // Banner de modo invitado
  guestCard: { backgroundColor: t.greenSoft, borderRadius: SIZES.radius * 1.2, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: t.green },
  guestHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  guestTitle: { fontSize: SIZES.font * 1.02, fontWeight: '800', color: t.textPrimary },
  guestBody: { fontSize: SIZES.font * 0.85, color: t.textSecondary, lineHeight: 18 },
  guestBtn: { backgroundColor: t.green, borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginTop: 12 },
  guestBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.font },
  group: { marginTop: SIZES.padding * 1.2 },
  groupTitle: { fontSize: SIZES.font * 0.85, fontWeight: '600', color: t.textSecondary, marginBottom: 8, marginLeft: 4 },
  version: { textAlign: 'center', fontSize: SIZES.font * 0.8, color: t.neutral, marginTop: 24 },
  groupCard: {
    backgroundColor: t.card,
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
    borderBottomColor: t.border,
  },
  rowLabel: { flex: 1, fontSize: SIZES.font * 1.05, color: t.textPrimary },
  rowValue: { fontSize: SIZES.font, color: t.textSecondary, fontWeight: '600' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: t.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
    elevation: 100,
  },
  nameCard: { width: '100%', maxWidth: 420, backgroundColor: t.card, borderRadius: 12, padding: 20 },
  nameTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: t.textPrimary },
  nameInput: { height: 50, borderColor: t.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 24, fontSize: 16, color: t.textPrimary, backgroundColor: t.inputBg },
  nameActions: { flexDirection: 'row', justifyContent: 'space-between' },
  nameBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  saveBtn: { backgroundColor: t.green },
  cancelBtn: { backgroundColor: t.cardAlt },
  nameBtnText: { fontWeight: 'bold', fontSize: 16, color: t.textPrimary },
  twoFAText: { fontSize: 14, color: t.textSecondary, marginBottom: 10, lineHeight: 20 },
  totpSecret: {
    fontSize: 16, fontWeight: 'bold', color: t.green, textAlign: 'center', letterSpacing: 1,
    backgroundColor: t.greenSoft, borderRadius: 8, paddingVertical: 10, marginBottom: 14,
  },
  twoFAError: { fontSize: 13, color: t.expense, marginBottom: 8, textAlign: 'center' },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  themeChips: { flexDirection: 'row', gap: 6 },
  themeChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: t.border, backgroundColor: t.card,
  },
  themeChipActive: { backgroundColor: t.green, borderColor: t.green },
  themeChipText: { fontSize: SIZES.font * 0.88, color: t.textSecondary, fontWeight: '600' },
  themeChipTextActive: { color: '#fff' },
});

export default MoreScreen;
