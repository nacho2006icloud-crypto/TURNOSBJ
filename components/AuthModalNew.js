import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import authService from '../services/authService';

export default function AuthModalNew({ visible, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [registerType, setRegisterType] = useState('usuario'); // 'usuario' | 'local'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre_completo: '',
    ano_nacimiento: '',
    nombre: '',
    direccion: '',
    descripcion: '',
    deportes: '[]',
    precio_hora: ''
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      nombre_completo: '',
      ano_nacimiento: '',
      nombre: '',
      direccion: '',
      descripcion: '',
      deportes: '[]',
      precio_hora: ''
    });
    setError('');
    setLoading(false);
    setTab('login');
    setRegisterType('usuario');
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError('Email y contraseña requeridos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.login({
        email: formData.email.trim(),
        password: formData.password
      });

      if (result.success) {
        onAuthSuccess && onAuthSuccess(result.user);
        resetForm();
        onClose && onClose();
      } else {
        setError(result.error || 'Error en login');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      let result;

      if (registerType === 'usuario') {
        if (!formData.nombre_completo || !formData.email || !formData.password || !formData.ano_nacimiento) {
          setError('Todos los campos son requeridos');
          setLoading(false);
          return;
        }

        result = await authService.registerUser({
          nombre_completo: formData.nombre_completo.trim(),
          email: formData.email.trim(),
          password: formData.password,
          ano_nacimiento: parseInt(formData.ano_nacimiento)
        });
      } else {
        if (!formData.email || !formData.password || !formData.nombre || !formData.direccion) {
          setError('Email, contraseña, nombre y dirección son requeridos');
          setLoading(false);
          return;
        }

        result = await authService.registerLocal({
          email: formData.email.trim(),
          password: formData.password,
          nombre: formData.nombre.trim(),
          direccion: formData.direccion.trim(),
          latitud: null,
          longitud: null,
          fotos: [],
          descripcion: formData.descripcion || '',
          deportes: formData.deportes || '[]',
          precio_hora: formData.precio_hora ? parseFloat(formData.precio_hora) : 0
        });
      }

      if (result && result.success) {
        onAuthSuccess && onAuthSuccess(result.user);
        resetForm();
        onClose && onClose();
      } else {
        setError(result?.error || 'Error en registro');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const renderLogin = () => (
    <View style={styles.tabContent}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <Text style={styles.subtitle}>Ingresá con tu email</Text>

      <View style={styles.inputGroup}>
        <Icon name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(val) => setFormData({ ...formData, email: val })}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={formData.password}
          onChangeText={(val) => setFormData({ ...formData, password: val })}
          secureTextEntry
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.submitButton} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Ingresar</Text>}
      </TouchableOpacity>
    </View>
  );

  const renderRegister = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Crear Cuenta</Text>
      
      {/* Selector Usuario/Cancha */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, registerType === 'usuario' && styles.typeButtonActive]}
          onPress={() => setRegisterType('usuario')}
        >
          <Icon name="person-outline" size={20} color={registerType === 'usuario' ? '#fff' : '#666'} />
          <Text style={[styles.typeButtonText, registerType === 'usuario' && styles.typeButtonTextActive]}>Usuario</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.typeButton, registerType === 'local' && styles.typeButtonActive]}
          onPress={() => setRegisterType('local')}
        >
          <Icon name="business-outline" size={20} color={registerType === 'local' ? '#fff' : '#666'} />
          <Text style={[styles.typeButtonText, registerType === 'local' && styles.typeButtonTextActive]}>Cancha</Text>
        </TouchableOpacity>
      </View>

      {registerType === 'usuario' ? (
        <>
          <View style={styles.inputGroup}>
            <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              value={formData.nombre_completo}
              onChangeText={(val) => setFormData({ ...formData, nombre_completo: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Icon name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Año de nacimiento (ej: 1990)"
              value={formData.ano_nacimiento}
              onChangeText={(val) => setFormData({ ...formData, ano_nacimiento: val })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Icon name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(val) => setFormData({ ...formData, email: val })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={formData.password}
              onChangeText={(val) => setFormData({ ...formData, password: val })}
              secureTextEntry
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Icon name="business-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre de la cancha"
              value={formData.nombre}
              onChangeText={(val) => setFormData({ ...formData, nombre: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Icon name="location-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Dirección"
              value={formData.direccion}
              onChangeText={(val) => setFormData({ ...formData, direccion: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Icon name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(val) => setFormData({ ...formData, email: val })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={formData.password}
              onChangeText={(val) => setFormData({ ...formData, password: val })}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Icon name="cash-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Precio por hora (opcional)"
              value={formData.precio_hora}
              onChangeText={(val) => setFormData({ ...formData, precio_hora: val })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Icon name="information-circle-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción (opcional)"
              value={formData.descripcion}
              onChangeText={(val) => setFormData({ ...formData, descripcion: val })}
              multiline
              numberOfLines={3}
            />
          </View>
        </>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.submitButton} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Registrarse</Text>}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Autenticación</Text>
              <View style={{ width: 28 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tabButton, tab === 'login' && styles.tabButtonActive]}
                onPress={() => { setTab('login'); setError(''); }}
              >
                <Text style={[styles.tabButtonText, tab === 'login' && styles.tabButtonTextActive]}>Login</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tabButton, tab === 'register' && styles.tabButtonActive]}
                onPress={() => { setTab('register'); setError(''); }}
              >
                <Text style={[styles.tabButtonText, tab === 'register' && styles.tabButtonTextActive]}>Registro</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            {tab === 'login' ? renderLogin() : renderRegister()}
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  keyboardView: { flex: 1, justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  closeButton: { padding: 4 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tabButton: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabButtonActive: { borderBottomWidth: 3, borderBottomColor: '#0000CD' },
  tabButtonText: { fontSize: 16, color: '#999', fontWeight: '500' },
  tabButtonTextActive: { color: '#0000CD', fontWeight: 'bold' },
  tabContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  typeSelector: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: '#e0e0e0', backgroundColor: '#fff' },
  typeButtonActive: { backgroundColor: '#0000CD', borderColor: '#0000CD' },
  typeButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  typeButtonTextActive: { color: '#fff' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16, backgroundColor: '#f9f9f9' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 12 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  errorText: { color: '#f44336', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  submitButton: { backgroundColor: '#0000CD', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
