// components/AuthModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { login, register, getCurrentUser, logout } from '../utils/auth';
import { Ionicons } from '@expo/vector-icons';

export default function AuthModal({ visible, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setCurrentUser(u);
    })();
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setEmail('');
      setPassword('');
      setMessage(null);
      setLoading(false);
      setMode('login');
    }
  }, [visible]);

  async function handleSubmit() {
    setMessage(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await login({ email: email.trim(), password });
        if (!res.ok) setMessage(res.error);
        else {
          onAuthSuccess && onAuthSuccess(res.user);
          onClose && onClose();
        }
      } else {
        const res = await register({ email: email.trim(), password });
        if (!res.ok) setMessage(res.error);
        else {
          onAuthSuccess && onAuthSuccess(res.user);
          onClose && onClose();
        }
      }
    } catch (err) {
      setMessage('Error inesperado. Intentá nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    await logout();
    setCurrentUser(null);
    setLoading(false);
    onAuthSuccess && onAuthSuccess(null);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
        <View style={styles.backdrop} />
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{currentUser ? 'Cuenta' : mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color="#9ca3af" /></TouchableOpacity>
          </View>

          {currentUser ? (
            <View style={{ paddingVertical: 12 }}>
              <Text style={styles.info}>Conectado como</Text>
              <Text style={styles.email}>{currentUser.email}</Text>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                {loading ? <ActivityIndicator /> : <Text style={styles.logoutText}>Cerrar sesión</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.form}>
                <Text style={styles.label}>Email</Text>
                <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />

                <Text style={[styles.label, { marginTop: 10 }]}>Contraseña</Text>
                <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

                {message ? <Text style={styles.error}>{message}</Text> : null}

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.switchRow} onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
                  <Text style={styles.switchText}>
                    {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modal: { backgroundColor: '#0b0b0b', padding: 18, borderTopLeftRadius: 16, borderTopRightRadius: 16, minHeight: 260 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  form: { marginTop: 12 },
  label: { color: '#9ca3af', fontSize: 13 },
  input: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6, color: '#fff' },
  submitBtn: { marginTop: 14, backgroundColor: '#06b6d4', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700' },
  switchRow: { marginTop: 12, alignItems: 'center' },
  switchText: { color: '#9ca3af' },
  error: { color: '#fb7185', marginTop: 8 },
  info: { color: '#9ca3af' },
  email: { color: '#fff', marginTop: 6, fontWeight: '700' },
  logoutBtn: { marginTop: 12, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, alignItems: 'center' },
  logoutText: { color: '#fff' },
});
