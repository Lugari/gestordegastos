import AsyncStorage from '@react-native-async-storage/async-storage'; 

const TOKEN_KEY = 'auth_token';

export const login = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save token', e);
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to remove token', e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to get token', e);
    return null;
  }
};
