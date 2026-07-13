import { makeCloudCollection } from './cloudCollection';
import { makeLocalCollection } from './localCollection';
import { isLocalMode } from './storageMode';

// Colección con conmutación de almacén: expone la misma API
// ({ getAll, add, update, remove, replaceAll }) y en CADA llamada despacha a la
// implementación local o de nube según el modo actual. Así, ascender de
// invitado a cuenta (cambiar el modo) surte efecto sin recrear los servicios.
export const makeCollection = (modelName) => {
  const cloud = makeCloudCollection(modelName);
  const local = makeLocalCollection(modelName);
  const pick = () => (isLocalMode() ? local : cloud);

  return {
    getAll: (...a) => pick().getAll(...a),
    add: (...a) => pick().add(...a),
    update: (...a) => pick().update(...a),
    remove: (...a) => pick().remove(...a),
    replaceAll: (...a) => pick().replaceAll(...a),
  };
};
