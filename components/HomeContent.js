import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { turnosService, canchasService, goatsService, deportesConfig } from '../services/dataService';

export default function HomeContent() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  
  // Estados
  const [proximoTurno, setProximoTurno] = useState(null);
  const [deporteSeleccionado, setDeporteSeleccionado] = useState('futbol');
  const [canchas, setCanchas] = useState([]);
  const [topJugadores, setTopJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  // Altura de cada sección = pantalla completa menos el header y el mainbar
  const sectionHeight = dimensions.height - 80 - 72 - insets.top - insets.bottom;

  // Manejar cambios de dimensiones (responsive)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
      });
    });

    return () => subscription?.remove();
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  // Cargar canchas cuando cambia el deporte
  useEffect(() => {
    cargarCanchas();
  }, [deporteSeleccionado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [turno, jugadores] = await Promise.all([
        turnosService.getProximoTurno(),
        goatsService.getTopJugadores(10),
      ]);
      setProximoTurno(turno);
      setTopJugadores(jugadores);
      await cargarCanchas();
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCanchas = async () => {
    try {
      const canchasData = await canchasService.getCanchasPorDeporte(deporteSeleccionado);
      setCanchas(canchasData);
    } catch (error) {
      console.error('Error cargando canchas:', error);
    }
  };

  const votarJugador = async (jugadorId) => {
    try {
      const result = await goatsService.votarJugador(jugadorId, 10);
      if (result.success) {
        // Actualizar lista
        const jugadoresActualizados = await goatsService.getTopJugadores(10);
        setTopJugadores(jugadoresActualizados);
      }
    } catch (error) {
      console.error('Error votando jugador:', error);
    }
  };

  const deportes = Object.keys(deportesConfig);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: 80 + insets.top, paddingBottom: 72 + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      {/* Sección 1: Tus Turnos */}
      <View style={[styles.section, { height: sectionHeight }]}>
        <View style={styles.transparentBg}>
          <View style={styles.sectionContent}>
            <Ionicons name="calendar" size={48} color="rgba(255,255,255,0.9)" />
            <Text style={styles.sectionTitle}>Tus Turnos</Text>
            
            {loading ? (
              <ActivityIndicator size="large" color="#fff" style={{ marginTop: 30 }} />
            ) : proximoTurno ? (
              <View style={styles.turnoCard}>
                <View style={styles.turnoHeader}>
                  <View style={styles.turnoIconContainer}>
                    <Ionicons 
                      name={deportesConfig[proximoTurno.deporte.toLowerCase()]?.icon || 'football'} 
                      size={32} 
                      color="#0000CD" 
                    />
                  </View>
                  <View style={styles.turnoInfo}>
                    <Text style={styles.turnoCancha}>{proximoTurno.cancha}</Text>
                    <Text style={styles.turnoDeporte}>{proximoTurno.deporte}</Text>
                  </View>
                </View>
                
                <View style={styles.turnoDivider} />
                
                <View style={styles.turnoDetails}>
                  <View style={styles.turnoDetailRow}>
                    <Ionicons name="location" size={18} color="#64748b" />
                    <Text style={styles.turnoDetailText}>{proximoTurno.ubicacion}</Text>
                  </View>
                  <View style={styles.turnoDetailRow}>
                    <Ionicons name="time" size={18} color="#64748b" />
                    <Text style={styles.turnoDetailText}>
                      {proximoTurno.hora} • {proximoTurno.duracion}
                    </Text>
                  </View>
                  <View style={styles.turnoDetailRow}>
                    <Ionicons name="calendar-outline" size={18} color="#64748b" />
                    <Text style={styles.turnoDetailText}>
                      {new Date(proximoTurno.fecha).toLocaleDateString('es-AR')}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.turnoButton}>
                  <Text style={styles.turnoButtonText}>Ver detalles</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noTurnoCard}>
                <Ionicons name="calendar-outline" size={48} color="rgba(255,255,255,0.6)" />
                <Text style={styles.noTurnoText}>No tienes turnos agendados</Text>
                <Text style={styles.noTurnoSubtext}>
                  Explora las canchas disponibles y reserva tu próximo turno
                </Text>
                <TouchableOpacity style={styles.noTurnoButton}>
                  <Text style={styles.noTurnoButtonText}>Buscar canchas</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Espaciador */}
      <View style={styles.sectionSpacer} />

      {/* Sección 2: Clasificación de Canchas */}
      <View style={[styles.section, { height: sectionHeight }]}>
        <View style={styles.transparentBg}>
          <View style={styles.sectionContent}>
            <Ionicons name="trophy" size={48} color="rgba(255,255,255,0.9)" />
            <Text style={styles.sectionTitle}>Clasificación de Canchas</Text>
            
            {/* Botones de deportes */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.deportesScroll}
              contentContainerStyle={styles.deportesContainer}
            >
              {deportes.map((deporte) => (
                <TouchableOpacity
                  key={deporte}
                  style={[
                    styles.deporteButton,
                    deporteSeleccionado === deporte && styles.deporteButtonActive,
                  ]}
                  onPress={() => setDeporteSeleccionado(deporte)}
                >
                  <Ionicons 
                    name={deportesConfig[deporte].icon} 
                    size={20} 
                    color={deporteSeleccionado === deporte ? '#fff' : 'rgba(255,255,255,0.7)'} 
                  />
                  <Text style={[
                    styles.deporteButtonText,
                    deporteSeleccionado === deporte && styles.deporteButtonTextActive,
                  ]}>
                    {deporte.charAt(0).toUpperCase() + deporte.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Lista de canchas */}
            <FlatList
              data={canchas}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.canchasContainer}
              numColumns={2}
              key={`flatlist-${dimensions.width}`}
              columnWrapperStyle={styles.canchasRow}
              renderItem={({ item }) => (
                <View style={[styles.canchaCard, { width: (dimensions.width - 52) / 2 }]}>
                  <View style={styles.canchaImagePlaceholder}>
                    <Ionicons 
                      name={deportesConfig[deporteSeleccionado].icon} 
                      size={60} 
                      color={deportesConfig[deporteSeleccionado].color} 
                    />
                  </View>
                  <View style={styles.canchaInfo}>
                    <Text style={styles.canchaNombre} numberOfLines={2}>
                      {item.nombre}
                    </Text>
                    <View style={styles.canchaRatingRow}>
                      <Ionicons name="star" size={14} color="#fbbf24" />
                      <Text style={styles.canchaRating}>{item.rating}</Text>
                    </View>
                    <Text style={styles.canchaUbicacion} numberOfLines={1}>
                      <Ionicons name="location" size={12} color="#64748b" /> {item.ubicacion}
                    </Text>
                    <Text style={styles.canchaPrecio}>${item.precio.toLocaleString()}/hora</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay canchas disponibles</Text>
                </View>
              }
            />
          </View>
        </View>
      </View>

      {/* Espaciador */}
      <View style={styles.sectionSpacer} />

      {/* Sección 3: GOATS */}
      <View style={[styles.section, { height: sectionHeight }]}>
        <View style={styles.transparentBg}>
          <View style={styles.sectionContent}>
            <Ionicons name="flame" size={48} color="rgba(255,255,255,0.9)" />
            <Text style={styles.sectionTitle}>GOATS</Text>
            <Text style={styles.sectionSubtitle}>
              Los mejores jugadores de la comunidad
            </Text>

            <FlatList
              data={topJugadores}
              keyExtractor={(item) => item.id.toString()}
              style={styles.goatsList}
              contentContainerStyle={styles.goatsListContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.goatCard}>
                  <View style={styles.goatPosition}>
                    <Text style={styles.goatPositionText}>#{item.posicion}</Text>
                  </View>
                  
                  <View style={styles.goatAvatar}>
                    <Text style={styles.goatAvatarText}>
                      {item.nombre.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>

                  <View style={styles.goatInfo}>
                    <Text style={styles.goatNombre}>{item.nombre}</Text>
                    <View style={styles.goatMetaRow}>
                      <Text style={styles.goatDeporte}>{item.deporte}</Text>
                      <Text style={styles.goatNivel}>• {item.nivel}</Text>
                    </View>
                    <Text style={styles.goatPartidos}>
                      {item.partidosJugados} partidos jugados
                    </Text>
                  </View>

                  <View style={styles.goatRight}>
                    <Text style={styles.goatPuntos}>{item.puntos}</Text>
                    <Text style={styles.goatPuntosLabel}>puntos</Text>
                    <TouchableOpacity 
                      style={styles.goatVoteButton}
                      onPress={() => votarJugador(item.id)}
                    >
                      <Ionicons name="arrow-up" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  section: {
    width: '100%',
  },
  sectionSpacer: {
    height: 40,
    backgroundColor: 'transparent',
  },
  solidBg: {
    flex: 1,
    width: '100%',
  },
  transparentBg: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  blackBg: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0f0f0f',
  },
  gradientOverlay: {
    flex: 1,
    width: '100%',
  },
  gradientBg: {
    flex: 1,
    width: '100%',
  },
  sectionContent: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: Platform.OS === 'ios' ? '700' : '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    includeFontPadding: false,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    includeFontPadding: false,
  },

  // === SECCIÓN 1: TUS TURNOS ===
  turnoCard: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  turnoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  turnoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  turnoInfo: {
    flex: 1,
  },
  turnoCancha: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    includeFontPadding: false,
  },
  turnoDeporte: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0000CD',
    marginTop: 2,
    includeFontPadding: false,
  },
  turnoDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  turnoDetails: {
    marginBottom: 16,
  },
  turnoDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  turnoDetailText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    includeFontPadding: false,
  },
  turnoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0000CD',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  turnoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    includeFontPadding: false,
  },
  noTurnoCard: {
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  noTurnoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
    includeFontPadding: false,
  },
  noTurnoSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  noTurnoButton: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  noTurnoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0000CD',
    includeFontPadding: false,
  },

  // === SECCIÓN 2: CANCHAS ===
  deportesScroll: {
    marginTop: 20,
    maxHeight: 48,
  },
  deportesContainer: {
    paddingHorizontal: 0,
    gap: 8,
  },
  deporteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginRight: 8,
    gap: 6,
  },
  deporteButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  deporteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    includeFontPadding: false,
  },
  deporteButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  canchasContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  canchasRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  canchaCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  canchaImagePlaceholder: {
    height: 140,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canchaInfo: {
    padding: 12,
  },
  canchaNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
    includeFontPadding: false,
    minHeight: 36,
  },
  canchaRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  canchaRating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    includeFontPadding: false,
  },
  canchaUbicacion: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
    includeFontPadding: false,
  },
  canchaPrecio: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0000CD',
    includeFontPadding: false,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },

  // === SECCIÓN 3: GOATS ===
  goatsList: {
    marginTop: 20,
    width: '100%',
  },
  goatsListContent: {
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  goatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  goatPosition: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goatPositionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    includeFontPadding: false,
  },
  goatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goatAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    includeFontPadding: false,
  },
  goatInfo: {
    flex: 1,
  },
  goatNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    includeFontPadding: false,
  },
  goatMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  goatDeporte: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    includeFontPadding: false,
  },
  goatNivel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    includeFontPadding: false,
  },
  goatPartidos: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    includeFontPadding: false,
  },
  goatRight: {
    alignItems: 'flex-end',
  },
  goatPuntos: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    includeFontPadding: false,
  },
  goatPuntosLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    includeFontPadding: false,
  },
  goatVoteButton: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
