import React, { createContext, useState, useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';

import * as authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // userToken: identificador del usuario cuando hay sesión (null si no la hay).
  // Se conserva el nombre para no tocar App.js ni MoreScreen.
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const u = await authService.usuarioActual();
      setUserToken(u?.username ?? u?.userId ?? 'user');
    } catch {
      setUserToken(null);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      // El arranque no puede quedarse colgado: si la sesión no se resuelve en
      // 5 s (almacén lento, tokens huérfanos, etc.), se asume sin sesión y se
      // muestra el login. Un login exitoso posterior actualiza el estado vía Hub.
      await Promise.race([
        refresh(),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
      if (active) setIsLoading(false);
    })();

    // Cognito emite eventos de sesión; reaccionamos para actualizar el estado.
    const stopListening = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') refresh();
      if (payload.event === 'signedOut') setUserToken(null);
    });

    return () => {
      active = false;
      stopListening();
    };
  }, []);

  const logout = async () => {
    try {
      await authService.cerrarSesion();
    } catch {
      // aunque falle el cierre remoto, limpiamos el estado local
    }
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};
