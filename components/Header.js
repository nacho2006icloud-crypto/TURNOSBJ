import React, { useRef, useEffect, useState } from 'react'; 
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  StatusBar,
  Platform,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@expo/vector-icons' in 'expo-linear-gradient';

export const HEADER_CONTENT_HEIGHT = 80;

export default function Header({ headerTranslate, headerTopInset = 0, searchDisabled = false }) {
  const headerTotal = HEADER_CONTENT_HEIGHT + (headerTopInset || 0);

  const SEARCH_BAR_HEIGHT = 46;
  const HIDE_OFFSET = -(SEARCH_BAR_HEIGHT + 8);

  const searchTranslateY = headerTranslate
    ? headerTranslate.interpolate({
        inputRange: [-headerTotal, 0],
        outputRange: [HIDE_OFFSET, 0],
        extrapolate: 'clamp',
      })
    : new Animated.Value(0);

  const searchOpacity = headerTranslate
    ? headerTranslate.interpolate({
        inputRange: [-headerTotal + 8, -headerTotal / 2, 0],
        outputRange: [0, 0.35, 1],
        extrapolate: 'clamp',
      })
    : new Animated.Value(1);

  const inputRef = useRef(null);
  const [inputFocused, setInputFocused] = useState(false);

  const onPressSearchIcon = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setInputFocused(true);
    }
  };

  useEffect(() => {
    if (searchDisabled && inputFocused) {
      Keyboard.dismiss();
      setInputFocused(false);
    }
  }, [searchDisabled, inputFocused]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* HEADER FIJO */}
      <View
        style={[
          styles.header,
          {
            height: headerTotal,
            paddingTop: headerTopInset || 0,
          },
        ]}
      >
        {/* TOP ROW */}
        <View style={styles.topRow}>
          <View style={styles.leftRow}>
            <TouchableOpacity activeOpacity={0.85} style={styles.userButton}>
              <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.avatar}>
                <Ionicons name="person" size={16} color="#fff" />
              </LinearGradient>

              <View style={styles.userMeta}>
                <Text numberOfLines={1} style={styles.userName}>Juan Pérez</Text>
                <View style={styles.statusRow}>
                  <View style={styles.dot} />
                  <Text style={styles.statusText}>Activo</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.gearButton}
            onPress={() => {
              console.log('Abrir configuración (simulado)');
            }}
          >
            <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.95)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH BAR ABSOLUTA ABAJO DEL HEADER */}
      <Animated.View
        pointerEvents={searchDisabled ? 'none' : 'auto'}
        style={[
          styles.searchBarWrap,
          {
            transform: [{ translateY: searchTranslateY }],
            opacity: searchOpacity,
            top: headerTotal - 8,
          },
        ]}
      >
        <TouchableOpacity activeOpacity={1} style={styles.searchInner} onPress={onPressSearchIcon}>
          <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.78)" style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Buscar"
            placeholderTextColor="rgba(159,231,231,0.9)"
            onBlur={() => setInputFocused(false)}
            onFocus={() => setInputFocused(true)}
            returnKeyType="search"
            underlineColorAndroid="transparent"
          />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    paddingHorizontal: 12,
    zIndex: 1000,
    justifyContent: 'flex-start',
  },

  topRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: { flexDirection: 'row', alignItems: 'center' },

  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMeta: {
    marginLeft: 10,
    minWidth: 0,
  },
  userName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    color: '#86efac',
    fontSize: 11,
  },

  gearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },

  searchBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 999,
  },
  searchInner: {
    marginTop: 4,
    marginBottom: 6,
    height: 46,
    borderRadius: 999,
    backgroundColor: 'rgba(20,20,20,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#00FFFF',
        shadowOpacity: 0.03,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
      web: {},
    }),
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    color: '#9fe7e7',
    fontSize: 15,
    height: '100%',
  },
});
