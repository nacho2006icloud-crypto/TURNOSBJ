// App.js
import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Home from './components/Home';
import HomeContent from './components/HomeContent';
import MainBar from './components/MainBar';
import AuthModal from './components/AuthModal';

export default function App() {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <LinearGradient
          colors={['#0000CD', '#1a1a4d', '#0a0a0a']}
          locations={[0, 0.35, 1]}
          style={styles.gradientBg}
        />
        <HomeContent />
        <Home />
        <MainBar
          onPressPlus={() => console.log('➕ Nuevo item')}
          onPressUser={() => setAuthModalVisible(true)}
          onPressSettings={() => console.log('⚙️ Configuración')}
        />
        
        <AuthModal
          visible={authModalVisible}
          onClose={() => setAuthModalVisible(false)}
          onAuthSuccess={handleAuthSuccess}
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
