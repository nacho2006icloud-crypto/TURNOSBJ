// App.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Home from './components/Home';
import HomeContent from './components/HomeContent';
import MainBar from './components/MainBar';
import AuthModalNew from './components/AuthModalNew';
import SettingsModal from './components/SettingsModal';
import LocalDashboard from './components/LocalDashboard';
import UserProfileModal from './components/UserProfileModal';
import authService from './services/authService';

export default function App() {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.log('No hay sesión activa');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleUserPress = () => {
    console.log('🟡 APP.JS - handleUserPress - currentUser:', currentUser?.nombre_completo || 'NULL');
    if (!currentUser) {
      console.log('🟡 APP.JS - No hay usuario, abriendo AuthModal');
      setAuthModalVisible(true);
    } else if (currentUser.tipo_usuario === 'usuario') {
      console.log('🟡 APP.JS - Usuario normal, abriendo ProfileModal');
      setProfileModalVisible(true);
    } else {
      console.log('🟡 APP.JS - Usuario local, ejecutando logout directo');
      // Para locales, cerrar sesión directamente
      handleLogout();
    }
  };

  const handleSettingsPress = () => {
    if (currentUser && currentUser.tipo_usuario === 'local') {
      setSettingsModalVisible(true);
    } else {
      console.log('⚠️ Solo locales pueden acceder a configuración');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setProfileModalVisible(false); // Asegurar que el modal se cierre
      setAuthModalVisible(false);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const handleProfileUpdate = (user) => {
    console.log('🟢 APP.JS - handleProfileUpdate llamado con:', user);
    
    // Cerrar modal SIEMPRE
    setProfileModalVisible(false);
    
    if (user === null) {
      // Logout desde UserProfileModal
      console.log('🟢 APP.JS - Detectado logout, limpiando estado...');
      setCurrentUser(null);
      setAuthModalVisible(false);
      setSettingsModalVisible(false);
      console.log('🟢 APP.JS - Estado limpiado, currentUser ahora es null');
    } else {
      // Actualizar usuario (refrescar datos)
      console.log('🟢 APP.JS - Actualizando datos de usuario...');
      checkAuth();
    }
  };

  // Si es cancha, mostrar solo su dashboard
  const isLocal = currentUser?.tipo_usuario === 'local';

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <LinearGradient
          colors={['#0000CD', '#1a1a4d', '#0a0a0a']}
          locations={[0, 0.35, 1]}
          style={styles.gradientBg}
        />
        
        {/* Contenido según tipo de usuario */}
        {isLocal ? (
          <LocalDashboard currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          <>
            <HomeContent />
            <Home />
          </>
        )}

        <MainBar
          onPressPlus={() => console.log('➕ Nuevo item')}
          onPressUser={handleUserPress}
          onPressSettings={handleSettingsPress}
          currentUser={currentUser}
        />
        
        <AuthModalNew
          visible={authModalVisible}
          onClose={() => setAuthModalVisible(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        <UserProfileModal
          visible={profileModalVisible}
          onClose={() => setProfileModalVisible(false)}
          currentUser={currentUser}
          onUpdate={handleProfileUpdate}
        />

        <SettingsModal
          visible={settingsModalVisible}
          onClose={() => setSettingsModalVisible(false)}
          currentUser={currentUser}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradientBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1,
  },
});
