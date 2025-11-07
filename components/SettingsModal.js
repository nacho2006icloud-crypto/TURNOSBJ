import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, Image, Platform, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = 'http://localhost:3000/api';

// Configuración de deportes con duraciones
const DEPORTES_CONFIG = {
  'Futbol 5': { duracion: 60, max_default: 10, color: '#4CAF50' },
  'Futbol 7': { duracion: 90, max_default: 14, color: '#2196F3' },
  'Futbol 11': { duracion: 90, max_default: 22, color: '#FF9800' },
  'Padel': { duracion: 90, max_default: 4, color: '#9C27B0' },
  'Tenis': { duracion: 60, max_default: 2, color: '#F44336' },
  'Basquet': { duracion: 60, max_default: 10, color: '#FF5722' },
  'Voley': { duracion: 60, max_default: 12, color: '#00BCD4' },
};

export default function SettingsModal({ visible, onClose, currentUser, onUpdate }) {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [localInfo, setLocalInfo] = useState({ nombre: '', direccion: '', descripcion: '', precio_hora: '', deportes: '' });
  const [fotos, setFotos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [nuevoHorario, setNuevoHorario] = useState({ 
    dias: [], // Array de días seleccionados
    deporte: 'Futbol 5',
    hora_inicio: '', 
    max_integrantes: '10',
    disponible: true 
  });
  const [canchaVisible, setCanchaVisible] = useState(false);
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    if (visible && currentUser?.local_data) {
      setLocalInfo({
        nombre: currentUser.local_data.nombre || '',
        direccion: currentUser.local_data.direccion || '',
        descripcion: currentUser.local_data.descripcion || '',
        precio_hora: currentUser.local_data.precio_hora?.toString() || '',
        deportes: currentUser.local_data.deportes || '',
      });
      const fotosArray = currentUser.local_data.fotos ? (typeof currentUser.local_data.fotos === 'string' ? JSON.parse(currentUser.local_data.fotos) : currentUser.local_data.fotos) : [];
      setFotos(fotosArray);
      setCanchaVisible(currentUser.local_data.visible === 1 || currentUser.local_data.visible === true);
      cargarHorarios();
    }
  }, [visible, currentUser]);

  const getToken = async () => {
    if (Platform.OS === 'web') return localStorage.getItem('authToken');
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    return await AsyncStorage.getItem('authToken');
  };

  const cargarHorarios = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/local/horarios`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setHorarios(data.horarios || []);
      }
    } catch (error) {
      console.log('Error cargando horarios:', error);
    }
  };

  const handleUpdateInfo = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/local/info`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(localInfo),
      });
      if (response.ok) {
        Alert.alert('Éxito', 'Información actualizada correctamente');
        if (onUpdate) onUpdate();
      } else {
        Alert.alert('Error', 'No se pudo actualizar la información');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al actualizar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 });
      if (!result.canceled && result.assets) subirFotos(result.assets);
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar las imágenes');
    }
  };

  const subirFotos = async (assets) => {
    try {
      setLoading(true);
      const token = await getToken();
      const formData = new FormData();
      assets.forEach((asset, index) => {
        formData.append('fotos', { uri: asset.uri, type: 'image/jpeg', name: `foto_${Date.now()}_${index}.jpg` });
      });
      const response = await fetch(`${API_BASE_URL}/local/fotos`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (response.ok) {
        Alert.alert('Éxito', 'Fotos subidas correctamente');
        if (onUpdate) onUpdate();
      } else {
        Alert.alert('Error', 'No se pudieron subir las fotos');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al subir fotos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarFoto = async (fotoUrl) => {
    Alert.alert('Confirmar', '¿Eliminar esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/local/fotos`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ fotoUrl }),
            });
            if (response.ok) {
              Alert.alert('Éxito', 'Foto eliminada');
              setFotos(fotos.filter(f => f !== fotoUrl));
              if (onUpdate) onUpdate();
            }
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar la foto');
          }
        }
      }
    ]);
  };

  const agregarHorario = async () => {
    // Validar días seleccionados
    if (nuevoHorario.dias.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos un día');
      return;
    }

    // Validar hora de inicio
    if (!nuevoHorario.hora_inicio) {
      Alert.alert('Error', 'Debes ingresar hora de inicio (formato: HH:MM)');
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(nuevoHorario.hora_inicio)) {
      Alert.alert('Error', 'Formato de hora inválido. Usa HH:MM (ejemplo: 09:00)');
      return;
    }

    // Calcular hora_fin automáticamente según deporte
    const deporteConfig = DEPORTES_CONFIG[nuevoHorario.deporte];
    const [horas, minutos] = nuevoHorario.hora_inicio.split(':').map(Number);
    const inicioEnMinutos = horas * 60 + minutos;
    const finEnMinutos = inicioEnMinutos + deporteConfig.duracion;
    const horaFin = Math.floor(finEnMinutos / 60);
    const minutoFin = finEnMinutos % 60;
    const hora_fin = `${String(horaFin).padStart(2, '0')}:${String(minutoFin).padStart(2, '0')}`;

    if (horaFin >= 24) {
      Alert.alert('Error', 'El turno se extiende más allá de las 24:00. Elige una hora de inicio más temprana.');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      // Crear turno para cada día seleccionado
      const promesas = nuevoHorario.dias.map(dia =>
        fetch(`${API_BASE_URL}/local/horarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            dia,
            deporte: nuevoHorario.deporte,
            hora_inicio: nuevoHorario.hora_inicio,
            hora_fin,
            max_integrantes: parseInt(nuevoHorario.max_integrantes),
            disponible: true
          })
        })
      );

      await Promise.all(promesas);
      
      Alert.alert('Éxito', `Turnos creados para ${nuevoHorario.dias.length} día(s)`);
      setNuevoHorario({ 
        dias: [], 
        deporte: 'Futbol 5',
        hora_inicio: '', 
        max_integrantes: '10',
        disponible: true 
      });
      cargarHorarios();
    } catch (error) {
      Alert.alert('Error', 'No se pudieron crear los turnos');
    } finally {
      setLoading(false);
    }
  };

  const eliminarHorario = async (id) => {
    Alert.alert('Confirmar', '¿Eliminar este horario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/local/horarios/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
              Alert.alert('Éxito', 'Horario eliminado');
              cargarHorarios();
            }
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el horario');
          }
        }
      }
    ]);
  };

  const toggleHorario = async (id, disponibleActual) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/local/horarios/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ disponible: !disponibleActual })
      });
      if (response.ok) cargarHorarios();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el horario');
    }
  };

  const toggleVisibilidad = async () => {
    try {
      const nuevaVisibilidad = !canchaVisible;
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/local/visibilidad`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ visible: nuevaVisibilidad })
      });
      if (response.ok) {
        setCanchaVisible(nuevaVisibilidad);
        Alert.alert('Éxito', nuevaVisibilidad ? 'Tu cancha ahora es visible para todos los usuarios' : 'Tu cancha está oculta. Los usuarios no la verán.');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar la visibilidad');
    }
  };

  const renderInfoTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.label}>Nombre del Local</Text>
      <TextInput style={styles.input} value={localInfo.nombre} onChangeText={(text) => setLocalInfo({ ...localInfo, nombre: text })} placeholder="Nombre de tu cancha" />
      <Text style={styles.label}>Dirección</Text>
      <TextInput style={styles.input} value={localInfo.direccion} onChangeText={(text) => setLocalInfo({ ...localInfo, direccion: text })} placeholder="Dirección completa" />
      <Text style={styles.label}>Descripción</Text>
      <TextInput style={[styles.input, styles.textArea]} value={localInfo.descripcion} onChangeText={(text) => setLocalInfo({ ...localInfo, descripcion: text })} placeholder="Describe tu cancha..." multiline numberOfLines={4} />
      <Text style={styles.label}>Deportes (separados por coma)</Text>
      <TextInput style={styles.input} value={localInfo.deportes} onChangeText={(text) => setLocalInfo({ ...localInfo, deportes: text })} placeholder="Ej: Fútbol, Tenis, Básquet" />
      <Text style={styles.label}>Precio por Hora ($)</Text>
      <TextInput style={styles.input} value={localInfo.precio_hora} onChangeText={(text) => setLocalInfo({ ...localInfo, precio_hora: text })} placeholder="Precio" keyboardType="numeric" />
      <TouchableOpacity style={styles.saveButton} onPress={handleUpdateInfo} disabled={loading}>
        <Text style={styles.saveButtonText}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Text>
      </TouchableOpacity>
      <View style={styles.visibilityContainer}>
        <View style={styles.visibilityInfo}>
          <Icon name={canchaVisible ? "eye" : "eye-off"} size={24} color={canchaVisible ? "#4CAF50" : "#999"} />
          <View style={styles.visibilityText}>
            <Text style={styles.visibilityTitle}>{canchaVisible ? 'Cancha Visible' : 'Cancha Oculta'}</Text>
            <Text style={styles.visibilitySubtitle}>{canchaVisible ? 'Los usuarios pueden ver tu cancha y reservar turnos' : 'Tu cancha no aparece en búsquedas'}</Text>
          </View>
        </View>
        <Switch value={canchaVisible} onValueChange={toggleVisibilidad} trackColor={{ false: '#ccc', true: '#4CAF50' }} />
      </View>
    </ScrollView>
  );

  const renderFotosTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity style={styles.uploadButton} onPress={handlePickImages}>
        <Icon name="camera" size={24} color="#fff" />
        <Text style={styles.uploadButtonText}>Subir Fotos de la Cancha</Text>
      </TouchableOpacity>
      <View style={styles.fotosGrid}>
        {fotos.map((foto, index) => (
          <View key={index} style={styles.fotoContainer}>
            <Image source={{ uri: `http://localhost:3000${foto}` }} style={styles.fotoPreview} />
            <TouchableOpacity style={styles.deleteFotoButton} onPress={() => eliminarFoto(foto)}>
              <Icon name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      {fotos.length === 0 && <Text style={styles.emptyText}>No hay fotos. Agrega fotos de tu cancha para atraer más clientes.</Text>}
    </ScrollView>
  );

  const toggleDia = (dia) => {
    setNuevoHorario(prev => ({
      ...prev,
      dias: prev.dias.includes(dia) 
        ? prev.dias.filter(d => d !== dia)
        : [...prev.dias, dia]
    }));
  };

  const toggleTodosDias = () => {
    setNuevoHorario(prev => ({
      ...prev,
      dias: prev.dias.length === 7 ? [] : [...diasSemana]
    }));
  };

  const cambiarDeporte = (deporte) => {
    const config = DEPORTES_CONFIG[deporte];
    setNuevoHorario(prev => ({
      ...prev,
      deporte,
      max_integrantes: String(config.max_default)
    }));
  };

  const renderHorariosTab = () => {
    const deporteConfig = DEPORTES_CONFIG[nuevoHorario.deporte];
    
    return (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Crear Nuevos Turnos</Text>
      <View style={styles.horarioForm}>
        
        {/* Selector de Deporte */}
        <Text style={styles.label}>Deporte</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deportesScroll}>
          {Object.keys(DEPORTES_CONFIG).map((deporte) => (
            <TouchableOpacity 
              key={deporte}
              style={[
                styles.deporteButton, 
                nuevoHorario.deporte === deporte && styles.deporteButtonActive,
                { borderColor: DEPORTES_CONFIG[deporte].color }
              ]}
              onPress={() => cambiarDeporte(deporte)}
            >
              <Text style={[
                styles.deporteButtonText,
                nuevoHorario.deporte === deporte && { color: DEPORTES_CONFIG[deporte].color, fontWeight: 'bold' }
              ]}>
                {deporte}
              </Text>
              <Text style={styles.deporteDuracion}>{DEPORTES_CONFIG[deporte].duracion} min</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selector de Días con botón "Todos" */}
        <View style={styles.diasHeader}>
          <Text style={styles.label}>Días de la Semana</Text>
          <TouchableOpacity 
            style={[styles.todosButton, nuevoHorario.dias.length === 7 && styles.todosButtonActive]}
            onPress={toggleTodosDias}
          >
            <Icon name={nuevoHorario.dias.length === 7 ? "checkmark-circle" : "ellipse-outline"} size={16} color={nuevoHorario.dias.length === 7 ? "#fff" : "#666"} />
            <Text style={[styles.todosButtonText, nuevoHorario.dias.length === 7 && styles.todosButtonTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.diasButtons}>
          {diasSemana.map((dia) => (
            <TouchableOpacity 
              key={dia} 
              style={[
                styles.diaButton, 
                nuevoHorario.dias.includes(dia) && [styles.diaButtonActive, { backgroundColor: deporteConfig.color }]
              ]} 
              onPress={() => toggleDia(dia)}
            >
              <Text style={[styles.diaButtonText, nuevoHorario.dias.includes(dia) && styles.diaButtonTextActive]}>
                {dia.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hora de Inicio (Fin se calcula automáticamente) */}
        <Text style={styles.label}>Hora de Inicio</Text>
        <TextInput 
          style={styles.input} 
          value={nuevoHorario.hora_inicio} 
          onChangeText={(text) => setNuevoHorario({ ...nuevoHorario, hora_inicio: text })} 
          placeholder="HH:MM (ej: 09:00)" 
          keyboardType="numbers-and-punctuation" 
        />
        
        {/* Info automática */}
        {nuevoHorario.hora_inicio && (
          <View style={styles.infoBox}>
            <Icon name="information-circle" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              Duración: {deporteConfig.duracion} min • Fin automático calculado
            </Text>
          </View>
        )}

        {/* Máximo de Integrantes */}
        <Text style={styles.label}>Máx. Jugadores por Turno</Text>
        <TextInput 
          style={styles.input} 
          value={nuevoHorario.max_integrantes} 
          onChangeText={(text) => setNuevoHorario({ ...nuevoHorario, max_integrantes: text })} 
          placeholder={`Recomendado: ${deporteConfig.max_default}`}
          keyboardType="numeric" 
        />

        {/* Botón Agregar */}
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: deporteConfig.color }]} 
          onPress={agregarHorario}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="add-circle" size={24} color="#fff" />
              <Text style={styles.addButtonText}>
                Crear {nuevoHorario.dias.length > 0 ? `${nuevoHorario.dias.length} Turno(s)` : 'Turnos'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Turnos Configurados</Text>
      {horarios.length === 0 ? (
        <Text style={styles.emptyText}>No tienes turnos configurados. Agrega turnos para que los usuarios puedan reservar.</Text>
      ) : (
        <View style={styles.horariosList}>
          {diasSemana.map((dia) => {
            const horariosDia = horarios.filter(h => h.dia === dia);
            if (horariosDia.length === 0) return null;
            return (
              <View key={dia} style={styles.diaSection}>
                <Text style={styles.diaSectionTitle}>{dia}</Text>
                {horariosDia.map((horario) => (
                  <View key={horario.id} style={styles.horarioItem}>
                    <View style={styles.horarioInfo}>
                      <View style={styles.horarioHeader}>
                        <Text style={styles.horarioTime}>{horario.hora_inicio} - {horario.hora_fin}</Text>
                        {horario.deporte && (
                          <View style={[styles.deporteBadge, { backgroundColor: DEPORTES_CONFIG[horario.deporte]?.color || '#666' }]}>
                            <Text style={styles.deporteBadgeText}>{horario.deporte}</Text>
                          </View>
                        )}
                      </View>
                      {horario.max_integrantes && (
                        <Text style={styles.horarioMeta}>👥 Máx. {horario.max_integrantes} jugadores</Text>
                      )}
                      <View style={[styles.horarioStatus, horario.disponible ? styles.horarioDisponible : styles.horarioNoDisponible]}>
                        <Text style={styles.horarioStatusText}>{horario.disponible ? 'Disponible' : 'Deshabilitado'}</Text>
                      </View>
                    </View>
                    <View style={styles.horarioActions}>
                      <Switch value={horario.disponible} onValueChange={() => toggleHorario(horario.id, horario.disponible)} trackColor={{ false: '#ccc', true: '#4CAF50' }} />
                      <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarHorario(horario.id)}>
                        <Icon name="trash-outline" size={20} color="#f44336" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Icon name="close" size={28} color="#333" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Configuración</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, activeTab === 'info' && styles.tabActive]} onPress={() => setActiveTab('info')}>
            <Icon name="information-circle" size={24} color={activeTab === 'info' ? '#0000CD' : '#999'} />
            <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>Info</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'fotos' && styles.tabActive]} onPress={() => setActiveTab('fotos')}>
            <Icon name="images" size={24} color={activeTab === 'fotos' ? '#0000CD' : '#999'} />
            <Text style={[styles.tabText, activeTab === 'fotos' && styles.tabTextActive]}>Fotos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'horarios' && styles.tabActive]} onPress={() => setActiveTab('horarios')}>
            <Icon name="time" size={24} color={activeTab === 'horarios' ? '#0000CD' : '#999'} />
            <Text style={[styles.tabText, activeTab === 'horarios' && styles.tabTextActive]}>Turnos</Text>
          </TouchableOpacity>
        </View>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'fotos' && renderFotosTab()}
        {activeTab === 'horarios' && renderHorariosTab()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingTop: Platform.OS === 'ios' ? 50 : 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tab: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, gap: 8 },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#0000CD' },
  tabText: { fontSize: 14, color: '#999' },
  tabTextActive: { color: '#0000CD', fontWeight: 'bold' },
  tabContent: { flex: 1, padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#0000CD', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  visibilityContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12, marginTop: 24 },
  visibilityInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  visibilityText: { flex: 1 },
  visibilityTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  visibilitySubtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  uploadButton: { flexDirection: 'row', backgroundColor: '#0000CD', padding: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fotosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  fotoContainer: { width: '48%', aspectRatio: 1, position: 'relative' },
  fotoPreview: { width: '100%', height: '100%', borderRadius: 8 },
  deleteFotoButton: { position: 'absolute', top: 8, right: 8, backgroundColor: '#f44336', borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 14, marginTop: 32, fontStyle: 'italic' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16, marginTop: 8 },
  horarioForm: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12, marginBottom: 24 },
  
  // Sport selector
  deportesScroll: { marginTop: 8, marginBottom: 8 },
  deporteButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 2, borderColor: '#ddd', backgroundColor: '#fff', marginRight: 8, minWidth: 100, alignItems: 'center' },
  deporteButtonActive: { borderWidth: 3, backgroundColor: '#f0f8ff' },
  deporteButtonText: { fontSize: 13, color: '#333', fontWeight: '500' },
  deporteDuracion: { fontSize: 11, color: '#666', marginTop: 2 },
  
  // Multi-day selector
  diasHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 12 },
  todosButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  todosButtonActive: { backgroundColor: '#0000CD', borderColor: '#0000CD' },
  todosButtonText: { fontSize: 12, color: '#666', fontWeight: '500' },
  todosButtonTextActive: { color: '#fff', fontWeight: 'bold' },
  diasButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  diaButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', minWidth: 48, alignItems: 'center' },
  diaButtonActive: { borderWidth: 2 },
  diaButtonText: { fontSize: 12, color: '#666', fontWeight: '500' },
  diaButtonTextActive: { color: '#fff', fontWeight: 'bold' },
  
  // Info box
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e3f2fd', padding: 12, borderRadius: 8, marginTop: 8 },
  infoText: { fontSize: 12, color: '#1976d2', flex: 1 },
  
  addButton: { flexDirection: 'row', backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  horariosList: { gap: 16 },
  diaSection: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8 },
  diaSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  horarioItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
  horarioInfo: { flex: 1 },
  horarioHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  horarioTime: { fontSize: 16, fontWeight: '600', color: '#333' },
  deporteBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  deporteBadgeText: { fontSize: 11, color: '#fff', fontWeight: 'bold' },
  horarioMeta: { fontSize: 12, color: '#666', marginBottom: 4 },
  horarioStatus: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  horarioDisponible: { backgroundColor: '#e8f5e9' },
  horarioNoDisponible: { backgroundColor: '#ffebee' },
  horarioStatusText: { fontSize: 12, fontWeight: '600' },
  horarioActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteButton: { padding: 8 },
});