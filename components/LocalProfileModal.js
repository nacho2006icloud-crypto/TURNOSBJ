import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api';

export default function LocalProfileModal({ visible, onClose, currentUser, onUpdate }) {
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('¿Estás seguro que deseas cerrar sesión?');
      if (!confirmLogout) return;
      performLogout();
    } else {
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro que deseas salir?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: performLogout }
        ]
      );
    }
  };

  const performLogout = async () => {
    console.log('🔴 LOCAL - Cerrando sesión...');
    
    try {
      // Limpiar token del storage
      if (Platform.OS === 'web') {
        localStorage.removeItem('auth_token');
      } else {
        await AsyncStorage.removeItem('auth_token');
      }
      
      // Cerrar modal
      onClose();
      
      // Notificar al padre
      if (onUpdate) {
        onUpdate(null);
      }
      
      console.log('🔴 LOCAL - Logout completado');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  if (!currentUser) return null;

  const localData = currentUser.local_data || {};

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mi Cancha</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.content}>
            {/* Info de la Cancha */}
            <View style={styles.infoSection}>
              <View style={styles.iconContainer}>
                <Icon name="business" size={48} color="#0000CD" />
              </View>
              <Text style={styles.canchaNombre}>{localData.nombre || 'Mi Cancha'}</Text>
              <Text style={styles.canchaEmail}>{currentUser.email}</Text>
              {localData.direccion && (
                <View style={styles.direccionContainer}>
                  <Icon name="location" size={16} color="#666" />
                  <Text style={styles.direccionText}>{localData.direccion}</Text>
                </View>
              )}
            </View>

            {/* Información adicional */}
            <View style={styles.detailsSection}>
              {localData.deportes && (
                <View style={styles.detailItem}>
                  <Icon name="football" size={20} color="#0000CD" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Deportes</Text>
                    <Text style={styles.detailValue}>{localData.deportes}</Text>
                  </View>
                </View>
              )}

              {localData.precio_hora && (
                <View style={styles.detailItem}>
                  <Icon name="cash" size={20} color="#0000CD" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Precio por hora</Text>
                    <Text style={styles.detailValue}>${localData.precio_hora}</Text>
                  </View>
                </View>
              )}

              {localData.descripcion && (
                <View style={styles.detailItem}>
                  <Icon name="information-circle" size={20} color="#0000CD" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Descripción</Text>
                    <Text style={styles.detailValue}>{localData.descripcion}</Text>
                  </View>
                </View>
              )}

              <View style={styles.detailItem}>
                <Icon name={localData.visible ? 'eye' : 'eye-off'} size={20} color={localData.visible ? '#10b981' : '#666'} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Visibilidad</Text>
                  <Text style={[styles.detailValue, { color: localData.visible ? '#10b981' : '#ef4444' }]}>
                    {localData.visible ? 'Visible para usuarios' : 'Oculta'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Botón Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
  
  // Info Section
  infoSection: { alignItems: 'center', marginBottom: 32 },
  iconContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#e3f2fd', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  canchaNombre: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4, textAlign: 'center' },
  canchaEmail: { fontSize: 14, color: '#666', marginBottom: 8 },
  direccionContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  direccionText: { fontSize: 12, color: '#666' },
  
  // Details Section
  detailsSection: { marginBottom: 24 },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  detailValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  
  // Logout Button
  logoutButton: { flexDirection: 'row', backgroundColor: '#d32f2f', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
