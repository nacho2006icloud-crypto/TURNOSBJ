// utils/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'bcryptjs';

const USERS_KEY = '@turnos360:users';      // guardará un array de usuarios { email, passwordHash, createdAt }
const CURRENT_USER = '@turnos360:current'; // guardará el email del usuario logueado

// Helpers AsyncStorage
async function _getUsers() {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}
async function _saveUsers(users) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Registro: devuelve { ok: true } o { ok: false, error: '...' }
export async function register({ email, password }) {
  if (!email || !password) return { ok: false, error: 'Email y contraseña son requeridos.' };
  const users = await _getUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return { ok: false, error: 'Ya existe una cuenta con ese email.' };

  // Hasheo seguro con bcryptjs (salt 10)
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const newUser = { email: email.toLowerCase(), passwordHash: hash, createdAt: new Date().toISOString() };
  users.push(newUser);
  await _saveUsers(users);
  await AsyncStorage.setItem(CURRENT_USER, newUser.email);
  return { ok: true, user: { email: newUser.email, createdAt: newUser.createdAt } };
}

// Login: compara el hash
export async function login({ email, password }) {
  if (!email || !password) return { ok: false, error: 'Email y contraseña son requeridos.' };
  const users = await _getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: false, error: 'Usuario no encontrado.' };

  const match = bcrypt.compareSync(password, user.passwordHash);
  if (!match) return { ok: false, error: 'Contraseña incorrecta.' };

  await AsyncStorage.setItem(CURRENT_USER, user.email);
  return { ok: true, user: { email: user.email, createdAt: user.createdAt } };
}

export async function logout() {
  await AsyncStorage.removeItem(CURRENT_USER);
  return { ok: true };
}

export async function getCurrentUser() {
  const email = await AsyncStorage.getItem(CURRENT_USER);
  if (!email) return null;
  const users = await _getUsers();
  const user = users.find(u => u.email === email);
  if (!user) return null;
  return { email: user.email, createdAt: user.createdAt };
}

// borrar todos los usuarios (solo para desarrollo)
export async function _clearAll() {
  await AsyncStorage.removeItem(USERS_KEY);
  await AsyncStorage.removeItem(CURRENT_USER);
}
