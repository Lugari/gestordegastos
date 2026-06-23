import { useWindowDimensions } from 'react-native';

// Punto de quiebre a partir del cual consideramos "escritorio".
// Por debajo se conserva el diseño móvil original.
export const DESKTOP_BREAKPOINT = 900;

/**
 * Devuelve información de tamaño de ventana para construir layouts adaptables.
 * Se apoya en useWindowDimensions, por lo que reacciona al redimensionar el navegador.
 *
 * @returns {{ width: number, height: number, isDesktop: boolean }}
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isDesktop: width >= DESKTOP_BREAKPOINT,
  };
};

/**
 * Atajo cuando solo interesa saber si estamos en escritorio.
 * @returns {boolean}
 */
export const useIsDesktop = () => useResponsive().isDesktop;

export default useResponsive;
