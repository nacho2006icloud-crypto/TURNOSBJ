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
  RefreshControl,
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
  const [deporteSeleccionado, setDeporteSeleccionado] = useState('favoritas');
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
      if (deporteSeleccionado === 'favoritas') {
        // Cargar canchas favoritas (implementar después)
        setCanchas([]);
      } else {
        console.log('🔍 Cargando canchas para:', deporteSeleccionado);
        const canchasData = await canchasService.getCanchasPorDeporte(deporteSeleccionado);
        console.log('✅ Canchas cargadas:', canchasData ? canchasData.length : 0);
        setCanchas(Array.isArray(canchasData) ? canchasData : []);
      }
    } catch (error) {
      console.error('❌ Error cargando canchas:', error);
      setCanchas([]);
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
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={cargarDatos}
          tintColor="rgba(255,255,255,0.8)"
          colors={['#0000CD', '#3b82f6']}
          progressViewOffset={80 + insets.top}
        />
      }
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

      {/* Sección 2: Canchas */}
      <View style={[styles.section, { height: sectionHeight }]}>
        <View style={styles.transparentBg}>
          <View style={styles.sectionContent}>
            <Ionicons name="football" size={48} color="rgba(255,255,255,0.9)" />
            <Text style={styles.sectionTitle}>Canchas</Text>
            
            {/* Contenedor de selectores */}
            <View style={styles.selectoresContainer}>
              
              {/* CANCHAS FAVORITAS - Botón fijo (sin scroll) */}
              <View style={styles.favoritasContainer}>
                <TouchableOpacity
                  style={[
                    styles.deporteButton,
                    deporteSeleccionado === 'favoritas' && styles.deporteButtonActive,
                  ]}
                  onPress={() => setDeporteSeleccionado('favoritas')}
                >
                  <Ionicons 
                    name="heart" 
                    size={20} 
                    color={deporteSeleccionado === 'favoritas' ? '#fff' : 'rgba(255,255,255,0.7)'} 
                  />
                  <Text style={[
                    styles.deporteButtonText,
                    deporteSeleccionado === 'favoritas' && styles.deporteButtonTextActive,
                  ]}>
                    Canchas Favoritas
                  </Text>
                </TouchableOpacity>
              </View>

              {/* BARRA SEPARADORA */}
              <View style={styles.deportesSeparator} />

              {/* DEPORTES - Con scroll horizontal */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.deportesScroll}
                contentContainerStyle={styles.deportesScrollContent}
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
            </View>

            {/* Lista de canchas con scroll vertical */}
            <View style={styles.canchasListContainer}>
              <FlatList
                data={canchas}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.canchasContainer}
                numColumns={2}
                key={`flatlist-${dimensions.width}`}
                columnWrapperStyle={styles.canchasRow}
                nestedScrollEnabled={true}
                style={styles.canchasList}
                renderItem={({ item }) => {
                  const cardWidth = (dimensions.width - 60) / 2; // Responsive width
                  const deporteIcon = deporteSeleccionado === 'favoritas' 
                    ? 'heart' 
                    : (deportesConfig[deporteSeleccionado]?.icon || 'football');
                  const deporteColor = deporteSeleccionado === 'favoritas' 
                    ? '#ff6b9d' 
                    : (deportesConfig[deporteSeleccionado]?.color || '#0000CD');
                  
                  return (
                    <TouchableOpacity 
                      style={[styles.canchaCard, { width: cardWidth, height: cardWidth }]}
                      activeOpacity={0.8}
                    >
                      <View style={styles.canchaImageContainer}>
                        {item.fotos && item.fotos.length > 0 ? (
                          <View style={styles.canchaImage}>
                            {/* Placeholder para imagen real */}
                            <Ionicons 
                              name="image" 
                              size={32} 
                              color="rgba(255,255,255,0.6)" 
                            />
                          </View>
                        ) : (
                          <View style={styles.canchaImagePlaceholder}>
                            <Ionicons 
                              name={deporteIcon} 
                              size={32} 
                              color={deporteColor} 
                            />
                          </View>
                        )}
                        
                        {/* Botón de favorito */}
                        <TouchableOpacity style={styles.favoriteBtn}>
                          <Ionicons name="heart-outline" size={18} color="#fff" />
                        </TouchableOpacity>

                        {/* Precio overlay */}
                        <View style={styles.priceOverlay}>
                          <Text style={styles.priceText}>
                            ${parseFloat(item.precio_hora) || 0}/h
                          </Text>
                        </View>
                      </View>

                      <View style={styles.canchaInfo}>
                        <Text style={styles.canchaNombre} numberOfLines={1}>
                          {item.nombre}
                        </Text>
                        <View style={styles.canchaMetaRow}>
                          <View style={styles.canchaRatingRow}>
                            <Ionicons name="star" size={12} color="#fbbf24" />
                            <Text style={styles.canchaRating}>
                              {(parseFloat(item.rating) || 0).toFixed(1)}
                            </Text>
                          </View>
                          <Text style={styles.canchaDistance}>2.1km</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={[styles.emptyContainer, { width: dimensions.width - 40 }]}>
                    <Ionicons 
                      name={deporteSeleccionado === 'favoritas' ? 'heart-outline' : 'search'} 
                      size={48} 
                      color="rgba(255,255,255,0.3)" 
                    />
                    <Text style={styles.emptyText}>
                      {deporteSeleccionado === 'favoritas' 
                        ? 'Sin canchas favoritas' 
                        : 'No hay canchas disponibles'
                      }
                    </Text>
                    <Text style={styles.emptySubtext}>
                      {deporteSeleccionado === 'favoritas'
                        ? 'Toca el ❤️ en las canchas que más te gustan para guardarlas aquí'
                        : 'Prueba con otro deporte o verifica tu conexión'
                      }
                    </Text>
                  </View>
                }
              />
            </View>
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
  selectoresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  
  // Favoritas - Botón fijo
  favoritasContainer: {
    marginRight: 16,
  },
  
  // Deportes - Con scroll
  deportesScroll: {
    flex: 1,
    maxHeight: 50,
  },
  deportesScrollContent: {
    alignItems: 'center',
    paddingRight: 20, // Espacio extra al final
  },
  
  // Estilo común para todos los botones
  deporteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
    gap: 8,
    minWidth: 120, // Ancho mínimo para consistencia
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Barra separadora
  deportesSeparator: {
    width: 2,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 1,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Estados activos
  deporteButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  
  // Texto de botones
  deporteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    includeFontPadding: false,
    textAlign: 'center',
  },
  deporteButtonTextActive: {
    color: '#fff',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  canchasListContainer: {
    flex: 1,
    marginTop: 16,
  },
  canchasList: {
    flex: 1,
  },
  canchasContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  canchasRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  canchaCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  canchaImageContainer: {
    flex: 1,
    position: 'relative',
  },
  canchaImage: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canchaImagePlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    includeFontPadding: false,
  },
  canchaInfo: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  canchaNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    includeFontPadding: false,
  },
  canchaMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  canchaRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  canchaRating: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    includeFontPadding: false,
  },
  canchaDistance: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    includeFontPadding: false,
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 16,
    includeFontPadding: false,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
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
