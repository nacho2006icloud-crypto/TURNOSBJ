import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api';

export default function LocalDashboard({ currentUser, onLogout }) {
  const insets = useSafeAreaInsets();
  const [horarios, setHorarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localInfo, setLocalInfo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const getToken = async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('token');
    }
    return await AsyncStorage.getItem('token');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      
      // Cargar horarios
      const horariosRes = await fetch(`${API_URL}/local/horarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const horariosData = await horariosRes.json();
      setHorarios(Array.isArray(horariosData) ? horariosData : []);

      // Cargar reservas
      const reservasRes = await fetch(`${API_URL}/local/reservas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (reservasRes.ok) {
        const reservasData = await reservasRes.json();
        setReservas(Array.isArray(reservasData) ? reservasData : []);
      }

      // Cargar info del local
      const infoRes = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (infoRes.ok) {
        const userData = await infoRes.json();
        setLocalInfo(userData.local_data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHorarioDisponible = async (horarioId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/local/horarios/${horarioId}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el horario');
    }
  };

  const eliminarHorario = async (horarioId) => {
    Alert.alert(
      'Confirmar',
      '¿Eliminar este horario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await fetch(`${API_URL}/local/horarios/${horarioId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              loadData();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          }
        }
      ]
    );
  };

  const getDiaColor = (dia) => {
    const colors = {
      'Lunes': '#3b82f6',
      'Martes': '#8b5cf6',
      'Miércoles': '#10b981',
      'Jueves': '#f59e0b',
      'Viernes': '#ef4444',
      'Sábado': '#06b6d4',
      'Domingo': '#ec4899'
    };
    return colors[dia] || '#666';
  };

  const getReservasParaHorario = (horarioId) => {
    return reservas.filter(r => r.horario_id === horarioId);
  };

  const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const horariosPorDia = diasOrden.map(dia => ({
    dia,
    horarios: horarios.filter(h => h.dia === dia).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
  })).filter(d => d.horarios.length > 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mi Cancha</Text>
          <Text style={styles.headerSubtitle}>{localInfo?.nombre || currentUser?.nombre_completo}</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{horarios.length}</Text>
            <Text style={styles.statLabel}>Turnos</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{reservas.length}</Text>
            <Text style={styles.statLabel}>Reservas</Text>
          </View>
        </View>
      </View>

      {/* Visibilidad */}
      {localInfo && (
        <View style={[styles.visibilityBanner, localInfo.visible ? styles.visibleBanner : styles.hiddenBanner]}>
          <Icon name={localInfo.visible ? 'eye' : 'eye-off'} size={20} color="#fff" />
          <Text style={styles.visibilityText}>
            {localInfo.visible ? '✓ Cancha visible para usuarios' : '✗ Cancha oculta - Configurá para mostrar'}
          </Text>
        </View>
      )}

      {/* Horarios y Reservas */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
      >
        {horariosPorDia.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay turnos configurados</Text>
            <Text style={styles.emptySubtext}>Andá a Configuración para crear turnos</Text>
          </View>
        ) : (
          horariosPorDia.map(({ dia, horarios: horariosDelDia }) => (
            <View key={dia} style={styles.diaSection}>
              <View style={[styles.diaHeader, { backgroundColor: getDiaColor(dia) }]}>
                <Text style={styles.diaTitle}>{dia}</Text>
                <Text style={styles.diaCount}>{horariosDelDia.length} turnos</Text>
              </View>

              {horariosDelDia.map(horario => {
                const reservasDelHorario = getReservasParaHorario(horario.id);
                const estaReservado = reservasDelHorario.length > 0;

                return (
                  <View key={horario.id} style={styles.horarioCard}>
                    <View style={styles.horarioHeader}>
                      <View style={styles.horarioTime}>
                        <Icon name="time-outline" size={20} color="#333" />
                        <Text style={styles.horarioTimeText}>
                          {horario.hora_inicio} - {horario.hora_fin}
                        </Text>
                      </View>

                      <View style={styles.horarioActions}>
                        <TouchableOpacity
                          style={[styles.toggleButton, horario.disponible ? styles.disponibleButton : styles.noDisponibleButton]}
                          onPress={() => toggleHorarioDisponible(horario.id)}
                        >
                          <Text style={styles.toggleButtonText}>
                            {horario.disponible ? 'Habilitado' : 'Deshabilitado'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => eliminarHorario(horario.id)} style={styles.deleteButton}>
                          <Icon name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Info adicional del horario */}
                    {horario.max_integrantes && (
                      <View style={styles.horarioMeta}>
                        <Icon name="people-outline" size={16} color="#666" />
                        <Text style={styles.horarioMetaText}>Máx. {horario.max_integrantes} personas</Text>
                      </View>
                    )}

                    {/* Reservas */}
                    {estaReservado ? (
                      <View style={styles.reservasContainer}>
                        <Text style={styles.reservasTitle}>Reservado por:</Text>
                        {reservasDelHorario.map(reserva => (
                          <View key={reserva.id} style={styles.reservaItem}>
                            <Icon name="person" size={16} color="#0000CD" />
                            <Text style={styles.reservaNombre}>{reserva.usuario_nombre}</Text>
                            <Text style={styles.reservaFecha}>{new Date(reserva.fecha_reserva).toLocaleDateString()}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.libreContainer}>
                        <Icon name="checkmark-circle-outline" size={16} color="#10b981" />
                        <Text style={styles.libreText}>Turno libre</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  headerStats: { flexDirection: 'row', gap: 16 },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  visibilityBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, marginHorizontal: 16, marginTop: 16, borderRadius: 8 },
  visibleBanner: { backgroundColor: '#10b981' },
  hiddenBanner: { backgroundColor: '#f59e0b' },
  visibilityText: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
  content: { flex: 1, padding: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  diaSection: { marginBottom: 24 },
  diaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8 },
  diaTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  diaCount: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  horarioCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 16, marginBottom: 12 },
  horarioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  horarioTime: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  horarioTimeText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  horarioActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  disponibleButton: { backgroundColor: '#10b981' },
  noDisponibleButton: { backgroundColor: '#ef4444' },
  toggleButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  deleteButton: { padding: 4 },
  horarioMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  horarioMetaText: { fontSize: 14, color: '#666' },
  reservasContainer: { backgroundColor: '#f0f9ff', padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#0000CD' },
  reservasTitle: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 8 },
  reservaItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  reservaNombre: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1 },
  reservaFecha: { fontSize: 12, color: '#666' },
  libreContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  libreText: { fontSize: 14, color: '#10b981', fontWeight: '500' },
});
