import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api';

export default function UserProfileModal({ visible, onClose, currentUser, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ proximos: 0, disputados: 0, cancelados: 0 });
  const [fotoPerfil, setFotoPerfil] = useState(currentUser?.foto_perfil || null);

  useEffect(() => {
    if (visible && currentUser) {
      loadStats();
      setFotoPerfil(currentUser.foto_perfil);
    }
  }, [visible, currentUser]);

  const getToken = async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('auth_token');
    }
    return await AsyncStorage.getItem('auth_token');
  };

  const loadStats = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/usuario/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        uploadFoto(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const uploadFoto = async (asset) => {
    setLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      
      formData.append('foto', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: `perfil_${Date.now()}.jpg`,
      });

      const response = await fetch(`${API_URL}/usuario/foto-perfil`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFotoPerfil(data.foto_perfil);
        Alert.alert('Éxito', 'Foto actualizada correctamente');
        if (onUpdate) onUpdate();
      } else {
        Alert.alert('Error', 'No se pudo subir la foto');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al subir foto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('🔵 HANDLELOGOUT ejecutándose...');
    
    // Para web, usar confirm nativo
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('¿Estás seguro que deseas cerrar sesión?');
      if (!confirmLogout) {
        console.log('🔵 Usuario canceló logout');
        return;
      }
    } else {
      // Para mobile, usar Alert
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro que deseas salir?',
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => console.log('🔵 Usuario canceló logout')
          },
          {
            text: 'Salir',
            style: 'destructive',
            onPress: () => performLogout()
          }
        ]
      );
      return; // Salir aquí para mobile
    }
    
    // Para web, continuar directamente
    performLogout();
  };

  const performLogout = async () => {
    console.log('🔵 PERFORMLOGOUT - Ejecutando cierre de sesión...');
    
    try {
      // 1. Limpiar token INMEDIATAMENTE
      if (Platform.OS === 'web') {
        localStorage.removeItem('auth_token');
      } else {
        await AsyncStorage.removeItem('auth_token');
      }
      console.log('🔵 Token eliminado del storage');
      
      // 2. Cerrar modal INMEDIATAMENTE
      console.log('🔵 Cerrando modal...');
      onClose();
      
      // 3. Notificar al padre para limpiar currentUser
      console.log('🔵 Llamando onUpdate(null)...');
      if (onUpdate) {
        onUpdate(null);
      }
      
      // 4. Llamar al backend (en background, no bloqueante)
      try {
        const token = await getToken();
        if (token) {
          fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } catch (e) {
        console.log('Error en backend logout:', e);
      }
      
      console.log('🔵 Logout completado exitosamente');
    } catch (error) {
      console.error('🔵 Error en logout:', error);
    }
  };

  if (!currentUser) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.content}>
            {/* Foto de Perfil */}
            <View style={styles.photoSection}>
              <TouchableOpacity onPress={handlePickImage} style={styles.photoContainer}>
                {fotoPerfil ? (
                  <Image source={{ uri: `${API_URL.replace('/api', '')}${fotoPerfil}` }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Icon name="person" size={64} color="#ccc" />
                  </View>
                )}
                <View style={styles.photoOverlay}>
                  <Icon name="camera" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
              {loading && <ActivityIndicator style={styles.photoLoader} />}
            </View>

            {/* Info Usuario */}
            <View style={styles.infoSection}>
              <Text style={styles.userName}>{currentUser.nombre_completo}</Text>
              <Text style={styles.userEmail}>{currentUser.email}</Text>
              {currentUser.ano_nacimiento && (
                <Text style={styles.userAge}>Año de nacimiento: {currentUser.ano_nacimiento}</Text>
              )}
            </View>

            {/* Estadísticas */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Mis Turnos</Text>
              
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
                  <Icon name="calendar-outline" size={32} color="#1976d2" />
                  <Text style={styles.statNumber}>{stats.proximos}</Text>
                  <Text style={styles.statLabel}>Próximos</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
                  <Icon name="checkmark-circle-outline" size={32} color="#388e3c" />
                  <Text style={styles.statNumber}>{stats.disputados}</Text>
                  <Text style={styles.statLabel}>Disputados</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: '#ffebee' }]}>
                  <Icon name="close-circle-outline" size={32} color="#d32f2f" />
                  <Text style={styles.statNumber}>{stats.cancelados}</Text>
                  <Text style={styles.statLabel}>Cancelados</Text>
                </View>
              </View>
            </View>

            {/* Botón Logout */}
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <Icon name="log-out-outline" size={24} color="#fff" />
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  closeButton: { padding: 4 },
  content: { padding: 20 },
  photoSection: { alignItems: 'center', marginBottom: 24 },
  photoContainer: { position: 'relative', width: 120, height: 120, borderRadius: 60, overflow: 'hidden', backgroundColor: '#f5f5f5' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8, alignItems: 'center' },
  photoLoader: { marginTop: 12 },
  infoSection: { alignItems: 'center', marginBottom: 32 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#666', marginBottom: 4 },
  userAge: { fontSize: 12, color: '#999' },
  statsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#333', marginVertical: 8 },
  statLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  logoutButton: { flexDirection: 'row', backgroundColor: '#d32f2f', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
