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
  const [localInfo, setLocalInfo] = useState({ 
    nombre: '', 
    direccion: '', 
    precio_hora: '', 
    deportes: [] // Array de deportes seleccionados
  });
  const [fotos, setFotos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [nuevoHorario, setNuevoHorario] = useState({ 
    dias: [], // Array de días seleccionados
    deporte: 'Futbol 5',
    hora_inicio: '', 
    max_integrantes: '10',
    disponible: true 
  });
  const [horaConfig, setHoraConfig] = useState({
    hora: '9',
    minutos: '00',
    periodo: 'AM'
  });
  const [canchaVisible, setCanchaVisible] = useState(false);
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Convertir hora AM/PM a formato 24h
  const convertirA24h = (hora, minutos, periodo) => {
    let h = parseInt(hora);
    if (periodo === 'PM' && h !== 12) h += 12;
    if (periodo === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minutos}`;
  };

  // Calcular hora de fin según duración del deporte
  const calcularHoraFin = (horaInicio, duracionMinutos) => {
    const [h, m] = horaInicio.split(':').map(Number);
    const totalMinutos = h * 60 + m + duracionMinutos;
    const horaFin = Math.floor(totalMinutos / 60) % 24;
    const minFin = totalMinutos % 60;
    return `${horaFin.toString().padStart(2, '0')}:${minFin.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (visible && currentUser?.local_data) {
      // Parsear deportes desde JSON
      let deportesArray = [];
      if (currentUser.local_data.deportes) {
        try {
          deportesArray = typeof currentUser.local_data.deportes === 'string' 
            ? JSON.parse(currentUser.local_data.deportes) 
            : currentUser.local_data.deportes;
          // Asegurar que es un array
          if (!Array.isArray(deportesArray)) {
            deportesArray = [];
          }
        } catch (e) {
          console.error('Error parseando deportes:', e);
          deportesArray = [];
        }
      }

      setLocalInfo({
        nombre: currentUser.local_data.nombre || '',
        direccion: currentUser.local_data.direccion || '',
        precio_hora: currentUser.local_data.precio_hora?.toString() || '',
        deportes: deportesArray,
      });
      const fotosArray = currentUser.local_data.fotos ? (typeof currentUser.local_data.fotos === 'string' ? JSON.parse(currentUser.local_data.fotos) : currentUser.local_data.fotos) : [];
      setFotos(fotosArray);
      
      // Solo actualizar visibilidad si el modal se acaba de abrir
      const visibilidadActual = currentUser.local_data.visible === 1 || currentUser.local_data.visible === true;
      setCanchaVisible(visibilidadActual);
      console.log('🔍 Estado de visibilidad cargado:', visibilidadActual);
      
      // Establecer el primer deporte disponible como seleccionado en turnos
      if (deportesArray.length > 0 && !deportesArray.includes(nuevoHorario.deporte)) {
        const primerDeporte = deportesArray[0];
        const config = DEPORTES_CONFIG[primerDeporte];
        setNuevoHorario(prev => ({
          ...prev,
          deporte: primerDeporte,
          max_integrantes: String(config.max_default)
        }));
      }
      
      cargarHorarios();
    }
  }, [visible, currentUser]);

  const getToken = async () => {
    if (Platform.OS === 'web') {
      const token = localStorage.getItem('auth_token');
      console.log('🔑 Token desde localStorage:', token ? `SI (${token.substring(0, 20)}...)` : 'NO');
      if (token) {
        // Decodificar token para ver su contenido
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('📋 Token payload:', payload);
        } catch (e) {
          console.error('❌ Error decodificando token:', e);
        }
      }
      return token;
    }
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const token = await AsyncStorage.getItem('auth_token');
    console.log('🔑 Token desde AsyncStorage:', token ? 'SI' : 'NO');
    return token;
  };

  const cargarHorarios = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('❌ No hay token disponible');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/local/horarios`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setHorarios(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.log('Error cargando horarios:', error);
      setHorarios([]);
    }
  };

  const handleUpdateInfo = async () => {
    try {
      // Validación: al menos un deporte debe estar seleccionado
      if (!localInfo.deportes || localInfo.deportes.length === 0) {
        Alert.alert('Error', 'Debes seleccionar al menos un deporte para tu cancha');
        return;
      }

      // Validación: campos obligatorios
      if (!localInfo.nombre.trim()) {
        Alert.alert('Error', 'El nombre de la cancha es obligatorio');
        return;
      }
      if (!localInfo.direccion.trim()) {
        Alert.alert('Error', 'La dirección es obligatoria');
        return;
      }
      if (!localInfo.precio_hora || parseFloat(localInfo.precio_hora) <= 0) {
        Alert.alert('Error', 'El precio por hora debe ser mayor a 0');
        return;
      }

      setLoading(true);
      const token = await getToken();
      
      if (!token) {
        Alert.alert('Error', 'No hay sesión activa. Por favor inicia sesión nuevamente.');
        return;
      }

      console.log('📤 Enviando actualización de info...');
      console.log('📦 Datos:', localInfo);
      
      // Convertir deportes a JSON para enviar al backend
      const dataToSend = {
        ...localInfo,
        deportes: JSON.stringify(localInfo.deportes)
      };
      
      const response = await fetch(`${API_BASE_URL}/local/info`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(dataToSend),
      });
      
      console.log('📡 Respuesta:', response.status);
      
      if (response.ok) {
        Alert.alert('Éxito', 'Información actualizada correctamente');
        if (onUpdate) onUpdate();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        Alert.alert('Error', errorData.error || 'No se pudo actualizar la información');
      }
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      Alert.alert('Error', 'Error al actualizar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: ImagePicker.MediaType.Images, 
        allowsMultipleSelection: true, 
        quality: 0.8 
      });
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
      
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        
        if (Platform.OS === 'web') {
          // En web, necesitamos fetch el blob
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          formData.append('fotos', blob, `foto_${Date.now()}_${i}.jpg`);
        } else {
          // En móvil, usar el formato estándar
          formData.append('fotos', {
            uri: asset.uri,
            type: 'image/jpeg',
            name: `foto_${Date.now()}_${i}.jpg`
          });
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/local/fotos`, { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}` }, 
        body: formData 
      });
      
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Éxito', 'Fotos subidas correctamente');
        setFotos(data.fotos || []);
        if (onUpdate) onUpdate();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'No se pudieron subir las fotos');
      }
    } catch (error) {
      console.error('Error subiendo fotos:', error);
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
              body: JSON.stringify({ foto: fotoUrl }),
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

    // Validar hora
    if (!horaConfig.hora || !horaConfig.minutos) {
      Alert.alert('Error', 'Debes seleccionar la hora de inicio');
      return;
    }

    // Convertir AM/PM a formato 24h
    const hora_inicio = convertirA24h(horaConfig.hora, horaConfig.minutos, horaConfig.periodo);
    
    // Calcular hora_fin automáticamente según deporte
    const deporteConfig = DEPORTES_CONFIG[nuevoHorario.deporte];
    const hora_fin = calcularHoraFin(hora_inicio, deporteConfig.duracion);

    console.log('📅 Creando horarios:', {
      dias: nuevoHorario.dias,
      deporte: nuevoHorario.deporte,
      hora_inicio,
      hora_fin,
      max_integrantes: nuevoHorario.max_integrantes
    });

    // Validar que no pase de medianoche
    const [horaFin] = hora_fin.split(':').map(Number);
    const [horaInicio] = hora_inicio.split(':').map(Number);
    if (horaFin < horaInicio && horaFin !== 0) {
      Alert.alert('Error', 'El turno se extiende más allá de medianoche. Elige una hora más temprana.');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      console.log('🔑 Token obtenido:', token ? 'SI' : 'NO');

      // Crear turno para cada día seleccionado
      const promesas = nuevoHorario.dias.map(async dia => {
        const response = await fetch(`${API_BASE_URL}/local/horarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            dia,
            deporte: nuevoHorario.deporte,
            hora_inicio,
            hora_fin,
            max_integrantes: parseInt(nuevoHorario.max_integrantes),
            disponible: true
          })
        });
        
        const data = await response.json();
        console.log(`📝 Respuesta para ${dia}:`, response.status, data);
        
        if (!response.ok) {
          throw new Error(data.error || `Error creando turno para ${dia}`);
        }
        
        return data;
      });

      const resultados = await Promise.all(promesas);
      console.log('✅ Turnos creados:', resultados.length);
      
      Alert.alert('Éxito', `Turnos creados para ${nuevoHorario.dias.length} día(s)`);
      setNuevoHorario({ 
        dias: [], 
        deporte: 'Futbol 5',
        hora_inicio: '', 
        max_integrantes: '10',
        disponible: true 
      });
      setHoraConfig({ hora: '9', minutos: '00', periodo: 'AM' });
      await cargarHorarios();
    } catch (error) {
      console.error('❌ Error creando turnos:', error);
      Alert.alert('Error', 'No se pudieron crear los turnos: ' + error.message);
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
      const response = await fetch(`${API_BASE_URL}/local/horarios/${id}/disponibilidad`, {
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
      
      if (!token) {
        Alert.alert('Error', 'No hay sesión activa. Por favor inicia sesión nuevamente.');
        return;
      }

      console.log('🔄 Cambiando visibilidad a:', nuevaVisibilidad);
      
      const response = await fetch(`${API_BASE_URL}/local/visibilidad`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ visible: nuevaVisibilidad })
      });
      
      console.log('📡 Respuesta visibilidad:', response.status);
      
      if (response.ok) {
        // Actualizar el estado local PRIMERO
        setCanchaVisible(nuevaVisibilidad);
        
        // Luego actualizar los datos del usuario
        if (onUpdate) {
          await onUpdate();
        }
        
        Alert.alert(
          'Éxito', 
          nuevaVisibilidad 
            ? 'Tu cancha ahora es visible para todos los usuarios' 
            : 'Tu cancha está oculta. Los usuarios no la verán.'
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        Alert.alert('Error', errorData.error || 'No se pudo cambiar la visibilidad');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'No se pudo cambiar la visibilidad');
    }
  };

  const toggleDeporte = (deporte) => {
    setLocalInfo(prev => ({
      ...prev,
      deportes: prev.deportes.includes(deporte)
        ? prev.deportes.filter(d => d !== deporte)
        : [...prev.deportes, deporte]
    }));
  };

  const renderInfoTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.label}>Nombre de la Cancha *</Text>
      <TextInput 
        style={styles.input} 
        value={localInfo.nombre} 
        onChangeText={(text) => setLocalInfo({ ...localInfo, nombre: text })} 
        placeholder="Ej: Cancha El Crack" 
      />
      
      <Text style={styles.label}>Dirección/Ubicación *</Text>
      <TextInput 
        style={styles.input} 
        value={localInfo.direccion} 
        onChangeText={(text) => setLocalInfo({ ...localInfo, direccion: text })} 
        placeholder="Ej: Av. Corrientes 1234, CABA" 
      />
      
      <Text style={styles.label}>Precio por Hora ($) *</Text>
      <TextInput 
        style={styles.input} 
        value={localInfo.precio_hora} 
        onChangeText={(text) => setLocalInfo({ ...localInfo, precio_hora: text })} 
        placeholder="Ej: 5000" 
        keyboardType="numeric" 
      />
      
      <Text style={styles.label}>Deportes Disponibles * (selecciona al menos uno)</Text>
      <View style={styles.deportesGrid}>
        {Object.keys(DEPORTES_CONFIG).map((deporte) => {
          const isSelected = localInfo.deportes.includes(deporte);
          const config = DEPORTES_CONFIG[deporte];
          
          return (
            <TouchableOpacity
              key={deporte}
              style={[
                styles.deporteCard,
                isSelected && { 
                  backgroundColor: config.color + '20',
                  borderColor: config.color,
                  borderWidth: 2
                }
              ]}
              onPress={() => toggleDeporte(deporte)}
            >
              <View style={styles.deporteCardContent}>
                <Icon 
                  name={isSelected ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={isSelected ? config.color : '#999'} 
                />
                <Text style={[
                  styles.deporteCardText,
                  isSelected && { color: config.color, fontWeight: 'bold' }
                ]}>
                  {deporte}
                </Text>
              </View>
              <Text style={styles.deporteCardDuration}>
                {config.duracion} min · {config.max_default} personas
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {localInfo.deportes.length === 0 && (
        <View style={styles.warningBox}>
          <Icon name="alert-circle" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            Debes seleccionar al menos un deporte para poder guardar
          </Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={[
          styles.saveButton,
          localInfo.deportes.length === 0 && styles.saveButtonDisabled
        ]} 
        onPress={handleUpdateInfo} 
        disabled={loading || localInfo.deportes.length === 0}
      >
        <Icon name="checkmark-circle" size={20} color="#fff" />
        <Text style={styles.saveButtonText}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.visibilityContainer}>
        <View style={styles.visibilityInfo}>
          <Icon name={canchaVisible ? "eye" : "eye-off"} size={24} color={canchaVisible ? "#4CAF50" : "#999"} />
          <View style={styles.visibilityText}>
            <Text style={styles.visibilityTitle}>
              {canchaVisible ? 'Cancha Visible' : 'Cancha Oculta'}
            </Text>
            <Text style={styles.visibilitySubtitle}>
              {canchaVisible 
                ? 'Los usuarios pueden ver tu cancha y reservar turnos' 
                : 'Tu cancha no aparece en búsquedas'}
            </Text>
          </View>
        </View>
        <Switch 
          value={canchaVisible} 
          onValueChange={toggleVisibilidad} 
          trackColor={{ false: '#ccc', true: '#4CAF50' }} 
        />
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
    const deportesDisponibles = localInfo.deportes.length > 0 
      ? localInfo.deportes 
      : Object.keys(DEPORTES_CONFIG);
    
    // Si no hay deportes configurados, mostrar advertencia
    if (localInfo.deportes.length === 0) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.emptyStateContainer}>
            <Icon name="alert-circle-outline" size={64} color="#FF9800" />
            <Text style={styles.emptyStateTitle}>Configura tus deportes primero</Text>
            <Text style={styles.emptyStateText}>
              Debes seleccionar los deportes disponibles en tu cancha desde la pestaña "Info" antes de crear turnos.
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setActiveTab('info')}
            >
              <Icon name="settings" size={20} color="#fff" />
              <Text style={styles.emptyStateButtonText}>Ir a Configuración</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    return (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Crear Nuevos Turnos</Text>
      <View style={styles.horarioForm}>
        
        {/* Selector de Deporte - Solo deportes configurados */}
        <Text style={styles.label}>Deporte</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deportesScroll}>
          {deportesDisponibles.map((deporte) => (
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

        {/* Hora de Inicio con selector AM/PM */}
        <Text style={styles.label}>Hora de Inicio</Text>
        <View style={styles.timePickerContainer}>
          {/* Selector de Hora (1-12) */}
          <View style={styles.timePicker}>
            <Text style={styles.timeLabel}>Hora</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
              {[...Array(12)].map((_, i) => {
                const hora = (i + 1).toString();
                return (
                  <TouchableOpacity
                    key={hora}
                    style={[styles.timeOption, horaConfig.hora === hora && styles.timeOptionActive]}
                    onPress={() => setHoraConfig({ ...horaConfig, hora })}
                  >
                    <Text style={[styles.timeOptionText, horaConfig.hora === hora && styles.timeOptionTextActive]}>
                      {hora}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Selector de Minutos */}
          <View style={styles.timePicker}>
            <Text style={styles.timeLabel}>Min</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
              {['00', '15', '30', '45'].map(min => (
                <TouchableOpacity
                  key={min}
                  style={[styles.timeOption, horaConfig.minutos === min && styles.timeOptionActive]}
                  onPress={() => setHoraConfig({ ...horaConfig, minutos: min })}
                >
                  <Text style={[styles.timeOptionText, horaConfig.minutos === min && styles.timeOptionTextActive]}>
                    {min}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Selector AM/PM */}
          <View style={styles.timePicker}>
            <Text style={styles.timeLabel}>Período</Text>
            <View style={styles.periodToggle}>
              <TouchableOpacity
                style={[styles.periodButton, horaConfig.periodo === 'AM' && styles.periodButtonActive]}
                onPress={() => setHoraConfig({ ...horaConfig, periodo: 'AM' })}
              >
                <Text style={[styles.periodButtonText, horaConfig.periodo === 'AM' && styles.periodButtonTextActive]}>
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, horaConfig.periodo === 'PM' && styles.periodButtonActive]}
                onPress={() => setHoraConfig({ ...horaConfig, periodo: 'PM' })}
              >
                <Text style={[styles.periodButtonText, horaConfig.periodo === 'PM' && styles.periodButtonTextActive]}>
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Info automática */}
        {horaConfig.hora && horaConfig.minutos && (
          <View style={styles.infoBox}>
            <Icon name="information-circle" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              Inicia: {horaConfig.hora}:{horaConfig.minutos} {horaConfig.periodo} • 
              Termina: {(() => {
                const inicio = convertirA24h(horaConfig.hora, horaConfig.minutos, horaConfig.periodo);
                const fin = calcularHoraFin(inicio, deporteConfig.duracion);
                const [h, m] = fin.split(':').map(Number);
                const periodo = h >= 12 ? 'PM' : 'AM';
                const hora12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
                return `${hora12}:${m.toString().padStart(2, '0')} ${periodo}`;
              })()} • 
              Duración: {deporteConfig.duracion} min
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
  
  // Deportes Grid (Info Tab)
  deportesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12, marginBottom: 16 },
  deporteCard: { 
    width: '48%', 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 12, 
    padding: 14, 
    minHeight: 80,
    justifyContent: 'space-between'
  },
  deporteCardContent: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  deporteCardText: { fontSize: 14, color: '#333', fontWeight: '600', flex: 1 },
  deporteCardDuration: { fontSize: 11, color: '#666', marginTop: 4 },
  
  // Warning Box
  warningBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    backgroundColor: '#FFF3E0', 
    padding: 14, 
    borderRadius: 8, 
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800'
  },
  warningText: { fontSize: 13, color: '#F57C00', flex: 1, fontWeight: '500' },
  
  // Save Button
  saveButton: { 
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#0000CD', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 24 
  },
  saveButtonDisabled: { backgroundColor: '#ccc', opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  // Empty State (Horarios Tab)
  emptyStateContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 32,
    marginTop: 60
  },
  emptyStateTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 16, textAlign: 'center' },
  emptyStateText: { fontSize: 14, color: '#666', marginTop: 12, textAlign: 'center', lineHeight: 20 },
  emptyStateButton: { 
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#0000CD', 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    borderRadius: 8, 
    marginTop: 24,
    alignItems: 'center'
  },
  emptyStateButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  
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
  
  // Time Picker styles
  timePickerContainer: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 12 },
  timePicker: { flex: 1 },
  timeLabel: { fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 6 },
  timeScroll: { maxHeight: 50 },
  timeOption: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', marginRight: 8, minWidth: 50, alignItems: 'center' },
  timeOptionActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  timeOptionText: { fontSize: 14, color: '#333', fontWeight: '500' },
  timeOptionTextActive: { color: '#fff', fontWeight: 'bold' },
  periodToggle: { flexDirection: 'row', gap: 8 },
  periodButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', alignItems: 'center' },
  periodButtonActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  periodButtonText: { fontSize: 14, color: '#333', fontWeight: '500' },
  periodButtonTextActive: { color: '#fff', fontWeight: 'bold' },

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