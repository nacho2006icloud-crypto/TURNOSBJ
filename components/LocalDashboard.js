import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Platform, LayoutAnimation, UIManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LocalDashboard({ currentUser, onLogout }) {
  const insets = useSafeAreaInsets();
  const [horarios, setHorarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localInfo, setLocalInfo] = useState(null);
  const [expandedDays, setExpandedDays] = useState({}); // Track expanded state per day

  useEffect(() => {
    loadData();
  }, []);

  const getToken = async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('auth_token');
    }
    return await AsyncStorage.getItem('auth_token');
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
      const response = await fetch(`${API_URL}/local/horarios/${horarioId}/disponibilidad`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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

  // Toggle función con animación
  const toggleDay = (dia) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDays(prev => ({
      ...prev,
      [dia]: !prev[dia]
    }));
  };

  // Clasificar turnos por estado (ocupados/libres)
  const turnosOcupados = horarios.filter(h => {
    const reservasDelHorario = getReservasParaHorario(h.id);
    return reservasDelHorario.length > 0 && h.disponible;
  }).sort((a, b) => {
    const diaIndexA = diasOrden.indexOf(a.dia);
    const diaIndexB = diasOrden.indexOf(b.dia);
    if (diaIndexA !== diaIndexB) return diaIndexA - diaIndexB;
    return a.hora_inicio.localeCompare(b.hora_inicio);
  });

  const turnosLibres = horarios.filter(h => {
    const reservasDelHorario = getReservasParaHorario(h.id);
    return reservasDelHorario.length === 0 && h.disponible;
  }).sort((a, b) => {
    const diaIndexA = diasOrden.indexOf(a.dia);
    const diaIndexB = diasOrden.indexOf(b.dia);
    if (diaIndexA !== diaIndexB) return diaIndexA - diaIndexB;
    return a.hora_inicio.localeCompare(b.hora_inicio);
  });

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
        {/* Vista Rápida: Turnos Ocupados y Libres */}
        {horarios.length > 0 && (
          <View style={styles.quickView}>
            <Text style={styles.quickViewTitle}>Vista Rápida</Text>
            
            {/* Turnos OCUPADOS */}
            {turnosOcupados.length > 0 && (
              <View style={styles.turnosSection}>
                <View style={styles.turnosSectionHeader}>
                  <Icon name="checkmark-circle" size={20} color="#ef4444" />
                  <Text style={styles.turnosSectionTitle}>Turnos Ocupados ({turnosOcupados.length})</Text>
                </View>
                {turnosOcupados.map(turno => {
                  const reservas = getReservasParaHorario(turno.id);
                  return (
                    <View key={turno.id} style={[styles.turnoCard, styles.turnoOcupado]}>
                      <View style={styles.turnoCardHeader}>
                        <Text style={styles.turnoDia}>{turno.dia}</Text>
                        {turno.deporte && (
                          <View style={[styles.turnoDeporteBadge, { backgroundColor: '#ef4444' }]}>
                            <Text style={styles.turnoDeporteText}>{turno.deporte}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.turnoHora}>{turno.hora_inicio} - {turno.hora_fin}</Text>
                      <Text style={styles.turnoReservas}>
                        {reservas.length} reserva{reservas.length > 1 ? 's' : ''} • 
                        {turno.max_integrantes && ` ${turno.max_integrantes} jugadores máx.`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Turnos LIBRES */}
            {turnosLibres.length > 0 && (
              <View style={styles.turnosSection}>
                <View style={styles.turnosSectionHeader}>
                  <Icon name="time-outline" size={20} color="#10b981" />
                  <Text style={styles.turnosSectionTitle}>Turnos Libres ({turnosLibres.length})</Text>
                </View>
                {turnosLibres.map(turno => (
                  <View key={turno.id} style={[styles.turnoCard, styles.turnoLibre]}>
                    <View style={styles.turnoCardHeader}>
                      <Text style={styles.turnoDia}>{turno.dia}</Text>
                      {turno.deporte && (
                        <View style={[styles.turnoDeporteBadge, { backgroundColor: '#10b981' }]}>
                          <Text style={styles.turnoDeporteText}>{turno.deporte}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.turnoHora}>{turno.hora_inicio} - {turno.hora_fin}</Text>
                    {turno.max_integrantes && (
                      <Text style={styles.turnoReservas}>{turno.max_integrantes} jugadores máx.</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {horariosPorDia.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay turnos configurados</Text>
            <Text style={styles.emptySubtext}>Andá a Configuración para crear turnos</Text>
          </View>
        ) : (
          horariosPorDia.map(({ dia, horarios: horariosDelDia }) => {
            const isExpanded = expandedDays[dia];
            const reservasCount = horariosDelDia.reduce((sum, h) => sum + getReservasParaHorario(h.id).length, 0);
            
            return (
              <View key={dia} style={styles.diaSection}>
                {/* Cabecera clickeable del día */}
                <TouchableOpacity 
                  onPress={() => toggleDay(dia)}
                  activeOpacity={0.7}
                  style={[styles.diaHeader, { backgroundColor: getDiaColor(dia) }]}
                >
                  <View style={styles.diaHeaderLeft}>
                    <Icon 
                      name={isExpanded ? "chevron-down" : "chevron-forward"} 
                      size={24} 
                      color="#fff" 
                    />
                    <Text style={styles.diaTitle}>{dia}</Text>
                  </View>
                  <View style={styles.diaHeaderRight}>
                    <Text style={styles.diaCount}>{horariosDelDia.length} turno{horariosDelDia.length !== 1 ? 's' : ''}</Text>
                    {reservasCount > 0 && (
                      <View style={styles.reservasBadge}>
                        <Icon name="checkmark-circle" size={14} color="#fff" />
                        <Text style={styles.reservasBadgeText}>{reservasCount}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Contenido expandible */}
                {isExpanded && horariosDelDia.map(horario => {
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

                      {horario.deporte && (
                        <View style={styles.horarioMeta}>
                          <Icon name="football-outline" size={16} color="#666" />
                          <Text style={styles.horarioMetaText}>{horario.deporte}</Text>
                        </View>
                      )}

                      {/* Estado de reserva */}
                      {estaReservado ? (
                        <View style={styles.reservadoContainer}>
                          <Icon name="checkmark-circle" size={18} color="#10b981" />
                          <Text style={styles.reservadoText}>
                            Reservado por: {reservasDelHorario.map(r => r.usuario_nombre).join(', ')}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.libreContainer}>
                          <Icon name="time-outline" size={18} color="#94a3b8" />
                          <Text style={styles.libreText}>Turno libre</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })
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
  diaHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  diaHeaderLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  diaHeaderRight: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  diaTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  diaCount: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  reservasBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: 'rgba(255,255,255,0.3)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  reservasBadgeText: { 
    fontSize: 12, 
    color: '#fff', 
    fontWeight: 'bold' 
  },
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
  libreText: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },
  reservadoContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#f0fdf4', 
    padding: 10, 
    borderRadius: 8, 
    borderLeftWidth: 3, 
    borderLeftColor: '#10b981',
    marginTop: 8
  },
  reservadoText: { 
    fontSize: 14, 
    color: '#10b981', 
    fontWeight: '600',
    flex: 1
  },
  
  // Vista Rápida styles
  quickView: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  quickViewTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  turnosSection: { marginBottom: 16 },
  turnosSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  turnosSectionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  turnoCard: { padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4 },
  turnoOcupado: { backgroundColor: '#fef2f2', borderLeftColor: '#ef4444' },
  turnoLibre: { backgroundColor: '#f0fdf4', borderLeftColor: '#10b981' },
  turnoCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  turnoDia: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  turnoDeporteBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  turnoDeporteText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  turnoHora: { fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 4 },
  turnoReservas: { fontSize: 12, color: '#999' },
});

