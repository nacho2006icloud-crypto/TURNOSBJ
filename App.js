// App.js
import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Home from './components/Home';
import HomeContent from './components/HomeContent';
import MainBar from './components/MainBar';

export default function App() {
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
          onPressUser={() => console.log('👤 Usuario')}
          onPressSettings={() => console.log('⚙️ Configuración')}
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
