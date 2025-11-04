import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Altura del contenido del header (sin el safe-area/top inset)
export const HEADER_CONTENT_HEIGHT = 80; // ajustable

export default function Header({ headerTranslate, headerTopInset = 0, searchDisabled = false }) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const headerTotal = HEADER_CONTENT_HEIGHT + headerTopInset;

  function openSearch() {
    if (searchDisabled) return;
    if (inputRef.current && inputRef.current.focus) inputRef.current.focus();
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: headerTopInset },
      ]}
    >
      {/* Fondo azul sólido igual al inicio del gradiente */}
      <View style={styles.bg} />

      <View style={styles.content}>
        <View style={styles.row}>
          {/* Botón de menú */}
          <TouchableOpacity 
            style={styles.menuButton}
            activeOpacity={0.7}
            onPress={() => { /* Abrir menú */ }}
          >
            <BlurView intensity={40} tint="light" style={styles.glassButton}>
              <View style={styles.glassOverlay} />
              <Ionicons name="menu" size={20} color="#1f2937" />
            </BlurView>
          </TouchableOpacity>

          {/* Barra de búsqueda */}
          <View style={styles.searchContainer}>
            <BlurView intensity={50} tint="light" style={styles.searchBlur}>
              <View style={styles.searchGlassOverlay} />
              <View style={styles.searchInner}>
                <Ionicons 
                  name="search" 
                  size={18} 
                  color={isFocused ? '#2563eb' : '#4b5563'} 
                  style={styles.searchIcon} 
                />
                <TextInput
                  ref={inputRef}
                  placeholder="Buscar..."
                  placeholderTextColor="rgba(75, 85, 99, 0.8)"
                  style={styles.searchInput}
                  editable={!searchDisabled}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  returnKeyType="search"
                  underlineColorAndroid="transparent"
                />
              </View>
              {isFocused && (
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6', '#ec4899']}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={styles.focusLine}
                />
              )}
            </BlurView>
          </View>

          {/* Botón de notificaciones */}
          <TouchableOpacity 
            style={styles.notificationButton}
            activeOpacity={0.7}
            onPress={() => { /* Abrir notificaciones */ }}
          >
            <BlurView intensity={40} tint="light" style={styles.glassButton}>
              <View style={styles.glassOverlay} />
              <Ionicons name="notifications" size={20} color="#1f2937" />
              <View style={styles.notificationBadge}>
                <LinearGradient
                  colors={['#ef4444', '#ec4899']}
                  start={[0, 0]}
                  end={[1, 1]}
                  style={styles.badgeGradient}
                />
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 40,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    height: HEADER_CONTENT_HEIGHT + 20,
    backgroundColor: '#0000CD',
  },
  content: {
    height: HEADER_CONTENT_HEIGHT,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  // Botón de menú
  menuButton: {
    width: 48,
    height: 48,
  },
  glassButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255,255,255,0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Barra de búsqueda
  searchContainer: {
    flex: 1,
  },
  searchBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  searchGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    padding: 0,
    includeFontPadding: false,
  },
  focusLine: {
    position: 'absolute',
    bottom: 0,
    left: '5%',
    right: '5%',
    height: 2,
    borderRadius: 1,
  },

  // Botón de notificaciones
  notificationButton: {
    width: 48,
    height: 48,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
  },
});
