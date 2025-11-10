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
import LocalProfileModal from './components/LocalProfileModal';
import authService from './services/authService';

export default function App() {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [localProfileModalVisible, setLocalProfileModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (forceRefresh = false) => {
    try {
      const user = await authService.getCurrentUser(forceRefresh);
      setCurrentUser(user);
    } catch (error) {
      console.log('No hay sesión activa');
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentUser = async () => {
    await checkAuth(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleUserPress = () => {
    if (!currentUser) {
      setAuthModalVisible(true);
    } else if (currentUser.tipo_usuario === 'usuario') {
      setProfileModalVisible(true);
    } else {
      setLocalProfileModalVisible(true);
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
    setProfileModalVisible(false);
    
    if (user === null) {
      setCurrentUser(null);
      setAuthModalVisible(false);
      setSettingsModalVisible(false);
    } else {
      checkAuth();
    }
  };

  const handleLocalProfileUpdate = (user) => {
    setLocalProfileModalVisible(false);
    
    if (user === null) {
      setCurrentUser(null);
      setAuthModalVisible(false);
      setSettingsModalVisible(false);
    } else {
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

        <LocalProfileModal
          visible={localProfileModalVisible}
          onClose={() => setLocalProfileModalVisible(false)}
          currentUser={currentUser}
          onUpdate={handleLocalProfileUpdate}
        />

        <SettingsModal
          visible={settingsModalVisible}
          onClose={() => setSettingsModalVisible(false)}
          currentUser={currentUser}
          onUpdate={refreshCurrentUser}
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
