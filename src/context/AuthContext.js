import React, { createContext, useState, useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';

import * as authService from '../services/authService';
import { loadStorageMode, setStorageMode, isLocalMode } from '../services/storageMode';
import { migrateGuestToCloud } from '../services/cloudSync';

export const AuthContext = createContext();

// Token simbólico para el modo invitado (sin cuenta): basta con que no sea null
// para que App.js muestre la app en vez del login.
const GUEST_TOKEN = 'guest';

export const AuthProvider = ({ children }) => {
  // userToken: identificador del usuario (o 'guest' sin cuenta); null = login.
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // mode: 'cloud' | 'local'. Refleja storageMode para que la UI reaccione.
  const [mode, setMode] = useState('cloud');

  const refresh = async () => {
    try {
      const u = await authService.usuarioActual();
      // Si veníamos de modo invitado y ahora hay sesión real: subimos los datos
      // del dispositivo a la cuenta y pasamos a modo nube ANTES de exponer el
      // token (así el arranque posterior ya opera contra la nube).
      if (isLocalMode()) {
        try { await migrateGuestToCloud(); } catch {}
        await setStorageMode('cloud');
        setMode('cloud');
      }
      setUserToken(u?.username ?? u?.userId ?? 'user');
    } catch {
      setUserToken(null);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const m = await loadStorageMode();
      if (!active) return;
      setMode(m);

      if (m === 'local') {
        // Invitado: entramos directo, sin tocar Cognito (no depende de la red,
        // así que nunca se queda "cargando" por una conexión bloqueada).
        setUserToken(GUEST_TOKEN);
        setIsLoading(false);
        return;
      }

      // Modo nube: el arranque no puede colgarse. Si la sesión no se resuelve en
      // 5 s (almacén lento, red mala, tokens huérfanos), se asume sin sesión.
      await Promise.race([refresh(), new Promise((r) => setTimeout(r, 5000))]);
      if (active) setIsLoading(false);
    })();

    const stopListening = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') refresh();
      if (payload.event === 'signedOut') setUserToken(null);
    });

    return () => {
      active = false;
      stopListening();
    };
  }, []);

  // Entrar en modo invitado (sin cuenta): datos solo en el dispositivo.
  const continuarSinConexion = async () => {
    await setStorageMode('local');
    setMode('local');
    setUserToken(GUEST_TOKEN);
  };

  // Desde el modo invitado: ir al login/registro para crear cuenta y respaldar.
  // Se mantiene el modo local hasta que haya sesión real (refresh migra y pasa a
  // nube); si el usuario se arrepiente, puede volver a "Continuar sin cuenta".
  const irAcrearCuenta = () => {
    setUserToken(null);
  };

  const logout = async () => {
    try {
      await authService.cerrarSesion();
    } catch {
      // aunque falle el cierre remoto, limpiamos el estado local
    }
    // Volvemos a modo nube para el login. Los datos locales de invitado (si los
    // hubo) permanecen en el dispositivo.
    await setStorageMode('cloud');
    setMode('cloud');
    setUserToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        isLoading,
        mode,
        isGuest: userToken === GUEST_TOKEN,
        logout,
        refresh,
        continuarSinConexion,
        irAcrearCuenta,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
