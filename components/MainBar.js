import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";

export default function MainBar({
  onPressPlus = () => {},
  onPressUser = () => {},
  onPressSettings = () => {},
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <View style={styles.containerOuter}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 60}
          tint="light"
          style={styles.blurContainer}
        >
          <View style={styles.glassOverlay} />
          
          <View style={styles.contentRow}>
            {/* Configuración (izquierda) */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onPressSettings}
              activeOpacity={0.6}
            >
              <Icon name="settings" size={24} color="#1f2937" />
            </TouchableOpacity>

            {/* Botón central destacado con gradiente */}
            <TouchableOpacity
              style={styles.plusButtonOuter}
              onPress={onPressPlus}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.plusButton}
              >
                <Icon name="plus" size={28} color="#fff" strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Usuario (derecha) */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onPressUser}
              activeOpacity={0.6}
            >
              <Icon name="user" size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  containerOuter: {
    borderRadius: 9999, // pill shape
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 32,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.1)",
      },
    }),
  },
  blurContainer: {
    borderRadius: 9999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  plusButtonOuter: {
    borderRadius: 9999,
    ...Platform.select({
      ios: {
        shadowColor: "#8b5cf6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  plusButton: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
});
