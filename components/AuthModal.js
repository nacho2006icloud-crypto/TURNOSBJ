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
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/Feather';
import authService from '../services/authService';

export default function AuthModal({ visible, onClose, onAuthSuccess }) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [userType, setUserType] = useState('usuario'); // 'usuario' | 'local' (solo para registro)
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Campos del formulario
  const [formData, setFormData] = useState({
    // Comunes
    email: '',
    password: '',
    // Usuario
    nombre_completo: '',
    ano_nacimiento: '',
    // Local
    nombre: '',
    direccion: '',
    latitud: null,
    longitud: null,
    fotos: [],
    descripcion: '',
    deportes: '[]',
    precio_hora: ''
  });

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setMode('login');
    setUserType('usuario');
    setMessage(null);
    setLoading(false);
    setFormData({
      email: '',
      password: '',
      nombre_completo: '',
      ano_nacimiento: '',
      nombre: '',
      direccion: '',
      latitud: null,
      longitud: null,
      fotos: [],
      descripcion: '',
      deportes: '[]',
      precio_hora: ''
    });
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setMessage('Email y contraseña son requeridos');
      return;
    }

    setMessage(null);
    setLoading(true);
    
    try {
      const result = await authService.login({
        email: formData.email.trim(),
        password: formData.password
      });

      if (result.success) {
        setCurrentUser(result.user);
        onAuthSuccess && onAuthSuccess(result.user);
        onClose && onClose();
      } else {
        setMessage(result.error);
      }
    } catch (error) {
      setMessage('Error inesperado. Intentá nuevamente.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setMessage(null);
    setLoading(true);

    try {
      let result;

      if (userType === 'usuario') {
        if (!formData.nombre_completo || !formData.email || !formData.password || !formData.ano_nacimiento) {
          setMessage('Todos los campos son requeridos');
          setLoading(false);
          return;
        }

        result = await authService.registerUser({
          nombre_completo: formData.nombre_completo.trim(),
          email: formData.email.trim(),
          password: formData.password,
          ano_nacimiento: parseInt(formData.ano_nacimiento)
        });
      } else if (userType === 'local') {
        if (!formData.email || !formData.password || !formData.nombre || !formData.direccion) {
          setMessage('Email, contraseña, nombre y dirección son requeridos');
          setLoading(false);
          return;
        }

        result = await authService.registerLocal({
          email: formData.email.trim(),
          password: formData.password,
          nombre: formData.nombre.trim(),
          direccion: formData.direccion.trim(),
          latitud: formData.latitud,
          longitud: formData.longitud,
          fotos: formData.fotos,
          descripcion: formData.descripcion,
          deportes: formData.deportes,
          precio_hora: formData.precio_hora ? parseFloat(formData.precio_hora) : 0
        });
      }

      if (result && result.success) {
        setCurrentUser(result.user);
        onAuthSuccess && onAuthSuccess(result.user);
        onClose && onClose();
      } else {
        setMessage(result?.error || 'Error en el registro');
      }
    } catch (error) {
      setMessage('Error inesperado. Intentá nuevamente.');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setCurrentUser(null);
      onAuthSuccess && onAuthSuccess(null);
      resetForm();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesitan permisos para acceder a las fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.slice(0, 5 - formData.fotos.length);
      updateFormData('fotos', [...formData.fotos, ...newPhotos]);
    }
  };

  const removeImage = (index) => {
    const newPhotos = formData.fotos.filter((_, i) => i !== index);
    updateFormData('fotos', newPhotos);
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesitan permisos de ubicación');
      return;
    }

    setLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      updateFormData('latitud', location.coords.latitude);
      updateFormData('longitud', location.coords.longitude);
      
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      if (address[0]) {
        const addressStr = `${address[0].street || ''} ${address[0].streetNumber || ''}, ${address[0].city || ''}, ${address[0].region || ''}`.trim();
        updateFormData('direccion', addressStr);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    } finally {
      setLoading(false);
    }
  };

  const renderSelectionStep = () => (
    <View style={styles.selectionContainer}>
      <Icon name="user" size={48} color="#fff" style={styles.headerIcon} />
      <Text style={styles.title}>¿Cómo querés unirte?</Text>
      <Text style={styles.subtitle}>Elegí tu tipo de cuenta</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => {
            setUserType('usuario');
            setStep('usuario');
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.optionGradient}
          >
            <Icon name="user" size={32} color="#fff" />
            <Text style={styles.optionTitle}>Usuario</Text>
            <Text style={styles.optionDescription}>Reserva turnos y juega</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => {
            setUserType('local');
            setStep('local');
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#10b981', '#06b6d4']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.optionGradient}
          >
            <Icon name="map-pin" size={32} color="#fff" />
            <Text style={styles.optionTitle}>Local / Cancha</Text>
            <Text style={styles.optionDescription}>Ofrece tu espacio</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => setStep('login')}
      >
        <Text style={styles.loginLinkText}>¿Ya tenés cuenta? Iniciá sesión</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoginStep = () => (
    <View style={styles.formContainer}>
      <Icon name="log-in" size={48} color="#fff" style={styles.headerIcon} />
      <Text style={styles.title}>Iniciar Sesión</Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            placeholder="tu@email.com"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>

        {message ? <Text style={styles.error}>{message}</Text> : null}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.submitGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Ingresar</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setStep('selection')}
        >
          <Text style={styles.backBtnText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUserForm = () => (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        <Icon name="user-plus" size={48} color="#fff" style={styles.headerIcon} />
        <Text style={styles.title}>Registro Usuario</Text>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              value={formData.nombre_completo}
              onChangeText={(value) => updateFormData('nombre_completo', value)}
              style={styles.input}
              placeholder="Juan Pérez"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Año de nacimiento</Text>
            <TextInput
              value={formData.ano_nacimiento}
              onChangeText={(value) => updateFormData('ano_nacimiento', value)}
              keyboardType="numeric"
              style={styles.input}
              placeholder="1990"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          {message ? <Text style={styles.error}>{message}</Text> : null}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6']}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Crear Cuenta</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep('selection')}
          >
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderLocalForm = () => (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        <Icon name="map-pin" size={48} color="#fff" style={styles.headerIcon} />
        <Text style={styles.title}>Registro Local / Cancha</Text>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              placeholder="local@email.com"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del local</Text>
            <TextInput
              value={formData.nombre}
              onChangeText={(value) => updateFormData('nombre', value)}
              style={styles.input}
              placeholder="Club Deportivo"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección</Text>
            <View style={styles.locationInputContainer}>
              <TextInput
                value={formData.direccion}
                onChangeText={(value) => updateFormData('direccion', value)}
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Av. Corrientes 1234"
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
              />
              <TouchableOpacity
                style={styles.locationBtn}
                onPress={getLocation}
                disabled={loading}
              >
                <Icon name="map-pin" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fotos de la cancha</Text>
            <TouchableOpacity
              style={styles.photoBtn}
              onPress={selectImages}
              disabled={formData.fotos.length >= 5}
            >
              <Icon name="camera" size={24} color="#fff" />
              <Text style={styles.photoBtnText}>
                {formData.fotos.length === 0 ? 'Seleccionar fotos' : `${formData.fotos.length}/5 fotos`}
              </Text>
            </TouchableOpacity>
            
            {formData.fotos.length > 0 && (
              <ScrollView horizontal style={styles.photosPreview} showsHorizontalScrollIndicator={false}>
                {formData.fotos.map((photo, index) => (
                  <View key={index} style={styles.photoPreview}>
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => removeImage(index)}
                    >
                      <Icon name="x" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {message ? <Text style={styles.error}>{message}</Text> : null}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10b981', '#06b6d4']}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Registrar Local</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep('selection')}
          >
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderProfileStep = () => (
    <View style={styles.profileContainer}>
      <Icon name="user-check" size={48} color="#fff" style={styles.headerIcon} />
      <Text style={styles.title}>Mi Cuenta</Text>
      
      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Conectado como</Text>
        <Text style={styles.profileEmail}>{currentUser?.email}</Text>
        <Text style={styles.profileType}>
          {currentUser?.tipo_usuario === 'local' ? 'Local / Cancha' : 'Usuario'}
        </Text>
        
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="log-out" size={18} color="#fff" />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    if (currentUser) return renderProfileStep();
    
    switch (step) {
      case 'selection':
        return renderSelectionStep();
      case 'login':
        return renderLoginStep();
      case 'usuario':
        return renderUserForm();
      case 'local':
        return renderLocalForm();
      default:
        return renderSelectionStep();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.wrapper}
      >
        <View style={styles.backdrop} />
        
        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 60}
          tint="dark"
          style={[styles.modal, { paddingTop: Math.max(insets.top, 20) }]}
        >
          <View style={styles.glassOverlay} />
          
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Icon name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {renderCurrentStep()}
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modal: {
    width: '95%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 40,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  
  // Selection Step
  selectionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 16,
    width: '100%',
    marginBottom: 24,
  },
  optionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  optionGradient: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  loginLink: {
    padding: 12,
  },
  loginLinkText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },

  // Form Steps
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  form: {
    width: '100%',
    marginTop: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 14,
    marginTop: 0,
  },
  photoBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  photoBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  photosPreview: {
    marginTop: 12,
  },
  photoPreview: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginRight: 8,
    position: 'relative',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(239,68,68,0.1)',
    padding: 12,
    borderRadius: 8,
  },
  submitBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  submitGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    padding: 12,
    alignItems: 'center',
  },
  backBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },

  // Profile Step
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
